import type { Category } from "@/lib/schemas";
import { Link } from "@tanstack/react-router";

type ListCategoriesProps = {
	categories: Category[];
};

export default function ListCategories({ categories }: ListCategoriesProps) {
	return (
		<div className="flex flex-col overflow-y-auto">
			{categories?.map((category) => (
				<Link
					to="/categories/$categoryId"
					params={{ categoryId: category.id }}
					key={category.id}
					style={{ "--category-color": category.color } as React.CSSProperties}
					className="flex gap-1 rounded-md py-2 px-3 items-center hover:bg-[color:var(--category-color)]/5 hover:cursor-pointer transition-colors group"
				>
					<div
						className="h-2 w-2 rounded-full"
						style={{ backgroundColor: category.color }}
					/>
					<div className="text-base">{category.icon}</div>
					<p className="text-sm group-hover:[color:var(--category-color)] transition-colors">
						{category.name}
					</p>
				</Link>
			))}
		</div>
	);
}
