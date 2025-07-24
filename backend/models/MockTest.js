const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String }],
  correctAnswer: { type: String, required: true },
  type: {
    type: String,
    enum: ["mcq", "true-false", "short-answer"],
    default: "mcq",
  },
  explanation: { type: String },
});

const mockTestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  originalFileName: { type: String, required: true },
  filePath: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  questions: [questionSchema],
  status: {
    type: String,
    enum: ["processing", "completed", "failed"],
    default: "processing",
  },
  createdAt: { type: Date, default: Date.now },
  lastTaken: { type: Date },
  score: { type: Number },
  processingError: { type: String },
  duration: { type: String },
});

module.exports = mongoose.model("MockTest", mockTestSchema);
