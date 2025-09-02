import AccountView from "@/modules/accounts/views/account-view";
import { createFileRoute, redirect } from "@tanstack/react-router";
import z from "zod";

export const Route = createFileRoute("/_authed/accounts/$accountId")({
	component: AccountView,
	params: z.object({
		accountId: z.string(),
	}),
	beforeLoad: async ({ context }) => {
		if (!context.user) {
			throw redirect({ to: "/login" });
		}
	},
	loader: async ({ context, params }) => {
		await context.queryClient.prefetchQuery(
			context.trpc.accounts.getAccount.queryOptions({
				id: params.accountId,
			}),
		);
	},
	head: () => ({
		meta: [
			{
				title: "Wealthify - Account Details",
			},
		],
	}),
});
