import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useState } from "react";
import NewTransactionForm from "../components/new-transaction-form";

export default function CreateTransaction() {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="icon">
					<Plus className="w-4 h-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Create Transaction</DialogTitle>
					<DialogDescription>
						Create a new transaction to track your finances.
					</DialogDescription>
				</DialogHeader>
				<NewTransactionForm setOpen={setOpen} />
			</DialogContent>
		</Dialog>
	);
}
