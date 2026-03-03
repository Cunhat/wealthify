import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useTRPC } from "@/integrations/trpc/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import RuleForm, { type RuleFormValues } from "./rule-form";

export default function CreateRuleDialog() {
	const [open, setOpen] = useState(false);
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const createMutation = useMutation({
		...trpc.rules.createRule.mutationOptions(),
		onSuccess: () => {
			toast.success("Rule created");
			queryClient.invalidateQueries({
				queryKey: trpc.rules.listRules.queryKey(),
			});
			setOpen(false);
		},
		onError: (error) => {
			toast.error(`Failed to create rule: ${error.message}`);
		},
	});

	function handleSubmit(values: RuleFormValues) {
		createMutation.mutate({
			name: values.name,
			descriptionContains: values.descriptionContains,
			categoryId: values.categoryId,
			budgetCategoryId: values.budgetCategoryId,
			transactionAccountId: values.transactionAccountId,
			type: values.type,
		});
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size="icon" title="Create rule">
					<Plus className="h-4 w-4" />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create Rule</DialogTitle>
				</DialogHeader>
				<RuleForm
					onSubmit={handleSubmit}
					isPending={createMutation.isPending}
					setOpen={setOpen}
				/>
			</DialogContent>
		</Dialog>
	);
}
