import PageContainer from "@/components/page-container";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/transactions")({
	component: RouteComponent,
	beforeLoad: async ({ context }) => {
		if (!context.user) {
			throw redirect({ to: "/login" });
		}
	},
	head: () => ({
		meta: [
			{
				title: "Wealthify - Transactions",
			},
		],
	}),
});

function RouteComponent() {
	return (
		<PageContainer title="Transactions">
			<div>Hello "/_authed/transactions"!</div>
		</PageContainer>
	);
}
