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
		<div className="grid grid-cols-[350px_1fr] h-full overflow-hidden">
			<AccountsWidget />
			<div className="p-4 flex flex-col gap-4 h-full overflow-y-auto">
				Hello, {user?.name}!
				{Array.from({ length: 100 }).map((_, index) => {
					return <div key={index}>{index}</div>;
				})}
			</div>
		</div>
	);
}
