import {
	type HTMLAttributes,
	type ReactNode,
	useId,
	useState,
} from "react";

export interface DisclosureProps
	 extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "title"> {
	title: ReactNode;
	children: ReactNode;
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	panelId?: string;
}

export default function Disclosure({
	title,
	children,
	open,
	defaultOpen = false,
	onOpenChange,
	panelId,
	className,
	...rootProps
}: DisclosureProps) {
	const generatedPanelId = useId();
	const resolvedPanelId = panelId ?? `disclosure-panel-${generatedPanelId}`;
	const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
	const isOpen = open ?? uncontrolledOpen;

	const handleToggle = () => {
		const nextOpen = !isOpen;

		if (open === undefined) {
			setUncontrolledOpen(nextOpen);
		}
		onOpenChange?.(nextOpen);
	};

	return (
		<div className={className} {...rootProps}>
			<button
				type="button"
				aria-expanded={isOpen}
				aria-controls={resolvedPanelId}
				onClick={handleToggle}
			>
				{title}
			</button>

			<div id={resolvedPanelId} hidden={!isOpen}>
				{children}
			</div>
		</div>
	);
}
