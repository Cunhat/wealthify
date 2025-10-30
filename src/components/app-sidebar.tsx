import { IconTags } from "@tabler/icons-react";
import type * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { User } from "better-auth";
import {
	BadgeEuro,
	CalendarSync,
	ChartNoAxesCombined,
	LayoutDashboard,
	NotebookPen,
	Wallet,
	Heart,
} from "lucide-react";

const data = {
	user: {
		name: "shadcn",
		email: "m@example.com",
		avatar: "/avatars/shadcn.jpg",
	},
	navMain: [
		{
			title: "Dashboard",
			url: "/",
			icon: LayoutDashboard,
		},
		{
			title: "Analyses",
			url: "/analyses",
			icon: ChartNoAxesCombined,
		},
		{
			title: "Transactions",
			url: "/transactions",
			icon: BadgeEuro,
		},
		{
			title: "Accounts",
			url: "/accounts",
			icon: Wallet,
		},
		{
			title: "Categories",
			url: "/categories",
			icon: IconTags,
		},
		{
			title: "Recurring",
			url: "/recurring",
			icon: CalendarSync,
		},
		{
			title: "Budget",
			url: "/budget",
			icon: NotebookPen,
		},
		{
			title: "Wishlist",
			url: "/wishlist",
			icon: Heart,
		},
		// {
		// 	title: "Team",
		// 	url: "#",
		// 	icon: IconUsers,
		// },
	],
	// navSecondary: [
	// 	{
	// 		title: "Settings",
	// 		url: "#",
	// 		icon: IconSettings,
	// 	},
	// 	{
	// 		title: "Get Help",
	// 		url: "#",
	// 		icon: IconHelp,
	// 	},
	// 	{
	// 		title: "Search",
	// 		url: "#",
	// 		icon: IconSearch,
	// 	},
	// ],
};

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
	user: User;
};

export function AppSidebar({ user, ...props }: AppSidebarProps) {
	return (
		<Sidebar collapsible="offcanvas" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className="data-[slot=sidebar-menu-button]:!p-1.5"
						>
							<a href="/">
								<img src="/icon.png" alt="Wealthify" className="size-6" />
								<span className="text-base font-semibold">Wealthify</span>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
				{/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={user} />
			</SidebarFooter>
		</Sidebar>
	);
}
