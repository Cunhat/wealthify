import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { FileUp } from "lucide-react";
import { useState } from "react";
import CsvUpload from "../components/csv-upload";

export default function UploadTransactionsFromFile() {
	const [csvData, setCsvData] = useState<Record<string, string>[]>([]);

	console.log(csvData);

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant="outline" size="icon">
					<FileUp className="w-4 h-4" />
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Upload Transactions From File</AlertDialogTitle>
					<AlertDialogDescription>
						Upload a CSV file to import your transactions.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<CsvUpload setCsvData={setCsvData} />
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction>Continue</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
