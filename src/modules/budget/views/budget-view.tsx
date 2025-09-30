import PageContainer from "@/components/page-container";
import React from "react";
import BudgetActions from "../sections/budget-actions";

export default function BudgetView() {
	return (
		<PageContainer title="Budget" actionsComponent={<BudgetActions />}>
			<div>BudgetView</div>
		</PageContainer>
	);
}
