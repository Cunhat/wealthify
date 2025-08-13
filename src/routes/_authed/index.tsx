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
			return redirect({ to: "/login" });
		}
	},
	loader: async ({ context }) => {
		await context.queryClient.prefetchQuery(
			context.trpc.accounts.listAccounts.queryOptions(),
		);
	},
});

function App() {
	const { user } = useRouteContext({ from: Route.id });

	return (
		<div className="grid grid-cols-[350px_1fr] h-full">
			<AccountsWidget />
			<div className="p-4">Hello, {user?.name}!</div>
		</div>
	);
}
