import { afterEach, describe, expect, it, vi } from "vitest";
import { analyzeResume } from "./api";

const validAnalysis = {
  matchScore: 87,
  matchedSkills: ["React", "JavaScript"],
  missingSkills: ["TypeScript"],
  suggestions: ["Add metrics", "Mention testing", "Highlight projects"],
  summary: "Strong overall match.",
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("analyzeResume", () => {
  it.each([
    [undefined, "Job description", "Please enter your resume before analyzing."],
    ["   ", "Job description", "Please enter your resume before analyzing."],
    ["Resume", undefined, "Please enter a job description."],
    ["Resume", "   ", "Please enter a job description."],
  ])("rejects invalid input", async (resume, jobDescription, message) => {
    await expect(analyzeResume(resume, jobDescription)).rejects.toThrow(message);
  });

  it("returns a valid analysis response", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(validAnalysis),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(analyzeResume("Resume", "Job description")).resolves.toEqual(validAnalysis);
    expect(fetchMock).toHaveBeenCalledWith("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resume: "Resume", jobDescription: "Job description" }),
    });
  });

  it("handles network failures", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    await expect(analyzeResume("Resume", "Job description")).rejects.toThrow(
      "Unable to reach the analysis service. Please try again."
    );
  });

  it("handles invalid JSON responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.reject(new Error("invalid JSON")),
    }));

    await expect(analyzeResume("Resume", "Job description")).rejects.toThrow(
      "The analysis service returned an invalid response."
    );
  });

  it.each([
    [{ error: "Provider failed" }, "Provider failed"],
    [{}, "The AI analysis failed. Please try again."],
  ])("returns API errors", async (payload, message) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve(payload),
    }));

    await expect(analyzeResume("Resume", "Job description")).rejects.toThrow(message);
  });

  it.each([
    null,
    { ...validAnalysis, matchScore: "87" },
    { ...validAnalysis, matchScore: -1 },
    { ...validAnalysis, matchScore: 101 },
    { ...validAnalysis, matchedSkills: "React" },
    { ...validAnalysis, matchedSkills: ["React", 1] },
    { ...validAnalysis, missingSkills: "TypeScript" },
    { ...validAnalysis, missingSkills: ["TypeScript", false] },
    { ...validAnalysis, suggestions: "Add metrics" },
    { ...validAnalysis, suggestions: ["One", "Two"] },
    { ...validAnalysis, suggestions: ["One", "Two", "Three", "Four", "Five", "Six"] },
    { ...validAnalysis, suggestions: ["One", "Two", 3] },
    { ...validAnalysis, summary: 42 },
    { ...validAnalysis, summary: "   " },
  ])("rejects invalid analysis payloads", async (payload) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(payload),
    }));

    await expect(analyzeResume("Resume", "Job description")).rejects.toThrow(
      "The AI returned an invalid analysis. Please try again."
    );
  });
});