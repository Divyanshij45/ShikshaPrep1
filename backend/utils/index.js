const MockTest = require("../models/MockTest");

// Mock PDF processing function
// In a real implementation, you would:
// 1. Extract text from PDF using libraries like pdf-parse
// 2. Send text to AI service (OpenAI, etc.) to generate questions
// 3. Parse AI response and save questions

const processPDF = async (testId, filePath) => {
  try {
    console.log(`Processing PDF for test ${testId}`);

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Mock questions (replace with real AI-generated questions)
    const mockQuestions = [
      {
        question: "What is the main topic of this document?",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: "Option A",
        type: "mcq",
        explanation: "This is based on the document content.",
      },
      {
        question: "True or False: The document contains important information.",
        options: ["True", "False"],
        correctAnswer: "True",
        type: "true-false",
        explanation: "The document clearly contains relevant information.",
      },
      {
        question: "What is the key concept discussed?",
        correctAnswer: "The key concept varies based on document content",
        type: "short-answer",
        explanation: "This requires understanding of the main themes.",
      },
    ];

    // Update the test with generated questions
    await MockTest.findByIdAndUpdate(testId, {
      questions: mockQuestions,
      status: "completed",
    });

    console.log(`PDF processing completed for test ${testId}`);
  } catch (error) {
    console.error(`PDF processing failed for test ${testId}:`, error);

    // Update test status to failed
    await MockTest.findByIdAndUpdate(testId, {
      status: "failed",
      processingError: error.message,
    });
  }
};

module.exports = { processPDF };
