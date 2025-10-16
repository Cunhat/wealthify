import { SiteHeader } from "./site-header";

type PageContainerProps = {
	title: string;
	actionsComponent?: React.ReactNode;
	children: React.ReactNode;
	middleSlot?: React.ReactNode;
};

export default function PageContainer({
	title,
	actionsComponent,
	middleSlot,
	children,
}: PageContainerProps) {
	return (
		<>
			<SiteHeader
				title={title}
				actionsComponent={actionsComponent}
				middleSlot={middleSlot}
			/>
			<div className="flex flex-1 flex-col p-4 h-screen overflow-hidden">
				{children}
			</div>
		</>
	);
}
