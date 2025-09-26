import NetWorthEvolutionWidget from "@/components/net-worth-evolution-widget";
import NetWorthWidget from "@/components/net-worth-widget";
import PageContainer from "@/components/page-container";
import AccountsWidget from "@/modules/accounts/sections/accounts-widget";
import IncomeVsExpensesWidget from "../sections/income-vs-expenses";

export default function DashboardView() {
	return (
		<PageContainer title="Dashboard">
			<div className="grid grid-cols-[350px_1fr] grid-rows-[1fr_auto] gap-6 h-full overflow-hidden">
				<AccountsWidget />
				<div className="flex flex-col gap-4 overflow-y-auto">
					<NetWorthWidget />
					<NetWorthEvolutionWidget />
					<IncomeVsExpensesWidget />
				</div>
			</div>
		</PageContainer>
	);
}
