import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

const statusColors: Record<string, string> = {
	"Do I really want this?": "#6B7280", // Gray - uncertain
	"I really want this": "#3B82F6", // Blue - interested
	"I will buy this": "#10B981", // Green - decided
	Purchased: "#059669", // Darker green - completed
};

const statusLabels: Record<string, string> = {
	"Do I really want this?": "Do I really want this?",
	"I really want this": "I really want this",
	"I will buy this": "I will buy this",
	Purchased: "Purchased",
};

type WishlistStatusBadgeProps = {
	status: string;
	onStatusChange?: (status: string) => void;
	disabled?: boolean;
};

export default function WishlistStatusBadge({
	status,
	onStatusChange,
	disabled = false,
}: WishlistStatusBadgeProps) {
	const statusColor = statusColors[status] || "#6B7280";
	const statusLabel = statusLabels[status] || status;

	if (!onStatusChange || disabled) {
		return (
			<Badge
				variant="default"
				style={{ "--status-color": statusColor } as React.CSSProperties}
				className="bg-[color:var(--status-color)]/10 text-[color:var(--status-color)]"
			>
				{statusLabel}
			</Badge>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className={cn(
						"inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1 transition-[color,box-shadow] overflow-hidden cursor-pointer",
						"bg-[color:var(--status-color)]/10 text-[color:var(--status-color)] border-transparent",
						"hover:bg-[color:var(--status-color)]/20 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
					)}
					style={{ "--status-color": statusColor } as React.CSSProperties}
				>
					{statusLabel}
					<ChevronDown className="size-3 opacity-50" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start">
				{Object.keys(statusColors).map((statusOption) => (
					<DropdownMenuItem
						key={statusOption}
						onClick={() => onStatusChange(statusOption)}
						className={cn(status === statusOption && "bg-accent")}
					>
						<Badge
							variant="default"
							style={
								{
									"--status-color": statusColors[statusOption],
								} as React.CSSProperties
							}
							className="bg-[color:var(--status-color)]/10 text-[color:var(--status-color)] mr-2"
						>
							{statusLabels[statusOption]}
						</Badge>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
