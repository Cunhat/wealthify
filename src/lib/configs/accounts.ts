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

export type AccountTypeGroup =
	| "cash_and_bank"
	| "credit_and_debt"
	| "investment"
	| "asset"
	| "liability";

export const AccountTypeGroups: {
	name: string;
	main_type: AccountTypeGroup;
	description: string;
	children: {
		type: AccountType;
		label: string;
		description: string;
	}[];
}[] = [
	{
		name: "Cash & Bank",
		main_type: "cash_and_bank",
		description: "Accounts for managing liquid funds and daily transactions.",
		children: [
			{
				type: "checking_account",
				label: "Checking Account",
				description: "A bank account for daily transactions and bill payments.",
			},
			{
				type: "savings_account",
				label: "Savings Account",
				description: "A bank account for storing money and earning interest.",
			},
			{ type: "cash", label: "Cash", description: "Physical money on hand." },
			{
				type: "money_market_account",
				label: "Money Market Account",
				description:
					"A high-interest savings account with limited transactions.",
			},
		],
	},
	{
		name: "Credit & Debt",
		main_type: "credit_and_debt",
		description: "Accounts for managing borrowed money and credit obligations.",
		children: [
			{
				type: "credit_card",
				label: "Credit Card",
				description: "An account for purchases made on credit.",
			},
			{
				type: "loan_account",
				label: "Loan Account",
				description: "An account for tracking personal or student loans.",
			},
			{
				type: "mortgage",
				label: "Mortgage",
				description: "An account for tracking home loan balances.",
			},
			{
				type: "line_of_credit",
				label: "Line of Credit",
				description: "A flexible borrowing account with a set credit limit.",
			},
		],
	},
	{
		name: "Investment",
		main_type: "investment",
		description: "Accounts for holding and growing investments.",
		children: [
			{
				type: "brokerage_account",
				label: "Brokerage Account",
				description:
					"An account for trading and holding stocks, ETFs, and bonds.",
			},
			{
				type: "retirement_account",
				label: "Retirement Account",
				description: "An account for retirement savings such as 401(k) or IRA.",
			},
			{
				type: "crypto_wallet",
				label: "Crypto Wallet",
				description: "A digital wallet for storing cryptocurrencies.",
			},
			{
				type: "mutual_fund_account",
				label: "Mutual Fund Account",
				description: "An account for pooled investment funds.",
			},
		],
	},
	{
		name: "Asset",
		main_type: "asset",
		description: "Accounts representing owned valuable items.",
		children: [
			{
				type: "property",
				label: "Property",
				description: "An account representing real estate assets.",
			},
			{
				type: "vehicle",
				label: "Vehicle",
				description: "An account representing vehicles such as cars or boats.",
			},
			{
				type: "other_assets",
				label: "Other Assets",
				description:
					"An account for other valuable assets like jewelry or collectibles.",
			},
		],
	},
	{
		name: "Liability",
		main_type: "liability",
		description: "Accounts representing financial obligations and debts.",
		children: [
			{
				type: "bills_payable",
				label: "Bills Payable",
				description: "An account for tracking outstanding bills.",
			},
			{
				type: "taxes_owed",
				label: "Taxes Owed",
				description: "An account for tracking taxes owed.",
			},
			{
				type: "other_debts",
				label: "Other Debts",
				description: "An account for tracking other financial obligations.",
			},
		],
	},
];
