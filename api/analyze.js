import { GoogleGenAI, Type } from "@google/genai";

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    matchScore: {
      type: Type.INTEGER,
    },
    matchedSkills: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
    },
    missingSkills: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
    },
    suggestions: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
    },
    summary: {
      type: Type.STRING,
    },
  },
  required: [
    "matchScore",
    "matchedSkills",
    "missingSkills",
    "suggestions",
    "summary",
  ],
};

function isValidAnalysis(result) {
  return (
    result &&
    Number.isInteger(result.matchScore) &&
    result.matchScore >= 0 &&
    result.matchScore <= 100 &&
    Array.isArray(result.matchedSkills) &&
    result.matchedSkills.every(
      (skill) => typeof skill === "string"
    ) &&
    Array.isArray(result.missingSkills) &&
    result.missingSkills.every(
      (skill) => typeof skill === "string"
    ) &&
    Array.isArray(result.suggestions) &&
    result.suggestions.length >= 3 &&
    result.suggestions.length <= 5 &&
    result.suggestions.every(
      (suggestion) => typeof suggestion === "string"
    ) &&
    typeof result.summary === "string" &&
    result.summary.trim().length > 0
  );
}

function sendJson(response, status, body) {
  response
    .status(status)
    .setHeader("Content-Type", "application/json");

  return response.json(body);
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");

    return sendJson(response, 405, {
      error: "Method not allowed.",
    });
  }

  const { resume, jobDescription } = request.body || {};

  if (typeof resume !== "string" || !resume.trim()) {
    return sendJson(response, 400, {
      error: "Resume text is required.",
    });
  }

  if (
    typeof jobDescription !== "string" ||
    !jobDescription.trim()
  ) {
    return sendJson(response, 400, {
      error: "Job description text is required.",
    });
  }

  if (!process.env.GEMINI_API_KEY) {
    return sendJson(response, 500, {
      error: "The Gemini API is not configured on the server.",
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

     const model = "gemini-3.5-flash";

    const result = await ai.models.generateContent({
      model,

      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
Compare the following resume with the job description.

Return the analysis strictly according to the provided JSON schema.

Resume:
${resume}

Job Description:
${jobDescription}
              `.trim(),
            },
          ],
        },
      ],

      config: {
        systemInstruction: `
You are an AI resume matching assistant.

Compare the candidate's resume with the provided job description.

Rules:
- matchScore must be an integer from 0 to 100.
- matchedSkills must contain relevant skills present in both the resume and job description.
- missingSkills must contain important skills from the job description that are missing or weak in the resume.
- suggestions must contain between 3 and 5 practical suggestions.
- summary must be short and useful.
- Do not invent experience or skills that are not supported by the resume.
        `.trim(),

        responseMimeType: "application/json",

        responseSchema: analysisSchema,
      },
    });

    if (!result.text) {
      return sendJson(response, 502, {
        error: "The AI returned an empty response.",
      });
    }

    let parsed;

    try {
      parsed = JSON.parse(result.text);
    } catch (error) {
      console.error(
        "Failed to parse Gemini response:",
        result.text
      );

      return sendJson(response, 502, {
        error: "The AI returned invalid JSON.",
      });
    }

    if (!isValidAnalysis(parsed)) {
      console.error(
        "Invalid Gemini analysis structure:",
        parsed
      );

      return sendJson(response, 502, {
        error: "The AI returned an invalid analysis.",
      });
    }

    return sendJson(response, 200, {
      matchScore: parsed.matchScore,
      matchedSkills: parsed.matchedSkills,
      missingSkills: parsed.missingSkills,
      suggestions: parsed.suggestions,
      summary: parsed.summary,
    });
  } catch (error) {
    console.error("Gemini analysis failed:", error);

    return sendJson(response, 502, {
      error: "The AI analysis failed. Please try again.",
    });
  }
}