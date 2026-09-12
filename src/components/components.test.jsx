import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Results from "./Results";
import ErrorMessage from "./ErrorMessage";
import JobInput from "./JobInput";
import ResumeInput from "./ResumeInput";

 describe("input components", () => {
  it("renders ResumeInput and updates when the user types", () => {
    const setResume = vi.fn();
    render(<ResumeInput resume="" setResume={setResume} />);

    const input = screen.getByLabelText("Your Resume");
    expect(input).toBeInTheDocument();
    fireEvent.change(input, { target: { value: "Resume text" } });

    expect(setResume).toHaveBeenCalledWith("Resume text");
  });

  it("renders JobInput and updates when the user types", () => {
    const setJobDescription = vi.fn();
    render(<JobInput jobDescription="" setJobDescription={setJobDescription} />);

    const input = screen.getByLabelText("Job Description");
    expect(input).toBeInTheDocument();
    fireEvent.change(input, { target: { value: "Job description" } });

    expect(setJobDescription).toHaveBeenCalledWith("Job description");
  });
});

describe("display components", () => {
  it("renders the provided error", () => {
    render(<ErrorMessage message="Something went wrong" />);

    expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong");
  });

  it("displays every analysis result section", () => {
    render(
      <Results
        result={{
          matchScore: 87,
          matchedSkills: ["React", "Testing"],
          missingSkills: ["TypeScript"],
          suggestions: ["Add metrics", "Mention testing", "Highlight projects"],
          summary: "Strong overall match.",
        }}
      />
    );

    expect(screen.getByText("87%")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("Add metrics")).toBeInTheDocument();
    expect(screen.getByText("Strong overall match.")).toBeInTheDocument();
  });
});
