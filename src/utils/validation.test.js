import { describe, expect, it } from "vitest";
import { isValidAnalysis, validateInputs } from "./validation";

describe("validateInputs", () => {
  it("accepts non-empty resume and job description text", () => {
    expect(validateInputs("Resume", "Job description")).toBe("");
  });

  it("rejects whitespace-only fields", () => {
    expect(validateInputs("  ", "Job description")).toBe(
      "Please enter your resume before analyzing."
    );
    expect(validateInputs("Resume", "  ")).toBe(
      "Please enter a job description."
    );
  });
});

describe("isValidAnalysis", () => {
  it("accepts a complete valid analysis", () => {
    expect(isValidAnalysis({
      matchScore: 0,
      matchedSkills: [],
      missingSkills: [],
      suggestions: ["One", "Two", "Three"],
      summary: "Useful summary.",
    })).toBe(true);
  });

  it("rejects non-object values", () => {
    expect(isValidAnalysis(null)).toBeFalsy();
    expect(isValidAnalysis(undefined)).toBeFalsy();
  });
});