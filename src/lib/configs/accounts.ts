export type AccountType =
	| "checking_account"
	| "savings_account"
	| "cash"
	| "money_market_account"
	| "credit_card"
	| "loan_account"
	| "mortgage"
	| "line_of_credit"
	| "brokerage_account"
	| "retirement_account"
	| "crypto_wallet"
	| "mutual_fund_account"
	| "property"
	| "vehicle"
	| "other_assets"
	| "bills_payable"
	| "taxes_owed"
	| "other_debts"
	| "cash_and_bank"
	| "credit_and_debt"
	| "investment"
	| "asset"
	| "liability";

export const accounts: {
	type: AccountType;
	description: string;
	label: string;
}[] = [
	{
		type: "checking_account",
		description: "A bank account for daily transactions and bill payments.",
		label: "Checking Account",
	},
	{
		type: "savings_account",
		description: "A bank account for storing money and earning interest.",
		label: "Savings Account",
	},
	{
		type: "cash",
		description: "Physical money on hand.",
		label: "Cash",
	},
	{
		type: "money_market_account",
		description: "A high-interest savings account with limited transactions.",
		label: "Money Market Account",
	},
	{
		type: "credit_card",
		description: "An account for purchases made on credit.",
		label: "Credit Card",
	},
	{
		type: "loan_account",
		description: "An account for tracking personal or student loans.",
		label: "Loan Account",
	},
	{
		type: "mortgage",
		description: "An account for tracking home loan balances.",
		label: "Mortgage",
	},
	{
		type: "line_of_credit",
		description: "A flexible borrowing account with a set credit limit.",
		label: "Line of Credit",
	},
	{
		type: "brokerage_account",
		description: "An account for trading and holding stocks, ETFs, and bonds.",
		label: "Brokerage Account",
	},
	{
		type: "retirement_account",
		description: "An account for retirement savings such as 401(k) or IRA.",
		label: "Retirement Account",
	},
	{
		type: "crypto_wallet",
		description: "A digital wallet for storing cryptocurrencies.",
		label: "Crypto Wallet",
	},
	{
		type: "mutual_fund_account",
		description: "An account for pooled investment funds.",
		label: "Mutual Fund Account",
	},
	{
		type: "property",
		description: "An account representing real estate assets.",
		label: "Property",
	},
	{
		type: "vehicle",
		description: "An account representing vehicles such as cars or boats.",
		label: "Vehicle",
	},
	{
		type: "other_assets",
		description:
			"An account for other valuable assets like jewelry or collectibles.",
		label: "Other Assets",
	},
	{
		type: "bills_payable",
		description: "An account for tracking outstanding bills.",
		label: "Bills Payable",
	},
	{
		type: "taxes_owed",
		description: "An account for tracking taxes owed.",
		label: "Taxes Owed",
	},
	{
		type: "other_debts",
		description: "An account for tracking other financial obligations.",
		label: "Other Debts",
	},
];

export type AccountTypeGroup =
	| "cash_and_bank"
	| "credit_and_debt"
	| "investment"
	| "asset"
	| "liability";

export const accountTypeGroups: {
	name: string;
	main_type: AccountTypeGroup;
	description: string;
	children: AccountType[];
}[] = [
	{
		name: "Cash & Bank",
		main_type: "cash_and_bank",
		description: "Accounts for managing liquid funds and daily transactions.",
		children: [
			"checking_account",
			"savings_account",
			"cash",
			"money_market_account",
		],
	},
	{
		name: "Credit & Debt",
		main_type: "credit_and_debt",
		description: "Accounts for managing borrowed money and credit obligations.",
		children: ["credit_card", "loan_account", "mortgage", "line_of_credit"],
	},
	{
		name: "Investment",
		main_type: "investment",
		description: "Accounts for holding and growing investments.",
		children: [
			"brokerage_account",
			"retirement_account",
			"crypto_wallet",
			"mutual_fund_account",
		],
	},
	{
		name: "Asset",
		main_type: "asset",
		description: "Accounts representing owned valuable items.",
		children: ["property", "vehicle", "other_assets"],
	},
	{
		name: "Liability",
		main_type: "liability",
		description: "Accounts representing financial obligations and debts.",
		children: ["bills_payable", "taxes_owed", "other_debts"],
	},
];
