import { categoryLabel, getCategory, type CategoryId } from "@/content/categories";
import type { Lang } from "@/content/types";

/**
 * Puce de catégorie.
 *
 * ACCESSIBILITÉ — la couleur ne porte jamais seule l'information : le libellé
 * est toujours affiché à côté de la pastille. Un daltonien lit la catégorie
 * aussi bien qu'un autre.
 */
export function CategoryChip({
  id,
  lang,
  size = "md",
}: {
  id: CategoryId;
  lang: Lang;
  size?: "sm" | "md";
}) {
  const category = getCategory(id);
  const label = categoryLabel(id, lang);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${
        size === "sm" ? "px-2.5 py-0.5 text-[0.72rem]" : "px-3 py-1 text-[0.8rem]"
      }`}
      style={{
        color: category.color,
        borderColor: `${category.color}40`,
        backgroundColor: `${category.color}0F`,
      }}
    >
      <span
        aria-hidden="true"
        className="size-1.5 rounded-full"
        style={{ backgroundColor: category.color }}
      />
      {label}
    </span>
  );
}
