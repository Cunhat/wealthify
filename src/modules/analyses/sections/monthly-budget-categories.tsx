"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useTRPC } from "@/integrations/trpc/react";
import type { Transaction } from "@/lib/schemas";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUp } from "lucide-react";

type MonthlyBudgetCategoriesProps = {
	data: Transaction[];
};

export default function MonthlyBudgetCategories({
	data,
}: MonthlyBudgetCategoriesProps) {
	const trpc = useTRPC();

	const getUserBudgetQuery = useQuery(trpc.budget.getUserBudget.queryOptions());

	console.log(getUserBudgetQuery.data);

	if (getUserBudgetQuery.isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Budget Categories</CardTitle>
					<CardDescription>Loading budget information...</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	const budget = getUserBudgetQuery.data;

	if (!budget) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Budget Categories</CardTitle>
					<CardDescription>
						No budget configured. Create a budget to track your spending.
					</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	// Calculate spending per budget category
	const budgetCategorySpending = data
		.filter(
			(transaction) => transaction.type === "expense" && !transaction.excluded,
		)
		.reduce(
			(acc, transaction) => {
				if (transaction.budgetCategory) {
					const categoryId = transaction.budgetCategory.id;
					const amount = Number(transaction.amount);

					if (!acc[categoryId]) {
						acc[categoryId] = {
							...transaction.budgetCategory,
							totalSpent: 0,
						};
					}

					acc[categoryId].totalSpent += amount;
				}

				return acc;
			},
			{} as Record<
				string,
				{
					id: string;
					name: string;
					percentage: string;
					totalSpent: number;
				}
			>,
		);

	const income = Number(budget.income);

	// Prepare data for all budget categories
	const categoryData = budget.categories.map((category) => {
		const spent = budgetCategorySpending[category.id]?.totalSpent || 0;
		const expectedAmount = (income * Number(category.percentage)) / 100;
		const percentageSpent =
			expectedAmount > 0 ? (spent / expectedAmount) * 100 : 0;
		const percentageOfIncome = (spent / income) * 100;
		const isOverBudget = spent > expectedAmount;

		return {
			id: category.id,
			name: category.name,
			expectedAmount,
			spent,
			percentageSpent: Math.min(percentageSpent, 100), // Cap at 100 for progress bar
			actualPercentageSpent: percentageSpent, // Keep actual value for display
			percentageOfIncome,
			isOverBudget,
			budgetPercentage: Number(category.percentage),
		};
	});

	// Sort by budget percentage (descending)
	const sortedData = categoryData.sort(
		(a, b) => b.budgetPercentage - a.budgetPercentage,
	);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Budget Categories</CardTitle>
				<CardDescription>
					Track your spending against budget for each category
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-6">
					{sortedData.map((category) => (
						<div key={category.id} className="space-y-2">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<span className="font-medium">{category.name}</span>
									<span className="text-sm text-muted-foreground">
										({category.budgetPercentage}% of income)
									</span>
								</div>
								<div className="flex items-center gap-2">
									{/* {category.isOverBudget ? (
										<ArrowUp className="h-4 w-4 text-destructive" />
									) : (
										<ArrowDown className="h-4 w-4 text-green-600" />
									)} */}
									<span
										className={
											category.isOverBudget
												? "font-semibold text-destructive"
												: "font-semibold text-green-600"
										}
									>
										{category.actualPercentageSpent.toFixed(1)}%
									</span>
								</div>
							</div>
							<Progress
								value={category.percentageSpent}
								className={
									category.isOverBudget
										? "[&>*]:bg-destructive"
										: "[&>*]:bg-green-600"
								}
							/>
							<div className="flex justify-between text-sm text-muted-foreground">
								<span>
									Spent: €{category.spent.toFixed(2)} /{" "}
									{category.percentageOfIncome.toFixed(1)}% of income
								</span>
								<span>Budget: €{category.expectedAmount.toFixed(2)}</span>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
