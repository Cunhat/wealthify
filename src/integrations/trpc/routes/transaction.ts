import { db } from "@/db";
import { category, transaction, transactionAccount } from "@/db/schema";
import dayjs from "dayjs";
import { and, eq, inArray, lt } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure } from "../init";

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
					createdAt: dayjs(input.createdAt).toDate(),
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
				}
			}
		}),
	generateTransactions: protectedProcedure.mutation(async ({ ctx }) => {
		// Get all transaction accounts for this user
		const transactionAccounts = await db.query.transactionAccount.findMany({
			where: eq(transactionAccount.userId, ctx.user.id),
		});

		if (transactionAccounts.length === 0) {
			throw new Error(
				"No transaction accounts found. Please create at least one transaction account first.",
			);
		}

		// Get all categories for this user
		const categories = await db.query.category.findMany({
			where: eq(category.userId, ctx.user.id),
		});

		if (categories.length === 0) {
			throw new Error(
				"No categories found. Please create at least one category first.",
			);
		}

		// Determine date range based on account initial balance dates
		const today = new Date();

		// Find the earliest initial balance date among all accounts
		const earliestInitialDate = transactionAccounts.reduce(
			(earliest, account) => {
				return account.initialBalanceDate < earliest
					? account.initialBalanceDate
					: earliest;
			},
			transactionAccounts[0].initialBalanceDate,
		);

		// Use the earliest initial balance date as start, today as end
		const actualStartDate = earliestInitialDate;
		const actualEndDate = today;

		// Fixed number of transactions to generate
		const numberOfTransactions = 50;

		// Generate realistic transaction patterns
		const generatedTransactions = [];
		const accountBalances: Record<string, number> = {};

		// Initialize account balances
		for (const account of transactionAccounts) {
			accountBalances[account.id] = Number.parseFloat(account.balance);
		}

		// Enhanced transaction descriptions by category type
		const transactionTemplates = {
			groceries: [
				"Grocery shopping at Supermarket",
				"Weekly groceries",
				"Fresh produce shopping",
				"Bulk grocery purchase",
				"Organic food shopping",
			],
			dining: [
				"Restaurant dinner",
				"Coffee shop",
				"Fast food lunch",
				"Pizza delivery",
				"Breakfast at cafe",
				"Food delivery",
			],
			transportation: [
				"Gas station fill-up",
				"Public transport ticket",
				"Taxi ride",
				"Uber ride",
				"Parking fee",
				"Car maintenance",
			],
			utilities: [
				"Electricity bill",
				"Water bill",
				"Internet service",
				"Phone bill",
				"Gas bill",
			],
			entertainment: [
				"Movie tickets",
				"Streaming subscription",
				"Concert tickets",
				"Gaming purchase",
				"Book purchase",
			],
			health: [
				"Pharmacy purchase",
				"Medical appointment",
				"Gym membership",
				"Health insurance",
				"Dental checkup",
			],
			shopping: [
				"Online shopping",
				"Clothing purchase",
				"Electronics store",
				"Home improvement",
				"Hardware store",
			],
			income: [
				"Salary payment",
				"Freelance payment",
				"Investment return",
				"Bonus payment",
				"Side hustle income",
				"Gift received",
			],
		};

		// Generate income transactions first to ensure positive balances
		const incomeTransactions = Math.floor(numberOfTransactions * 0.2); // 20% income

		for (let i = 0; i < numberOfTransactions; i++) {
			const isIncome = i < incomeTransactions;
			const randomAccount =
				transactionAccounts[
					Math.floor(Math.random() * transactionAccounts.length)
				];
			const randomCategory =
				categories[Math.floor(Math.random() * categories.length)];

			// Generate random date within range
			const randomTime =
				actualStartDate.getTime() +
				Math.random() * (actualEndDate.getTime() - actualStartDate.getTime());
			const transactionDate = new Date(randomTime);

			// Ensure transaction date is after the specific account's initial balance date
			const accountStartDate =
				randomAccount.initialBalanceDate > actualStartDate
					? randomAccount.initialBalanceDate
					: actualStartDate;

			if (transactionDate < accountStartDate) {
				transactionDate.setTime(
					accountStartDate.getTime() +
						Math.random() *
							(actualEndDate.getTime() - accountStartDate.getTime()),
				);
			}

			// Generate realistic amounts based on transaction type
			let amount: number;
			let description: string;

			if (isIncome) {
				// Income amounts: $500 - $5000
				amount = Math.floor(Math.random() * 4500) + 500;
				description =
					transactionTemplates.income[
						Math.floor(Math.random() * transactionTemplates.income.length)
					];
			} else {
				// Expense amounts: $5 - $500, with occasional larger purchases
				if (Math.random() < 0.1) {
					// 10% chance of larger purchase ($200-$1000)
					amount = Math.floor(Math.random() * 800) + 200;
				} else {
					// Regular expenses ($5-$200)
					amount = Math.floor(Math.random() * 195) + 5;
				}

				// Choose description based on category name or random
				const categoryName = randomCategory.name.toLowerCase();
				if (categoryName.includes("food") || categoryName.includes("grocery")) {
					description =
						transactionTemplates.groceries[
							Math.floor(Math.random() * transactionTemplates.groceries.length)
						];
				} else if (
					categoryName.includes("transport") ||
					categoryName.includes("car")
				) {
					description =
						transactionTemplates.transportation[
							Math.floor(
								Math.random() * transactionTemplates.transportation.length,
							)
						];
				} else if (
					categoryName.includes("dining") ||
					categoryName.includes("restaurant")
				) {
					description =
						transactionTemplates.dining[
							Math.floor(Math.random() * transactionTemplates.dining.length)
						];
				} else if (
					categoryName.includes("utility") ||
					categoryName.includes("bill")
				) {
					description =
						transactionTemplates.utilities[
							Math.floor(Math.random() * transactionTemplates.utilities.length)
						];
				} else if (
					categoryName.includes("entertainment") ||
					categoryName.includes("fun")
				) {
					description =
						transactionTemplates.entertainment[
							Math.floor(
								Math.random() * transactionTemplates.entertainment.length,
							)
						];
				} else if (
					categoryName.includes("health") ||
					categoryName.includes("medical")
				) {
					description =
						transactionTemplates.health[
							Math.floor(Math.random() * transactionTemplates.health.length)
						];
				} else if (
					categoryName.includes("shopping") ||
					categoryName.includes("retail")
				) {
					description =
						transactionTemplates.shopping[
							Math.floor(Math.random() * transactionTemplates.shopping.length)
						];
				} else {
					// Fallback to general descriptions
					const allDescriptions = Object.values(transactionTemplates).flat();
					description =
						allDescriptions[Math.floor(Math.random() * allDescriptions.length)];
				}
			}

			// Check if expense would make balance negative, and adjust if needed
			if (!isIncome && accountBalances[randomAccount.id] - amount < 0) {
				// Either reduce the amount or skip this transaction
				const maxExpense = Math.floor(accountBalances[randomAccount.id] * 0.8); // Keep 20% buffer
				if (maxExpense > 5) {
					amount = Math.floor(Math.random() * (maxExpense - 5)) + 5;
				} else {
					continue; // Skip this transaction if account balance is too low
				}
			}

			// Update projected balance
			if (isIncome) {
				accountBalances[randomAccount.id] += amount;
			} else {
				accountBalances[randomAccount.id] -= amount;
			}

			generatedTransactions.push({
				userId: ctx.user.id,
				amount: amount.toString(),
				description,
				transactionAccount: randomAccount.id,
				category: randomCategory.id,
				type: isIncome ? "income" : "expense",
				createdAt: transactionDate,
			});
		}

		// Sort transactions by date for realistic progression
		generatedTransactions.sort(
			(a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
		);

		// Insert all transactions
		await db.insert(transaction).values(generatedTransactions);

		// Update account balances
		for (const account of transactionAccounts) {
			await db
				.update(transactionAccount)
				.set({ balance: accountBalances[account.id].toString() })
				.where(
					and(
						eq(transactionAccount.id, account.id),
						eq(transactionAccount.userId, ctx.user.id),
					),
				);
		}

		return {
			success: true,
			generated: generatedTransactions.length,
			message: `Successfully generated ${generatedTransactions.length} realistic transactions.`,
			accountBalances: Object.fromEntries(
				transactionAccounts.map((account) => [
					account.name,
					accountBalances[account.id],
				]),
			),
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
