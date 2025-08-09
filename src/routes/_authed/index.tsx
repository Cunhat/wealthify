// import { type AccountItem, AccountsList } from "@/components/accounts-list";
import AccountsWidget from "@/components/accounts-widget";
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
});

function App() {
	const { user } = useRouteContext({ from: Route.id });

	const accounts = [
		{
			id: "a1",
			name: "Account 1",
			note: "Checking",
			category: "cash",
			group: "Cash",
			balance: 700,
			changePct: -22.2,
		},
		{
			id: "i1",
			name: "Invest",
			note: "401(k)",
			category: "investment",
			group: "Investments",
			balance: 200,
			changePct: 0,
		},
	];

	return (
		<div className="grid grid-cols-[300px_1fr] h-full">
			<div className="bg-amber-200">
				<AccountsWidget />
			</div>
			<div className="p-4">Hello, {user?.name}!</div>
		</div>
	);
}
