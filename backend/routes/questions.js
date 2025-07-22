const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

// GET all questions
router.get('/', async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new question
router.post('/', async (req, res) => {
  const { questionText, options, correctAnswer } = req.body;
  try {
    const newQuestion = new Question({ questionText, options, correctAnswer });
    await newQuestion.save();
    res.status(201).json(newQuestion);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
