// English – the BASE language and the source of truth for keys. Every key the
// app uses exists here; `src/locales/da.ts` is a partial overlay on top.
//
// Adding a screen? Add its keys here first, then translate what you can. A key
// with no Danish renders the English below, which is why a half-translated app
// still works.
//
// ⚠️ CATEGORY NAMES ARE NOT UI STRINGS ALONE. The English words under
// `categories` double as the value STORED in the database (`aisle`), shared by
// every member of a kitchen. Translate the label, never the stored value – see
// `categoryLabel()` in shopping-core.ts.
export const en = {
  common: {
    done: 'Done',
    back: 'Back',
    cancel: 'Cancel',
    save: 'Save',
    saving: 'Saving…',
    /** ⚠️ `LoadError` still hardcodes the English of this – see load-error.tsx.
     *  Anything new should use this key. */
    tryAgain: 'Try again',
  },

  /** The four tab-bar labels. Short – they sit under an icon. */
  tabs: {
    plan: 'Plan',
    recipes: 'Recipes',
    shopping: 'Shopping',
    settings: 'Settings',
  },

  /**
   * `friendlyError()` – the plain-language rewrites of technical failures.
   * Anything it does not recognise passes through as the app wrote it, so
   * these four are the only ones translatable here.
   */
  errors: {
    generic: 'Something went wrong – please try again',
    offline: 'You appear to be offline. Check your connection and try again.',
    badCode: 'That code is wrong or has expired. Ask for a new one below.',
    rateLimited: 'You’re going a little fast. Wait a minute, then try again.',

    /**
     * Thrown by auth.ts and household.ts. These are ALREADY plain language, so
     * `friendlyError()` passes them through untouched – translating them here
     * is the only way they ever reach a Danish reader.
     */
    nameRequired: 'Please enter your name',
    kitchenNameRequired: 'Please give your kitchen a name',
    inviteCodeRequired: 'Please enter an invite code',
    inviteCodeInvalid:
      'That code is not valid – check it with the person who sent it',
    inviteCodeTooMany:
      'Too many tries – wait a few minutes, then try that code again',
  },

  onboarding: {
    tagline: 'Plan dinners, collect recipes\nand shop together',
    continueWithEmail: 'Continue with email',

    email: {
      title: 'What’s your email?',
      subtitle:
        'New here or coming back, it’s the same – we’ll send you a code. No password to remember.',
      submit: 'Send code',
      label: 'Email',
      placeholder: 'you@example.com',
      invalid: 'Enter your email to continue.',
    },

    code: {
      title: 'Check your email',
      subtitle: 'We sent a code to %{email}.\nCan’t find it? Check your spam folder.',
      submit: 'Continue',
      label: 'Code',
    },

    resend: {
      link: 'Send a new code',
      sending: 'Sending a new code…',
      sent: 'New code sent – check your email',
      wait: 'A code was just sent – wait a minute, then try again',
      failed: 'Couldn’t send – tap to retry',
    },

    name: {
      title: 'What’s your name?',
      submit: 'Continue',
      label: 'Name',
      placeholder: 'Sofia',
      invalid: 'Enter your name to continue.',
    },

    setup: {
      title: 'Set up your kitchen',
      body: 'Your recipes, weekly plan and shopping list live in a kitchen – shared with whoever you cook with. If someone at home already has one, join theirs instead of starting another.',
      createTitle: 'Create a new kitchen',
      createBody: 'Start fresh. Invite people whenever you like, or keep it to yourself.',
      joinTitle: 'Join an existing kitchen',
      joinBody:
        'You’ll share the same recipes, plan and shopping list – anything you add shows up for them too.',
    },

    create: {
      title: 'Name your kitchen',
      subtitle: 'You can change this any time.',
      label: 'Kitchen name',
      placeholder: 'The Hansens',
      submit: 'Continue',
      invalid: 'Give your kitchen a name to continue.',
    },

    join: {
      title: 'Enter your invite code',
      subtitle: 'Ask whoever set up Prep+Eat for the code.',
      label: 'Invite code',
      submit: 'Join',
      invalid: 'Enter an invite code to continue.',
    },

    ready: {
      title: 'Your kitchen is ready',
      body: 'Share this code and they’ll see the same recipes, plan and list. You can also do this later from Settings.',
      copyCode: 'Copy the code',
      share: 'Share the code',
      continue: 'Continue',
    },

    welcome: {
      greeting: 'Welcome to %{name}',
      /** Never names a destination – a creator lands on Recipes, a joiner on Plan. */
      action: 'Take a look around',
    },
  },

  categories: {
    produce: 'Produce',
    dairy: 'Dairy',
    meatFish: 'Meat & Fish',
    bakery: 'Bakery',
    frozen: 'Frozen',
    pantry: 'Pantry',
    drinks: 'Drinks',
    household: 'Household',
    other: 'Other',
  },

  week: {
    /** "Week 34" beside the date range in the week switcher. */
    number: 'Week %{number}',
    previous: 'Previous week',
    next: 'Next week',
  },

  undo: {
    action: 'Undo',
    /** Composed as "{name} {verb}" – "Milk deleted", "4 items cleared". */
    deleted: 'deleted',
    cleared: 'cleared',
    moved: 'moved',
    removed: 'removed',
    itemCount: {
      one: '%{count} item',
      other: '%{count} items',
    },
  },

  plan: {
    title: 'Weekly plan',
    listNote: 'Your shopping list updates as you plan.',

    error: {
      title: 'Can’t load your plan',
      message:
        'We couldn’t load your weekly plan. Check your connection and try again – nothing in your plan is lost.',
    },

    day: {
      addMeal: 'Add meal',
      noMeal: 'No meal added',
    },

    meal: {
      open: 'Open %{title}',
      move: 'Move to another day',
      swap: 'Swap meal',
      servings: 'Change servings',
      remove: 'Remove meal',
    },

    move: {
      title: 'Move to another day',
      subtitle: 'Feel like having this meal on another day?',
      to: 'Move meal to %{day}',
      already: 'Already on this day',
    },

    servings: {
      title: 'Change servings',
      subtitle: 'Having friends over?',
      submit: 'Change servings',
      fewer: 'Fewer servings',
      more: 'More servings',
      count: {
        one: '%{count} serving',
        other: '%{count} servings',
      },
    },

    add: {
      /** "Add to Monday" – the day name comes from DAY_NAMES. */
      titleAdd: 'Add to %{day}',
      /** Stands in for the day when the sheet was opened without one. */
      titleDayFallback: 'day',
      titleSwap: 'Swap meal',
      subtitleSwap: 'Feeling for something else?',
      tabRecipes: 'Recipes',
      tabManual: 'Anything else',
      mealName: 'Name of meal',
      mealNamePlaceholder: 'E.g. leftovers',
      all: 'All',
      favorites: 'Favorites',
      submitAdd: 'Add to plan',
      submitSwap: 'Swap meal',
      search: 'Search',
      searchRecipes: 'Search recipes',
      clearSearch: 'Clear search',
      noMatch: 'No recipe for “%{query}” yet',
      noRecipes: 'No recipes yet',
      noMatchBody: 'You don’t have this one in your library – add it below.',
      addRecipe: 'Add recipe',
    },
  },

  recipes: {
    title: 'Recipes',
    /** The two section headings – shown on the detail screen AND the form. */
    ingredients: 'Ingredients',
    instructions: 'Instructions',
    add: 'Add a recipe',
    all: 'All',
    favorites: 'Favorites',
    search: 'Search',
    searchRecipes: 'Search recipes',
    noMatch: 'No recipes match your search.',
    noFavoriteMatch: 'No favorites match your search.',
    /** "Step 3" – shared by the detail rows, the step sheet and the undo toast. */
    step: 'Step %{number}',

    error: {
      title: 'Can’t load your recipes',
      message:
        'We couldn’t load your cookbook. Check your connection and try again – none of your recipes are lost.',
    },

    empty: {
      title: 'Nothing’s cooking yet',
      body: 'Save the dishes you love – one shared cookbook for everyone in your kitchen.',
      action: 'Add your first recipe',
    },

    card: {
      favorite: 'Favorite %{title}',
      unfavorite: 'Remove %{title} from favorites',
    },

    /** The shared swipe row on ingredients and instructions. */
    row: {
      edit: 'Edit %{label}',
      delete: 'Delete %{label}',
    },

    detail: {
      error: {
        title: 'Can’t load this recipe',
        message:
          'We couldn’t open this recipe. Check your connection and try again – nothing in it is lost.',
      },
      actions: 'Recipe actions',
      closeMenu: 'Close menu',
      favoriteAdd: 'Add to favorites',
      favoriteRemove: 'Remove from favorites',
      addToPlan: 'Add to weekly plan',
      addToList: 'Add ingredients to shopping list',
      edit: 'Edit recipe',
      delete: 'Delete recipe',
      share: 'Share recipe',
      // ⚠️ THE LINK AND NOTHING ELSE. Messages splits a message that ends in a
      // URL into a text bubble PLUS a link bubble, so the old
      // "%{title}\n%{url}" arrived as a stray-looking title followed by a link
      // (Thomas's screenshot, 2026-08-18) - and text alongside a URL is also
      // what stops iMessage building a rich preview at all. The preview carries
      // the title; the sender types whatever they want around it.
      shareMessage: '%{url}',
      shareFailedTitle: 'Couldn’t create the link',
      total: 'Total',
      prep: 'Prep',
      cook: 'Cook',
      minutes: '%{count} min',
      // ⚠️ SHORTENED FROM THE FRAMES, and worth a look: Figma 709:6812/709:6855
      // read "Screen on while cooking" / "Screen dimes while cooking" (the
      // second is also a typo for "dims"). Trimmed here for the same reason
      // Thomas trimmed the Settings label – two texts and an icon share one
      // 16px line, and the Danish of the full phrase crowds it.
      keepAwakeOn: 'Screen stays on',
      keepAwakeOff: 'Screen dims',
      keepAwakeHint: 'Change in settings',
      reorderIngredients: 'Reorder ingredients',
      reorderInstructions: 'Reorder instructions',
      reorderHint: 'Drag to change the order.',
      noIngredients: 'No ingredients yet – add the first one below.',
      noInstructions: 'No instructions yet – add the first step below.',
      source: 'From %{site}',
      sourceOpen: 'Open the original recipe on %{site}',
      deleteConfirm:
        'You are about to delete a recipe from your kitchen. This action cannot be undone.',
      /** `servings` arrives already counted – "4 servings". */
      addToListConfirm:
        'Add this recipe’s ingredients for %{servings} to the shopping list? You can also do this from your weekly plan.',
      addToListConfirmLabel: 'Add ingredients',
    },

    form: {
      titleAdd: 'Add new recipe',
      titleEdit: 'Edit recipe',
      blurb: 'Save the dishes you love – one shared cookbook for everyone in your kitchen.',
      fromLink: 'Add from a link',
      addImage: 'Add an image',
      changeImage: 'Change the image',
      name: 'Recipe name',
      namePlaceholder: 'Pasta al Pomodoro',
      description: 'Description',
      descriptionPlaceholder: 'A quick weeknight classic',
      prep: 'Preparation time',
      prepPlaceholder: '10 min',
      cook: 'Cooking time',
      cookPlaceholder: '20 min',
      servings: 'Servings',
      source: 'Source',
      sourceLink: 'Source link',
      sourcePlaceholder: 'https://example.com/recipe',
      addIngredient: 'Add ingredient',
      addInstruction: 'Add instruction',
      editSection: 'Edit section %{name}',
      editRow: 'Edit %{name}',
      editStep: 'Edit step %{number}',
      save: 'Save recipe',
      saveChanges: 'Save changes',
      noSteps:
        'This page didn’t share any instructions – you’ll need to add them yourself.',
    },

    import: {
      title: 'Add from a link',
      blurb:
        'Paste a link to a recipe page – the ingredients and steps fill in by themselves, ready for you to adjust.',
      link: 'Recipe link',
      submit: 'Import recipe',
      generic: 'Something went wrong – please try again.',
      fetchFailed:
        'Couldn’t reach that page – check the link, or the site may be blocking apps.',
      noRecipe:
        'No recipe found on that page – it may not be a recipe page, or the site doesn’t share recipe data.',
    },

    ingredientSheet: {
      addIngredient: 'Add ingredient',
      editIngredient: 'Edit ingredient',
      addSection: 'Add section',
      editSection: 'Edit section',
      tabIngredient: 'Ingredient',
      tabSection: 'Section',
      name: 'Name',
      namePlaceholderIngredient: 'e.g. Cherry tomatoes',
      namePlaceholderSection: 'e.g. Sauce',
      quantity: 'Quantity',
      quantityPlaceholder: 'e.g. 250 g',
      deleteIngredient: 'Delete ingredient',
      deleteSection: 'Delete section',
    },

    stepSheet: {
      titleAdd: 'Add instruction',
      titleEdit: 'Edit instruction',
      step: 'Step',
      instruction: 'Instruction',
      instructionPlaceholder: 'Add your instruction here',
      delete: 'Delete instruction',
    },

    addToPlan: {
      title: 'Add to weekly plan',
      subtitle: 'Pick a day.',
      submit: 'Add to plan',
      /** Appended to a day name in the picker – " · today". */
      todaySuffix: ' · today',
    },
  },

  settings: {
    title: 'Settings',
    groupKitchens: 'Kitchens',
    groupPeople: 'People',
    groupApp: 'App',
    // Fixed in both states – the switch carries the state, not the label.
    // Kept short at Thomas's request (2026-08-17): the Danish of anything
    // longer crowds the switch off a narrow phone.
    // Both strings are Thomas's own, off Figma 684:3871 and 709:7592 – he
    // rewrote the row after my first attempt shipped a hint long enough to run
    // to three lines. The label deliberately matches the recipe screen's ON
    // status word for word, so the setting and the state read as one thing.
    // Still fixed in both switch positions: it names what the setting does when
    // enabled, which is the convention, not the current state.
    keepScreenOn: 'Screen stays on',
    keepScreenOnHint: 'Only while you are on a recipe',
    joinKitchen: 'Join an existing kitchen',
    createKitchen: 'Create a new kitchen',
    inviteSomeone: 'Invite someone',
    help: 'Help',
    privacy: 'Privacy policy',
    signOut: 'Sign out',
    currentKitchen: '%{name}, current kitchen',
    switchTo: 'Switch to %{name}',
    editKitchen: 'Edit kitchen',
    editProfile: 'Edit profile',

    inviteBanner: {
      title: 'Invite someone',
      body: 'Everyone sees the same plan and the same shopping list – and it updates as everyone changes it.',
      action: 'Invite someone',
    },

    /**
     * ⚠️ THE TYPED CONFIRMATION IS TRANSLATED, AND MUST STAY IN STEP.
     * `confirmWord` is both the word shown and the word compared against – one
     * key feeding both, so they cannot drift. A Danish user types SLET, not
     * DELETE. It never leaves the device.
     */
    confirmWord: 'DELETE',
    confirmTypePrompt: 'To confirm this, type “%{word}”',
    confirmTypeLabel: 'Type %{word} to confirm',

    editKitchenSheet: {
      title: 'Edit kitchen',
      nameLabel: 'Kitchen name',
      deleteKitchen: 'Delete kitchen',
    },

    editProfileSheet: {
      title: 'Edit profile',
      firstName: 'First name',
      email: 'Email',
      save: 'Save profile',
      leaveKitchen: 'Leave kitchen',
      deleteProfile: 'Delete profile',
    },

    deleteKitchen: {
      title: 'Delete “%{name}”?',
      body: 'Everything in “%{name}” goes: the plans, the recipes and the shopping list. This cannot be undone.',
      confirm: 'Delete kitchen',
    },

    deleteProfile: {
      title: 'Delete profile',
      /** `who` is ` "Thomas"` or empty – it carries its own leading space. */
      body: 'You’re about to delete your profile%{who}. Your personal data is deleted; recipes you shared stay in the kitchen, without your name. This cannot be undone.',
      confirm: 'Delete profile',
    },

    leaveKitchen: {
      title: 'Leave kitchen',
      body: 'You’re about to leave “%{name}”. You’ll keep your own copy of the recipes, and you can be invited back later.',
      confirm: 'Leave kitchen',
    },

    invite: {
      title: 'Invite someone',
      intro: 'Invite someone, or give them the code below.',
      copyCode: 'Copy code',
      copied: 'Copied',
      refreshes: 'Refreshes on %{date}',
      newCode: 'Get a new code',
      newCodeTitle: 'Get a new code?',
      newCodeBody:
        'The current code stops working right away. Anyone you already shared it with will need the new one.',
      newCodeConfirm: 'New code',
      failedTitle: 'Could not make a new code',
      failedBody: 'Please try again in a moment.',
      /** Goes out to another person through the OS share sheet. */
      shareMessage: 'Join our kitchen “%{name}” in Prep+Eat with the code %{code}',
      action: 'Invite someone',
    },

    createKitchenModal: {
      title: 'Name your kitchen',
      subtitle: 'You can change this any time.',
      nameLabel: 'Kitchen name',
      namePlaceholder: 'The Hansens',
      submit: 'Create kitchen',
    },

    joinKitchenModal: {
      title: 'Enter your invite code',
      subtitle: 'Ask whoever set up Prep+Eat for the code.',
      codeLabel: 'Invite code',
      submit: 'Join',
    },
  },

  shopping: {
    title: 'Shopping list',
    addItem: 'Add an item',
    moveToThisWeek: 'Move all items to this week',
    reorderCategories: 'Reorder categories',
    reorderHint: 'Drag to match your walk through the store.',

    live: {
      live: 'Live',
      connecting: 'Connecting',
      offline: 'Offline',
    },

    error: {
      title: 'Can’t load your list',
      message:
        'We couldn’t load your shopping list. Check your connection and try again – nothing on your list is lost.',
    },

    empty: {
      title: 'Time to prep',
      body: 'Meals you plan for this week land here on their own. Add anything else you need above.',
    },

    done: {
      heading: {
        one: '%{count} item done',
        other: '%{count} items done',
      },
      show: 'Show %{label}',
      hide: 'Hide %{label}',
      clear: 'Clear done items',
    },

    row: {
      edit: 'Edit %{name}',
      delete: 'Delete %{name}',
    },

    edit: {
      title: 'Edit item',
      save: 'Done',
      name: 'Name',
      quantity: 'Quantity',
      quantityPlaceholder: 'e.g. 250g',
      category: 'Category',
      categoryHint: 'Your kitchen will remember this.',
      categoryChoose: 'Choose a category',
      categoryNone: 'none yet',
      /** Read out as "Category: Dairy" / "Category: none yet". */
      categoryLabel: 'Category: %{value}',
    },
  },

  /** Landing screen for a shared-recipe link opened by someone who has the app.
   *  Saving a copy is not built yet – the share snapshot deliberately carries no
   *  ingredients or steps, so there is nothing to copy from here. */
  share: {
    /** ⚠️ The NAME IS RENDERED SEPARATELY, in bold, immediately before this
     *  – that is the design (Figma 726:10545), not a shortcut. So this string
     *  is the REMAINDER of the sentence and must read naturally after a name.
     *  A language that cannot open with the name needs this reworked into a
     *  single interpolated string, not a translation of this fragment. */
    sharedWithYou: 'shared a recipe with you',
    /** The conversion moment: a link becomes a recipe you own. */
    save: 'Save to my recipes',
    saving: 'Saving…',
    /** Declining is just leaving: nothing was saved, so there is nothing to
     *  undo. Named "No thanks" rather than "Cancel" because you are turning
     *  down a gift, not abandoning a task (Thomas, 2026-08-18). */
    decline: 'No thanks',
    saveFailedTitle: 'Couldn’t save this recipe',
    revokedTitle: '%{name} isn’t sharing this one any more',
    revokedBody: 'The link has been turned off. Ask for a new one – it only takes a second.',
    notFoundTitle: 'This link doesn’t lead anywhere',
    notFoundBody: 'It may have been mistyped or cut short. Ask whoever sent it to share it again.',
    errorTitle: 'Can’t open this recipe',
    errorBody: 'We couldn’t reach Prep+Eat. Check your connection and try again.',
  },

};
