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
    itemCount: {
      one: '%{count} item',
      other: '%{count} items',
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
