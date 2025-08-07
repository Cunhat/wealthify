import {
	IconChartBar,
	IconDashboard,
	IconFolder,
	IconInnerShadowTop,
	IconListDetails,
	IconUsers,
} from "@tabler/icons-react";
import * as React from "react";

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

const data = {
	user: {
		name: "shadcn",
		email: "m@example.com",
		avatar: "/avatars/shadcn.jpg",
	},
	navMain: [
		{
			title: "Dashboard",
			url: "#",
			icon: IconDashboard,
		},
		{
			title: "Transactions",
			url: "#",
			icon: IconListDetails,
		},
		{
			title: "Accounts",
			url: "#",
			icon: IconChartBar,
		},
		// {
		// 	title: "Projects",
		// 	url: "#",
		// 	icon: IconFolder,
		// },
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
								<IconInnerShadowTop className="!size-5" />
								<span className="text-base font-semibold">Acme Inc.</span>
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
