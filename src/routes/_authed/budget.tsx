import BudgetView from "@/modules/budget/views/budget-view";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/budget")({
	component: BudgetView,
});
