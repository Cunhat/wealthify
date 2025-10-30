import { Badge } from "./ui/badge";

type WishlistCategoryBadgeProps = {
	category: { name: string; icon: string; color: string } | null;
};

export default function WishlistCategoryBadge({
	category,
}: WishlistCategoryBadgeProps) {
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

