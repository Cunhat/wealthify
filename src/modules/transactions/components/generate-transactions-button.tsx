import { Button } from "@/components/ui/button";
import { useTRPC } from "@/integrations/trpc/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function GenerateTransactionsButton() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const generateTransactionsMutation = useMutation({
		...trpc.transactions.generateTransactions.mutationOptions(),
		onSuccess: (data) => {
			toast.success(data.message);
			// Invalidate transactions query to refresh the list
			queryClient.invalidateQueries({
				queryKey: ["transactions", "listTransactions"],
			});
		},
		onError: (error) => {
			toast.error(`Failed to generate transactions: ${error.message}`);
		},
	});

	const handleGenerate = () => {
		if (
			confirm(
				"This will generate 50 sample transactions from your account creation dates to today. Are you sure?",
			)
		) {
			generateTransactionsMutation.mutate();
		}
	};

	return (
		<Button
			onClick={handleGenerate}
			disabled={generateTransactionsMutation.isPending}
			variant="outline"
		>
			<Sparkles className="w-4 h-4 mr-2" />
			{generateTransactionsMutation.isPending
				? "Generating..."
				: "Generate Transactions"}
		</Button>
	);
}
