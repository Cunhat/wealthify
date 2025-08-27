import { db } from "@/db";
import { category, transaction, transactionAccount } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure } from "../init";

// Sample transaction descriptions for realistic data
const SAMPLE_DESCRIPTIONS = [
	"Grocery shopping",
	"Gas station",
	"Coffee shop",
	"Restaurant dinner",
	"Online shopping",
	"Utility bill",
	"Insurance payment",
	"Gym membership",
	"Pharmacy",
	"Movie tickets",
	"Public transport",
	"Parking fee",
	"Subscription service",
	"Hardware store",
	"Bookstore",
	"Clothing store",
	"Electronics",
	"Home improvement",
	"Medical appointment",
	"Hair salon",
	"Fast food",
	"Taxi ride",
	"Hotel booking",
	"Car maintenance",
	"Pet supplies",
	"Gift purchase",
	"Bank fee",
	"Interest payment",
	"Tax payment",
	"Charity donation",
];

export const transactionRouter = {
	createTransaction: protectedProcedure
		.input(
			z.object({
				amount: z.number().min(1, "Amount is required"),
				description: z.string().optional(),
				transactionAccount: z.string().optional(),
				category: z.string().optional(),
				type: z.enum(["expense", "income"]),
				createdAt: z.date().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			await db.insert(transaction).values({
				userId: ctx.user.id,
				amount: input.amount.toString(),
				description: input.description,
				transactionAccount: input.transactionAccount,
				category: input.category,
				type: input.type,
				createdAt: input.createdAt,
			});
		}),
	generateTransactions: protectedProcedure.mutation(async ({ ctx }) => {
		// Get user's accounts and categories
		const userAccounts = await db.query.transactionAccount.findMany({
			where: eq(transactionAccount.userId, ctx.user.id),
		});

		const userCategories = await db.query.category.findMany({
			where: eq(category.userId, ctx.user.id),
		});

		// If no accounts or categories exist, we'll create transactions without them
		const currentDate = new Date();
		const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
		const transactions = [];

		// Generate transactions from start of year to current date
		const currentWeekStart = new Date(startOfYear);

		while (currentWeekStart <= currentDate) {
			// Generate 5-8 transactions per week for variety
			const transactionsPerWeek = Math.floor(Math.random() * 4) + 5; // 5-8 transactions

			for (let i = 0; i < transactionsPerWeek; i++) {
				// Random day within the week
				const dayOffset = Math.floor(Math.random() * 7);
				const transactionDate = new Date(currentWeekStart);
				transactionDate.setDate(transactionDate.getDate() + dayOffset);

				// Don't generate transactions in the future
				if (transactionDate > currentDate) break;

				// Determine transaction type (80% expenses, 20% income)
				const isIncome = Math.random() < 0.2; // 20% chance of income
				const type = isIncome ? "income" : "expense";

				// Generate positive amounts based on type
				const amount = isIncome
					? (Math.random() * 1000 + 100).toFixed(2) // Income: $100-$1100
					: (Math.random() * 400 + 10).toFixed(2); // Expense: $10-$410

				// Random description
				const description =
					SAMPLE_DESCRIPTIONS[
						Math.floor(Math.random() * SAMPLE_DESCRIPTIONS.length)
					];

				// Random account and category if they exist
				const randomAccount =
					userAccounts.length > 0
						? userAccounts[Math.floor(Math.random() * userAccounts.length)].id
						: null;

				const randomCategory =
					userCategories.length > 0
						? userCategories[Math.floor(Math.random() * userCategories.length)]
								.id
						: null;

				transactions.push({
					userId: ctx.user.id,
					amount: amount,
					description: description,
					transactionAccount: randomAccount,
					category: randomCategory,
					type: type,
					createdAt: transactionDate,
				});
			}

			// Move to next week
			currentWeekStart.setDate(currentWeekStart.getDate() + 7);
		}

		// Insert all transactions in batches to avoid overwhelming the database
		const batchSize = 100;
		for (let i = 0; i < transactions.length; i += batchSize) {
			const batch = transactions.slice(i, i + batchSize);
			await db.insert(transaction).values(batch);
		}

		return {
			count: transactions.length,
			message: `Generated ${transactions.length} transactions successfully!`,
		};
	}),
	listTransactions: protectedProcedure.query(async ({ ctx }) => {
		const transactions = await db.query.transaction.findMany({
			where: eq(transaction.userId, ctx.user.id),
			with: {
				transactionAccount: true,
				category: true,
			},
			orderBy: (transaction, { desc }) => [desc(transaction.createdAt)],
		});
		return transactions;
	}),
	deleteTransaction: protectedProcedure
		.input(z.object({ transactions: z.array(z.string()) }))
		.mutation(async ({ ctx, input }) => {
			await db
				.delete(transaction)
				.where(
					and(
						inArray(transaction.id, input.transactions),
						eq(transaction.userId, ctx.user.id),
					),
				);
		}),
};
