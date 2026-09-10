import { useState } from "react";
import ResumeInput from "./components/ResumeInput";
import JobInput from "./components/JobInput";
import AnalysisResult from "./components/AnalysisResult";
import LoadingState from "./components/LoadingState";
import ErrorMessage from "./components/ErrorMessage";
import { analyzeResume } from "./services/aiService";

function App() {
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async (event) => {
    event.preventDefault();
    setError("");
    setResult(null);

    if (!resume.trim()) {
      setError("Please enter your resume before analyzing.");
      return;
    }

    if (!jobDescription.trim()) {
      setError("Please enter a job description.");
      return;
    }

    setLoading(true);

    try {
      const analysis = await analyzeResume(resume, jobDescription);
      setResult(analysis);
    } catch (analysisError) {
      setError(
        analysisError instanceof Error
          ? analysisError.message
          : "The analysis failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app">
      <header className="hero">
        <div className="eyebrow"><span aria-hidden="true">✦</span> AI-powered career clarity</div>
        <h1>AI Resume Job Matcher</h1>
        <p>
          Turn a job description into a clear action plan. See where your
          experience fits and what to strengthen next.
        </p>
      </header>

      <form
        className="form-container"
        onSubmit={handleAnalyze}
        aria-describedby={error ? "analysis-error" : undefined}
      >
        <div className="form-heading">
          <div>
            <span className="section-kicker">Start here</span>
            <h2>Compare your materials</h2>
          </div>
          <span className="secure-note"><span aria-hidden="true">●</span> Private by design</span>
        </div>

        <div className="input-grid">
        <ResumeInput resume={resume} setResume={setResume} />

        <JobInput
          jobDescription={jobDescription}
          setJobDescription={setJobDescription}
        />
        </div>

        <button
          type="submit"
          className="analyze-button"
          disabled={loading}
        >
          <span aria-hidden="true">{loading ? "◌" : "↗"}</span>
          {loading ? "Analyzing..." : "Analyze Match"}
        </button>
      </form>

      {error && <ErrorMessage id="analysis-error" message={error} />}

      {loading && <LoadingState />}

      {result && !loading && <AnalysisResult result={result} />}
    </main>
  );
}

export default App;