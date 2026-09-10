function ResumeInput({ resume, setResume }) {
  return (
    <div className="input-group">
      <div className="input-label-row">
        <label htmlFor="resume">Your Resume</label>
        <span className="input-count">Required</span>
      </div>
      <p className="input-help" id="resume-help">Include your recent roles, skills, and measurable wins.</p>

      <textarea
        id="resume"
        value={resume}
        onChange={(event) => setResume(event.target.value)}
        placeholder="Paste your resume content here..."
        rows="9"
        aria-describedby="resume-help"
      />
    </div>
  );
}

export default ResumeInput;