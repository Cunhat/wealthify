import type { Budget } from "@/lib/schemas";
import CreateBudget from "../components/create-budget";

type BudgetActionsProps = {
	budget: Budget | null;
};

export default function BudgetActions({ budget }: BudgetActionsProps) {
	return (
		<div className="flex gap-2 w-full justify-between">
			{!budget && <CreateBudget />}
		</div>
	);
}
