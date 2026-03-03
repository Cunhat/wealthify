import CategoryBadge from "@/components/category-badge";
import EmptyBadge from "@/components/empty-badge";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import AccountBadge from "@/modules/transactions/components/account-badge";
import RuleRowMenu from "./rule-row-menu";

type Rule = {
	id: string;
	name: string;
	descriptionContains: string;
	categoryId: string | null;
	budgetCategoryId: string | null;
	transactionAccountId: string | null;
	type: string | null;
	category: {
		id: string;
		name: string;
		icon: string;
		color: string;
		createdAt: Date | null;
		userId: string;
		groupId: string | null;
	} | null;
	budgetCategory: { id: string; name: string } | null;
	transactionAccount: {
		id: string;
		type: string;
		name: string;
		balance: string;
		initialBalance: string;
		initialBalanceDate: Date;
		createdAt: Date | null;
		userId: string;
	} | null;
};

interface RulesTableProps {
	rules: Rule[];
}

export default function RulesTable({ rules }: RulesTableProps) {
	return (
		<div className="rounded-md border overflow-auto">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead>Pattern</TableHead>
						<TableHead>Category</TableHead>
						<TableHead>Budget Category</TableHead>
						<TableHead>Account</TableHead>
						<TableHead>Type</TableHead>
						<TableHead className="w-10" />
					</TableRow>
				</TableHeader>
				<TableBody>
					{rules.map((rule) => (
						<TableRow key={rule.id}>
							<TableCell className="font-medium">{rule.name}</TableCell>
							<TableCell>
								<code className="bg-muted px-1.5 py-0.5 rounded text-sm">
									{rule.descriptionContains}
								</code>
							</TableCell>
							<TableCell>
								{rule.category ? (
									<CategoryBadge category={rule.category} />
								) : (
									<EmptyBadge message="—" />
								)}
							</TableCell>
							<TableCell>
								{rule.budgetCategory ? (
									<Badge variant="outline">{rule.budgetCategory.name}</Badge>
								) : (
									<EmptyBadge message="—" />
								)}
							</TableCell>
							<TableCell>
								{rule.transactionAccount ? (
									<AccountBadge account={rule.transactionAccount} />
								) : (
									<EmptyBadge message="—" />
								)}
							</TableCell>
							<TableCell className="capitalize">
								{rule.type ?? <EmptyBadge message="any" />}
							</TableCell>
							<TableCell>
								<RuleRowMenu rule={rule} />
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
