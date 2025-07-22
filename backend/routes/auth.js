const express = require("express")
const router = express.Router()
const User = require("../models/User")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

// ✅ REGISTER route
router.post("/register", async (req, res) => {
  try {
    console.log("Register request received:", req.body) // Debug log
    const { username, email, password } = req.body

    // Check if user exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" })
    }

    // Create new user
    const newUser = new User({ username, email, password })
    await newUser.save()

    // Respond with user info (no password)
    res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
    })
  } catch (err) {
    console.error("Register Error:", err)
    res.status(500).json({ error: "Server error" })
  }
})

// ✅ LOGIN route
router.post("/login", async (req, res) => {
  try {
    console.log("Login request received:", req.body) // Debug log
    const { email, password } = req.body

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" })
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" })
    }

    // Generate token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET || "secretkey", { expiresIn: "1h" })

    // Send user + token
    res.status(200).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
    })
  } catch (err) {
    console.error("Login Error:", err)
    res.status(500).json({ error: "Server error" })
  }
})

module.exports = router
