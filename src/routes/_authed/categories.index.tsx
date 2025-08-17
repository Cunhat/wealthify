import { createFileRoute } from "@tanstack/react-router";
import { Inbox } from "lucide-react";

export const Route = createFileRoute("/_authed/categories/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex h-full flex-col gap-2 items-center justify-center">
			<Inbox className="w-10 h-10 text-muted-foreground/50" />
			<h1 className="text-xl font-bold">Select a category</h1>
			<p className="text-sm text-muted-foreground">
				Select a category to view its transactions
			</p>
		</div>
	);
}
