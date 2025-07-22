const pdf = require("pdf-parse")
const MockTest = require("../models/MockTest")
const fs = require("fs").promises // Use promise-based fs for async operations
const { generateText } = require("ai") // Import generateText from AI SDK [^2]
const { openai } = require("@ai-sdk/openai") // Import openai model from AI SDK [^2]

const processPDF = async (testId, filePath) => {
  try {
    console.log(`[PDF Processor] Starting processing for test ${testId} from ${filePath}`)

    // 1. Read PDF file
    const dataBuffer = await fs.readFile(filePath)
    console.log("[PDF Processor] PDF file read successfully.")

    // 2. Extract text from PDF
    const pdfData = await pdf(dataBuffer)
    const extractedText = pdfData.text
    console.log(`[PDF Processor] Extracted text length: ${extractedText.length} characters.`)

    if (extractedText.trim().length === 0) {
      throw new Error("No text could be extracted from the PDF. Please ensure it's not an image-only PDF.")
    }

    // 3. Generate questions using AI
    console.log("[PDF Processor] Sending text to AI for question generation...");
    const { text: aiGeneratedContent } = await generateText({
      model: openai("gpt-4o"), // Using GPT-4o model [^2]
      prompt: `You are an expert in creating mock test questions.
      Given the following text from a PDF document, generate a set of diverse mock test questions.
      Include Multiple Choice Questions (MCQ), True/False questions, and Short Answer questions.
      For MCQs and True/False, provide a correct answer and a brief explanation.
      For Short Answer questions, provide a concise correct answer and a brief explanation.

      Format your output as a JSON array of question objects. Each object should have:
      - "question": string (the question text)
      - "options": string[] (an array of options for MCQs and True/False, empty for Short Answer)
      - "correctAnswer": string (the correct answer)
      - "type": "mcq" | "true-false" | "short-answer"
      - "explanation": string (a brief explanation for the correct answer)

      Ensure the JSON is valid and can be directly parsed. Do NOT include any introductory or concluding text outside the JSON.

      PDF Content:
      ---
      ${extractedText}
      ---
      `,
      temperature: 0.7, // Adjust for creativity vs. factual accuracy
      maxTokens: 2000, // Adjust based on expected output length
    })

    console.log("[PDF Processor] AI question generation completed.")
    // console.log("AI Raw Output:", aiGeneratedContent); // For debugging AI output

    let generatedQuestions = []
    try {
      // Attempt to parse the AI's JSON output
      generatedQuestions = JSON.parse(aiGeneratedContent)
      // Basic validation to ensure it's an array of objects with expected properties
      if (
        !Array.isArray(generatedQuestions) ||
        generatedQuestions.some((q) => !q.question || !q.correctAnswer || !q.type)
      ) {
        throw new Error("AI did not return questions in the expected JSON format.")
      }
      console.log(`[PDF Processor] Successfully parsed ${generatedQuestions.length} questions from AI.`)
    } catch (parseError) {
      console.error("[PDF Processor] Failed to parse AI generated content as JSON:", parseError)
      console.error("AI Output that failed to parse:", aiGeneratedContent)
      throw new Error(
        "AI response was not valid JSON or in the expected format. Please try again or refine the PDF content.",
      )
    }

    // 4. Update the MockTest document with the generated questions
    await MockTest.findByIdAndUpdate(testId, {
      questions: generatedQuestions,
      status: "completed",
    })

    console.log(`[PDF Processor] PDF processing completed for test ${testId}`)
  } catch (error) {
    console.error(`[PDF Processor] PDF processing failed for test ${testId}:`, error)

    // Update test status to failed and store the error message
    await MockTest.findByIdAndUpdate(testId, {
      status: "failed",
      processingError: error.message || "Unknown processing error",
    })
  } finally {
    // Clean up the uploaded file after processing (or failure)
    try {
      if (filePath) {
        await fs.unlink(filePath)
        console.log(`[PDF Processor] Cleaned up uploaded file: ${filePath}`)
      }
    } catch (cleanupError) {
      console.error(`[PDF Processor] Failed to delete uploaded file ${filePath}:`, cleanupError)
    }
  }
}

module.exports = { processPDF }
