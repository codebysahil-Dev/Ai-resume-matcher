import {
	type HTMLAttributes,
	type KeyboardEvent,
	type ReactNode,
	useId,
	useRef,
	useState,
} from "react";

export interface TabItem {
	id: string;
	label: ReactNode;
	content: ReactNode;
	disabled?: boolean;
}

export interface TabsProps
	 extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
	tabs: readonly TabItem[];
	label: string;
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
}

export default function Tabs({
	tabs,
	label,
	value,
	defaultValue,
	onValueChange,
	className,
	...tabListProps
}: TabsProps) {
	const tabsId = useId();
	const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
	const [uncontrolledValue, setUncontrolledValue] = useState(
		defaultValue ?? tabs[0]?.id ?? "",
	);
	const activeValue = value ?? uncontrolledValue;
	const requestedIndex = tabs.findIndex((tab) => tab.id === activeValue);
	const firstEnabledIndex = tabs.findIndex((tab) => !tab.disabled);
	const activeIndex =
		requestedIndex >= 0 && !tabs[requestedIndex].disabled
			? requestedIndex
			: firstEnabledIndex;

	if (tabs.length === 0) {
		return null;
	}

	const getTabIndex = (index: number, direction: 1 | -1): number => {
		let nextIndex = index;

		for (let step = 0; step < tabs.length; step += 1) {
			nextIndex = (nextIndex + direction + tabs.length) % tabs.length;
			if (!tabs[nextIndex].disabled) {
				return nextIndex;
			}
		}

		return index;
	};

	const focusTab = (index: number) => {
		tabRefs.current[index]?.focus();
	};

	const activateTab = (index: number) => {
		const nextTab = tabs[index];
		if (!nextTab || nextTab.disabled) {
			return;
		}

		if (value === undefined) {
			setUncontrolledValue(nextTab.id);
		}
		onValueChange?.(nextTab.id);
	};

	const handleKeyDown = (
		event: KeyboardEvent<HTMLButtonElement>,
		index: number,
	) => {
		let nextIndex: number | undefined;

		switch (event.key) {
			case "ArrowRight":
				nextIndex = getTabIndex(index, 1);
				break;
			case "ArrowLeft":
				nextIndex = getTabIndex(index, -1);
				break;
			case "Home":
				nextIndex = tabs.findIndex((tab) => !tab.disabled);
				break;
			case "End":
				nextIndex = tabs
					.map((tab) => !tab.disabled)
					.lastIndexOf(true);
				break;
			case "Enter":
			case " ":
				activateTab(index);
				return;
			default:
				return;
		}

		event.preventDefault();
		if (nextIndex !== undefined && nextIndex >= 0) {
			focusTab(nextIndex);
		}
	};

	return (
		<div className={className} {...tabListProps}>
			<div role="tablist" aria-label={label} aria-orientation="horizontal">
				{tabs.map((tab, index) => {
					const tabId = `${tabsId}-tab-${index}`;
					const panelId = `${tabsId}-panel-${index}`;
					const isSelected = index === activeIndex;

					return (
						<button
							key={tab.id}
							ref={(element) => {
								tabRefs.current[index] = element;
							}}
							type="button"
							role="tab"
							id={tabId}
							aria-selected={isSelected}
							aria-controls={panelId}
							tabIndex={isSelected ? 0 : -1}
							disabled={tab.disabled}
							onClick={() => activateTab(index)}
							onKeyDown={(event) => handleKeyDown(event, index)}
						>
							{tab.label}
						</button>
					);
				})}
			</div>

			{tabs.map((tab, index) => {
				const tabId = `${tabsId}-tab-${index}`;
				const panelId = `${tabsId}-panel-${index}`;

				return (
					<div
						key={tab.id}
						role="tabpanel"
						id={panelId}
						aria-labelledby={tabId}
						hidden={index !== activeIndex}
					>
						{tab.content}
					</div>
				);
			})}
		</div>
	);
}
