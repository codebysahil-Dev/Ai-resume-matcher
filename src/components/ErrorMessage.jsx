function ErrorMessage({ id, message }) {
  return (
    <div id={id} className="error-message" role="alert" aria-live="assertive">
      <span className="error-icon" aria-hidden="true">!</span>
      {message}
    </div>
  );
}

export default ErrorMessage;