import NotFound from "@/components/not-found";
import PageContainer from "@/components/page-container";
import { useTRPC } from "@/integrations/trpc/react";
import { useQuery } from "@tanstack/react-query";
import RulesTable from "../components/rules-table";
import RulesActions from "../sections/rules-actions";

export default function RulesView() {
	const trpc = useTRPC();

	const rulesQuery = useQuery(trpc.rules.listRules.queryOptions());

	if (rulesQuery.isLoading) {
		return <div>Loading...</div>;
	}

	return (
		<PageContainer title="Rules" actionsComponent={<RulesActions />}>
			{rulesQuery.data?.length === 0 ? (
				<NotFound message="No rules yet. Create one manually or click Analyse to generate suggestions from your transactions." />
			) : (
				<RulesTable rules={rulesQuery.data ?? []} />
			)}
		</PageContainer>
	);
}
