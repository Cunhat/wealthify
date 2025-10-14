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
import ColumnsMatch from "../components/columns-match";
import CsvUpload from "../components/csv-upload";

export default function UploadTransactionsFromFile() {
	const [open, setOpen] = useState<boolean>(false);
	const [step, setStep] = useState<number>(0);
	const [csvData, setCsvData] = useState<Record<string, string>[]>([]);

	return (
		<AlertDialog
			open={open}
			onOpenChange={() => {
				setOpen(!open);
				setStep(0);
				setCsvData([]);
			}}
		>
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
				{step === 0 && <CsvUpload setCsvData={setCsvData} setStep={setStep} />}
				{step === 1 && (
					<ColumnsMatch
						csvData={csvData}
						onSuccess={() => {
							setOpen(false);
							setStep(0);
							setCsvData([]);
						}}
					/>
				)}
			</AlertDialogContent>
		</AlertDialog>
	);
}
