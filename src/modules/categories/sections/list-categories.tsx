import type { Category } from "@/lib/schemas";
import { EllipsisVertical } from "lucide-react";

type ListCategoriesProps = {
	categories: Category[];
};

export default function ListCategories({ categories }: ListCategoriesProps) {
	return (
		<div className="flex flex-col">
			{categories?.map((category) => (
				<div
					key={category.id}
					style={{ "--category-color": category.color } as React.CSSProperties}
					className="flex gap-1 rounded-md p-3 items-center hover:bg-[color:var(--category-color)]/5 hover:cursor-pointer transition-colors group"
				>
					<div
						className="h-2 w-2 rounded-full"
						style={{ backgroundColor: category.color }}
					/>
					<div className="text-base">{category.icon}</div>
					<p className="text-sm group-hover:[color:var(--category-color)] transition-colors">
						{category.name}
					</p>
					<EllipsisVertical
						className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground"
						size={16}
					/>
				</div>
			))}
		</div>
	);
}
