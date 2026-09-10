function isValidAnalysis(result) {
	return (
		result &&
		Number.isInteger(result.matchScore) &&
		result.matchScore >= 0 &&
		result.matchScore <= 100 &&
		Array.isArray(result.matchedSkills) &&
		result.matchedSkills.every((skill) => typeof skill === "string") &&
		Array.isArray(result.missingSkills) &&
		result.missingSkills.every((skill) => typeof skill === "string") &&
		Array.isArray(result.suggestions) &&
		result.suggestions.length >= 3 &&
		result.suggestions.length <= 5 &&
		result.suggestions.every((suggestion) => typeof suggestion === "string") &&
		typeof result.summary === "string" &&
		result.summary.trim().length > 0
	);
}

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
