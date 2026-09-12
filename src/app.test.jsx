import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { analyzeResume } from "./services/api";

vi.mock("./services/api", () => ({
  analyzeResume: vi.fn(),
}));

const analysis = {
  matchScore: 92,
  matchedSkills: ["React", "JavaScript"],
  missingSkills: ["GraphQL"],
  suggestions: ["Add GraphQL experience", "Quantify results", "Highlight testing"],
  summary: "Excellent match for the role.",
};

describe("App analyze flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("validates an empty resume", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Analyze Match" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Please enter your resume before analyzing."
    );
    expect(analyzeResume).not.toHaveBeenCalled();
  });

  it("validates an empty job description", () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText("Your Resume"), {
      target: { value: "Experienced frontend developer" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Analyze Match" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Please enter a job description."
    );
    expect(analyzeResume).not.toHaveBeenCalled();
  });

  it("displays mocked analysis results after a completed submission", async () => {
    analyzeResume.mockResolvedValue(analysis);
    render(<App />);

    fireEvent.change(screen.getByLabelText("Your Resume"), {
      target: { value: "Experienced frontend developer" },
    });
    fireEvent.change(screen.getByLabelText("Job Description"), {
      target: { value: "Looking for a React developer" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Analyze Match" }));

    expect(analyzeResume).toHaveBeenCalledWith(
      "Experienced frontend developer",
      "Looking for a React developer"
    );
    expect(await screen.findByText("92%")).toBeInTheDocument();
    expect(screen.getByText("Excellent match for the role.")).toBeInTheDocument();
    expect(screen.getByText("GraphQL")).toBeInTheDocument();
  });

  it("shows the loading state while analysis is pending", async () => {
    let resolveAnalysis;
    analyzeResume.mockImplementation(
      () => new Promise((resolve) => { resolveAnalysis = resolve; })
    );
    render(<App />);

    fireEvent.change(screen.getByLabelText("Your Resume"), {
      target: { value: "Resume text" },
    });
    fireEvent.change(screen.getByLabelText("Job Description"), {
      target: { value: "Job description" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Analyze Match" }));

    expect(screen.getByRole("status")).toHaveTextContent("Building your match report");
    expect(screen.getByRole("button", { name: "Analyzing..." })).toBeDisabled();

    resolveAnalysis(analysis);
    await waitFor(() => expect(screen.getByText("92%")).toBeInTheDocument());
  });

  it("shows an API error when analysis fails with an Error", async () => {
    analyzeResume.mockRejectedValueOnce(new Error("Service unavailable"));
    render(<App />);

    fireEvent.change(screen.getByLabelText("Your Resume"), {
      target: { value: "Resume text" },
    });
    fireEvent.change(screen.getByLabelText("Job Description"), {
      target: { value: "Job description" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Analyze Match" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Service unavailable");
    await waitFor(() => expect(screen.getByRole("button", { name: "Analyze Match" })).toBeEnabled());
  });

  it("uses a fallback message for non-Error failures", async () => {
    analyzeResume.mockRejectedValueOnce("unexpected failure");
    render(<App />);

    fireEvent.change(screen.getByLabelText("Your Resume"), {
      target: { value: "Resume text" },
    });
    fireEvent.change(screen.getByLabelText("Job Description"), {
      target: { value: "Job description" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Analyze Match" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The analysis failed. Please try again."
    );
  });
});
