const express = require("express");
const router = express.Router();
const MockTest = require("../models/MockTest");
const { authenticateToken } = require("../middleware/auth");
const fs = require("fs");

// Get all tests for authenticated user
router.get("/", authenticateToken, async (req, res) => {
  try {
    console.log("Tests route hit by user:", req.user._id);

    const tests = await MockTest.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    const formattedTests = tests.map((test) => ({
      _id: test._id,
      name: test.name,
      originalFileName: test.originalFileName,
      questions: test.questions.length,
      status: test.status,
      createdAt: test.createdAt,
      lastTaken: test.lastTaken,
      score: test.score,
    }));

    res.json({ tests: formattedTests });
  } catch (error) {
    console.error("Error fetching tests:", error);
    res.status(500).json({ error: "Failed to fetch tests" });
  }
});

// Get specific test with questions
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const test = await MockTest.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!test) {
      return res.status(404).json({ error: "Test not found" });
    }

    console.log("test", test);

    res.json({
      id: test._id,
      name: test.name,
      duration: test.duration,
      questions: test.questions,
    });
  } catch (error) {
    console.error("Error fetching test:", error);
    res.status(500).json({ error: "Failed to fetch test" });
  }
});

// Delete test
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const test = await MockTest.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!test) {
      return res.status(404).json({ error: "Test not found" });
    }

    // Delete the uploaded file
    if (fs.existsSync(test.filePath)) {
      fs.unlinkSync(test.filePath);
    }

    await MockTest.findByIdAndDelete(req.params.id);

    res.json({ message: "Test deleted successfully" });
  } catch (error) {
    console.error("Error deleting test:", error);
    res.status(500).json({ error: "Failed to delete test" });
  }
});

// Download test as PDF (placeholder)
router.get("/:id/download", authenticateToken, async (req, res) => {
  try {
    const test = await MockTest.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!test) {
      return res.status(404).json({ error: "Test not found" });
    }

    if (test.status !== "completed") {
      return res.status(400).json({ error: "Test is not ready for download" });
    }

    // Ensure filePath is stored in DB or determined here
    const filePath =
      test.filePath ||
      path.join(__dirname, `../files/mocktest-${test._id}.pdf`);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    // Set headers and send file
    res.download(filePath, `MockTest-${test.title || "Test"}.pdf`, (err) => {
      if (err) {
        console.error("File download error:", err);
        return res.status(500).json({ error: "Failed to download file" });
      }
    });
  } catch (error) {
    console.error("Error downloading test:", error);
    res.status(500).json({ error: "Failed to download test" });
  }
});

// Submit test answers and calculate score
router.post("/:id/submit", authenticateToken, async (req, res) => {
  try {
    const { answers } = req.body;
    const test = await MockTest.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!test) {
      return res.status(404).json({ error: "Test not found" });
    }

    // Calculate score
    let correctAnswers = 0;
    const results = test.questions.map((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      if (isCorrect) correctAnswers++;

      return {
        question: question.question,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation,
      };
    });

    const score = Math.round((correctAnswers / test.questions.length) * 100);

    // Update test with score and last taken date
    test.score = score;
    test.lastTaken = new Date();
    await test.save();

    res.json({
      score,
      correctAnswers,
      totalQuestions: test.questions.length,
      results,
    });
  } catch (error) {
    console.error("Error submitting test:", error);
    res.status(500).json({ error: "Failed to submit test" });
  }
});

module.exports = router;
