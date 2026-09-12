export function validateInputs(resume, jobDescription) {
  if (!resume?.trim()) {
    return "Please enter your resume before analyzing.";
  }

  if (!jobDescription?.trim()) {
    return "Please enter a job description.";
  }

  return "";
}

export function isValidAnalysis(result) {
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