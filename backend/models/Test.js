const mongoose = require("mongoose");

const testSchema = new mongoose.Schema({
  testName: String,
  originalFileName: String,
  questions: String, // or Array if parsed
  createdAt: Date,
});

module.exports = mongoose.model("Test", testSchema);
