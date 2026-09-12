# AI Resume Job Matcher

An AI-powered web application that compares a candidate's resume with a job description and provides a match analysis, including matched skills, missing skills, practical improvement suggestions, and an overall match score.

## Live Demo

🔗 https://ai-resume-matcher-pi.vercel.app

## Features

- Compare resume text with a job description
- AI-generated match score from 0 to 100
- Identify matched skills
- Identify missing or weak skills
- Generate practical improvement suggestions
- Generate a concise candidate-job match summary
- Loading and error states
- Responsive user interface
- Server-side Gemini API integration

## Tech Stack

### Frontend

- React
- Vite
- JavaScript
- CSS

### Backend / API

- Vercel Serverless Functions
- Google Gemini API

### Testing

- Vitest
- React Testing Library

### Deployment

- Vercel

## How It Works

1. Enter or paste resume content.
2. Enter or paste a job description.
3. Click **Analyze Match**.
4. The application sends the data to a server-side API endpoint.
5. The server securely communicates with the Google Gemini API.
6. Gemini analyzes the resume and job description.
7. The application displays:
   - Match score
   - Matched skills
   - Missing skills
   - AI suggestions
   - Summary

## Project Structure

```text
ai-resume-matcher/
│
├── api/
│   └── analyze.js
│
├── public/
│
├── src/
│   ├── components/
│   ├── services/
│   │   └── api.js
│   ├── utils/
│   │   └── validation.js
│   ├── test/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── .env.example
├── .gitignore
├── package.json
└── README.md