const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config();

// Access your API key as an environment variable (GEMINI_API_KEY)

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// For text-only input, use the gemini-pro model
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

async function generateQuestionsFromText(text) {
  const prompt = `
  You are an expert in creating mock test questions.
  Given the following text from a PDF document, generate a set of diverse mock test questions.
  Include Multiple Choice Questions (MCQ), True/False questions, and Short Answer questions.
  For MCQs and True/False, provide a correct answer and a brief explanation.
  For Short Answer questions, provide a concise correct answer and a brief explanation.

  Format your output as a "duration": time duration to solve these problem as m/s/h and a "questions":
 JSON array of question objects. Each object should have:
  - "question": string (the question text)
  - "options": string[] (an array of options for MCQs and True/False, empty for Short Answer)
  - "correctAnswer": string (the correct answer)
  - "type": "mcq" | "true-false" | "short-answer"
  - "explanation": string (a brief explanation for the correct answer)

  Ensure the JSON is valid and can be directly parsed. Do NOT include any introductory or concluding text outside the JSON.

  PDF Content:
  ---
  ${text}
  ---
  `;

  try {
    const result = await model.generateContent(prompt);

    const response = await result.response;

    const textResponse = response.text();

    let jsonString = textResponse.trim();

    // Attempt to parse the JSON
    if (jsonString.startsWith("```json")) {
      jsonString = jsonString
        .substring(7, jsonString.lastIndexOf("```"))
        .trim();
    } else if (jsonString.startsWith("```")) {
      jsonString = jsonString
        .substring(3, jsonString.lastIndexOf("```"))
        .trim();
    }

    try {
      const questions = JSON.parse(jsonString);
      return questions;
    } catch (err) {
      console.error("JSON parsing failed. Output received:", jsonString);
      throw new Error("Failed to parse questions JSON: " + err.message);
    }
  } catch (error) {
    throw new Error(`Failed to generate questions from AI: ${error.message}`);
  }
}

module.exports = { generateQuestionsFromText };
