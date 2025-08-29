import { cn } from "@/lib/utils";
import { Inbox } from "lucide-react";

interface NotFoundProps {
	message: string;
	title?: string;
	className?: string;
}

export default function NotFound({
	message,
	title,
	className = "",
}: NotFoundProps) {
	return (
		<div
			className={cn(
				"flex flex-col gap-2 items-center justify-center h-full",
				className,
			)}
		>
			<Inbox className="w-10 h-10 text-muted-foreground/50" />
			{title && <h1 className="text-xl font-bold">{title}</h1>}
			<div className="flex flex-col gap-2 text-base text-muted-foreground/50">
				{message}
			</div>
		</div>
	);
}
