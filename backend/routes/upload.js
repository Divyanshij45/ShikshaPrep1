const express = require("express");
const multer = require("multer");
const path = require("path");
const MockTest = require("../models/MockTest");
const { authenticateToken } = require("../middleware/auth"); // Import the authentication middleware
const { processPDF } = require("../utils/pdfProcessor"); // Import the processing function

const router = express.Router();

// Configure Multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure the 'uploads' directory exists
    const uploadDir = path.join(__dirname, "../uploads");
    if (!require("fs").existsSync(uploadDir)) {
      require("fs").mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed!"), false);
    }
  },
});

// POST route for PDF upload and test generation
// Restore authenticateToken here
router.post(
  "/pdf",
  authenticateToken,
  upload.single("pdfFile"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No PDF file uploaded." });
      }

      // req.user is now available because authenticateToken middleware runs first
      const userId = req.user._id;
      const originalFileName = req.file.originalname;
      const filePath = req.file.path;

      // Create a new MockTest entry with 'processing' status
      const newMockTest = new MockTest({
        userId,
        name: `Test from ${originalFileName}`, // Default name, can be changed later
        originalFileName,
        filePath,
        status: "processing", // Initial status
        questions: [], // Empty initially
      });

      await newMockTest.save();

      // Asynchronously process the PDF in the background
      // Do NOT await this, so the response can be sent immediately
      processPDF(newMockTest._id, filePath)
        .then(() =>
          console.log(
            `Background PDF processing started for test ${newMockTest._id}`
          )
        )
        .catch((err) =>
          console.error(
            `Error starting background PDF processing for test ${newMockTest._id}:`,
            err
          )
        );

      res.status(202).json({
        message: "PDF uploaded and processing started.",
        testId: newMockTest._id,
        fileName: originalFileName,
        name: newMockTest.name, // Return the name for frontend display
        originalFileName: newMockTest.originalFileName,
        status: newMockTest.status,
        createdAt: newMockTest.createdAt,
      });
    } catch (error) {
      console.error("Error uploading PDF:", error);
      if (error instanceof multer.MulterError) {
        return res.status(400).json({ error: error.message });
      }
      res
        .status(500)
        .json({ error: "Failed to upload PDF and start processing." });
    }
  }
);

module.exports = router;
