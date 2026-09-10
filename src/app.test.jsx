import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./app";
import { analyzeResume } from "./services/aiService";

vi.mock("./services/aiService", () => ({
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
});
