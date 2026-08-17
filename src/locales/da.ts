// Danish – a PARTIAL overlay on English. Anything missing here renders the
// English string from `en.ts`, so this file can grow a screen at a time
// without ever breaking the app.
//
// The type is a deep partial of `en`, which means a missing key is allowed but
// a MISSPELLED one is a build error.
//
// ⚠️ NOT TRANSLATED, deliberately:
// - **The name and the tagline.** "Prep+Eat" and "Prep. Eat. Repeat." are
//   brand, not UI.
// - **Recipe content.** A recipe typed or imported in Danish stays Danish on
//   an English phone and the other way round – only the app's own chrome
//   changes language.
// - **Category values.** The Danish words below are LABELS; the stored `aisle`
//   stays English so two members of one kitchen on differently-set phones
//   still agree on what a category is.
import type { en } from '@/locales/en';

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends string ? string : DeepPartial<T[K]>;
};

export const da: DeepPartial<typeof en> = {
  categories: {
    produce: 'Frugt & grønt',
    dairy: 'Mejeri',
    meatFish: 'Kød & fisk',
    bakery: 'Bageri',
    frozen: 'Frost',
    // Supermarket Danish for the dry-goods aisle. "Spisekammer" is the literal
    // translation of Pantry and reads like a room in a house, not an aisle.
    pantry: 'Kolonial',
    drinks: 'Drikkevarer',
    household: 'Husholdning',
    other: 'Andet',
  },

  week: {
    number: 'Uge %{number}',
    previous: 'Forrige uge',
    next: 'Næste uge',
  },

  undo: {
    action: 'Fortryd',
    // Danish puts the participle after the subject exactly as English does, so
    // "Mælk slettet" and "4 varer flyttet" compose the same way. A language
    // where it does not would need the whole sentence as one key.
    deleted: 'slettet',
    cleared: 'ryddet',
    moved: 'flyttet',
    removed: 'fjernet',
    itemCount: {
      one: '%{count} vare',
      other: '%{count} varer',
    },
  },

  plan: {
    title: 'Ugeplan',
    listNote: 'Din indkøbsliste opdaterer sig, mens du planlægger.',

    error: {
      title: 'Kan ikke hente din plan',
      message:
        'Vi kunne ikke hente din ugeplan. Tjek din forbindelse, og prøv igen – intet i din plan er gået tabt.',
    },

    day: {
      addMeal: 'Tilføj måltid',
      noMeal: 'Intet måltid tilføjet',
    },

    meal: {
      open: 'Åbn %{title}',
      move: 'Flyt til en anden dag',
      swap: 'Byt måltid',
      servings: 'Skift portioner',
      remove: 'Fjern måltid',
    },

    move: {
      title: 'Flyt til en anden dag',
      subtitle: 'Har du lyst til dette måltid en anden dag?',
      to: 'Flyt måltid til %{day}',
      already: 'Allerede på denne dag',
    },

    servings: {
      title: 'Skift portioner',
      subtitle: 'Får I gæster?',
      submit: 'Skift portioner',
      fewer: 'Færre portioner',
      more: 'Flere portioner',
      count: {
        one: '%{count} portion',
        other: '%{count} portioner',
      },
    },

    add: {
      // Danish weekdays are lower case, so this reads "Tilføj til mandag" –
      // see the note on DAY_NAMES in week.ts.
      titleAdd: 'Tilføj til %{day}',
      titleDayFallback: 'dagen',
      titleSwap: 'Byt måltid',
      subtitleSwap: 'Har du lyst til noget andet?',
      tabRecipes: 'Opskrifter',
      tabManual: 'Noget andet',
      mealName: 'Måltidets navn',
      mealNamePlaceholder: 'F.eks. rester',
      all: 'Alle',
      favorites: 'Favoritter',
      submitAdd: 'Tilføj til plan',
      submitSwap: 'Byt måltid',
      search: 'Søg',
      searchRecipes: 'Søg i opskrifter',
      clearSearch: 'Ryd søgning',
      noMatch: 'Ingen opskrift til “%{query}” endnu',
      noRecipes: 'Ingen opskrifter endnu',
      noMatchBody: 'Du har den ikke i dit bibliotek – tilføj den nedenfor.',
      addRecipe: 'Tilføj opskrift',
    },
  },

  shopping: {
    title: 'Indkøbsliste',
    addItem: 'Tilføj en vare',
    moveToThisWeek: 'Flyt alle varer til denne uge',
    reorderCategories: 'Sortér kategorier',
    reorderHint: 'Træk, så rækkefølgen passer til din vej gennem butikken.',

    live: {
      live: 'Live',
      connecting: 'Forbinder',
      offline: 'Offline',
    },

    error: {
      title: 'Kan ikke hente din liste',
      message:
        'Vi kunne ikke hente din indkøbsliste. Tjek din forbindelse, og prøv igen – intet på din liste er gået tabt.',
    },

    empty: {
      // ⚠️ IMPROVISED, NOT A TRANSLATION – flagged for Thomas. "Time to prep"
      // has no Danish equivalent that is not either the meal-prep loanword
      // ("Tid til at prepe" – batch-cooking with plastic tubs, the exact
      // misreading `2.21` was raised about) or flat ("Tid til at forberede").
      // "Klar til ugen" keeps the forward-looking tone and drops the pun.
      title: 'Klar til ugen',
      body: 'Måltider, du planlægger for denne uge, lander her helt af sig selv. Tilføj det andet, du mangler, ovenfor.',
    },

    done: {
      heading: {
        one: '%{count} vare klaret',
        other: '%{count} varer klaret',
      },
      show: 'Vis %{label}',
      hide: 'Skjul %{label}',
      clear: 'Ryd klarede varer',
    },

    row: {
      edit: 'Rediger %{name}',
      delete: 'Slet %{name}',
    },

    edit: {
      title: 'Rediger vare',
      save: 'Færdig',
      name: 'Navn',
      quantity: 'Mængde',
      quantityPlaceholder: 'f.eks. 250 g',
      category: 'Kategori',
      categoryHint: 'Dit køkken husker det her.',
      categoryChoose: 'Vælg en kategori',
      categoryNone: 'ingen endnu',
      categoryLabel: 'Kategori: %{value}',
    },
  },
};
