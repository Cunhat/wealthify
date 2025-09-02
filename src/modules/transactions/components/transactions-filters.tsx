import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTRPC } from "@/integrations/trpc/react";
import { AccountTypeGroups } from "@/lib/configs/accounts";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Check, Filter, Trash, Trash2, X } from "lucide-react";
import AccountBadge from "./account-badge";

export function TransactionsFilters() {
	const trpc = useTRPC();
	const navigate = useNavigate();
	const search = useSearch({ from: "/_authed/transactions" });

	const categoriesQuery = useQuery({
		...trpc.categories.listCategories.queryOptions(),
	});

	// Add accounts query
	const accountsQuery = useQuery({
		...trpc.accounts.listTransactionAccounts.queryOptions(),
	});

	const selectedCategories = search.category || [];
	const selectedAccounts = search.account || []; // Add this line

	const handleCategoryToggle = (id: string) => {
		const isSelected = selectedCategories.includes(id);
		let newCategories: string[];

		if (isSelected) {
			newCategories = selectedCategories.filter((c) => c !== id);
		} else {
			newCategories = [...selectedCategories, id];
		}

		navigate({
			to: "/transactions",
			search: {
				category: newCategories.length > 0 ? newCategories : undefined,
				account: selectedAccounts.length > 0 ? selectedAccounts : undefined, // Preserve account filter
			},
		});
	};

	// Add account toggle handler
	const handleAccountToggle = (name: string) => {
		const isSelected = selectedAccounts.includes(name);
		let newAccounts: string[];

		if (isSelected) {
			newAccounts = selectedAccounts.filter((a) => a !== name);
		} else {
			newAccounts = [...selectedAccounts, name];
		}

		navigate({
			to: "/transactions",
			search: {
				category:
					selectedCategories.length > 0 ? selectedCategories : undefined, // Preserve category filter
				account: newAccounts.length > 0 ? newAccounts : undefined,
			},
		});
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline">
					<Filter className="size-3" />
					Filters
					{(selectedCategories.length > 0 || selectedAccounts.length > 0) && (
						<span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5">
							{selectedCategories.length + selectedAccounts.length}
						</span>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuLabel>Transactions Filters</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuSub>
						<DropdownMenuSubTrigger>Categories</DropdownMenuSubTrigger>
						<DropdownMenuPortal>
							<DropdownMenuSubContent className="max-h-[300px] overflow-y-auto">
								{categoriesQuery.data?.map((category) => {
									const isSelected = selectedCategories.includes(category.name);
									return (
										<DropdownMenuItem
											key={category.id}
											onClick={() => handleCategoryToggle(category.name)}
											className="flex items-center gap-2 cursor-pointer"
										>
											<span className="text-sm">{category.icon}</span>
											<span>{category.name}</span>
											<span className="flex items-center justify-center w-4 h-4 ml-auto">
												{isSelected && <Check className="w-3 h-3" />}
											</span>
										</DropdownMenuItem>
									);
								})}
								{categoriesQuery.data?.length === 0 && (
									<DropdownMenuItem disabled>
										No categories found
									</DropdownMenuItem>
								)}
							</DropdownMenuSubContent>
						</DropdownMenuPortal>
					</DropdownMenuSub>

					{/* Add Accounts submenu */}
					<DropdownMenuSub>
						<DropdownMenuSubTrigger>Accounts</DropdownMenuSubTrigger>
						<DropdownMenuPortal>
							<DropdownMenuSubContent className="max-h-[300px] overflow-y-auto">
								{accountsQuery.data?.map((account) => {
									const isSelected = selectedAccounts.includes(account.name);
									return (
										<DropdownMenuItem
											key={account.id}
											onClick={() => handleAccountToggle(account.name)}
											className="flex items-center gap-2 cursor-pointer"
										>
											<span>{account.name}</span>
											<span className="flex items-center justify-center w-4 h-4 ml-auto">
												{isSelected && <Check className="w-3 h-3" />}
											</span>
										</DropdownMenuItem>
									);
								})}
								{accountsQuery.data?.length === 0 && (
									<DropdownMenuItem disabled>
										No accounts found
									</DropdownMenuItem>
								)}
							</DropdownMenuSubContent>
						</DropdownMenuPortal>
					</DropdownMenuSub>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export function AppliedFilters() {
	const trpc = useTRPC();
	const navigate = useNavigate();
	const search = useSearch({ from: "/_authed/transactions" });

	// Function to remove a specific category from the URL
	const removeCategoryFilter = (categoryName: string) => {
		const selectedCategories = search.category || [];
		const selectedAccounts = search.account || [];
		const newCategories = selectedCategories.filter((c) => c !== categoryName);

		navigate({
			to: "/transactions",
			search: {
				category: newCategories.length > 0 ? newCategories : undefined,
				account: selectedAccounts.length > 0 ? selectedAccounts : undefined,
			},
		});
	};

	// Function to remove a specific account from the URL
	const removeAccountFilter = (accountName: string) => {
		const selectedCategories = search.category || [];
		const selectedAccounts = search.account || [];
		const newAccounts = selectedAccounts.filter((a) => a !== accountName);

		navigate({
			to: "/transactions",
			search: {
				category:
					selectedCategories.length > 0 ? selectedCategories : undefined,
				account: newAccounts.length > 0 ? newAccounts : undefined,
			},
		});
	};

	const categories = useQuery({
		...trpc.categories.listCategories.queryOptions(),
	});

	const accounts = useQuery({
		...trpc.accounts.listTransactionAccounts.queryOptions(),
	});

	if (Object.keys(search).length === 0) {
		return null;
	}

	if (categories.isLoading || accounts.isLoading) {
		return <div>Loading...</div>;
	}

	return (
		<div className="flex gap-2 items-center flex-wrap mb-4">
			{search.category &&
				search.category.length > 0 &&
				categories.data
					?.filter((category) => search.category?.includes(category.name))
					.map((category) => {
						return (
							<FilterItem
								key={category.id}
								icon={category.icon}
								name={category.name}
								color={category.color}
								onRemove={() => removeCategoryFilter(category.name)}
							/>
						);
					})}

			{search.account &&
				search.account.length > 0 &&
				accounts.data
					?.filter((account) => search.account?.includes(account.name))
					.map((account) => {
						const accountInfo = AccountTypeGroups.flatMap(
							(elem) => elem.children,
						).find((child) => child.type === account.type);

						return (
							<button
								key={account.id}
								type="button"
								style={
									{
										"--account-color": accountInfo?.iconFgHex,
										"--account-bg": accountInfo?.iconBgHex,
									} as React.CSSProperties
								}
								className="flex items-center gap-1 border py-0.5 px-2 rounded-sm cursor-pointer hover:bg-gray-50 border-[color:var(--account-color)]"
								onClick={() => removeAccountFilter(account.name)}
								aria-label={`Remove ${account.name} account filter`}
							>
								<AccountBadge account={account} />
								<X className="size-4 text-[color:var(--account-color)]" />
							</button>
						);
					})}

			<Button
				variant="outline"
				size="sm"
				onClick={() => navigate({ to: "/transactions" })}
			>
				<Trash2 className="size-4" />
				Clear All
			</Button>
		</div>
	);
}

type FilterItemProps = {
	icon: string;
	name: string;
	color: string;
	onRemove: () => void;
};

function FilterItem({ icon, name, color, onRemove }: FilterItemProps) {
	return (
		<button
			type="button"
			style={{ "--category-color": color } as React.CSSProperties}
			className="flex cursor-pointer items-center gap-1 bg-[color:var(--category-color)]/10 text-[color:var(--category-color)] text-sm rounded-sm px-2 py-1.5 hover:bg-[color:var(--category-color)]/20"
			onClick={onRemove}
			aria-label={`Remove ${name} filter`}
		>
			<span>{icon}</span>
			<span>{name}</span>
			<X className="w-4 h-4" />
		</button>
	);
}
