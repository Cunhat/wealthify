import React from "react";
import CreateBudget from "../components/create-budget";

export default function BudgetActions() {
	return (
		<div className="flex gap-2 w-full justify-between">
			<CreateBudget />
		</div>
	);
}
