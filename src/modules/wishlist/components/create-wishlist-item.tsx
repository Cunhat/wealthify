import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import WishlistItemForm from "./create-wishlist-item-dialog";

export default function CreateWishlistItem() {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<IconPlus className="mr-2 h-4 w-4" />
					New Item
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Create Wishlist Item</DialogTitle>
					<DialogDescription>
						Add a new item to your wishlist.
					</DialogDescription>
				</DialogHeader>
				<WishlistItemForm setOpen={setOpen} />
			</DialogContent>
		</Dialog>
	);
}

