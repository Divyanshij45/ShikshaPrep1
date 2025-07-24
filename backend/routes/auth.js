const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ✅ REGISTER route
router.post("/register", async (req, res) => {
  try {
    console.log("Register request received:", req.body); // Debug log
    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Create new user
    // Map the 'username' from req.body to the 'name' field in the User model
    const newUser = new User({ username, email, password: password.trim() });
    await newUser.save();

    // Respond with user info (no password)
    res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
    });
  } catch (err) {
    console.error("Register Error:", err);
    // More specific error handling for validation errors
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message);
      return res.status(400).json({ error: messages.join(", ") });
    }
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ LOGIN route
router.post("/login", async (req, res) => {
  try {
    console.log("Login request received:", req.body);
    const { email, password } = req.body;
    // Find user
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    // Compare password
    const isMatch = await bcrypt.compare(password.trim(), user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
    // Generate token
    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "5h" }
    );
    // Send user + token
    res.status(200).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
