import { ReorderSheet } from "@/components/ui/reorder-sheet";
import { t } from "@/lib/i18n";
import { categoryLabel, type Category } from "@/lib/shopping-list";

/**
 * Reorder the store-walk category order. A thin wrapper over the shared
 * drag-to-reorder sheet (the category names double as the keys), so the
 * gesture and row styling live in one place.
 */
export function ReorderCategoriesSheet({
  visible,
  order,
  onClose,
  onChange,
}: {
  visible: boolean;
  order: Category[];
  onClose: () => void;
  onChange: (order: Category[]) => void;
}) {
  return (
    <ReorderSheet
      visible={visible}
      title={t("shopping.reorderCategories")}
      hint={t("shopping.reorderHint")}
      items={order.map((category) => ({
        key: category,
        label: categoryLabel(category),
      }))}
      onClose={onClose}
      onChange={(orderedKeys) => onChange(orderedKeys as Category[])}
    />
  );
}
