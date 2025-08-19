import PageContainer from "@/components/page-container";
import CreateTransaction from "../sections/create-transaction";

export default function TransactionsView() {
	return (
		<PageContainer
			title="Transactions"
			actionsComponent={<CreateTransaction />}
		>
			<div>Hello "/_authed/transactions"!</div>
		</PageContainer>
	);
}
