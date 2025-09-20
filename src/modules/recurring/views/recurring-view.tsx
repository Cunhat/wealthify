import PageContainer from "@/components/page-container";
import RecurringActions from "../sections/recurring-actions";

export default function RecurringView() {
	return (
		<PageContainer
			title="Recurring Transactions"
			actionsComponent={<RecurringActions />}
		>
			<div>Recurring transactions content will go here</div>
		</PageContainer>
	);
}
