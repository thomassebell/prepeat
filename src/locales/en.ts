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
};
