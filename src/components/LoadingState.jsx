function LoadingState() {
  return (
    <section
      className="loading-state"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-busy="true"
    >
      <div className="loading-mark" aria-hidden="true">✦</div>
      <p className="loading-title">Building your match report</p>
      <p className="loading-copy">Comparing experience, skills, and role requirements...</p>
      <div className="loading-bar" aria-hidden="true"><span /></div>
    </section>
  );
}

export default LoadingState;