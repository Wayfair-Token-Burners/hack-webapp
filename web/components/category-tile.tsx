import Link from "next/link";
import type { Category } from "@/lib/catalog";
import { CategoryIcon } from "@/components/category-icon";

export function CategoryTile({ category }: { category: Category }) {
  return (
    <Link
      href={`/category/${category.slug}`}
      className="group flex flex-col border border-mc-border bg-white p-3 hover:border-black hover:shadow-sm !text-mc-ink !no-underline"
    >
      <div className="mb-2 grid h-28 place-items-center bg-mc-bg text-mc-ink-soft group-hover:bg-white group-hover:text-mc-ink">
        <CategoryIcon
          slug={category.slug}
          title={category.name}
          className="h-20 w-20"
        />
      </div>
      <div className="text-[13px] font-semibold leading-tight group-hover:underline">
        {category.name}
      </div>
      <div className="mt-1 text-[11px] text-mc-ink-soft">{category.blurb}</div>
      <ul className="mt-2 text-[11px] text-mc-blue-link">
        {category.subcategories.slice(0, 3).map((s) => (
          <li key={s}>· {s}</li>
        ))}
        {category.subcategories.length > 3 ? (
          <li className="text-mc-ink-soft">
            +{category.subcategories.length - 3} more
          </li>
        ) : null}
      </ul>
    </Link>
  );
}
