const MockTest = require("../models/MockTest");
const pdfParse = require("pdf-parse"); // Import pdf-parse
const fs = require("fs").promises; // Use promise-based fs for async operations
const { generateQuestionsFromText } = require("./gemini"); // Import Gemini function

const processPDF = async (testId, filePath) => {
  try {
    console.log(
      `[PDF Processor] Starting processing for test ${testId} from ${filePath}`
    );

    // 1. Extract text from PDF
    const dataBuffer = await fs.readFile(filePath);
    const pdfData = await pdfParse(dataBuffer);
    const pdfText = pdfData.text;

    if (!pdfText || pdfText.trim().length === 0) {
      throw new Error("Could not extract text from PDF or PDF is empty.");
    }

    console.log(
      `[PDF Processor] Extracted text from PDF for test ${testId}. Length: ${pdfText.length}`
    );

    // 2. Send text to AI service (Gemini) to generate questions
    const generatedQuestions = await generateQuestionsFromText(pdfText);

    if (!generatedQuestions || generatedQuestions.length === 0) {
      throw new Error("AI did not generate any questions.");
    }

    console.log(
      `[PDF Processor] AI generated ${generatedQuestions.length} questions for test ${testId}.`
    );

    // 3. Update the test with generated questions and set status to completed
    await MockTest.findByIdAndUpdate(testId, {
      questions: generatedQuestions.questions,
      duration: generatedQuestions.duration,
      status: "completed",
    });

    console.log(`[PDF Processor] PDF processing completed for test ${testId}`);
  } catch (error) {
    console.error(
      `[PDF Processor] PDF processing failed for test ${testId}:`,
      error
    );
    // Update test status to failed and store the error message
    await MockTest.findByIdAndUpdate(testId, {
      status: "failed",
      processingError: error.message || "Unknown processing error",
    });
  } finally {
    // Clean up the uploaded file after processing (or failure)
    try {
      if (filePath) {
        // await fs.unlink(filePath)
        // console.log(`[PDF Processor] Cleaned up uploaded file: ${filePath}`)
      }
    } catch (cleanupError) {
      console.error(
        `[PDF Processor] Failed to delete uploaded file ${filePath}:`,
        cleanupError
      );
    }
  }
};

module.exports = { processPDF };
