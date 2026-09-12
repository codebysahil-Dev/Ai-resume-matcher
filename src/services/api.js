import { isValidAnalysis } from "../utils/validation";

export async function analyzeResume(resume, jobDescription) {
	if (!resume?.trim()) {
		throw new Error("Please enter your resume before analyzing.");
	}

	if (!jobDescription?.trim()) {
		throw new Error("Please enter a job description.");
	}

	let response;

	try {
		response = await fetch("/api/analyze", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ resume, jobDescription }),
		});
	} catch {
		throw new Error("Unable to reach the analysis service. Please try again.");
	}

	let payload;
	try {
		payload = await response.json();
	} catch {
		throw new Error("The analysis service returned an invalid response.");
	}

	if (!response.ok) {
		throw new Error(payload.error || "The AI analysis failed. Please try again.");
	}

	if (!isValidAnalysis(payload)) {
		throw new Error("The AI returned an invalid analysis. Please try again.");
	}

	return payload;
}
