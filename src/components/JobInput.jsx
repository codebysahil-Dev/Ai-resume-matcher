function JobInput({ jobDescription, setJobDescription }) {
  return (
    <div className="input-group">
      <div className="input-label-row">
        <label htmlFor="job-description">Job Description</label>
        <span className="input-count">Required</span>
      </div>
      <p className="input-help" id="job-description-help">Paste the role details so the comparison has useful context.</p>

      <textarea
        id="job-description"
        value={jobDescription}
        onChange={(event) => setJobDescription(event.target.value)}
        placeholder="Paste the job description here..."
        rows="9"
        aria-describedby="job-description-help"
      />
    </div>
  );
}

export default JobInput;