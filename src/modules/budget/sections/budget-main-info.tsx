import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/mixins";
import type { Budget } from "@/lib/schemas";

type BudgetMainInfoProps = {
	budget: Budget;
};

export default function BudgetMainInfo({ budget }: BudgetMainInfoProps) {
	return (
		<Card className="w-full @xl/main:w-[500px]">
			<CardHeader>
				<div className="flex gap-2 justify-between">
					<div className="flex flex-col gap-1">
						<CardTitle>Budget Overview</CardTitle>
						<CardDescription>
							Total income and allocation overview
						</CardDescription>
					</div>
					<p className="text-xl font-semibold">
						{formatCurrency(Number(budget.income))}
					</p>
				</div>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col gap-2">
					{budget.categories.map((category) => (
						<div className="flex gap-2" key={category.id}>
							<div className="grid grid-cols-[1fr_auto_auto] items-center w-full gap-2">
								<p className="text-sm text-foreground">{category.name}</p>
								<p className="text-sm text-foreground">
									{category.percentage}%
								</p>
								<p className="text-sm text-foreground">
									{formatCurrency(
										(Number(category.percentage) * Number(budget.income)) / 100,
									)}
								</p>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
