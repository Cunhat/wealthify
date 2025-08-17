import PageContainer from "@/components/page-container";
import { useTRPC } from "@/integrations/trpc/react";
import { Separator } from "@radix-ui/react-separator";
import { useQuery } from "@tanstack/react-query";
import { Inbox } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import CategoriesActions from "../sections/categories-actions";
import ListCategories from "../sections/list-categories";

export default function Categories() {
	const trpc = useTRPC();

	const categoriesQuery = useQuery({
		...trpc.categories.listCategories.queryOptions(),
	});

	useEffect(() => {
		if (categoriesQuery.isError) {
			toast.error("Error fetching categories");
		}
	}, [categoriesQuery.isError]);

	if (categoriesQuery.isLoading) {
		return (
			<PageContainer
				title="Categories"
				actionsComponent={<CategoriesActions />}
			>
				<div className="flex flex-col gap-2">Loading...</div>
			</PageContainer>
		);
	}

	if (!categoriesQuery.data?.length) {
		return (
			<PageContainer
				title="Categories"
				actionsComponent={<CategoriesActions />}
			>
				<div className="flex flex-col gap-2 items-center justify-center h-full">
					<Inbox className="w-10 h-10 text-muted-foreground/50" />
					<div className="flex flex-col gap-2 text-base text-muted-foreground/50">
						No categories found...
					</div>
				</div>
			</PageContainer>
		);
	}

	return (
		<PageContainer title="Categories" actionsComponent={<CategoriesActions />}>
			<div className="h-full grid grid-cols-[1fr_10px_1fr] gap-2">
				<ListCategories categories={categoriesQuery.data ?? []} />
				<Separator orientation="vertical" className="h-full" />
				<div className="flex flex-col gap-2">Transactions</div>
			</div>
		</PageContainer>
	);
}
