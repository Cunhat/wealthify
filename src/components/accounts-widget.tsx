import { PlusIcon } from "lucide-react";
import React from "react";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export default function AccountsWidget() {
	return (
		<div className="flex flex-col gap-4">
			<Tabs defaultValue="assets">
				<TabsList className="w-full">
					<TabsTrigger value="assets">Assets</TabsTrigger>
					<TabsTrigger value="debts">Debts</TabsTrigger>
				</TabsList>
				<TabsContent value="assets">
					<div className="flex flex-col gap-4">
						<Button variant="ghost">
							<PlusIcon />
							New Asset
						</Button>
					</div>
				</TabsContent>
				<TabsContent value="debts">Debts</TabsContent>
			</Tabs>
		</div>
	);
}
