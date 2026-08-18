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
  common: {
    done: 'Færdig',
    back: 'Tilbage',
    cancel: 'Annuller',
    save: 'Gem',
    saving: 'Gemmer…',
  },

  tabs: {
    plan: 'Plan',
    recipes: 'Opskrifter',
    // "Indkøb", not "Indkøbsliste": it sits under an icon in a quarter of the
    // tab bar, and the screen it opens carries the full title anyway.
    shopping: 'Indkøb',
    settings: 'Indstillinger',
  },

  errors: {
    generic: 'Noget gik galt – prøv igen',
    offline: 'Du ser ud til at være offline. Tjek din forbindelse, og prøv igen.',
    badCode: 'Den kode er forkert eller udløbet. Bed om en ny nedenfor.',
    rateLimited: 'Du går lidt hurtigt frem. Vent et minut, og prøv så igen.',

    nameRequired: 'Indtast dit navn',
    kitchenNameRequired: 'Giv dit køkken et navn',
    inviteCodeRequired: 'Indtast en invitationskode',
    inviteCodeInvalid:
      'Den kode er ikke gyldig – tjek den med personen, der sendte den',
    inviteCodeTooMany:
      'For mange forsøg – vent et par minutter, og prøv så koden igen',
  },

  onboarding: {
    tagline: 'Planlæg middage, saml opskrifter\nog køb ind sammen',
    continueWithEmail: 'Fortsæt med e-mail',

    email: {
      title: 'Hvad er din e-mail?',
      subtitle:
        'Ny her eller på vej tilbage – det er det samme. Vi sender dig en kode. Ingen adgangskode at huske.',
      submit: 'Send kode',
      label: 'E-mail',
      placeholder: 'dig@eksempel.dk',
      invalid: 'Indtast din e-mail for at fortsætte.',
    },

    code: {
      title: 'Tjek din e-mail',
      subtitle: 'Vi har sendt en kode til %{email}.\nKan du ikke finde den? Tjek din spammappe.',
      submit: 'Fortsæt',
      label: 'Kode',
    },

    resend: {
      link: 'Send en ny kode',
      sending: 'Sender en ny kode…',
      sent: 'Ny kode sendt – tjek din e-mail',
      wait: 'Der blev lige sendt en kode – vent et minut, og prøv så igen',
      failed: 'Kunne ikke sende – tryk for at prøve igen',
    },

    name: {
      title: 'Hvad hedder du?',
      submit: 'Fortsæt',
      label: 'Navn',
      placeholder: 'Sofia',
      invalid: 'Indtast dit navn for at fortsætte.',
    },

    setup: {
      title: 'Sæt dit køkken op',
      body: 'Dine opskrifter, ugeplan og indkøbsliste bor i et køkken – delt med dem, du laver mad sammen med. Hvis nogen derhjemme allerede har et, så deltag i deres i stedet for at starte et nyt.',
      createTitle: 'Opret et nyt køkken',
      createBody: 'Start forfra. Inviter folk, når du har lyst – eller behold det for dig selv.',
      joinTitle: 'Deltag i et eksisterende køkken',
      joinBody:
        'I deler de samme opskrifter, den samme plan og den samme indkøbsliste – alt, hvad du tilføjer, dukker også op hos dem.',
    },

    create: {
      title: 'Navngiv dit køkken',
      subtitle: 'Du kan ændre det når som helst.',
      label: 'Køkkenets navn',
      placeholder: 'Familien Hansen',
      submit: 'Fortsæt',
      invalid: 'Giv dit køkken et navn for at fortsætte.',
    },

    join: {
      title: 'Indtast din invitationskode',
      subtitle: 'Spørg den, der har sat Prep+Eat op, om koden.',
      label: 'Invitationskode',
      submit: 'Deltag',
      invalid: 'Indtast en invitationskode for at fortsætte.',
    },

    ready: {
      title: 'Dit køkken er klar',
      body: 'Del denne kode, så ser de de samme opskrifter, den samme plan og den samme liste. Du kan også gøre det senere under Indstillinger.',
      copyCode: 'Kopiér koden',
      share: 'Del koden',
      continue: 'Fortsæt',
    },

    welcome: {
      greeting: 'Velkommen til %{name}',
      action: 'Se dig omkring',
    },
  },

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

  recipes: {
    title: 'Opskrifter',
    ingredients: 'Ingredienser',
    // Danish calls the method as a whole "fremgangsmåde" and each entry a
    // "trin" – see the note on the form keys below.
    instructions: 'Fremgangsmåde',
    add: 'Tilføj en opskrift',
    all: 'Alle',
    favorites: 'Favoritter',
    search: 'Søg',
    searchRecipes: 'Søg i opskrifter',
    noMatch: 'Ingen opskrifter matcher din søgning.',
    noFavoriteMatch: 'Ingen favoritter matcher din søgning.',
    step: 'Trin %{number}',

    error: {
      title: 'Kan ikke hente dine opskrifter',
      message:
        'Vi kunne ikke hente din kogebog. Tjek din forbindelse, og prøv igen – ingen af dine opskrifter er gået tabt.',
    },

    empty: {
      // ⚠️ IMPROVISED, NOT A TRANSLATION – flagged for Thomas, the second such
      // line after the shopping list's "Time to prep". "Nothing's cooking yet"
      // is an English idiom; the literal Danish ("Der er ikke noget i gryderne
      // endnu") is a joke nobody asked for. This states the same fact plainly
      // and picks up "kogebog" from the sentence underneath it.
      title: 'Kogebogen er tom endnu',
      body: 'Gem de retter, I holder af – én fælles kogebog for alle i dit køkken.',
      action: 'Tilføj din første opskrift',
    },

    card: {
      favorite: 'Marker %{title} som favorit',
      unfavorite: 'Fjern %{title} fra favoritter',
    },

    row: {
      edit: 'Rediger %{label}',
      delete: 'Slet %{label}',
    },

    detail: {
      error: {
        title: 'Kan ikke åbne denne opskrift',
        message:
          'Vi kunne ikke åbne denne opskrift. Tjek din forbindelse, og prøv igen – intet i den er gået tabt.',
      },
      actions: 'Handlinger for opskrift',
      closeMenu: 'Luk menu',
      favoriteAdd: 'Tilføj til favoritter',
      favoriteRemove: 'Fjern fra favoritter',
      addToPlan: 'Tilføj til ugeplan',
      addToList: 'Tilføj ingredienser til indkøbslisten',
      edit: 'Rediger opskrift',
      delete: 'Slet opskrift',
      share: 'Del opskrift',
        shareFailedTitle: 'Kunne ikke oprette linket',
      // ⚠️ ABBREVIATED ON PURPOSE, AND SHORTENED TWICE – Thomas's call, both
      // rounds on 2026-08-17 from his phone. The correct words are
      // "Forberedelse" and "Tilberedning"; they overflowed the row, and
      // "Forbered."/"Tilbered." still did. English gets away with Prep and
      // Cook in the same three-column flex-1 space.
      // Capitalised to match "I alt" beside them.
      // DO NOT "correct" these back to the full words without checking the
      // layout on a device first.
      total: 'I alt',
      prep: 'Forb.',
      cook: 'Tilb.',
      minutes: '%{count} min',
      keepAwakeOn: 'Skærmen forbliver tændt',
      keepAwakeOff: 'Skærmen dæmpes',
      keepAwakeHint: 'Ændr i indstillinger',
      reorderIngredients: 'Sortér ingredienser',
      reorderInstructions: 'Sortér trin',
      reorderHint: 'Træk for at ændre rækkefølgen.',
      noIngredients: 'Ingen ingredienser endnu – tilføj den første nedenfor.',
      noInstructions: 'Ingen fremgangsmåde endnu – tilføj det første trin nedenfor.',
      source: 'Fra %{site}',
      sourceOpen: 'Åbn den originale opskrift på %{site}',
      deleteConfirm:
        'Du er ved at slette en opskrift fra dit køkken. Det kan ikke fortrydes.',
      addToListConfirm:
        'Tilføj denne opskrifts ingredienser til %{servings} til indkøbslisten? Du kan også gøre det fra din ugeplan.',
      addToListConfirmLabel: 'Tilføj ingredienser',
    },

    form: {
      titleAdd: 'Tilføj ny opskrift',
      titleEdit: 'Rediger opskrift',
      blurb: 'Gem de retter, I holder af – én fælles kogebog for alle i dit køkken.',
      fromLink: 'Tilføj fra et link',
      addImage: 'Tilføj et billede',
      changeImage: 'Skift billede',
      name: 'Opskriftens navn',
      namePlaceholder: 'Pasta al Pomodoro',
      description: 'Beskrivelse',
      descriptionPlaceholder: 'En hurtig hverdagsklassiker',
      prep: 'Forberedelsestid',
      prepPlaceholder: '10 min',
      cook: 'Tilberedningstid',
      cookPlaceholder: '20 min',
      servings: 'Portioner',
      source: 'Kilde',
      sourceLink: 'Kildelink',
      sourcePlaceholder: 'https://example.com/recipe',
      addIngredient: 'Tilføj ingrediens',
      addInstruction: 'Tilføj trin',
      editSection: 'Rediger sektion %{name}',
      editRow: 'Rediger %{name}',
      editStep: 'Rediger trin %{number}',
      save: 'Gem opskrift',
      saveChanges: 'Gem ændringer',
      noSteps:
        'Denne side delte ingen fremgangsmåde – du skal selv tilføje den.',
    },

    import: {
      title: 'Tilføj fra et link',
      blurb:
        'Indsæt et link til en opskriftsside – ingredienser og fremgangsmåde udfylder sig selv, klar til at du retter til.',
      link: 'Opskriftslink',
      submit: 'Importér opskrift',
      generic: 'Noget gik galt – prøv igen.',
      fetchFailed:
        'Kunne ikke nå den side – tjek linket, eller siden blokerer måske for apps.',
      noRecipe:
        'Ingen opskrift fundet på den side – det er måske ikke en opskriftsside, eller siden deler ikke opskriftsdata.',
    },

    ingredientSheet: {
      addIngredient: 'Tilføj ingrediens',
      editIngredient: 'Rediger ingrediens',
      addSection: 'Tilføj sektion',
      editSection: 'Rediger sektion',
      tabIngredient: 'Ingrediens',
      tabSection: 'Sektion',
      name: 'Navn',
      namePlaceholderIngredient: 'f.eks. Cherrytomater',
      namePlaceholderSection: 'f.eks. Sauce',
      quantity: 'Mængde',
      quantityPlaceholder: 'f.eks. 250 g',
      deleteIngredient: 'Slet ingrediens',
      deleteSection: 'Slet sektion',
    },

    stepSheet: {
      titleAdd: 'Tilføj trin',
      titleEdit: 'Rediger trin',
      step: 'Trin',
      // Deliberately NOT "Trin" as well: the number picker above this field is
      // already labelled "Trin", and two fields with one label is worse than a
      // slightly formal word.
      instruction: 'Instruktion',
      instructionPlaceholder: 'Skriv dit trin her',
      delete: 'Slet trin',
    },

    addToPlan: {
      title: 'Tilføj til ugeplan',
      subtitle: 'Vælg en dag.',
      submit: 'Tilføj til plan',
      todaySuffix: ' · i dag',
    },
  },

  settings: {
    title: 'Indstillinger',
    groupKitchens: 'Køkkener',
    groupPeople: 'Personer',
    groupApp: 'App',
    // Matches recipes.detail.keepAwakeOn word for word, exactly as the English
    // pair does – the setting and the status must not drift apart.
    keepScreenOn: 'Skærmen forbliver tændt',
    keepScreenOnHint: 'Kun når du er inde i en opskrift',
    joinKitchen: 'Deltag i et eksisterende køkken',
    createKitchen: 'Opret et nyt køkken',
    inviteSomeone: 'Inviter nogen',
    help: 'Hjælp',
    privacy: 'Privatlivspolitik',
    signOut: 'Log ud',
    currentKitchen: '%{name}, nuværende køkken',
    switchTo: 'Skift til %{name}',
    editKitchen: 'Rediger køkken',
    editProfile: 'Rediger profil',

    inviteBanner: {
      title: 'Inviter nogen',
      body: 'Alle ser den samme plan og den samme indkøbsliste – og den opdaterer sig, når nogen ændrer noget.',
      action: 'Inviter nogen',
    },

    // ⚠️ A DANISH USER TYPES "SLET", NOT "DELETE". The same key is shown and
    // compared against, so the prompt and the check cannot disagree.
    confirmWord: 'SLET',
    confirmTypePrompt: 'Skriv “%{word}” for at bekræfte',
    confirmTypeLabel: 'Skriv %{word} for at bekræfte',

    editKitchenSheet: {
      title: 'Rediger køkken',
      nameLabel: 'Køkkenets navn',
      deleteKitchen: 'Slet køkken',
    },

    editProfileSheet: {
      title: 'Rediger profil',
      firstName: 'Fornavn',
      email: 'E-mail',
      save: 'Gem profil',
      leaveKitchen: 'Forlad køkken',
      deleteProfile: 'Slet profil',
    },

    deleteKitchen: {
      title: 'Slet “%{name}”?',
      body: 'Alt i “%{name}” forsvinder: planerne, opskrifterne og indkøbslisten. Det kan ikke fortrydes.',
      confirm: 'Slet køkken',
    },

    deleteProfile: {
      title: 'Slet profil',
      body: 'Du er ved at slette din profil%{who}. Dine personlige data slettes; opskrifter, du har delt, bliver i køkkenet uden dit navn. Det kan ikke fortrydes.',
      confirm: 'Slet profil',
    },

    leaveKitchen: {
      title: 'Forlad køkken',
      body: 'Du er ved at forlade “%{name}”. Du beholder din egen kopi af opskrifterne, og du kan blive inviteret tilbage senere.',
      confirm: 'Forlad køkken',
    },

    invite: {
      title: 'Inviter nogen',
      intro: 'Inviter nogen, eller giv dem koden nedenfor.',
      copyCode: 'Kopiér kode',
      copied: 'Kopieret',
      refreshes: 'Fornyes den %{date}',
      newCode: 'Få en ny kode',
      newCodeTitle: 'Få en ny kode?',
      newCodeBody:
        'Den nuværende kode holder op med at virke med det samme. Alle, du allerede har delt den med, skal bruge den nye.',
      newCodeConfirm: 'Ny kode',
      failedTitle: 'Kunne ikke lave en ny kode',
      failedBody: 'Prøv igen om et øjeblik.',
      shareMessage: 'Kom med i vores køkken “%{name}” i Prep+Eat med koden %{code}',
      action: 'Inviter nogen',
    },

    createKitchenModal: {
      title: 'Navngiv dit køkken',
      subtitle: 'Du kan ændre det når som helst.',
      nameLabel: 'Køkkenets navn',
      namePlaceholder: 'Familien Hansen',
      submit: 'Opret køkken',
    },

    joinKitchenModal: {
      title: 'Indtast din invitationskode',
      subtitle: 'Spørg den, der har sat Prep+Eat op, om koden.',
      codeLabel: 'Invitationskode',
      submit: 'Deltag',
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

  share: {
    sharedWithYou: '%{name} har delt denne opskrift med dig',
    save: 'Gem i mine opskrifter',
    saving: 'Gemmer…',
    saveFailedTitle: 'Kunne ikke gemme opskriften',
    revokedTitle: '%{name} deler ikke længere denne',
    revokedBody: 'Linket er slået fra. Bed om et nyt.',
    notFoundTitle: 'Linket fører ingen steder hen',
    notFoundBody: 'Det kan være skrevet forkert eller blevet klippet over. Bed afsenderen om at dele det igen.',
    errorTitle: 'Kan ikke åbne opskriften',
    errorBody: 'Vi kunne ikke få fat i Prep+Eat. Tjek din forbindelse, og prøv igen.',
  },

};
