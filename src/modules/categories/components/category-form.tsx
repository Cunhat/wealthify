import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { UseFormReturn } from "react-hook-form";
import { z } from "zod";

export const CategorySchema = z.object({
	name: z
		.string()
		.min(1, "Category name is required")
		.max(50, "Category name must be less than 50 characters"),
	icon: z.string().emoji("Should be an emoji").min(1, "Icon is required"),
	color: z
		.string()
		.regex(
			/^#[0-9A-Fa-f]{6}$/,
			"Color must be a valid hex color (e.g., #000000)",
		),
});

export type CategoryForm = z.infer<typeof CategorySchema>;

type CategoryFormProps = {
	form: UseFormReturn<CategoryForm>;
	onSubmit: (values: CategoryForm) => void;
	disabled: boolean;
	formId: string;
};

export default function CategoryForm({
	form,
	onSubmit,
	disabled,
	formId,
}: CategoryFormProps) {
	return (
		<Form {...form}>
			<form
				id={formId}
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-4"
			>
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Category Name</FormLabel>
							<FormControl>
								<Input
									placeholder="e.g., Food & Dining"
									{...field}
									disabled={disabled}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="icon"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Icon (Emoji)</FormLabel>
							<FormControl>
								<Input
									placeholder="e.g., 🍕"
									{...field}
									disabled={disabled}
									maxLength={10}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="color"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Color</FormLabel>
							<FormControl>
								<div className="flex gap-2 items-center">
									<Input
										type="color"
										{...field}
										disabled={disabled}
										className="w-full h-10 p-1 border rounded cursor-pointer"
									/>
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</form>
		</Form>
	);
}
