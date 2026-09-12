function Results({ result }) {
  return (
    <section className="results" aria-labelledby="analysis-heading">
      <div className="results-heading">
        <div>
          <span className="section-kicker">Your readout</span>
          <h2 id="analysis-heading">Your Analysis</h2>
        </div>
        <span className="results-status"><span aria-hidden="true">●</span> Complete</span>
      </div>

      <div className="match-score" style={{ "--score": `${result.matchScore}%` }}>
        <div className="score-ring" aria-label={`Match score: ${result.matchScore} percent`} role="img">
          <div className="score-ring-inner">
            <strong>{result.matchScore}%</strong>
            <span>match</span>
          </div>
        </div>
        <div className="score-copy">
          <span className="score-label">Match score</span>
          <p>A snapshot of how closely your experience aligns with this role.</p>
        </div>
      </div>

      <div className="result-section result-section-success">
        <h3>Matched Skills</h3>
        <p className="result-intro">Strengths already visible in your resume.</p>

        <ul className="skill-list">
          {result.matchedSkills.map((skill) => (
            <li className="skill-chip skill-chip-success" key={skill}>{skill}</li>
          ))}
        </ul>
      </div>

      <div className="result-section result-section-warning">
        <h3>Missing Skills</h3>
        <p className="result-intro">Areas to clarify, build, or emphasize.</p>

        <ul className="skill-list">
          {result.missingSkills.map((skill) => (
            <li className="skill-chip skill-chip-warning" key={skill}>{skill}</li>
          ))}
        </ul>
      </div>

      <div className="result-section suggestions-section">
        <h3>AI Suggestions</h3>
        <p className="result-intro">Small edits that can make your application sharper.</p>

        <ol className="suggestion-list">
          {result.suggestions.map((suggestion) => (
            <li key={suggestion}><span className="suggestion-marker" aria-hidden="true">↗</span><span>{suggestion}</span></li>
          ))}
        </ol>
      </div>

      <div className="result-section summary summary-section">
        <h3>Summary</h3>
        <p>{result.summary}</p>
      </div>
    </section>
  );
}

export default Results;