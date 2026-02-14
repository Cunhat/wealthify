import type { Category, CategoryGroupWithCategories } from "@/lib/schemas";
import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

type ListCategoriesProps = {
	groups: CategoryGroupWithCategories[];
	ungroupedCategories: Category[];
};

function CategoryLink({ category }: { category: Category }) {
	return (
		<Link
			to="/categories/category/$categoryId"
			params={{ categoryId: category.id }}
			style={{ "--category-color": category.color } as React.CSSProperties}
			className="flex gap-1 rounded-md py-2 px-3 items-center hover:bg-[color:var(--category-color)]/5 hover:cursor-pointer transition-colors group"
		>
			<div
				className="h-2 w-2 rounded-full shrink-0"
				style={{ backgroundColor: category.color }}
			/>
			<div className="text-base">{category.icon}</div>
			<p className="text-sm group-hover:[color:var(--category-color)] transition-colors">
				{category.name}
			</p>
		</Link>
	);
}

function CategoryGroupItem({ group }: { group: CategoryGroupWithCategories }) {
	const [open, setOpen] = useState(true);

	return (
		<div>
			<div
				style={{ "--group-color": group.color } as React.CSSProperties}
				className="flex items-center rounded-md hover:bg-[color:var(--group-color)]/5 transition-colors group"
			>
				<button
					type="button"
					onClick={() => setOpen((o) => !o)}
					className="flex items-center pl-3 pr-1 py-2 shrink-0 rounded-l-md transition-colors self-stretch"
				>
					{open ? (
						<ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
					) : (
						<ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
					)}
				</button>
				<Link
					to="/categories/group/$groupId"
					params={{ groupId: group.id }}
					className="flex-1 flex gap-2 py-2 pr-3 items-center  cursor-pointer rounded-r-md"
				>
					<div
						className="h-2 w-2 rounded-full shrink-0"
						style={{ backgroundColor: group.color }}
					/>
					<span className="text-base">{group.icon}</span>
					<span className="text-sm font-medium group-hover:[color:var(--group-color)] transition-colors">
						{group.name}
					</span>
					<span className="ml-auto text-xs text-muted-foreground">
						{group.categories.length}
					</span>
				</Link>
			</div>

			{open && group.categories.length > 0 && (
				<div className="pl-4">
					{group.categories.map((category) => (
						<CategoryLink key={category.id} category={category} />
					))}
				</div>
			)}

			{open && group.categories.length === 0 && (
				<p className="pl-9 py-1.5 text-xs text-muted-foreground/50">
					No categories
				</p>
			)}
		</div>
	);
}

export default function ListCategories({
	groups,
	ungroupedCategories,
}: ListCategoriesProps) {
	return (
		<div className="flex flex-col overflow-y-auto">
			{groups.map((group) => (
				<CategoryGroupItem key={group.id} group={group} />
			))}

			{ungroupedCategories.map((category) => (
				<CategoryLink key={category.id} category={category} />
			))}
		</div>
	);
}
