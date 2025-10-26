import {
	AlertDialogCancel,
	AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { File } from "lucide-react";
import Papa from "papaparse";
import {
	type Dispatch,
	type SetStateAction,
	useCallback,
	useState,
} from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

type CsvUploadProps = {
	setCsvData: Dispatch<SetStateAction<Record<string, string>[]>>;
	setStep: Dispatch<SetStateAction<number>>;
};

export default function CsvUpload({ setCsvData, setStep }: CsvUploadProps) {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	const onDrop = useCallback((acceptedFiles: File[]) => {
		const csvFile = acceptedFiles[0];
		setSelectedFile(csvFile);
	}, []);

	function handleFileProcess() {
		if (selectedFile !== null) {
			Papa?.parse(selectedFile, {
				header: true, // Set to true to parse CSV into an array of objects
				skipEmptyLines: true, // Skip empty lines
				complete: (result: Papa.ParseResult<Record<string, string>>) => {
					setCsvData(result.data);
					console.log(result.data);
					setStep(1);
				},
				error: () => {
					toast.error("Error parsing CSV file");
				},
			});
		}
	}

	const { getRootProps, getInputProps } = useDropzone({
		onDrop,
		accept: {
			"text/csv": [".csv"],
		},
	});

	return (
		<>
			<div
				{...getRootProps()}
				className="border-2 border-dashed border-input bg-accent/20 rounded-md p-4 h-36 flex items-center justify-center"
			>
				<input {...getInputProps()} />
				{selectedFile ? (
					<div className="flex gap-1 items-center justify-center">
						<File size={16} className="text-muted-foreground" />
						<p className="text-sm text-center text-muted-foreground">
							{selectedFile.name}
						</p>
					</div>
				) : (
					<p className="text-sm text-center text-muted-foreground">
						Drag 'n' drop some files here, or click to select files...
					</p>
				)}
			</div>
			<AlertDialogFooter>
				<AlertDialogCancel>Cancel</AlertDialogCancel>
				<Button disabled={!selectedFile} onClick={handleFileProcess}>
					Continue
				</Button>
			</AlertDialogFooter>
		</>
	);
}
