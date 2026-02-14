import NotFound from "@/components/not-found";
import PageContainer from "@/components/page-container";
import { Separator } from "@/components/ui/separator";
import { useTRPC } from "@/integrations/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import CategoriesActions from "../sections/categories-actions";
import ListCategories from "../sections/list-categories";

export default function Categories() {
	const trpc = useTRPC();

	const categoriesQuery = useQuery({
		...trpc.categories.listCategories.queryOptions(),
	});

	const groupsQuery = useQuery({
		...trpc.categoryGroups.listCategoryGroups.queryOptions(),
	});

	useEffect(() => {
		if (categoriesQuery.isError || groupsQuery.isError) {
			toast.error("Error fetching categories");
		}
	}, [categoriesQuery.isError, groupsQuery.isError]);

	const isLoading = categoriesQuery.isLoading || groupsQuery.isLoading;

	if (isLoading) {
		return (
			<PageContainer
				title="Categories"
				actionsComponent={<CategoriesActions />}
			>
				<div className="flex flex-col gap-2">Loading...</div>
			</PageContainer>
		);
	}

	const groups = groupsQuery.data ?? [];
	const allCategories = categoriesQuery.data ?? [];
	const ungroupedCategories = allCategories.filter((c) => c.groupId === null);

	if (!allCategories.length && !groups.length) {
		return (
			<PageContainer
				title="Categories"
				actionsComponent={<CategoriesActions />}
			>
				<NotFound message="No categories found..." />
			</PageContainer>
		);
	}

	return (
		<PageContainer title="Categories" actionsComponent={<CategoriesActions />}>
			<div className="h-full grid grid-cols-[1fr_10px_2fr] gap-2 overflow-hidden">
				<ListCategories
					groups={groups}
					ungroupedCategories={ungroupedCategories}
				/>
				<Separator orientation="vertical" className="h-full" />
				<div className="flex flex-col gap-2 overflow-hidden">
					<Outlet />
				</div>
			</div>
		</PageContainer>
	);
}
