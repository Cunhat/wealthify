import { db } from "@/db";
import {
	category,
	transaction,
	transactionAccount,
	transactionAccountHistory,
} from "@/db/schema";
import { balanceTransactionCalculator } from "@/lib/utils";
import dayjs from "dayjs";
import { and, eq, inArray, lt } from "drizzle-orm";
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
			// Create the transaction
			const createdTransaction = await db
				.insert(transaction)
				.values({
					userId: ctx.user.id,
					amount: input.amount.toString(),
					description: input.description,
					transactionAccount: input.transactionAccount,
					category: input.category,
					type: input.type,
					createdAt: input.createdAt || new Date(),
				})
				.returning();

			// Update account balance if transaction account is specified
			if (input.transactionAccount && createdTransaction) {
				const currentAccount = await db.query.transactionAccount.findFirst({
					where: and(
						eq(transactionAccount.id, input.transactionAccount),
						eq(transactionAccount.userId, ctx.user.id),
					),
				});

				if (currentAccount) {
					const currentBalance = Number.parseFloat(currentAccount.balance);
					let newBalance: number;

					// For expenses, subtract from balance; for income, add to balance
					if (input.type === "expense") {
						newBalance = currentBalance - input.amount;
					} else {
						newBalance = currentBalance + input.amount;
					}

					await db
						.update(transactionAccount)
						.set({ balance: newBalance.toString() })
						.where(
							and(
								eq(transactionAccount.id, input.transactionAccount),
								eq(transactionAccount.userId, ctx.user.id),
							),
						);

					const tranAccountHistory =
						await db.query.transactionAccountHistory.findFirst({
							where: and(
								eq(
									transactionAccountHistory.transactionAccountId,
									input.transactionAccount,
								),
								eq(transactionAccountHistory.userId, ctx.user.id),
								eq(
									transactionAccountHistory.year,
									dayjs(input.createdAt).year(),
								),
							),
						});

					const transactionMonth = dayjs(input.createdAt)
						.format("MMMM")
						.toLowerCase();

					if (!tranAccountHistory) {
						await db.insert(transactionAccountHistory).values({
							transactionAccountId: input.transactionAccount,
							year: dayjs(input.createdAt).year(),
							[transactionMonth]: balanceTransactionCalculator(
								input.type,
								input.amount,
								Number(currentAccount.balance),
							).toString(),
							userId: ctx.user.id,
						});
					} else {
						const newBalance = balanceTransactionCalculator(
							input.type,
							input.amount,
							Number(
								tranAccountHistory[
									transactionMonth as keyof typeof tranAccountHistory
								] ?? 0,
							),
						);

						await db
							.update(transactionAccountHistory)
							.set({
								[transactionMonth]: newBalance,
							})
							.where(eq(transactionAccountHistory.id, tranAccountHistory.id));
					}
				}
			}
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

		// Track running balances for each account to prevent negative balances
		const runningBalances = new Map<string, number>();
		for (const account of userAccounts) {
			runningBalances.set(account.id, Number.parseFloat(account.balance));
		}

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

				// Random account if they exist
				const randomAccount =
					userAccounts.length > 0
						? userAccounts[Math.floor(Math.random() * userAccounts.length)]
						: null;

				// Generate positive amounts based on type, but check balance for expenses
				let amount: string;
				if (isIncome) {
					amount = (Math.random() * 1000 + 100).toFixed(2); // Income: $100-$1100
				} else {
					// For expenses, ensure we don't go below $50 minimum balance
					const maxExpense = randomAccount
						? Math.max(10, (runningBalances.get(randomAccount.id) || 0) - 50)
						: 400;
					amount = (Math.random() * Math.min(maxExpense, 400) + 10).toFixed(2); // Expense: $10-$410 or available balance
				}

				// Skip this transaction if it would cause negative balance
				if (!isIncome && randomAccount) {
					const currentBalance = runningBalances.get(randomAccount.id) || 0;
					const expenseAmount = Number.parseFloat(amount);
					if (currentBalance - expenseAmount < 50) {
						// Skip this expense transaction to maintain minimum balance
						continue;
					}
				}

				// Random description
				const description =
					SAMPLE_DESCRIPTIONS[
						Math.floor(Math.random() * SAMPLE_DESCRIPTIONS.length)
					];

				const randomCategory =
					userCategories.length > 0
						? userCategories[Math.floor(Math.random() * userCategories.length)]
								.id
						: null;

				// Update running balance
				if (randomAccount) {
					const currentBalance = runningBalances.get(randomAccount.id) || 0;
					const amountValue = Number.parseFloat(amount);
					const newBalance = isIncome
						? currentBalance + amountValue
						: currentBalance - amountValue;
					runningBalances.set(randomAccount.id, newBalance);
				}

				transactions.push({
					userId: ctx.user.id,
					amount: amount,
					description: description,
					transactionAccount: randomAccount?.id || null,
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

		// Update account balances based on generated transactions
		const accountBalanceChanges = new Map<string, number>();

		// Calculate balance changes for each account
		for (const txn of transactions) {
			if (txn.transactionAccount) {
				const currentChange =
					accountBalanceChanges.get(txn.transactionAccount) || 0;
				const amount = Number.parseFloat(txn.amount);

				// For expenses, subtract from balance; for income, add to balance
				const balanceChange = txn.type === "expense" ? -amount : amount;
				accountBalanceChanges.set(
					txn.transactionAccount,
					currentChange + balanceChange,
				);
			}
		}

		// Update each account's balance
		for (const [accountId, balanceChange] of accountBalanceChanges) {
			const currentAccount = await db.query.transactionAccount.findFirst({
				where: and(
					eq(transactionAccount.id, accountId),
					eq(transactionAccount.userId, ctx.user.id),
				),
			});

			if (currentAccount) {
				const currentBalance = Number.parseFloat(currentAccount.balance);
				const newBalance = currentBalance + balanceChange;

				await db
					.update(transactionAccount)
					.set({ balance: newBalance.toString() })
					.where(
						and(
							eq(transactionAccount.id, accountId),
							eq(transactionAccount.userId, ctx.user.id),
						),
					);
			}
		}

		// Update transaction account history for generated transactions
		const historyUpdates = new Map<string, Map<string, number>>(); // accountId -> { "year-month": amount }

		// Group transactions by account, year, and month
		for (const txn of transactions) {
			if (txn.transactionAccount) {
				const accountId = txn.transactionAccount;
				const year = dayjs(txn.createdAt).year();
				const month = dayjs(txn.createdAt).format("MMMM").toLowerCase();
				const yearMonth = `${year}-${month}`;
				const amount = Number.parseFloat(txn.amount);

				if (!historyUpdates.has(accountId)) {
					historyUpdates.set(accountId, new Map());
				}

				const accountHistory = historyUpdates.get(accountId);
				if (!accountHistory) continue;
				const currentAmount = accountHistory.get(yearMonth) || 0;

				// Calculate the balance change based on transaction type
				const balanceChange = txn.type === "expense" ? -amount : amount;
				accountHistory.set(yearMonth, currentAmount + balanceChange);
			}
		}

		// Apply history updates
		for (const [accountId, yearMonthUpdates] of historyUpdates) {
			for (const [yearMonth, totalChange] of yearMonthUpdates) {
				const [year, month] = yearMonth.split("-");
				const yearNum = Number.parseInt(year);

				// Find or create history record
				const existingHistory =
					await db.query.transactionAccountHistory.findFirst({
						where: and(
							eq(transactionAccountHistory.transactionAccountId, accountId),
							eq(transactionAccountHistory.userId, ctx.user.id),
							eq(transactionAccountHistory.year, yearNum),
						),
					});

				if (!existingHistory) {
					// Create new history record
					await db.insert(transactionAccountHistory).values({
						transactionAccountId: accountId,
						year: yearNum,
						[month]: totalChange.toFixed(2),
						userId: ctx.user.id,
					});
				} else {
					// Update existing history record
					const currentMonthBalance = Number(
						existingHistory[month as keyof typeof existingHistory] ?? 0,
					);
					const newMonthBalance = currentMonthBalance + totalChange;

					await db
						.update(transactionAccountHistory)
						.set({
							[month]: newMonthBalance.toFixed(2),
						})
						.where(eq(transactionAccountHistory.id, existingHistory.id));
				}
			}
		}

		return {
			count: transactions.length,
			message: `Generated ${transactions.length} transactions successfully!`,
		};
	}),
	listTransactions: protectedProcedure
		.input(
			z.object({
				cursor: z.date().nullish(),
				limit: z.number().min(1),
				categoryNames: z.array(z.string()).optional(),
				accountNames: z.array(z.string()).optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const { cursor, limit, categoryNames, accountNames } = input;

			// Build where conditions
			const whereConditions = [eq(transaction.userId, ctx.user.id)];

			if (cursor) {
				whereConditions.push(lt(transaction.createdAt, cursor));
			}

			if (categoryNames && categoryNames.length > 0) {
				const categories = await db.query.category.findMany({
					where: inArray(category.name, categoryNames),
				});

				whereConditions.push(
					inArray(
						transaction.category,
						categories.map((c) => c.id),
					),
				);
			}

			// Add account filtering
			if (accountNames && accountNames.length > 0) {
				const accounts = await db.query.transactionAccount.findMany({
					where: inArray(transactionAccount.name, accountNames),
				});

				whereConditions.push(
					inArray(
						transaction.transactionAccount,
						accounts.map((a) => a.id),
					),
				);
			}

			// If category filtering is requested, we need to join with category table
			const transactions = await db.query.transaction.findMany({
				where: and(...whereConditions),
				with: {
					transactionAccount: true,
					category: true,
				},
				limit: limit + 1,
				orderBy: (transaction, { desc }) => [desc(transaction.createdAt)],
			});

			// Filter by category names if provided

			const hasMore = transactions.length > limit;

			const items = hasMore ? transactions.slice(0, -1) : transactions;
			const lastItem = items[items.length - 1];
			const nextCursor = hasMore ? lastItem?.createdAt : undefined;

			return {
				transactions: items,
				nextCursor,
			};
		}),
	deleteTransaction: protectedProcedure
		.input(z.object({ transactions: z.array(z.string()) }))
		.mutation(async ({ ctx, input }) => {
			// Get the transactions to be deleted to reverse their balance effects
			const transactionsToDelete = await db.query.transaction.findMany({
				where: and(
					inArray(transaction.id, input.transactions),
					eq(transaction.userId, ctx.user.id),
				),
			});

			// First delete the transactions
			await db
				.delete(transaction)
				.where(
					and(
						inArray(transaction.id, input.transactions),
						eq(transaction.userId, ctx.user.id),
					),
				);

			const listOfAccountsToUpdate = new Set<string>();

			for (const txn of transactionsToDelete) {
				if (txn.transactionAccount) {
					listOfAccountsToUpdate.add(txn.transactionAccount);
				}
			}

			for (const accountId of listOfAccountsToUpdate) {
				const account = await db.query.transactionAccount.findFirst({
					where: and(
						eq(transactionAccount.id, accountId),
						eq(transactionAccount.userId, ctx.user.id),
					),
				});

				if (account) {
					const currentBalance = Number.parseFloat(account.balance);

					const newBalance = transactionsToDelete
						.filter((txn) => txn.transactionAccount === accountId)
						.reduce((acc, txn) => {
							if (txn.type === "expense") {
								return acc + Number.parseFloat(txn.amount);
							}

							return acc - Number.parseFloat(txn.amount);
						}, currentBalance);

					await db
						.update(transactionAccount)
						.set({ balance: newBalance.toString() })
						.where(
							and(
								eq(transactionAccount.id, accountId),
								eq(transactionAccount.userId, ctx.user.id),
							),
						);

					// Update transaction account history for deleted transactions
					const accountTransactions = transactionsToDelete.filter(
						(txn) => txn.transactionAccount === accountId,
					);

					for (const txn of accountTransactions) {
						const tranAccountHistory =
							await db.query.transactionAccountHistory.findFirst({
								where: and(
									eq(transactionAccountHistory.transactionAccountId, accountId),
									eq(transactionAccountHistory.userId, ctx.user.id),
									eq(
										transactionAccountHistory.year,
										dayjs(txn.createdAt).year(),
									),
								),
							});

						const transactionMonth = dayjs(txn.createdAt)
							.format("MMMM")
							.toLowerCase();

						if (tranAccountHistory) {
							// Reverse the transaction effect on history
							const currentMonthBalance = Number(
								tranAccountHistory[
									transactionMonth as keyof typeof tranAccountHistory
								] ?? 0,
							);

							// For deletion, we reverse the effect:
							// - If it was an expense, we add it back (opposite of subtraction)
							// - If it was income, we subtract it (opposite of addition)
							const reversedBalance = balanceTransactionCalculator(
								txn.type === "expense" ? "income" : "expense",
								Number.parseFloat(txn.amount),
								currentMonthBalance,
							);

							await db
								.update(transactionAccountHistory)
								.set({
									[transactionMonth]: reversedBalance,
								})
								.where(eq(transactionAccountHistory.id, tranAccountHistory.id));
						}
					}
				}
			}
		}),
	updateTransaction: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				amount: z.number().min(1, "Amount is required").optional(),
				description: z.string().optional(),
				transactionAccount: z.string().optional(),
				category: z.string().optional(),
				type: z.enum(["expense", "income"]).optional(),
				createdAt: z.date().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { id, ...updateData } = input;

			// Get the current transaction to understand what's changing
			const currentTransaction = await db.query.transaction.findFirst({
				where: and(eq(transaction.id, id), eq(transaction.userId, ctx.user.id)),
			});

			if (!currentTransaction) {
				throw new Error("Transaction not found");
			}

			// Only include fields that were provided
			const fieldsToUpdate: Partial<{
				amount: string;
				description: string | null;
				transactionAccount: string | null;
				category: string | null;
				type: "expense" | "income";
				createdAt: Date;
			}> = {};
			if (updateData.amount !== undefined)
				fieldsToUpdate.amount = updateData.amount.toString();
			if (updateData.description !== undefined)
				fieldsToUpdate.description = updateData.description;
			if (updateData.transactionAccount !== undefined)
				fieldsToUpdate.transactionAccount = updateData.transactionAccount;
			if (updateData.category !== undefined)
				fieldsToUpdate.category = updateData.category;
			if (updateData.type !== undefined) fieldsToUpdate.type = updateData.type;
			if (updateData.createdAt !== undefined)
				fieldsToUpdate.createdAt = updateData.createdAt;

			// Handle balance updates when amount, type, or account changes
			const oldAmount = Number.parseFloat(currentTransaction.amount);
			const newAmount = updateData.amount ?? oldAmount;
			const oldType = currentTransaction.type as "expense" | "income";
			const newType = updateData.type ?? oldType;
			const oldAccountId = currentTransaction.transactionAccount;
			const newAccountId = updateData.transactionAccount ?? oldAccountId;

			// Update the transaction
			await db
				.update(transaction)
				.set(fieldsToUpdate)
				.where(
					and(eq(transaction.id, id), eq(transaction.userId, ctx.user.id)),
				);

			// Handle balance adjustments and history updates
			const oldCreatedAt = currentTransaction.createdAt;
			const newCreatedAt = updateData.createdAt ?? oldCreatedAt;

			if (oldAccountId && newAccountId) {
				if (oldAccountId === newAccountId) {
					// Same account, adjust for amount/type changes
					const account = await db.query.transactionAccount.findFirst({
						where: and(
							eq(transactionAccount.id, oldAccountId),
							eq(transactionAccount.userId, ctx.user.id),
						),
					});

					if (account) {
						const currentBalance = Number.parseFloat(account.balance);

						// Reverse the old transaction effect
						let balanceAfterReverse = currentBalance;
						if (oldType === "expense") {
							balanceAfterReverse += oldAmount; // Add back the expense
						} else {
							balanceAfterReverse -= oldAmount; // Remove the income
						}

						// Apply the new transaction effect
						let newBalance = balanceAfterReverse;
						if (newType === "expense") {
							newBalance -= newAmount; // Subtract the new expense
						} else {
							newBalance += newAmount; // Add the new income
						}

						await db
							.update(transactionAccount)
							.set({ balance: newBalance.toString() })
							.where(
								and(
									eq(transactionAccount.id, oldAccountId),
									eq(transactionAccount.userId, ctx.user.id),
								),
							);

						// Update transaction account history
						// Handle old transaction date/month
						const oldTransactionHistory =
							await db.query.transactionAccountHistory.findFirst({
								where: and(
									eq(
										transactionAccountHistory.transactionAccountId,
										oldAccountId,
									),
									eq(transactionAccountHistory.userId, ctx.user.id),
									eq(
										transactionAccountHistory.year,
										dayjs(oldCreatedAt).year(),
									),
								),
							});

						const oldTransactionMonth = dayjs(oldCreatedAt)
							.format("MMMM")
							.toLowerCase();

						if (oldTransactionHistory) {
							// Reverse the old transaction effect from history
							const oldMonthBalance = Number(
								oldTransactionHistory[
									oldTransactionMonth as keyof typeof oldTransactionHistory
								] ?? 0,
							);

							const reversedOldBalance = balanceTransactionCalculator(
								oldType === "expense" ? "income" : "expense",
								oldAmount,
								oldMonthBalance,
							);

							await db
								.update(transactionAccountHistory)
								.set({
									[oldTransactionMonth]: reversedOldBalance,
								})
								.where(
									eq(transactionAccountHistory.id, oldTransactionHistory.id),
								);
						}

						// Handle new transaction date/month (if different from old)
						const newTransactionYear = dayjs(newCreatedAt).year();
						const newTransactionMonth = dayjs(newCreatedAt)
							.format("MMMM")
							.toLowerCase();

						const newTransactionHistory =
							await db.query.transactionAccountHistory.findFirst({
								where: and(
									eq(
										transactionAccountHistory.transactionAccountId,
										oldAccountId,
									),
									eq(transactionAccountHistory.userId, ctx.user.id),
									eq(transactionAccountHistory.year, newTransactionYear),
								),
							});

						if (!newTransactionHistory) {
							// Create new history record for the new year
							await db.insert(transactionAccountHistory).values({
								transactionAccountId: oldAccountId,
								year: newTransactionYear,
								[newTransactionMonth]: balanceTransactionCalculator(
									newType,
									newAmount,
									0,
								).toString(),
								userId: ctx.user.id,
							});
						} else {
							// Update existing history record
							const newMonthBalance = Number(
								newTransactionHistory[
									newTransactionMonth as keyof typeof newTransactionHistory
								] ?? 0,
							);

							const updatedNewBalance = balanceTransactionCalculator(
								newType,
								newAmount,
								newMonthBalance,
							);

							await db
								.update(transactionAccountHistory)
								.set({
									[newTransactionMonth]: updatedNewBalance,
								})
								.where(
									eq(transactionAccountHistory.id, newTransactionHistory.id),
								);
						}
					}
				} else {
					// Different accounts, reverse from old and apply to new

					// Reverse from old account
					const oldAccount = await db.query.transactionAccount.findFirst({
						where: and(
							eq(transactionAccount.id, oldAccountId),
							eq(transactionAccount.userId, ctx.user.id),
						),
					});

					if (oldAccount) {
						const oldBalance = Number.parseFloat(oldAccount.balance);
						let newOldBalance = oldBalance;

						if (oldType === "expense") {
							newOldBalance += oldAmount; // Add back the expense
						} else {
							newOldBalance -= oldAmount; // Remove the income
						}

						await db
							.update(transactionAccount)
							.set({ balance: newOldBalance.toString() })
							.where(
								and(
									eq(transactionAccount.id, oldAccountId),
									eq(transactionAccount.userId, ctx.user.id),
								),
							);

						// Update old account history - reverse the transaction
						const oldTransactionHistory =
							await db.query.transactionAccountHistory.findFirst({
								where: and(
									eq(
										transactionAccountHistory.transactionAccountId,
										oldAccountId,
									),
									eq(transactionAccountHistory.userId, ctx.user.id),
									eq(
										transactionAccountHistory.year,
										dayjs(oldCreatedAt).year(),
									),
								),
							});

						const oldTransactionMonth = dayjs(oldCreatedAt)
							.format("MMMM")
							.toLowerCase();

						if (oldTransactionHistory) {
							const oldMonthBalance = Number(
								oldTransactionHistory[
									oldTransactionMonth as keyof typeof oldTransactionHistory
								] ?? 0,
							);

							const reversedOldBalance = balanceTransactionCalculator(
								oldType === "expense" ? "income" : "expense",
								oldAmount,
								oldMonthBalance,
							);

							await db
								.update(transactionAccountHistory)
								.set({
									[oldTransactionMonth]: reversedOldBalance,
								})
								.where(
									eq(transactionAccountHistory.id, oldTransactionHistory.id),
								);
						}
					}

					// Apply to new account
					const newAccount = await db.query.transactionAccount.findFirst({
						where: and(
							eq(transactionAccount.id, newAccountId),
							eq(transactionAccount.userId, ctx.user.id),
						),
					});

					if (newAccount) {
						const newAccountBalance = Number.parseFloat(newAccount.balance);
						let updatedBalance = newAccountBalance;

						if (newType === "expense") {
							updatedBalance -= newAmount; // Subtract the expense
						} else {
							updatedBalance += newAmount; // Add the income
						}

						await db
							.update(transactionAccount)
							.set({ balance: updatedBalance.toString() })
							.where(
								and(
									eq(transactionAccount.id, newAccountId),
									eq(transactionAccount.userId, ctx.user.id),
								),
							);

						// Update new account history - add the new transaction
						const newTransactionYear = dayjs(newCreatedAt).year();
						const newTransactionMonth = dayjs(newCreatedAt)
							.format("MMMM")
							.toLowerCase();

						const newTransactionHistory =
							await db.query.transactionAccountHistory.findFirst({
								where: and(
									eq(
										transactionAccountHistory.transactionAccountId,
										newAccountId,
									),
									eq(transactionAccountHistory.userId, ctx.user.id),
									eq(transactionAccountHistory.year, newTransactionYear),
								),
							});

						if (!newTransactionHistory) {
							// Create new history record for the new account/year
							await db.insert(transactionAccountHistory).values({
								transactionAccountId: newAccountId,
								year: newTransactionYear,
								[newTransactionMonth]: balanceTransactionCalculator(
									newType,
									newAmount,
									0,
								).toString(),
								userId: ctx.user.id,
							});
						} else {
							// Update existing history record for new account
							const newMonthBalance = Number(
								newTransactionHistory[
									newTransactionMonth as keyof typeof newTransactionHistory
								] ?? 0,
							);

							const updatedNewBalance = balanceTransactionCalculator(
								newType,
								newAmount,
								newMonthBalance,
							);

							await db
								.update(transactionAccountHistory)
								.set({
									[newTransactionMonth]: updatedNewBalance,
								})
								.where(
									eq(transactionAccountHistory.id, newTransactionHistory.id),
								);
						}
					}
				}
			}
		}),
	updateTransactionCategory: protectedProcedure
		.input(
			z.object({
				transactionId: z.array(z.string()),
				categoryId: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			await db
				.update(transaction)
				.set({ category: input.categoryId })
				.where(
					and(
						inArray(transaction.id, input.transactionId),
						eq(transaction.userId, ctx.user.id),
					),
				);
		}),
};
