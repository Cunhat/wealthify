import Papa from "papaparse";
import { type Dispatch, type SetStateAction, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

type CsvUploadProps = {
	setCsvData: Dispatch<SetStateAction<Record<string, string>[]>>;
};

export default function CsvUpload({ setCsvData }: CsvUploadProps) {
	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			const csvFile = acceptedFiles[0];

			if (csvFile !== null) {
				Papa?.parse(acceptedFiles[0], {
					header: true, // Set to true to parse CSV into an array of objects
					skipEmptyLines: true, // Skip empty lines
					complete: (result: Papa.ParseResult<Record<string, string>>) => {
						setCsvData(result.data);
					},
					error: () => {
						toast.error("Error parsing CSV file");
					},
				});
			}
		},
		[setCsvData],
	);

	const { getRootProps, getInputProps } = useDropzone({ onDrop });

	return (
		<div
			{...getRootProps()}
			className="border-2 border-dashed border-input bg-accent/20 rounded-md p-4 h-36 flex items-center justify-center"
		>
			<input {...getInputProps()} />
			<p className="text-sm text-center text-muted-foreground">
				Drag 'n' drop some files here, or click to select files...
			</p>
		</div>
	);
}
