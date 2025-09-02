import type { LucideIcon } from "lucide-react";
import {
	BarChart3,
	Bitcoin,
	Building2,
	Car,
	Coins,
	CreditCard,
	Home,
	Landmark,
	Layers,
	LineChart,
	Package,
	Percent,
	Receipt,
	Shield,
	TrendingDown,
	Wallet,
} from "lucide-react";

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

export type AccountsGroupedByType = {
	name: string;
	main_type: AccountTypeGroup;
	description: string;
	children: {
		type: AccountType;
		label: string;
		description: string;
		icon: LucideIcon;
		iconBg: string;
		iconFg: string;
		iconBgHex: string;
		iconFgHex: string;
	}[];
};

export const AccountTypeGroups: AccountsGroupedByType[] = [
	{
		name: "Cash & Bank",
		main_type: "cash_and_bank",
		description: "Accounts for managing liquid funds and daily transactions.",
		children: [
			{
				type: "checking_account",
				label: "Checking Account",
				description: "A bank account for daily transactions and bill payments.",
				icon: Landmark,
				iconBg: "bg-blue-100",
				iconFg: "text-blue-700",
				iconBgHex: "#dbeafe",
				iconFgHex: "#1d4ed8",
			},
			{
				type: "savings_account",
				label: "Savings Account",
				description: "A bank account for storing money and earning interest.",
				icon: Wallet,
				iconBg: "bg-emerald-100",
				iconFg: "text-emerald-700",
				iconBgHex: "#d1fae5",
				iconFgHex: "#047857",
			},
			{
				type: "cash",
				label: "Cash",
				description: "Physical money on hand.",
				icon: Coins,
				iconBg: "bg-amber-100",
				iconFg: "text-amber-700",
				iconBgHex: "#fef3c7",
				iconFgHex: "#b45309",
			},
			{
				type: "money_market_account",
				label: "Money Market Account",
				description:
					"A high-interest savings account with limited transactions.",
				icon: BarChart3,
				iconBg: "bg-violet-100",
				iconFg: "text-violet-700",
				iconBgHex: "#ede9fe",
				iconFgHex: "#6d28d9",
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
				icon: CreditCard,
				iconBg: "bg-rose-100",
				iconFg: "text-rose-700",
				iconBgHex: "#ffe4e6",
				iconFgHex: "#be123c",
			},
			{
				type: "loan_account",
				label: "Loan Account",
				description: "An account for tracking personal or student loans.",
				icon: Landmark,
				iconBg: "bg-orange-100",
				iconFg: "text-orange-700",
				iconBgHex: "#fed7aa",
				iconFgHex: "#c2410c",
			},
			{
				type: "mortgage",
				label: "Mortgage",
				description: "An account for tracking home loan balances.",
				icon: Home,
				iconBg: "bg-cyan-100",
				iconFg: "text-cyan-700",
				iconBgHex: "#cffafe",
				iconFgHex: "#0e7490",
			},
			{
				type: "line_of_credit",
				label: "Line of Credit",
				description: "A flexible borrowing account with a set credit limit.",
				icon: LineChart,
				iconBg: "bg-lime-100",
				iconFg: "text-lime-700",
				iconBgHex: "#ecfccb",
				iconFgHex: "#4d7c0f",
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
				icon: LineChart,
				iconBg: "bg-indigo-100",
				iconFg: "text-indigo-700",
				iconBgHex: "#e0e7ff",
				iconFgHex: "#4338ca",
			},
			{
				type: "retirement_account",
				label: "Retirement Account",
				description: "An account for retirement savings such as 401(k) or IRA.",
				icon: Shield,
				iconBg: "bg-teal-100",
				iconFg: "text-teal-700",
				iconBgHex: "#ccfbf1",
				iconFgHex: "#0f766e",
			},
			{
				type: "crypto_wallet",
				label: "Crypto Wallet",
				description: "A digital wallet for storing cryptocurrencies.",
				icon: Bitcoin,
				iconBg: "bg-yellow-100",
				iconFg: "text-yellow-700",
				iconBgHex: "#fef9c3",
				iconFgHex: "#a16207",
			},
			{
				type: "mutual_fund_account",
				label: "Mutual Fund Account",
				description: "An account for pooled investment funds.",
				icon: Layers,
				iconBg: "bg-fuchsia-100",
				iconFg: "text-fuchsia-700",
				iconBgHex: "#fae8ff",
				iconFgHex: "#a21caf",
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
				icon: Building2,
				iconBg: "bg-slate-100",
				iconFg: "text-slate-700",
				iconBgHex: "#f1f5f9",
				iconFgHex: "#334155",
			},
			{
				type: "vehicle",
				label: "Vehicle",
				description: "An account representing vehicles such as cars or boats.",
				icon: Car,
				iconBg: "bg-sky-100",
				iconFg: "text-sky-700",
				iconBgHex: "#e0f2fe",
				iconFgHex: "#0369a1",
			},
			{
				type: "other_assets",
				label: "Other Assets",
				description:
					"An account for other valuable assets like jewelry or collectibles.",
				icon: Package,
				iconBg: "bg-neutral-100",
				iconFg: "text-neutral-700",
				iconBgHex: "#f5f5f5",
				iconFgHex: "#404040",
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
				icon: Receipt,
				iconBg: "bg-zinc-100",
				iconFg: "text-zinc-700",
				iconBgHex: "#f4f4f5",
				iconFgHex: "#3f3f46",
			},
			{
				type: "taxes_owed",
				label: "Taxes Owed",
				description: "An account for tracking taxes owed.",
				icon: Percent,
				iconBg: "bg-red-100",
				iconFg: "text-red-700",
				iconBgHex: "#fee2e2",
				iconFgHex: "#b91c1c",
			},
			{
				type: "other_debts",
				label: "Other Debts",
				description: "An account for tracking other financial obligations.",
				icon: TrendingDown,
				iconBg: "bg-stone-100",
				iconFg: "text-stone-700",
				iconBgHex: "#f5f5f4",
				iconFgHex: "#44403c",
			},
		],
	},
];
