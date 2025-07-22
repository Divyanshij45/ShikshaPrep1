const { GoogleGenerativeAI } = require('@google/generative-ai');
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateQuestionsFromPDF(pdfText) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      Generate 5 multiple choice questions from this PDF content:
      ${pdfText}

      Format:
      [
        {
          "question": "...",
          "options": ["A", "B", "C", "D"],
          "answer": "B"
        },
        ...
      ]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text; // You can parse to JSON if needed
  } catch (error) {
    console.error("Gemini Error:", error);
    return [];
  }
}

module.exports = { generateQuestionsFromPDF };
