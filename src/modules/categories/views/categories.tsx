import PageContainer from "@/components/page-container";
import { useTRPC } from "@/integrations/trpc/react";
import { useQuery } from "@tanstack/react-query";
import CategoriesActions from "../sections/categories-actions";

export default function Categories() {
	const trpc = useTRPC();

	const categoriesQuery = useQuery({
		...trpc.categories.listCategories.queryOptions(),
	});

	console.log(categoriesQuery.data);

	return (
		<PageContainer title="Categories" actionsComponent={<CategoriesActions />}>
			<div className="flex flex-col gap-2">
				{categoriesQuery.data?.map((category) => (
					<div key={category.id}>{category.name}</div>
				))}
			</div>
		</PageContainer>
	);
}
