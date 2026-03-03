import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTRPC } from "@/integrations/trpc/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Ellipsis } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import RuleForm, { type RuleFormValues } from "./rule-form";

type RuleWithRelations = {
	id: string;
	name: string;
	descriptionContains: string;
	categoryId: string | null;
	budgetCategoryId: string | null;
	transactionAccountId: string | null;
	type: string | null;
};

interface RuleRowMenuProps {
	rule: RuleWithRelations;
}

export default function RuleRowMenu({ rule }: RuleRowMenuProps) {
	const [editOpen, setEditOpen] = useState(false);
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const updateMutation = useMutation({
		...trpc.rules.updateRule.mutationOptions(),
		onSuccess: () => {
			toast.success("Rule updated");
			queryClient.invalidateQueries({
				queryKey: trpc.rules.listRules.queryKey(),
			});
			setEditOpen(false);
		},
		onError: (error) => {
			toast.error(`Failed to update rule: ${error.message}`);
		},
	});

	const deleteMutation = useMutation({
		...trpc.rules.deleteRule.mutationOptions(),
		onSuccess: () => {
			toast.success("Rule deleted");
			queryClient.invalidateQueries({
				queryKey: trpc.rules.listRules.queryKey(),
			});
		},
		onError: (error) => {
			toast.error(`Failed to delete rule: ${error.message}`);
		},
	});

	function handleEdit(values: RuleFormValues) {
		updateMutation.mutate({
			id: rule.id,
			name: values.name,
			descriptionContains: values.descriptionContains,
			categoryId: values.categoryId,
			budgetCategoryId: values.budgetCategoryId,
			transactionAccountId: values.transactionAccountId,
			type: values.type,
		});
	}

	return (
		<>
			<Dialog open={editOpen} onOpenChange={setEditOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit Rule</DialogTitle>
					</DialogHeader>
					<RuleForm
						defaultValues={{
							name: rule.name,
							descriptionContains: rule.descriptionContains,
							categoryId: rule.categoryId,
							budgetCategoryId: rule.budgetCategoryId,
							transactionAccountId: rule.transactionAccountId,
							type: (rule.type as "expense" | "income") ?? null,
						}}
						onSubmit={handleEdit}
						isPending={updateMutation.isPending}
						setOpen={setEditOpen}
					/>
				</DialogContent>
			</Dialog>

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="icon">
						<Ellipsis className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem onClick={() => setEditOpen(true)}>
						Edit
					</DropdownMenuItem>
					<DropdownMenuItem
						className="text-destructive"
						onClick={() => deleteMutation.mutate({ id: rule.id })}
						disabled={deleteMutation.isPending}
					>
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);
}
