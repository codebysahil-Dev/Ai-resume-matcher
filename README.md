# AI Resume Job Matcher

AI Resume Job Matcher helps job seekers compare resume text with a target job description and turn the comparison into a match score, skill gaps, practical suggestions, and a concise summary. The idea was chosen because tailoring application materials is a common, repetitive problem for candidates, and a focused AI comparison can provide useful direction without pretending to replace human hiring judgment.

## Live Demo

The application is deployed on Vercel and is available at:

https://ai-resume-matcher-pi.vercel.app

## Features

- Compare resume text with a job description.
- Generate an AI match score from 0 to 100.
- Identify matched skills and missing or weak skills.
- Generate three to five practical improvement suggestions.
- Generate a concise candidate-job match summary.
- Show loading, validation, and API error states.
- Provide a responsive interface for desktop and mobile layouts.
- Keep Gemini API communication in the server-side API function.

## Tech Stack

### Frontend


3. Install dependencies:

   ```bash
   npm install
   ```

4. Create a local environment file from the example:

   ```bash
   cp .env.example .env.local
   ```

   On Windows PowerShell, use `Copy-Item .env.example .env.local`.

5. Open `.env.local` and replace the placeholder with your Gemini API key:

   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

   Keep this file local and do not commit the key. The serverless function reads `GEMINI_API_KEY` from the server environment. The current API implementation selects its Gemini model in `api/analyze.js`.

6. Start the development server:

   ```bash
   npm run dev
   ```

Vite will print the local development URL in the terminal.

### Common Commands

```bash
npm test -- --run
npm run test:coverage
npm run build
npm run preview
```

These run the test suite, generate the configured coverage report, create a production build, and preview that build respectively.

## Architecture Overview

The frontend is a Vite-powered React application. The browser collects the two text inputs, the frontend service sends them to `/api/analyze`, and the Vercel serverless function calls Gemini without putting the API key in browser code.

### Responsibilities

- `src/`: Frontend application source.
- `src/components/`: UI pieces for resume input, job input, loading, errors, and results.
- `src/services/api.js`: Sends the analysis request, handles response parsing and HTTP failures, and validates the returned analysis shape.
- `src/utils/validation.js`: Validates required input fields and the analysis response structure.
- `src/test/setup.js`: Vitest and Testing Library setup.
- `src/App.jsx`: Owns input, loading, error, and result state and coordinates the analysis flow.
- `src/main.jsx`: Mounts the React application and imports the global stylesheet.
- `src/index.css`: Global layout, responsive styling, focus states, loading animation, and result styling.
- `api/analyze.js`: Vercel endpoint that validates requests, reads the server-side Gemini key, calls Gemini, parses and validates the structured response, and returns JSON.

### Request Flow

```text
User Input
  -> React Frontend
  -> Frontend API Service
  -> /api/analyze
  -> Vercel Serverless Function
  -> Google Gemini API
  -> Structured Response
  -> Server and frontend validation
  -> Results UI
```

## AI Integration

Gemini is used to compare a candidate's resume with a specific job description and produce guidance that is more contextual than a static keyword list. The API receives the two text fields as JSON: `resume` and `jobDescription`.

The server sends both values to Gemini with instructions to compare the candidate materials. The system instruction requires a score from 0 to 100, matched skills supported by both inputs, important missing or weak skills, three to five practical suggestions, a short useful summary, and no invented experience or skills.

The request asks Gemini for JSON using an explicit response schema. The schema requires `matchScore`, `matchedSkills`, `missingSkills`, `suggestions`, and `summary`. The score is an integer from 0 to 100; the skill and suggestion fields are string arrays; suggestions contain three to five items; and the summary is non-empty.

Structured output makes the frontend contract predictable, so the results UI can render known fields instead of parsing free-form prose. `api/analyze.js` parses the model text and validates the structure before returning the five fields. The frontend validates the response again before displaying it. Empty output, invalid JSON, invalid field types or ranges, and invalid suggestion counts are rejected rather than rendered as results.

The Gemini key is read from `process.env.GEMINI_API_KEY` inside the serverless function. It is never placed in the frontend request or bundled into the React application. Missing configuration returns a server error, while Gemini failures return a generic analysis error to the client.

## Error Handling and Safe Failure

- The form rejects an empty resume or empty job description before making a request.
- The API rejects non-`POST` requests and missing or blank request fields.
- The Analyze button is disabled while a request is running, and a live loading state is displayed.
- Network failures are converted to an actionable frontend message.
- Invalid JSON responses and non-success HTTP responses are handled by the frontend service.
- Missing Gemini configuration, empty model output, invalid JSON, invalid response structure, and Gemini exceptions are handled by the API function.
- The backend returns generic client-facing error messages for AI failures rather than exposing API keys or stack traces.
- The form error uses an alert region, and the loading state uses a polite live status region.

The project does not currently add request authentication, rate limiting, or server-side length limits for submitted text. Those are operational considerations for a larger production deployment.

## Performance and Accessibility

The supplied Lighthouse audit results for the deployed application were:

| Category | Score |
| --- | ---: |
| Performance | 87 |
| Accessibility | 95 |
- Resume input is text-only; there is no PDF or DOCX parsing.
- The application does not provide authentication or saved analysis history.
- Only one resume and one job description are compared per analysis.
- There is no visible monitoring, analytics, rate limiting, or request-history feature in the current codebase.
- The WAVE audit reported two contrast errors that still require attention.

## Future Improvements

The following are future work, not current features:

- Add PDF and DOCX resume upload and text extraction.
- Add authentication and saved analysis history.
- Compare one resume with multiple job descriptions.
- Improve structured skill extraction and normalization.
- Add end-to-end browser tests for the deployed request flow.
- Add production monitoring, analytics, rate limiting, and request tracing.
- Resolve the reported contrast findings and repeat accessibility audits.

## Reflection

The hardest part of this project was making a generative AI response dependable enough for a normal interface. A free-form answer would be easy to display but difficult to test and easy to break when a model changes its wording. I therefore had to make the Gemini request explicit, require a JSON response schema, parse the returned text, and validate every field before allowing it into the results UI. The score range, suggestion count, array types, and non-empty summary all matter because the React components assume those shapes.

The API boundary created a second challenge. The Gemini key needed to stay in the server environment, while the browser still needed useful messages for missing configuration, network failure, invalid JSON, and model failure. Keeping the key in `api/analyze.js` and returning generic client-facing errors made that boundary clear. Vercel deployment also made environment variables and the difference between a local frontend request and a deployed serverless function important to verify.

The tests helped most with the user-visible flow: required-field validation, mocked analysis submission, errors, and result rendering. They do not replace a production AI test, because the Gemini response is mocked in the frontend tests. Next time, I would add an isolated API-handler test suite and an end-to-end test against a controlled response before deploying changes.

The accessibility and performance audits were useful because they exposed concerns that are easy to miss while focusing on the AI feature. The current UI has labels, headings, live states, focus styling, and responsive rules, and the supplied Lighthouse results were strong overall. The WAVE result still reported two contrast errors, which is a concrete reminder that an accessible structure does not guarantee every color combination passes an audit. I would address those contrast pairs, rerun WAVE and Lighthouse, and record the new evidence rather than assuming the CSS change was sufficient.

What surprised me most was how much of the work was contract design rather than prompt writing. The useful product behavior depends on the boundary between user input, server validation, Gemini's structured response, frontend validation, and the final explanation. Making those boundaries explicit also made the application easier to test and easier to reason about when deployment or AI output failed.

## Project Structure

```text
Ai-resume-matcher/
├── api/
│   └── analyze.js
├── public/
├── src/
│   ├── components/
│   │   ├── ErrorMessage.jsx
│   │   ├── JobInput.jsx
│   │   ├── LoadingState.jsx
│   │   ├── Results.jsx
│   │   ├── components.test.jsx
│   │   └── ResumeInput.jsx
│   ├── services/
│   │   └── api.js
│   ├── test/
│   │   └── setup.js
│   ├── utils/
│   │   └── validation.js
│   ├── App.jsx
│   ├── app.test.jsx
│   ├── index.css
│   └── main.jsx
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── README.md
├── tsconfig.json
└── vitest.config.js
```

## Repository

GitHub: https://github.com/codebysahil-Dev/Ai-resume-matcher

