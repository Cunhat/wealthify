import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/accounts/$accountId")({
	beforeLoad: ({ context }) => {
		if (!context.user) {
			throw redirect({ to: "/login" });
		}
	},
	head: () => ({
		meta: [
			{
				title: "Wealthify - Account Details",
			},
		],
	}),
	component: AccountDetailsView,
});

function AccountDetailsView() {
	const { accountId } = Route.useParams();

	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold">Account Details</h1>
			<p className="text-muted-foreground">Account ID: {accountId}</p>
			{/* TODO: Implement account details view */}
		</div>
	);
}
