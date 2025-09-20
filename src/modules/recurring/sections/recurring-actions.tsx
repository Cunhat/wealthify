import { Button } from "@/components/ui/button";
import { useTRPC } from "@/integrations/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import CreateRecurringTransactionDialog from "../components/create-recurring-transaction-dialog";

export default function RecurringActions() {
	const trpc = useTRPC();

	const categoriesQuery = useQuery({
		...trpc.categories.listCategories.queryOptions(),
	});

	if (categoriesQuery.isLoading) {
		return (
			<Button variant="outline" size="icon" disabled>
				<Loader className="animate-spin" />
			</Button>
		);
	}

	return (
		<div className="flex items-center gap-2">
			<CreateRecurringTransactionDialog />
		</div>
	);
}
