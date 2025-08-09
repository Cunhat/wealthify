import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info, PlusIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "./ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "./ui/form";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";

export default function CreateAssetDialog() {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="ghost">
					<PlusIcon />
					New Asset
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create Asset</DialogTitle>
					<DialogDescription>
						Create a new account for tracking your assets.
					</DialogDescription>
				</DialogHeader>
				<CreateAssetForm />
			</DialogContent>
		</Dialog>
	);
}

const formSchema = z.object({
	main_type: z.union([z.literal("transactional"), z.literal("balance")]),
	type: z.string(),
	balance: z.number(),
	initial_balance: z.number(),
});

function CreateAssetForm() {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			main_type: "transactional",
			type: "",
			balance: 0,
			initial_balance: 0,
		},
	});

	function onSubmit(values: z.infer<typeof formSchema>) {
		// Do something with the form values.
		// ✅ This will be type-safe and validated.
		console.log(values);
	}

	return (
		<div>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
					<FormField
						control={form.control}
						name="main_type"
						render={({ field }) => (
							<FormItem className="space-y-3">
								<FormControl>
									<RadioGroup
										onValueChange={field.onChange}
										defaultValue={field.value}
										className="flex gap-4"
									>
										<FormItem className="flex flex-1 items-center gap-3">
											<FormControl>
												<RadioGroupItem value="transactional" />
											</FormControl>
											<FormLabel className="font-normal">
												Transactional
											</FormLabel>
										</FormItem>
										<FormItem className="flex flex-1 items-center gap-3">
											<FormControl>
												<RadioGroupItem value="balance" />
											</FormControl>
											<FormLabel className="font-normal">Balance</FormLabel>
										</FormItem>
									</RadioGroup>
								</FormControl>

								<FormMessage />
								{field.value === "balance" ? (
									<FormDescription>
										<strong>Balance</strong> accounts are ideal for accounts
										that you only want to control the balance variance.
									</FormDescription>
								) : (
									<FormDescription>
										<strong>Transactional</strong> accounts are ideal for
										accounts that you want to control every transaction.
									</FormDescription>
								)}
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="type"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Username</FormLabel>
								<FormControl>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select a verified email to display" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="m@example.com">
												m@example.com
											</SelectItem>
											<SelectItem value="m@google.com">m@google.com</SelectItem>
											<SelectItem value="m@support.com">
												m@support.com
											</SelectItem>
										</SelectContent>
									</Select>
								</FormControl>
								<FormDescription>
									Select the type of account you want to create.
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
				</form>
			</Form>
		</div>
	);
}
