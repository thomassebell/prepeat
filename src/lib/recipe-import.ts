// Recipe import from a URL (explored + decided 2026-07-12): recipe sites
// embed schema.org Recipe data for Google's rich results – JSON-LD on most,
// older microdata on some (valdemarsro.dk). We fetch the page, extract the
// recipe, and prefill the Add-recipe form for human review. Import never
// saves anything by itself.
//
// Native fetch passes many bot checks (it looks like the system browser at
// the TLS level), but not all – sites that block anyway (madensverden.dk
// did in testing) surface as a friendly error; a hidden-WebView fallback is
// the known next step if the family's sites need it.

import { t } from "@/lib/i18n";

export interface ImportedRecipe {
  title: string;
  description: string | null;
  servings: number | null;
  prepMinutes: number | null;
  cookMinutes: number | null;
  imageUrl: string | null;
  ingredients: { name: string; quantityText: string | null; isSection?: boolean }[];
  steps: string[];
  /** Where it came from, stored on the recipe for attribution. */
  sourceUrl: string;
}

export class ImportError extends Error {
  constructor(
    message: string,
    readonly kind: "fetch" | "no-recipe",
  ) {
    super(message);
  }
}

const USER_AGENT =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";

export async function importRecipeFromUrl(
  url: string,
): Promise<ImportedRecipe> {
  const normalized = url.trim().match(/^https?:\/\//)
    ? url.trim()
    : `https://${url.trim()}`;
  let html: string;
  try {
    const response = await fetch(normalized, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    html = await response.text();
  } catch {
    throw new ImportError(t("recipes.import.fetchFailed"), "fetch");
  }

  const recipe = extractJsonLdRecipe(html) ?? extractMicrodataRecipe(html);
  if (recipe == null) {
    throw new ImportError(t("recipes.import.noRecipe"), "no-recipe");
  }
  return { ...recipe, sourceUrl: normalized };
}

// ── JSON-LD (the modern flavor, most sites) ──────────────────────────────

type JsonValue =
  string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
type JsonObject = { [key: string]: JsonValue };

function extractJsonLdRecipe(
  html: string,
): Omit<ImportedRecipe, "sourceUrl"> | null {
  const blocks =
    html.match(
      /<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi,
    ) ?? [];
  for (const block of blocks) {
    const raw = block
      .replace(/^<script[^>]*>/i, "")
      .replace(/<\/script>$/i, "");
    let data: JsonValue;
    try {
      data = JSON.parse(raw);
    } catch {
      continue;
    }
    const node = findRecipeNode(data);
    if (node) {
      const recipe = normalizeJsonLd(node);
      // Keep scanning the other blocks – another may hold a complete Recipe.
      if (recipe) return recipe;
    }
  }
  return null;
}

function findRecipeNode(data: JsonValue): JsonObject | null {
  if (Array.isArray(data)) {
    for (const item of data) {
      const found = findRecipeNode(item);
      if (found) return found;
    }
    return null;
  }
  if (data == null || typeof data !== "object") return null;
  const obj = data as JsonObject;
  const type = obj["@type"];
  if (type === "Recipe" || (Array.isArray(type) && type.includes("Recipe")))
    return obj;
  if (obj["@graph"]) return findRecipeNode(obj["@graph"]);
  return null;
}

function normalizeJsonLd(
  node: JsonObject,
): Omit<ImportedRecipe, "sourceUrl"> | null {
  const ingredients = asStringArray(
    node.recipeIngredient ?? node.ingredients,
  ).map(splitIngredient);
  // A Recipe node with no ingredients is not usable, and treating it as a
  // success opened a near-empty form titled "Imported recipe" with no error –
  // a silent failure. It happens when a site's bot protection serves a
  // stripped page (delish/Hearst do this intermittently). Bail so the caller
  // falls through to microdata and, failing that, raises "no-recipe".
  if (ingredients.length === 0) return null;
  return {
    title: cleanText(asString(node.name) ?? "Imported recipe"),
    description: cleanText(asString(node.description) ?? "") || null,
    servings: parseYield(node.recipeYield),
    prepMinutes: parseIsoDuration(asString(node.prepTime)),
    cookMinutes: resolveCookMinutes(
      parseIsoDuration(asString(node.prepTime)),
      parseIsoDuration(asString(node.cookTime)),
      parseIsoDuration(asString(node.totalTime)),
    ),
    imageUrl: extractImage(node.image),
    ingredients,
    steps: stripStepNumbers(extractInstructions(node.recipeInstructions)),
  };
}

function asString(value: JsonValue | undefined): string | null {
  return typeof value === "string" ? value : null;
}

function asStringArray(value: JsonValue | undefined): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value))
    return value.filter((item): item is string => typeof item === "string");
  return [];
}

function extractImage(value: JsonValue | undefined): string | null {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.length ? extractImage(value[0]) : null;
  if (value && typeof value === "object") {
    const url = (value as JsonObject).url;
    return typeof url === "string" ? url : null;
  }
  return null;
}

/**
 * Sites that number their own steps ("1. Skyl bønnerne.") hand us that number
 * inside the text, and the recipe screen numbers the steps AGAIN – so every
 * step read "1  1. Skyl bønnerne" (mkuniverset.dk, 2026-08-16).
 *
 * Only stripped when the list is unambiguously the site's own numbering: at
 * least two steps, every one of them numbered, and the numbers running 1, 2,
 * 3… in order. A step that merely opens with a figure ("200 g mel røres i")
 * is left alone, and so is a partly numbered list, because there the digit is
 * likelier to be content than a counter.
 */
function stripStepNumbers(steps: string[]): string[] {
  if (steps.length < 2) return steps;
  const parsed = steps.map((step) => step.match(/^(\d{1,2})\s*[.)]\s+(.*)$/s));
  if (parsed.some((m, i) => m == null || Number(m[1]) !== i + 1)) return steps;
  return parsed.map((m, i) => m![2].trim() || steps[i]);
}

function extractInstructions(value: JsonValue | undefined): string[] {
  if (typeof value === "string") {
    return value
      .split(/\n+/)
      .map((step) => cleanText(step))
      .filter(Boolean);
  }
  if (!Array.isArray(value)) return [];
  const steps: string[] = [];
  for (const item of value) {
    if (typeof item === "string") {
      const text = cleanText(item);
      if (text) steps.push(text);
    } else if (item && typeof item === "object") {
      const obj = item as JsonObject;
      if (
        obj["@type"] === "HowToSection" &&
        Array.isArray(obj.itemListElement)
      ) {
        steps.push(...extractInstructions(obj.itemListElement));
      } else {
        const text = cleanText(asString(obj.text) ?? asString(obj.name) ?? "");
        if (text) steps.push(text);
      }
    }
  }
  return steps;
}

function parseYield(value: JsonValue | undefined): number | null {
  const text =
    typeof value === "number"
      ? String(value)
      : Array.isArray(value)
        ? asString(value[0])
        : asString(value);
  const match = text?.match(/\d+/);
  return match ? Number(match[0]) : null;
}

/** "PT1H20M" → 80. */
export function parseIsoDuration(value: string | null): number | null {
  if (!value) return null;
  const match = value.match(/^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?/i);
  if (!match || (!match[1] && !match[2] && !match[3])) return null;
  return (
    Number(match[1] ?? 0) * 24 * 60 +
    Number(match[2] ?? 0) * 60 +
    Number(match[3] ?? 0)
  );
}

/**
 * Reconcile the three time fields a page may publish (prep / cook / total)
 * into the app's two (prep + cook, where the recipe screen shows
 * Total = prep + cook). When a page gives a total but no explicit cook,
 * derive cook so prep + cook = total, rather than storing the whole total AS
 * the cook – which made Total count prep twice (review #9). With only a total
 * and no prep, the total goes to cook so Total still renders correctly.
 */
export function resolveCookMinutes(
  prep: number | null,
  cook: number | null,
  total: number | null,
): number | null {
  // A published cookTime of ZERO means "not stated", not "cooks instantly".
  // arla.dk writes `cookTime PT00M` beside `totalTime PT2H` and `prepTime
  // PT40M`, and trusting the zero showed their lasagne as 40 minutes total –
  // the two hours of simmering simply vanished (2026-08-16). Falling through
  // derives 80 minutes from the total, so Total reads 2 h as the site says.
  // A GENUINE no-cook recipe still lands on zero, one line further down:
  // prep 5 with total 5 gives cook 0, and Total stays correct at 5.
  if (cook != null && cook > 0) return cook;
  if (total == null) return cook;
  if (prep != null) return Math.max(0, total - prep);
  return total;
}

// ── Microdata (the older flavor – e.g. valdemarsro.dk) ───────────────────

/**
 * `itemprop` holds a SPACE-SEPARATED LIST, not a single name – microdata lets
 * one element carry several properties at once. mkuniverset.dk writes
 * `itemprop="recipeInstructions description"` on its method, and matching the
 * attribute value exactly missed it, so that recipe imported with no steps at
 * all (2026-08-16). Match the name as one token among the list instead.
 */
function itempropPattern(name: string): string {
  return `itemprop="(?:[^"]*\\s)?${name}(?:\\s[^"]*)?"`;
}

// Where the text of a property ends. INLINE tags (<a>, <strong>, <i>…) are
// deliberately absent: this site links each ingredient to its own page, so the
// ingredient sits INSIDE an <a>, and stopping at the first closing tag threw
// the actual food away and imported "240 g kogte" and "4 stk".
const PROPERTY_END =
  /<\/(?:span|li|p|div|td|th|h[1-6]|ul|ol|section|article|dd|dt)\b|<li\b/i;

// A property's text is short – a cap keeps a page with unclosed tags (this one
// never closes its ingredient <span>) from swallowing the rest of the document.
const PROPERTY_MAX_CHARS = 600;

function extractMicrodataRecipe(
  html: string,
): Omit<ImportedRecipe, "sourceUrl"> | null {
  // Scope to the Recipe item so page-level itemprops (site name etc.) don't
  // pollute the extraction (happened on valdemarsro.dk).
  const scopeMatch = html.match(/itemtype="[^"]*schema\.org\/Recipe"/i);
  if (!scopeMatch || scopeMatch.index == null) return null;
  // Empty out inline <script>/<style> bodies. Scoping to the Recipe item was
  // supposed to keep code that merely MENTIONS the attribute out, but on
  // valdemarsro.dk that code sits INSIDE the recipe: a jQuery selector
  // `li[itemprop="recipeIngredient"]` and a CSS rule using the same attribute
  // both imported as ingredients, so every recipe from there arrived with two
  // junk rows ("div[itemprop=…] > p.can-hover" and "×"). The tags themselves
  // stay, because the instruction scan uses `<script` as a stop boundary.
  const scope = html
    .slice(scopeMatch.index)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "<script></script>")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "<style></style>");

  const ingredients = matchAllTexts(scope, "recipeIngredient").map(
    splitIngredient,
  );
  if (ingredients.length === 0) return null;

  // Real instruction containers are HTML tags carrying the itemprop; the
  // steps are their <p>/<li> children.
  const steps: string[] = [];
  const blockRegex = new RegExp(
    `<[a-zA-Z][^>]*${itempropPattern("recipeInstructions")}[^>]*>` +
      `([\\s\\S]{0,6000}?)` +
      `(?=<[a-zA-Z][^>]*itemprop="|<\\/section|<\\/article|<script)`,
    "gi",
  );
  let blockMatch: RegExpExecArray | null;
  while ((blockMatch = blockRegex.exec(scope)) != null) {
    const block = blockMatch[1];
    const items = block.match(/<(?:li|p)[^>]*>([\s\S]*?)<\/(?:li|p)>/gi);
    if (items && items.length > 0) {
      for (const item of items) {
        const text = cleanText(item);
        if (text) steps.push(text);
      }
    } else {
      const text = cleanText(block);
      if (text) steps.push(text);
    }
  }

  // Times/yield can be attributes or plain span text ("PT1H15M").
  const timeOf = (prop: string) =>
    parseIsoDuration(
      matchAttr(scope, prop, "datetime") ??
        matchAttr(scope, prop, "content") ??
        matchAllTexts(scope, prop)[0] ??
        null,
    );

  const title =
    // The recipe's own name is the heading carrying the itemprop; plain
    // first-name-in-scope can be the author/site.
    cleanText(
      scope.match(
        new RegExp(`<h[12][^>]*${itempropPattern("name")}[^>]*>([^<]+)`, "i"),
      )?.[1] ?? "",
    ) ||
    matchAllTexts(scope, "name")[0] ||
    cleanText(
      html.match(/<meta property="og:title" content="([^"]+)"/i)?.[1] ?? "",
    ) ||
    "Imported recipe";
  const image =
    matchAttr(scope, "image", "src") ??
    matchAttr(scope, "image", "content") ??
    html.match(/<meta property="og:image" content="([^"]+)"/i)?.[1] ??
    null;

  return {
    title: cleanText(title),
    description:
      cleanText(
        html.match(/<meta name="description" content="([^"]+)"/i)?.[1] ?? "",
      ) || null,
    servings: parseYield(matchAllTexts(scope, "recipeYield")[0] ?? null),
    prepMinutes: timeOf("prepTime"),
    cookMinutes: resolveCookMinutes(
      timeOf("prepTime"),
      timeOf("cookTime"),
      timeOf("totalTime"),
    ),
    imageUrl: image,
    ingredients,
    steps: stripStepNumbers(steps),
  };
}

function matchAllTexts(html: string, itemprop: string): string[] {
  const results: string[] = [];
  // Match only the OPENING TAG, then walk forward to the property's end in
  // JS. Doing the end in a lookahead would drop a property whose closing tag
  // is missing; here a broken one is merely truncated at the cap, which is
  // visible in the form rather than a silently missing ingredient.
  const regex = new RegExp(`${itempropPattern(itemprop)}[^>]*>`, "gi");
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) != null) {
    const after = html.slice(
      match.index + match[0].length,
      match.index + match[0].length + PROPERTY_MAX_CHARS,
    );
    const end = after.search(PROPERTY_END);
    const text = cleanText(end === -1 ? after : after.slice(0, end));
    if (text) results.push(text);
  }
  return results;
}

function matchAttr(
  html: string,
  itemprop: string,
  attr: string,
): string | null {
  const prop = itempropPattern(itemprop);
  return (
    html.match(new RegExp(`${prop}[^>]*${attr}="([^"]+)"`, "i"))?.[1] ??
    html.match(new RegExp(`${attr}="([^"]+)"[^>]*${prop}`, "i"))?.[1] ??
    null
  );
}

// A numeric entity, decimal or hex. Decoding the whole range beats listing
// entities one at a time: the old code knew "&#39;" but not its hex twin
// "&#x27;", so RecipeTin and Love & Lemons descriptions imported reading
// "It&#x27;s a perfect side salad".
function decodeNumericEntity(match: string, digits: string, hex: boolean) {
  const code = hex ? parseInt(digits, 16) : Number(digits);
  if (!Number.isFinite(code) || code <= 0 || code > 0x10ffff) return match;
  try {
    return String.fromCodePoint(code);
  } catch {
    return match; // lone surrogate or similar – leave the source text alone
  }
}

// Named entities, the ones recipe sites actually emit. Before 2026-08-04 only
// six were handled, so `&rsquo;` `&eacute;` `&ndash;` survived verbatim into
// titles, steps and ingredient names – and `&frac12;` was worse than cosmetic:
// it never became ½, so the amount regex saw no leading number and "&frac12;
// cup sugar" was stored as the NAME with no quantity at all. The amount was
// silently lost on the shopping list, which is the screen that has to be right.
//
// Deliberately a curated table, not the full HTML5 set (~2,200 names): Latin-1,
// the punctuation and the fractions cover every Western recipe site, and an
// unknown entity is left VISIBLE in the text rather than swallowed, so the next
// one that turns up is obvious rather than mysterious.
//
// `amp` is deliberately ABSENT – see the ordering note in cleanText.
const NAMED_ENTITIES: Record<string, string> = {
  // Spaces and invisibles. The soft hyphen and zero-width joiners are dropped
  // rather than decoded: an invisible character inside an ingredient name would
  // travel into item_merge_key and split a shopping row for no visible reason.
  nbsp: " ", ensp: " ", emsp: " ", thinsp: " ", shy: "", zwnj: "", zwj: "",
  // Quotes and dashes – the commonest gibberish in imported prose.
  quot: '"', apos: "'", lsquo: "‘", rsquo: "’",
  ldquo: "“", rdquo: "”", sbquo: "‚", bdquo: "„",
  lsaquo: "‹", rsaquo: "›", laquo: "«", raquo: "»",
  ndash: "–", mdash: "—", hellip: "…",
  bull: "•", middot: "·", prime: "′", Prime: "″",
  lt: "<", gt: ">",
  // Fractions. These are the ones that cost an amount, not just a character.
  frac12: "½", frac13: "⅓", frac23: "⅔", frac14: "¼", frac34: "¾",
  frac15: "⅕", frac25: "⅖", frac35: "⅗", frac45: "⅘",
  frac16: "⅙", frac56: "⅚", frac18: "⅛", frac38: "⅜", frac58: "⅝", frac78: "⅞",
  // Symbols that appear in amounts and oven temperatures.
  deg: "°", plusmn: "±", times: "×", divide: "÷", frasl: "⁄",
  minus: "−", sup2: "²", sup3: "³", ordm: "º", ordf: "ª",
  euro: "€", pound: "£", cent: "¢", yen: "¥",
  sect: "§", para: "¶", dagger: "†", copy: "©", reg: "®", trade: "™",
  // Accented Latin, lower case. Case matters: &Eacute; is a different
  // character from &eacute;, so both cases are listed rather than folded.
  agrave: "à", aacute: "á", acirc: "â", atilde: "ã", auml: "ä", aring: "å",
  aelig: "æ", ccedil: "ç", egrave: "è", eacute: "é", ecirc: "ê", euml: "ë",
  igrave: "ì", iacute: "í", icirc: "î", iuml: "ï", ntilde: "ñ",
  ograve: "ò", oacute: "ó", ocirc: "ô", otilde: "õ", ouml: "ö", oslash: "ø",
  ugrave: "ù", uacute: "ú", ucirc: "û", uuml: "ü",
  yacute: "ý", yuml: "ÿ", szlig: "ß", eth: "ð", thorn: "þ",
  // Accented Latin, upper case.
  Agrave: "À", Aacute: "Á", Acirc: "Â", Atilde: "Ã", Auml: "Ä", Aring: "Å",
  AElig: "Æ", Ccedil: "Ç", Egrave: "È", Eacute: "É", Ecirc: "Ê", Euml: "Ë",
  Igrave: "Ì", Iacute: "Í", Icirc: "Î", Iuml: "Ï", Ntilde: "Ñ",
  Ograve: "Ò", Oacute: "Ó", Ocirc: "Ô", Otilde: "Õ", Ouml: "Ö", Oslash: "Ø",
  Ugrave: "Ù", Uacute: "Ú", Ucirc: "Û", Uuml: "Ü",
  Yacute: "Ý", ETH: "Ð", THORN: "Þ",
};

function cleanText(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&#(\d+);/g, (m, d: string) => decodeNumericEntity(m, d, false))
    .replace(/&#[xX]([0-9a-fA-F]+);/g, (m, d: string) =>
      decodeNumericEntity(m, d, true),
    )
    // One pass over the table. An entity that is not in it falls through
    // unchanged, which is on purpose – see the note above.
    .replace(/&([a-zA-Z][a-zA-Z0-9]*);/g, (m, name: string) =>
      Object.prototype.hasOwnProperty.call(NAMED_ENTITIES, name)
        ? NAMED_ENTITIES[name]
        : m,
    )
    // Last on purpose, and NOT in the table above: decoding "&amp;" first would
    // turn a literal "&amp;#39;" into "&#39;" and then into an apostrophe it
    // never was. The same trap in reverse is why numeric entities are decoded
    // before the named pass.
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    // Tags become a space, so an inline tag sitting right before punctuation
    // leaves one behind: "<a>skyr</a>, neutral" cleaned to "skyr , neutral"
    // and that space travelled onto the shopping list.
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();
}

// ── Ingredient strings → name + quantity ─────────────────────────────────
// Site strings are quantity-first ("400 g cherry tomatoes", "2 fed
// hvidløg", "1/2 tsp salt"). We split a leading amount and an optional
// known unit; the rest is the name. Unknown middle words stay in the name
// ("1 stort løg" → 1 + "stort løg").
//
// What is left after that split is a shopping-list item, so it has to read
// like one. Sites put a lot more than the ingredient in `recipeIngredient`:
// prep instructions ("onion, diced"), parentheticals ("cheese, grated (any
// melting cheese will do)"), alternatives ("spur chilies or another mild,
// red pepper"), trailing amounts ("coriander leaves, 1 large handful") and
// occasionally a whole sentence ("Prik Nam Pla (…): Mix together some fish
// sauce, …"). Left in place they end up verbatim on the shopping list, which
// is the one screen that has to be scannable in a supermarket aisle.

const UNITS = new Set([
  // metric + Danish
  "g",
  "gram",
  "grams",
  "gr",
  "kg",
  "kilogram",
  "kilograms",
  "mg",
  "ml",
  "milliliter",
  "millilitre",
  "milliliters",
  "millilitres",
  "cl",
  "dl",
  "l",
  "liter",
  "litre",
  "liters",
  "litres",
  "head",
  "heads",
  "tsk",
  "spsk",
  "knsp",
  "stk",
  "fed",
  "dåse",
  "dåser",
  "bundt",
  "håndfuld",
  "glas",
  "pakke",
  "pakker",
  "bæger",
  "skive",
  "skiver",
  "ps",
  "pose",
  "poser",
  "nip",
  "kvist",
  "kviste",
  "stilk",
  "stilke",
  "brev",
  "plade",
  "plader",
  "bakke",
  "net",
  "bundter",
  // English
  "tsp",
  "tbsp",
  "teaspoon",
  "teaspoons",
  "tablespoon",
  "tablespoons",
  "cup",
  "cups",
  "oz",
  "ounce",
  "ounces",
  "lb",
  "lbs",
  "pound",
  "pounds",
  "pcs",
  "piece",
  "pieces",
  // US shorthand: "0.5 c. heavy cream". The trailing period is stripped
  // before the lookup. Deliberately NOT "t"/"T" – the lookup lowercases, so
  // teaspoon and tablespoon would collapse into one and silently halve or
  // triple the amount. Better to leave those in the name than get them wrong.
  "c",
  "clove",
  "cloves",
  "can",
  "cans",
  "pinch",
  "handful",
  "slice",
  "slices",
  "bunch",
  "sprig",
  "sprigs",
  "stick",
  "sticks",
]);

// Sites write "½ tsp" as often as "1/2 tsp"; the amount regex only knows
// ASCII, so fold the glyphs first or the whole string stays in the name.
const VULGAR_FRACTIONS: Record<string, string> = {
  "½": "1/2",
  "⅓": "1/3",
  "⅔": "2/3",
  "¼": "1/4",
  "¾": "3/4",
  "⅕": "1/5",
  "⅖": "2/5",
  "⅗": "3/5",
  "⅘": "4/5",
  "⅙": "1/6",
  "⅚": "5/6",
  "⅐": "1/7",
  "⅛": "1/8",
  "⅜": "3/8",
  "⅝": "5/8",
  "⅞": "7/8",
};

// A trailing ", …" clause opening with one of these is prep or a qualifier,
// never part of what you buy. Danish included – imports are bilingual.
const PREP_CLAUSE_OPENERS = new Set([
  // English
  "diced", "sliced", "chopped", "minced", "grated", "crushed", "peeled",
  "halved", "quartered", "cubed", "shredded", "drained", "rinsed", "melted",
  "softened", "beaten", "trimmed", "cut", "torn", "crumbled", "zested",
  "juiced", "roughly", "finely", "thinly", "coarsely", "freshly", "lightly",
  "well", "to", "or", "optional", "for", "as", "plus", "divided", "packed",
  "use", "any", "your",
  "preferably", "about", "approximately", "ideally", "cooked", "uncooked",
  "raw", "at", "room",
  // Danish
  "hakket", "finthakket", "grofthakket", "revet", "snittet", "skrællet",
  "skåret", "delt", "efter", "til", "evt", "eller", "i", "ca", "gerne",
  "helst", "fint", "groft", "valgfrit", "samt", "plus", "om", "cirka",
]);

// A clause can also END in the prep word rather than open with it:
// "chicken breasts, bone and skin removed".
const PREP_CLAUSE_ENDINGS = new Set([
  "removed", "chopped", "diced", "sliced", "minced", "grated", "melted",
  "softened", "drained", "rinsed", "peeled", "trimmed", "crushed", "beaten",
  "cubed", "shredded", "halved", "quartered", "torn", "zested", "juiced",
  "crumbled", "separated", "reserved", "divided", "warmed", "chilled",
  "packed", "softened", "toasted", "sifted", "strained",
  // Danish – past participles, the usual "løg, finthakket" shape.
  "hakket", "finthakket", "grofthakket", "revet", "snittet", "skrællet",
  "smeltet", "skåret", "delt", "kogt", "stegt", "ristet", "blendet",
  "presset", "udblødt", "drænet", "skyllet", "tørret", "optøet",
  "blødgjort", "pisket", "vasket", "renset", "udstenet", "flået",
]);

// An adverb that only ever modified the prep word. Once "chopped" is cut from
// "onion finely chopped", "finely" is left holding nothing and rides onto the
// shopping list as "onion finely" (BBC Good Food, found 2026-08-16 – also
// "garlic cloves finely" and "ball mozzarella roughly"). Stripped only from
// the END, so "freshly grated parmesan" – where the adverb sits in front of a
// noun and is part of what you buy – is untouched.
const TRAILING_ADVERBS = new Set([
  "finely", "roughly", "thinly", "coarsely", "freshly", "lightly", "well",
  "very", "fint", "groft", "grofthakket", "fintsnittet", "let", "godt",
]);

// Same idea without the comma – "Jasmine rice for serving".
const TRAILING_QUALIFIERS =
  /\s+(for serving|for garnish|to serve|to taste|as needed|if desired|optional|til servering|til pynt|til drys|efter smag|efter behov|efter ønske|om ønsket|valgfrit)\.?$/i;

function tidyIngredientName(raw: string): string {
  let name = raw;

  // "Prik Nam Pla (…): Mix together some fish sauce, …" – everything after a
  // colon is the site explaining what to do, not another thing to buy.
  const colon = name.indexOf(":");
  if (colon > 0) name = name.slice(0, colon);

  // "(any melting cheese will do)", "(or sub dark soy sauce …)". Repeated,
  // because sites nest them – RecipeTin writes "(, finely chopped (brown,
  // yellow or white))" and a single pass stops at the first ")", leaving an
  // orphan bracket on the shopping list.
  for (let i = 0; i < 4; i++) {
    const stripped = name.replace(/\s*\([^()]*\)/g, " ");
    if (stripped === name) break;
    name = stripped;
  }
  // Whatever brackets survive were unbalanced in the source.
  name = name.replace(/[()]/g, " ");

  // "1 lb / 500g beef mince", "800g / 28 oz can crushed tomato" – the second
  // unit is a conversion for the reader, not a second thing to buy.
  name = name.replace(/^\s*\/\s*[\d\s.,/]+[a-z]*\s+/i, "");

  // "1 pinch of ground cumin", "2 slices of white bread"
  name = name.replace(/^(?:of|af)\s+/i, "");

  // A multiplier we could not fold, because the unit was unknown: "2 x large
  // eggs" keeps its amount of 2, but the bare "x" is not part of the name.
  name = name.replace(/^[x×]\s+/i, "");

  // "spur chilies or another mild, red pepper" – buy the first alternative.
  // Only when something substantial precedes the "or": in "store-bought or
  // homemade brownies" the head noun lives in the SECOND half, and cutting
  // there would leave "store-bought".
  const orCut = name.search(/\s+\b(?:or|eller)\b\s+/i);
  if (orCut > 0 && name.slice(0, orCut).trim().split(/\s+/).length >= 2) {
    name = name.slice(0, orCut);
  }

  name = name.replace(TRAILING_QUALIFIERS, "");

  // Strip trailing prep clauses, repeatedly: "long beans, cut into short
  // pieces" and "cheese, grated" both end up as the bare ingredient.
  for (let i = 0; i < 4; i++) {
    const comma = name.lastIndexOf(",");
    if (comma <= 0) break;
    const clause = name.slice(comma + 1).trim();
    const words = clause.split(/\s+/);
    const opener = words[0]?.toLowerCase().replace(/[.]$/, "");
    const ending = words[words.length - 1]?.toLowerCase().replace(/[.]$/, "");
    const isPrep =
      (opener && PREP_CLAUSE_OPENERS.has(opener)) ||
      (ending && PREP_CLAUSE_ENDINGS.has(ending));
    if (!isPrep) break;
    name = name.slice(0, comma);
  }

  // Clauses left dangling by an earlier "or" cut, or a bare inline count, are
  // not part of the name. Great British Chefs writes "green chillies, 1–2,
  // with or without seeds…"; the or-cut leaves "green chillies, 1–2, with",
  // and these two strips take it down to "green chillies".
  for (let i = 0; i < 3; i++) {
    const before = name;
    name = name.replace(/,\s*(?:with|and|of|plus|in|for|on|to)\s*$/i, "");
    name = name.replace(/,\s*\d+(?:\s*[-–]\s*\d+)?\s*$/, "");
    if (name === before) break;
  }

  // Some sites drop the comma entirely – BBC Good Food writes "300g celery
  // sliced" and "200g potatoes peeled and cut into chunks". Cut at the first
  // prep participle, but never at the first word: "shredded cheese" and
  // "crushed tomato" are what you buy, not instructions.
  // Only when the participle ENDS the string ("celery sliced") or opens a
  // conjunction ("potatoes peeled and cut into chunks"). If a noun follows it
  // instead, the participle is part of the product – "can crushed tomato",
  // "shredded cheese" – and cutting there would throw away what you buy.
  if (!name.includes(",")) {
    // TRIM FIRST. Stripping "(optional)" off "basil leaves torn (optional)"
    // leaves a trailing space, so splitting produced an empty final token –
    // and the "is this the last word" test below compares against `undefined`,
    // which "" is not. So "torn" read as mid-string, no cut happened, and the
    // shopping list said "large handful basil leaves torn" (2026-08-16).
    const words = name.trim().split(/\s+/);
    const at = words.findIndex((w, i) => {
      if (i < 1 || !PREP_CLAUSE_ENDINGS.has(w.toLowerCase())) return false;
      const next = words[i + 1]?.toLowerCase();
      return next === undefined || next === "and" || next === "og";
    });
    if (at > 0) name = words.slice(0, at).join(" ");
  }

  // Whatever the cuts above left, an adverb must not END the name. Repeated,
  // because "finely and thinly sliced" leaves two.
  for (let i = 0; i < 3; i++) {
    const words = name.trim().split(/\s+/);
    const last = words[words.length - 1]?.toLowerCase().replace(/[.,]$/, "");
    // Never strip the only word – an ingredient called just "well" is not
    // something we can improve by emptying it.
    if (words.length < 2 || !last || !TRAILING_ADVERBS.has(last)) break;
    name = words.slice(0, -1).join(" ");
  }

  // Dashes join the trailing punctuation strip (2026-08-04). Sites write
  // "beef – diced" as often as "beef, diced", and the cuts above take the prep
  // word while leaving the separator behind: "beef –" on a shopping list. Found
  // while testing the entity decoding, because &ndash; now becomes a real dash
  // instead of gibberish, which made the dangling one visible.
  return name.replace(/\s+/g, " ").replace(/[\s,.;–—-]+$/, "").trim();
}

// The shopping list merges on name + UNIT STRING (item_merge_key, migration
// 0013), so "2 tablespoons olive oil" and "2 tbsp olive oil" become two rows
// unless the unit is written the same way. Fold the spelled-out forms onto
// the abbreviation. Only units whose abbreviation reads correctly at any
// amount are listed – "cup"/"cups" and "clove"/"cloves" are deliberately
// absent, since "2 cup" and "1 cloves" would read wrong on the list.
const UNIT_ALIASES: Record<string, string> = {
  c: "cup",
  tablespoon: "tbsp",
  tablespoons: "tbsp",
  teaspoon: "tsp",
  teaspoons: "tsp",
  gram: "g",
  grams: "g",
  gr: "g",
  kilogram: "kg",
  kilograms: "kg",
  milliliter: "ml",
  millilitre: "ml",
  milliliters: "ml",
  millilitres: "ml",
  liter: "l",
  litre: "l",
  liters: "l",
  litres: "l",
  ounce: "oz",
  ounces: "oz",
  pound: "lb",
  pounds: "lb",
  lbs: "lb",
};

// Sites write the same thing both ways round: "5 cloves garlic" gives unit
// "cloves" + name "garlic", while "2 garlic cloves" gives no unit and name
// "garlic cloves". Those are one ingredient and have to merge, so when the
// amount carries no unit and the name ENDS in one, move it across.
function liftTrailingUnit(
  name: string,
  amount: string,
): { name: string; quantityText: string } {
  const words = name.split(/\s+/);
  const last = words[words.length - 1]?.toLowerCase();
  // Never strip the only word – "2 slices" is already just a unit.
  if (words.length < 2 || !last || !UNITS.has(last)) {
    return { name, quantityText: amount };
  }
  return {
    name: words.slice(0, -1).join(" "),
    quantityText: `${amount} ${UNIT_ALIASES[last] ?? last}`,
  };
}

// The container a multiplied pack comes in. Once "2 x 400g" has become
// "800 g", the word is describing packaging rather than food, and "cans
// chopped tomatoes" is not what you look for on a shelf.
const PACK_CONTAINERS = new Set([
  "can", "cans", "tin", "tins", "jar", "jars", "pack", "packs", "packet",
  "packets", "tub", "tubs", "carton", "cartons", "bottle", "bottles",
  "dåse", "dåser", "pakke", "pakker", "glas", "bæger", "pose", "poser",
]);

/**
 * "2 x 400g cans chopped tomatoes" → "800 g chopped tomatoes".
 *
 * The multiplier form defeated the amount regex, which read the leading "2"
 * and left the REST as the name – "x 400g cans chopped tomatoes" on the
 * shopping list (BBC Good Food, found 2026-08-16).
 *
 * Multiplying rather than keeping "2 x 400 g" is deliberate: the shopping list
 * merges on name + unit string (item_merge_key, migration 0013), so "800 g
 * chopped tomatoes" adds up with another recipe's "400 g" into 1200 g, while a
 * "2 x 400 g" unit string would sit beside them as a third row. What is lost
 * is the word "cans", and 800 g of chopped tomatoes is still two of them.
 *
 * Only folded when the unit is one we know. "2 x large eggs" keeps its shape
 * rather than becoming a number we invented.
 */
function foldPackMultiplier(text: string): string {
  const match = text.match(
    /^(\d+)\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*([a-zA-Z]+)\b\s*(.*)$/,
  );
  if (!match) return text;
  const unit = match[3].toLowerCase();
  if (!UNITS.has(unit)) return text;
  const total = Number(match[1]) * Number(match[2].replace(",", "."));
  if (!Number.isFinite(total) || total <= 0) return text;
  const rest = match[4].trim().split(/\s+/);
  if (rest.length > 1 && PACK_CONTAINERS.has(rest[0].toLowerCase())) {
    rest.shift();
  }
  return `${total} ${UNIT_ALIASES[unit] ?? unit} ${rest.join(" ")}`.trim();
}

function splitIngredientParts(text: string): {
  name: string;
  quantityText: string | null;
} {
  // "1½ tsp" means one and a half. Folding the glyph without a separator
  // would splice it onto the whole number and read as eleven halves.
  const cleaned = cleanText(text)
    .replace(
      /(\d?)\s*([½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅐⅛⅜⅝⅞])/g,
      (_all, lead: string, glyph: string) =>
        (lead ? `${lead} ` : "") + (VULGAR_FRACTIONS[glyph] ?? glyph),
    )
    // A leading amount range – keep the low end. The main amount regex only
    // knows decimal ranges ("500-600 g"); a fraction on either side left the
    // rest in the name, so "1/4 -1/2 teaspoon crushed red pepper" parsed as
    // amount "1/4", name "-1/2 teaspoon crushed red pepper".
    .replace(/^(\d+(?:\/\d+)?)\s*[-–]\s*\d+(?:\/\d+)?(?=\s|$)/, "$1")
    // BBC glues an imperial conversion to the metric unit with a slash and no
    // space: "45g/2oz Parmesan", "500ml/18fl oz milk". The conversion is for
    // the reader, not a second thing to buy, and it can span two tokens
    // ("18fl oz"), so drop it whole and leave "45 g Parmesan".
    .replace(
      /(\d)\s*([a-zA-Z]+)\s*\/\s*[\d\s.,/]*(?:fl\s*)?[a-zA-Z]{1,4}\b/,
      "$1 $2",
    );
  // Last, so it sees a string whose fractions and conversions are already
  // resolved: "2 x 400g cans chopped tomatoes" → "800 g chopped tomatoes".
  const folded = foldPackMultiplier(cleaned);
  const match = folded.match(
    /^(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:[.,]\d+)?(?:\s*[-–]\s*\d+(?:[.,]\d+)?)?)\s*(.*)$/,
  );

  // No leading amount. The amount may still be trailing – "coriander leaves,
  // 1 large handful" – in which case that clause is the quantity, not a name.
  if (!match) {
    const trailing = folded.match(/^(.*?),\s*(\d[^,]*)$/);
    if (trailing) {
      const name = tidyIngredientName(trailing[1]);
      if (name) return { name, quantityText: trailing[2].trim() };
    }
    return { name: tidyIngredientName(folded) || folded, quantityText: null };
  }

  const amount = match[1].replace(/\s*[-–]\s*\d+(?:[.,]\d+)?$/, ""); // ranges: keep the low end
  const rest = match[2].trim();
  const firstWord =
    rest.split(/\s+/)[0]?.toLowerCase().replace(/[.,]$/, "") ?? "";
  // "2 c. à soupe" is a French TABLESPOON, not a cup – reading the bare "c"
  // as a unit there would inflate the amount ~16x. Bail out and leave the
  // whole thing in the name rather than invent a wrong quantity.
  const secondWord = rest.split(/\s+/)[1]?.toLowerCase() ?? "";
  const ambiguousC =
    firstWord === "c" && (secondWord === "à" || secondWord === "a");

  if (UNITS.has(firstWord) && !ambiguousC) {
    const unit = UNIT_ALIASES[firstWord] ?? firstWord;
    const name = tidyIngredientName(rest.slice(rest.indexOf(" ") + 1).trim());
    // "2 dl fløde" → quantity "2 dl", name "fløde"
    return name
      ? { name, quantityText: `${amount} ${unit}` }
      : { name: tidyIngredientName(rest) || rest, quantityText: amount };
  }
  const name = tidyIngredientName(rest);
  if (!name) {
    return { name: tidyIngredientName(folded) || folded, quantityText: null };
  }
  // No unit was found up front, but the name may end in one.
  return liftTrailingUnit(name, amount);
}

/**
 * Is this "ingredient" really a SECTION HEADING?
 *
 * Schema.org's `recipeIngredient` is a flat list of strings, so a site that
 * groups its ingredients has nowhere to say so – the heading arrives as just
 * another entry. ambitiouskitchen.com's cinnamon rolls gave us "DOUGH",
 * "FILLING" and "CREAM CHEESE FROSTING" (Thomas, 2026-08-04), which without
 * this would land on the shopping list next to the milk.
 *
 * DELIBERATELY CAUTIOUS, because the two mistakes are not equally bad. A false
 * negative leaves a heading looking like an ingredient – visible, and one tap
 * to fix. A false positive HIDES a real ingredient from the list and from the
 * shopping list, where nobody would think to look for it.
 *
 * So "has no amount" is never enough on its own: that same recipe lists
 * "Extra-virgin olive oil" with no amount, and it is a real ingredient. A
 * heading also has to LOOK like one – shouted, or punctuated as a heading.
 *
 * The one accepted false positive: a site that SHOUTS a single amountless
 * ingredient ("MILK") gets it read as a heading. No site we have imported does
 * that, and the cost is one visible row to fix rather than a hidden one.
 */
function looksLikeSectionHeading(
  raw: string,
  parsed: { name: string; quantityText: string | null },
): boolean {
  const name = parsed.name.trim();
  // An amount settles it: headings never carry one.
  if (parsed.quantityText != null && parsed.quantityText.trim() !== "") {
    return false;
  }
  if (name.length === 0 || name.length > 40) return false;
  // A digit means a measurement or a count crept in - not a heading.
  if (/\d/.test(name)) return false;
  if (name.split(/\s+/).length > 5) return false;

  const letters = name.replace(/[^A-Za-zÀ-ÿ]/g, "");
  if (letters.length < 2) return false;

  // "DOUGH", "CREAM CHEESE FROSTING" - shouted, which no site does for a
  // single ingredient.
  if (letters === letters.toUpperCase()) return true;
  // "For the dough:", "Dough:" - punctuated as a heading. Tested on the RAW
  // string, because tidyIngredientName has already stripped the colon by the
  // time we see the parsed name, which made "Dough:" slip through.
  if (raw.trim().endsWith(":")) return true;
  // "For the filling" - the other common phrasing, without the colon.
  if (/^for the\s/i.test(name)) return true;
  return false;
}

export function splitIngredient(text: string): {
  name: string;
  quantityText: string | null;
  isSection: boolean;
} {
  const parsed = splitIngredientParts(text);
  const isSection = looksLikeSectionHeading(text, parsed);
  return {
    name: isSection ? parsed.name.replace(/:\s*$/, "") : parsed.name,
    quantityText: parsed.quantityText,
    isSection,
  };
}

