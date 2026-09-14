import {
	type CSSProperties,
	type HTMLAttributes,
	type ReactNode,
	useEffect,
	useId,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { createPortal } from "react-dom";

export interface ModalProps
	extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
	isOpen: boolean;
	onClose: () => void;
	title: ReactNode;
	titleId?: string;
	children: ReactNode;
}

const focusableSelector = [
	"a[href]",
	"area[href]",
	"button:not([disabled])",
	"input:not([disabled])",
	"select:not([disabled])",
	"textarea:not([disabled])",
	"iframe",
	"object",
	"embed",
	"[contenteditable]",
	"[tabindex]:not([tabindex='-1'])",
].join(",");

const visuallyHiddenStyle: CSSProperties = {
	position: "fixed",
	inset: 0,
	zIndex: 1000,
};

function getFocusableElements(container: HTMLElement): HTMLElement[] {
	return Array.from(container.querySelectorAll(focusableSelector)).filter(
		(element): element is HTMLElement =>
			element instanceof HTMLElement &&
			element.getAttribute("aria-hidden") !== "true" &&
			!element.hasAttribute("disabled"),
	);
}

export default function Modal({
	isOpen,
	onClose,
	title,
	titleId,
	children,
	className,
	...dialogProps
}: ModalProps) {
	const dialogRef = useRef<HTMLDivElement>(null);
	const openerRef = useRef<HTMLElement | null>(null);
	const generatedTitleId = useId();
	const resolvedTitleId = titleId ?? `modal-title-${generatedTitleId}`;
	const [portalElement] = useState<HTMLElement | null>(() =>
		typeof document === "undefined" ? null : document.createElement("div"),
	);

	useEffect(() => {
		if (!portalElement) {
			return;
		}

		document.body.appendChild(portalElement);
		return () => portalElement.remove();
	}, [portalElement]);

	useLayoutEffect(() => {
		if (!isOpen || !dialogRef.current) {
			return;
		}

		// Capture the opener before moving focus into the dialog.
		openerRef.current =
			document.activeElement instanceof HTMLElement
				? document.activeElement
				: null;

		const focusableElements = getFocusableElements(dialogRef.current);
		(focusableElements[0] ?? dialogRef.current).focus();
	}, [isOpen]);

	useLayoutEffect(() => {
		if (isOpen) {
			return;
		}

		// Restore focus after the dialog closes, and tolerate a removed opener.
		if (openerRef.current?.isConnected) {
			openerRef.current.focus();
		}
		openerRef.current = null;
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen || !dialogRef.current) {
			return;
		}

		const dialog = dialogRef.current;
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				event.preventDefault();
				onClose();
				return;
			}

			if (event.key !== "Tab") {
				return;
			}

			const focusableElements = getFocusableElements(dialog);
			if (focusableElements.length === 0) {
				event.preventDefault();
				dialog.focus();
				return;
			}

			const firstElement = focusableElements[0];
			const lastElement = focusableElements[focusableElements.length - 1];

			if (event.shiftKey && document.activeElement === firstElement) {
				event.preventDefault();
				lastElement.focus();
			} else if (!event.shiftKey && document.activeElement === lastElement) {
				event.preventDefault();
				firstElement.focus();
			}
		};

		dialog.addEventListener("keydown", handleKeyDown);
		return () => dialog.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, onClose]);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		const previousOverflow = document.body.style.overflow;
		const inertElements = Array.from(document.body.children).filter(
			(element): element is HTMLElement => element !== portalElement,
		);
		const previousInertState = new Map<HTMLElement, boolean>();

		document.body.style.overflow = "hidden";
		inertElements.forEach((element) => {
			previousInertState.set(element, element.inert);
			element.inert = true;
		});

		return () => {
			document.body.style.overflow = previousOverflow;
			previousInertState.forEach((wasInert, element) => {
				element.inert = wasInert;
			});
		};
	}, [isOpen, portalElement]);

	if (!isOpen || !portalElement) {
		return null;
	}

	return createPortal(
		<div className="modal-backdrop" style={visuallyHiddenStyle}>
			<div
				{...dialogProps}
				ref={dialogRef}
				className={className}
				role="dialog"
				aria-modal="true"
				aria-labelledby={resolvedTitleId}
				tabIndex={-1}
			>
				<h2 id={resolvedTitleId}>{title}</h2>
				{children}
			</div>
		</div>,
		portalElement,
	);
}
