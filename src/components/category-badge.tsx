import type { Category } from "@/lib/schemas";
import { Badge } from "./ui/badge";

type CategoryBadgeProps = {
	category: Category | null;
};

export default function CategoryBadge({ category }: CategoryBadgeProps) {
	if (!category) return null;

	return (
		<Badge
			variant="default"
			style={{ "--category-color": category.color } as React.CSSProperties}
			className="bg-[color:var(--category-color)]/10 text-[color:var(--category-color)]"
		>
			<span>{category.icon}</span>
			{category.name}
		</Badge>
	);
}
