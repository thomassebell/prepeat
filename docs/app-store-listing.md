# App Store listing – Prep+Eat

Draft 2026-07-27. Every field below maps to a box in App Store Connect.
Character limits are Apple's and are hard – the field simply will not accept
more. Counts are checked at the bottom of this file.

---

## Name (max 30)

```
Prep+Eat
```

## Subtitle (max 30)

```
prep. cook. eat. repeat.
```

Decided 2026-07-27, see [trademark-search.md](trademark-search.md) – including
the UK caveat, which applies to this field as much as anywhere.

## Promotional text (max 170)

Editable any time WITHOUT submitting a new build – the one field you can
change freely, so use it for seasonal or "what's new" messages later.

```
Plan the week's dinners together. Everyone's shopping list updates on every
phone the moment the plan changes – no messages, no forgotten items.
```

## Keywords (max 100, comma-separated, no spaces after commas)

Do not repeat words already in the Name or Subtitle – Apple indexes those
separately, so repeating them wastes the budget.

```
meal planner,weekly menu,family,grocery list,shopping,recipe box,dinner,cooking,household,groceries
```

## Description (max 4000)

```
Prep+Eat is the kitchen your whole family shares.

Plan the week's meals together, keep every recipe in one place, and shop from
a list that updates on everyone's phone at the same moment. No more "did you
already get milk?" from the supermarket aisle.


PLAN THE WEEK

Give each day as many meals as it needs. Set servings per meal – cooking for
three on Tuesday and eight on Saturday is normal, and the shopping quantities
follow automatically. Swap a meal, move it to another day, or drop it, and
everything downstream keeps up.

Not every meal is a recipe. Leftovers and eating out belong on the plan too.


ONE SHOPPING LIST, LIVE ON EVERY PHONE

The list builds itself from the plan. Add a meal and its ingredients appear;
change the servings and the amounts rescale; remove it and its share comes
back off – without touching anything you have already ticked or edited by
hand.

Whoever is closest to the shop does the shopping. Items tick off live on
everyone's phone, so two people in two aisles never buy the same thing twice.

Items sort into supermarket sections, and the app learns your corrections.
Move something to Dairy once and it stays there.


YOUR RECIPES, YOUR WAY

Type them in, or paste a link and let Prep+Eat read the ingredients, steps and
photo for you – with a credit back to the original site. Add your own photos.
Search by name or by ingredient, so "what can I make with aubergine?" has an
answer.

Cooking mode ticks off ingredients and steps as you go, on your phone only.


BUILT FOR A HOUSEHOLD

Invite the family with a code. Everyone sees the same recipes, the same plan
and the same list, instantly. Belong to more than one household – your family
and your flat, a summer house, your parents' kitchen – and switch between
them.

Leave a household and your recipes come with you.


NO ADS. NO TRACKING. NO NONSENSE.

Prep+Eat contains no advertising, no analytics and no third-party tracking of
any kind. Your data is stored in the EU. Delete your profile from inside the
app and it is gone – properly, immediately, with no hidden copy.

We do not want your attention. We want you to plan dinner and get on with your
evening.


Sign in with your email – there is no password to forget.
```

## Description – v1.1 REVISION (drafted 2026-08-10, DO NOT SUBMIT YET)

⚠️ **The block above is what is bound to the v1.0 submission, still in review.**
Changing metadata mid-review invites questions for no benefit (same reasoning as
the `github.io` → `prepeat.app` URL item in the backlog). This revision ships
with the **v1.1 version record**, not before.

Reviewed against the Synthetic User Panel findings. **The finding was that the
listing was already ahead of the app** – six of the seven capabilities the panel
said first run hides were already described here. So this is a small revision,
not a rewrite.

```
Prep+Eat is a kitchen you share.

Plan the week's meals together, keep every recipe in one place, and shop from
a list that updates on everyone's phone at the same moment. No more "did you
already get milk?" from the supermarket aisle.


PLAN THE WEEK

Give each day as many meals as it needs. Set servings per meal – cooking for
three on Tuesday and eight on Saturday is normal, and the shopping quantities
follow automatically. Swap a meal, move it to another day, or drop it, and
everything downstream keeps up.

Not every meal is a recipe. Leftovers and eating out belong on the plan too.


ONE SHOPPING LIST, LIVE ON EVERY PHONE

The list builds itself from the plan. Add a meal and its ingredients appear;
change the servings and the amounts rescale; remove it and its share comes
back off – without touching anything you have already ticked or edited by
hand.

Add anything else straight to the list – washing-up liquid, nappies, dog food.
It does not have to come from a recipe.

Whoever is closest to the shop does the shopping. Items tick off live on
everyone's phone, so two people in two aisles never buy the same thing twice.

Items sort into supermarket sections, and the app learns your corrections.
Move something to Dairy once and it stays there.


YOUR RECIPES, YOUR WAY

Type them in, or paste a link and let Prep+Eat read the ingredients, steps and
photo for you – with a credit back to the original site. Add your own photos.
Search by name or by ingredient, so "what can I make with aubergine?" has an
answer.

Cooking mode ticks off ingredients and steps as you go, on your phone only.


SHARE YOUR KITCHEN

Invite the others with a code. Everyone sees the same recipes, the same plan
and the same list, instantly. Belong to more than one kitchen – home, a flat
share, a summer house, your parents' – and switch between them.

Cooking alone works too. A kitchen of one is still a kitchen.

Leave a kitchen and your recipes come with you.


NO ADS. NO TRACKING. NO NONSENSE.

Prep+Eat contains no advertising, no analytics and no third-party tracking of
any kind. Your data is stored in the EU. Delete your profile from inside the
app and it is gone – properly, immediately, with no hidden copy.

We do not want your attention. We want you to plan dinner and get on with your
evening.


Sign in with your email – there is no password to forget.
```

### What changed, and why

1. **`household` → `kitchen` throughout**, and the heading *BUILT FOR A
   HOUSEHOLD* becomes *SHARE YOUR KITCHEN*. **The listing had the same
   two-vocabulary fault the panel caught in the app:** it opened on *"the kitchen
   your whole family shares"* and then said household five times. One thing, two
   words, reader left to reconcile them. Follows the app rename of 2026-08-10.
2. **Manual shopping items added** – *"Add anything else straight to the list –
   washing-up liquid, nappies, dog food."* This was the ONE capability of seven
   the listing omitted, and it is exactly the finding where two readers concluded
   the list could not hold non-food. The description repeated the app's silence.
3. **⚠️ The opening line drops "your whole family"** – now *"a kitchen you
   share."* **This is a positioning call, not a correction, and it is the one
   change to query.** A listing describes who it is FOR, which is legitimately
   different from in-app copy telling a user who they ARE. Revert to *"the
   kitchen your whole family shares"* if the family framing is deliberate; three
   of the four households the panel reviewed were not a permanent multi-person
   family, which is the argument the other way.
4. **`Cooking alone works too. A kitchen of one is still a kitchen.`** – new, and
   also cuttable. Pre-answers the panel's "is a household of one supported or
   broken?" at the store, before install.
5. **`Invite the family with a code` → `Invite the others with a code`** – drops
   an assertion, and does not have to change again when link-joining lands.

### Left alone deliberately

- **Keywords keep `household`.** Search vocabulary and UI vocabulary are
  different jobs – people search for the word even when the app stops using it.
  **Add `kitchen` alongside rather than swapping**, budget permitting.
- **The subtitle stays `prep. cook. eat. repeat.`** The panel found *repeat*
  *"accurate to Mette and an insult to Sofie and Rikke"* – so the one contested
  word sits in the most-read field. It is brand, so it stays; recorded so the
  split is known rather than discovered later.
- **Money is not mentioned.** The store shows Free with no in-app purchases, and
  that closed the finding (2026-08-10). A sentence would be redundant.

## What's New (max 4000) – for version 1.0

```
First release. Thank you for trying Prep+Eat.

Plan the week's meals, share one live shopping list with your household, and
keep your recipes in one place.

Found something broken or missing? Write to hello@prepeat.app – it reaches a
person.
```

---

## Notes on choices

- **The first three lines carry the listing.** Only they show before the
  "more" fold, so the shared-kitchen idea and the live list are there and
  nothing else competes with them.
- **The differentiator leads.** Every meal-planning app has recipes and a
  planner. Almost none has a list that is live across a household. That is why
  it gets the second section and the concrete "two people in two aisles" image
  rather than a feature-list bullet.
- **"No ads, no tracking" is a selling point, not boilerplate.** It is also
  true and verifiable – the app has no analytics SDK at all – and it lines up
  with the privacy policy and with an App Store privacy card that is almost
  entirely "No".
- **Written in the app's own voice**, plain and warm, no exclamation marks and
  no "revolutionary". It should read like the person who built it.
- Avoided the words "AI", "smart" and "effortless".
