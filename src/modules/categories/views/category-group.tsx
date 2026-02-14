import NotFound from "@/components/not-found";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTRPC } from "@/integrations/trpc/react";
import { formatCurrency } from "@/lib/mixins";
import { cn } from "@/lib/utils";
import AccountBadge from "@/modules/transactions/components/account-badge";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import dayjs from "dayjs";
import { Edit, EllipsisVertical, Loader, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import CategoryForm, {
	CategorySchema,
	type CategoryForm as CategoryFormType,
} from "../components/category-form";

function groupByDate<T extends { createdAt: Date | null }>(
	items: T[],
): Record<string, T[]> {
	const groups: Record<string, T[]> = {};
	for (const item of items) {
		if (!item.createdAt) continue;
		const date = dayjs(item.createdAt);
		const label = date.isSame(dayjs(), "day")
			? "Today"
			: date.isSame(dayjs().subtract(1, "day"), "day")
				? "Yesterday"
				: date.format("ddd, MMMM D");
		if (!groups[label]) groups[label] = [];
		groups[label].push(item);
	}
	return groups;
}

function CategoryGroupActions({ groupId }: { groupId: string }) {
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const groupQuery = useQuery({
		...trpc.categoryGroups.getCategoryGroup.queryOptions({ id: groupId }),
	});

	const form = useForm<CategoryFormType>({
		resolver: zodResolver(CategorySchema),
		values: {
			name: groupQuery.data?.name ?? "",
			icon: groupQuery.data?.icon ?? "📁",
			color: groupQuery.data?.color ?? "#000000",
		},
	});

	const updateMutation = useMutation({
		...trpc.categoryGroups.updateCategoryGroup.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: trpc.categoryGroups.listCategoryGroups.queryKey(),
			});
			queryClient.invalidateQueries({
				queryKey: trpc.categoryGroups.getCategoryGroup.queryKey({
					id: groupId,
				}),
			});
			toast.success("Group updated successfully");
			setEditDialogOpen(false);
		},
		onError: () => toast.error("Failed to update group"),
	});

	const deleteMutation = useMutation({
		...trpc.categoryGroups.deleteCategoryGroup.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: trpc.categoryGroups.listCategoryGroups.queryKey(),
			});
			queryClient.invalidateQueries({
				queryKey: trpc.categories.listCategories.queryKey(),
			});
			toast.success("Group deleted successfully");
			setDeleteDialogOpen(false);
			navigate({ to: "/categories" });
		},
		onError: () => toast.error("Failed to delete group"),
	});

	function onEditSubmit(values: CategoryFormType) {
		updateMutation.mutate({ id: groupId, ...values });
	}

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline" size="icon" className="ml-auto">
						<EllipsisVertical className="h-4 w-4" />
						<span className="sr-only">Open menu</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuLabel>Actions</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
						<Edit className="h-4 w-4" />
						Edit Group
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => setDeleteDialogOpen(true)}
						className="text-destructive focus:text-destructive"
					>
						<Trash2 className="h-4 w-4" color="red" />
						Delete Group
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Edit Dialog */}
			<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Edit Group</DialogTitle>
						<DialogDescription>
							Make changes to your group here. Click save when you're done.
						</DialogDescription>
					</DialogHeader>
					<CategoryForm
						form={form}
						onSubmit={onEditSubmit}
						disabled={updateMutation.isPending}
						formId="edit-group-form"
					/>
					<div className="flex justify-end gap-2 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => setEditDialogOpen(false)}
							disabled={updateMutation.isPending}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							form="edit-group-form"
							disabled={updateMutation.isPending}
						>
							{updateMutation.isPending && (
								<Loader className="mr-2 h-4 w-4 animate-spin" />
							)}
							Save Changes
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* Delete Dialog */}
			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Delete Group</DialogTitle>
						<DialogDescription>
							Are you sure? This group will be deleted but its categories will
							remain ungrouped.
						</DialogDescription>
					</DialogHeader>
					<div className="flex justify-end gap-2 pt-4">
						<Button
							variant="outline"
							onClick={() => setDeleteDialogOpen(false)}
							disabled={deleteMutation.isPending}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={() => deleteMutation.mutate({ id: groupId })}
							disabled={deleteMutation.isPending}
						>
							{deleteMutation.isPending && (
								<Loader className="mr-2 h-4 w-4 animate-spin" />
							)}
							Delete Group
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}

export default function CategoryGroup() {
	const trpc = useTRPC();
	const { groupId } = useParams({
		from: "/_authed/categories/group/$groupId",
	});

	const groupQuery = useQuery({
		...trpc.categoryGroups.getCategoryGroup.queryOptions({ id: groupId }),
	});

	if (groupQuery.isLoading) {
		return <div>Loading...</div>;
	}

	if (groupQuery.isError) {
		return <div>Error: {groupQuery.error.message}</div>;
	}

	const allTransactions = (groupQuery.data?.categories ?? [])
		.flatMap((cat) =>
			(cat.transactions ?? []).map((t) => ({
				...t,
				_categoryName: cat.name,
				_categoryIcon: cat.icon,
				_categoryColor: cat.color,
			})),
		)
		.sort((a, b) => {
			const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
			const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
			return db - da;
		});

	const grouped = groupByDate(allTransactions);

	return (
		<div className="h-full flex flex-col gap-4 overflow-hidden">
			<div className="flex items-center gap-2">
				<div
					className="size-2 rounded-full"
					style={{ backgroundColor: groupQuery.data?.color }}
				/>
				<span>{groupQuery.data?.icon}</span>
				<h1 className="text-lg font-semibold">{groupQuery.data?.name}</h1>
				<CategoryGroupActions groupId={groupId} />
			</div>

			{allTransactions.length > 0 ? (
				<div className="flex flex-col gap-4 overflow-y-auto">
					{Object.entries(grouped).map(([dateGroup, transactions]) => (
						<div key={dateGroup} className="flex flex-col gap-2">
							<div className="text-lg text-foreground font-medium">
								{dateGroup}
							</div>
							<div className="flex flex-col gap-1">
								{transactions.map((transaction) => (
									<div
										key={transaction.id}
										className="grid grid-cols-[4fr_1.5fr_2fr_100px] items-center px-0 py-2 rounded-sm"
									>
										<div className="text-sm text-foreground">
											{transaction.description}
										</div>
										<div className="flex items-center gap-1 text-xs text-muted-foreground">
											<span>{transaction._categoryIcon}</span>
											<span>{transaction._categoryName}</span>
										</div>
										<AccountBadge account={transaction.transactionAccount} />
										<div
											className={cn(
												"text-sm text-right",
												transaction.type !== "expense" && "text-green-500",
											)}
										>
											{formatCurrency(Number(transaction.amount))}
										</div>
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			) : (
				<NotFound message="No transactions found for this group" />
			)}
		</div>
	);
}
