import { Badge } from "./ui/badge";

type EmptyBadgeProps = {
	message: string;
};

export default function EmptyBadge({ message }: EmptyBadgeProps) {
	return (
		<Badge variant="default" className="bg-neutral-50 text-neutral-300">
			{message}
		</Badge>
	);
}
