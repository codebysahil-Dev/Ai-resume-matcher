import { useState } from "react";
import Disclosure from "./Disclosure";
import Modal from "./Modal";
import Tabs, { type TabItem } from "./Tabs";

const demoTabs: readonly TabItem[] = [
	{
		id: "overview",
		label: "Overview",
		content: (
			<div>
				<h3>Overview</h3>
				<p>
					This panel demonstrates the default tab selection and visible panel
					content.
				</p>
			</div>
		),
	},
	{
		id: "details",
		label: "Details",
		content: (
			<div>
				<h3>Details</h3>
				<p>
					Use the arrow keys to move between tabs, then press Enter or Space
					to activate one.
				</p>
			</div>
		),
	},
	{
		id: "activity",
		label: "Activity",
		content: (
			<div>
				<h3>Activity</h3>
				<p>
					This is a third, independent panel for testing selection changes.
				</p>
			</div>
		),
	},
];

export default function Demo() {
	const [isModalOpen, setIsModalOpen] = useState(false);

	return (
		<main
			style={{
				maxWidth: 760,
				margin: "0 auto",
				padding: "2rem 1rem",
				fontFamily: "system-ui, sans-serif",
				lineHeight: 1.5,
			}}
		>
			<header>
				<h1>Playground Components</h1>
				<p>Manual test page for the Modal, Tabs, and Disclosure components.</p>
			</header>

			<section aria-labelledby="modal-demo-heading">
				<h2 id="modal-demo-heading">Modal</h2>
				<button type="button" onClick={() => setIsModalOpen(true)}>
					Open Modal
				</button>

				<Modal
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
					title="Test modal"
					style={{
						margin: "10vh auto",
						maxWidth: 480,
						padding: "1.5rem",
						background: "white",
						border: "1px solid #ccc",
						boxShadow: "0 1rem 3rem rgb(0 0 0 / 25%)",
					}}
				>
					<p>Try Tab, Shift+Tab, and Escape while this dialog is open.</p>
					<label>
						Name
						<input type="text" placeholder="Focusable input" />
					</label>
					<p>
						<a href="https://example.com">Focusable link</a>
					</p>
					<button type="button" onClick={() => setIsModalOpen(false)}>
						Close Modal
					</button>
				</Modal>
			</section>

			<section aria-labelledby="tabs-demo-heading" style={{ marginTop: "2rem" }}>
				<h2 id="tabs-demo-heading">Tabs</h2>
				<Tabs tabs={demoTabs} label="Demo sections" />
			</section>

			<section
				aria-labelledby="disclosure-demo-heading"
				style={{ marginTop: "2rem" }}
			>
				<h2 id="disclosure-demo-heading">Disclosure</h2>
				<Disclosure title="Show testing details">
					<p>
						This content toggles when the button is clicked or activated with
						Enter or Space.
					</p>
				</Disclosure>
			</section>
		</main>
	);
}
