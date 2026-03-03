import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useTRPC } from "@/integrations/trpc/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ScanSearch } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AnalyseSuggestionsDialog() {
	const [open, setOpen] = useState(false);
	const [selected, setSelected] = useState<Set<number>>(new Set());
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const suggestionsQuery = useQuery({
		...trpc.rules.analyseTransactions.queryOptions(),
		enabled: open,
	});

	const suggestions = suggestionsQuery.data ?? [];

	const bulkCreateMutation = useMutation({
		...trpc.rules.bulkCreateRules.mutationOptions(),
		onSuccess: (data) => {
			toast.success(
				`${data.created} rule${data.created !== 1 ? "s" : ""} saved`,
			);
			queryClient.invalidateQueries({
				queryKey: trpc.rules.listRules.queryKey(),
			});
			setOpen(false);
			setSelected(new Set());
		},
		onError: (error) => {
			toast.error(`Failed to save rules: ${error.message}`);
		},
	});

	function toggleAll(checked: boolean) {
		if (checked) {
			setSelected(new Set(suggestions.map((_, i) => i)));
		} else {
			setSelected(new Set());
		}
	}

	function toggle(index: number, checked: boolean) {
		setSelected((prev) => {
			const next = new Set(prev);
			if (checked) {
				next.add(index);
			} else {
				next.delete(index);
			}
			return next;
		});
	}

	function handleSave() {
		const toSave = suggestions
			.filter((_, i) => selected.has(i))
			.map((s) => ({
				name: s.suggestedName,
				descriptionContains: s.descriptionContains,
				categoryId: s.categoryId,
				budgetCategoryId: s.budgetCategoryId,
				transactionAccountId: s.transactionAccountId,
				type: s.type,
			}));
		bulkCreateMutation.mutate({ rules: toSave });
	}

	const allSelected =
		suggestions.length > 0 && selected.size === suggestions.length;
	const someSelected = selected.size > 0 && !allSelected;

	return (
		<Dialog
			open={open}
			onOpenChange={(v) => {
				setOpen(v);
				if (!v) setSelected(new Set());
			}}
		>
			<DialogTrigger asChild>
				<Button variant="outline">
					<ScanSearch className="h-4 w-4 mr-2" />
					Analyse
				</Button>
			</DialogTrigger>
			<DialogContent className="min-w-[80%]">
				<DialogHeader>
					<DialogTitle>Transaction Analysis</DialogTitle>
				</DialogHeader>

				{suggestionsQuery.isLoading && (
					<p className="text-sm text-muted-foreground py-4 text-center">
						Analysing transactions...
					</p>
				)}

				{!suggestionsQuery.isLoading && suggestions.length === 0 && (
					<p className="text-sm text-muted-foreground py-4 text-center">
						No patterns found. You need at least 2 transactions with the same
						description, category and budget category.
					</p>
				)}

				{suggestions.length > 0 && (
					<div className="rounded-md border overflow-auto max-h-[70vh]">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-10">
										<Checkbox
											checked={
												allSelected
													? true
													: someSelected
														? "indeterminate"
														: false
											}
											onCheckedChange={(v) => toggleAll(!!v)}
										/>
									</TableHead>
									<TableHead>Pattern</TableHead>
									<TableHead>Category</TableHead>
									<TableHead>Budget Category</TableHead>
									<TableHead>Account</TableHead>
									<TableHead>Type</TableHead>
									<TableHead className="text-right">Seen</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{suggestions.map((s, i) => (
									<TableRow
										key={`${s.descriptionContains}-${s.categoryId}-${s.budgetCategoryId}`}
										className="cursor-pointer"
										onClick={() => toggle(i, !selected.has(i))}
									>
										<TableCell onClick={(e) => e.stopPropagation()}>
											<Checkbox
												checked={selected.has(i)}
												onCheckedChange={(v) => toggle(i, !!v)}
											/>
										</TableCell>
										<TableCell>
											<code className="bg-muted px-1.5 py-0.5 rounded text-sm">
												{s.descriptionContains}
											</code>
										</TableCell>
										<TableCell>{s.categoryName ?? "—"}</TableCell>
										<TableCell>{s.budgetCategoryName ?? "—"}</TableCell>
										<TableCell>{s.transactionAccountName ?? "—"}</TableCell>
										<TableCell className="capitalize">{s.type}</TableCell>
										<TableCell className="text-right text-muted-foreground text-sm">
											{s.count}×
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				)}

				<DialogFooter>
					<Button variant="outline" onClick={() => setOpen(false)}>
						Cancel
					</Button>
					<Button
						onClick={handleSave}
						disabled={selected.size === 0 || bulkCreateMutation.isPending}
					>
						{bulkCreateMutation.isPending
							? "Saving..."
							: `Save ${selected.size > 0 ? selected.size : ""} Selected`}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
