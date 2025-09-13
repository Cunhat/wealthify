import NetWorthWidget from "@/components/net-worth-widget";
import PageContainer from "@/components/page-container";
import AccountsWidget from "@/modules/accounts/sections/accounts-widget";
import {
	createFileRoute,
	redirect,
	useRouteContext,
} from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/")({
	component: App,
	beforeLoad: ({ context }) => {
		if (!context.user) {
			throw redirect({ to: "/login" });
		}
	},
	loader: async ({ context }) => {
		await context.queryClient.prefetchQuery(
			context.trpc.accounts.listAccounts.queryOptions(),
		);

		await context.queryClient.prefetchQuery(
			context.trpc.transactions.listTransactions.queryOptions({
				limit: 100,
				categoryNames: [],
				accountNames: [],
			}),
		);
	},
	head: () => ({
		meta: [
			{
				title: "Wealthify - Dashboard",
			},
		],
	}),
});

function App() {
	const { user } = useRouteContext({ from: Route.id });

	return (
		<PageContainer title="Dashboard">
			<div className="grid grid-cols-[350px_1fr] h-full overflow-hidden">
				<AccountsWidget />
				<div className="p-4 flex flex-col gap-4 h-full overflow-y-auto">
					<NetWorthWidget />
				</div>
			</div>
		</PageContainer>
	);
}
