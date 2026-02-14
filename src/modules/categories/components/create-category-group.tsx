import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useTRPC } from "@/integrations/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconPlus } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import CategoryForm, {
	CategorySchema,
	type CategoryForm as CategoryFormType,
} from "./category-form";

export default function CreateCategoryGroup() {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
					<IconPlus />
					New Group
				</DropdownMenuItem>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Create Category Group</DialogTitle>
					<DialogDescription>
						Group related categories together for better organization.
					</DialogDescription>
				</DialogHeader>
				<CreateCategoryGroupForm setOpen={setOpen} />
			</DialogContent>
		</Dialog>
	);
}

function CreateCategoryGroupForm({
	setOpen,
}: { setOpen: (open: boolean) => void }) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const form = useForm<CategoryFormType>({
		resolver: zodResolver(CategorySchema),
		defaultValues: {
			name: "",
			icon: "📁",
			color: "#000000",
		},
	});

	const createGroupMutation = useMutation({
		...trpc.categoryGroups.createCategoryGroup.mutationOptions(),
		onSuccess: () => {
			form.reset();
			queryClient.invalidateQueries({
				queryKey: trpc.categoryGroups.listCategoryGroups.queryKey(),
			});
			toast.success("Category group created successfully");
			setOpen(false);
		},
		onError: (error) => {
			toast.error("Failed to create category group");
			console.error(error);
		},
	});

	function onSubmit(values: CategoryFormType) {
		createGroupMutation.mutate(values);
	}

	return (
		<>
			<CategoryForm
				form={form}
				onSubmit={onSubmit}
				disabled={createGroupMutation.isPending}
				formId="create-category-group-form"
			/>
			<div className="flex justify-end gap-2 pt-4">
				<Button
					type="button"
					variant="outline"
					onClick={() => setOpen(false)}
					disabled={createGroupMutation.isPending}
				>
					Cancel
				</Button>
				<Button
					type="submit"
					form="create-category-group-form"
					disabled={createGroupMutation.isPending}
				>
					{createGroupMutation.isPending && (
						<Loader className="mr-2 h-4 w-4 animate-spin" />
					)}
					Create Group
				</Button>
			</div>
		</>
	);
}
