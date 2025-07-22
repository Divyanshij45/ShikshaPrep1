const { OpenAI } = require('@ai-sdk/openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateQuestions(pdfText) {
  // prompt AI to generate MCQs from the PDF
  const prompt = `Generate 5 MCQ questions with options and correct answers from this content:\n\n${pdfText}`;

  const result = await openai.complete({
    model: "gpt-3.5-turbo-instruct",
    prompt,
  });

  return result.text; // you might need to parse it into JSON
}

module.exports = { generateQuestions };
