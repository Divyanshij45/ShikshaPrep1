  const express = require("express")
  const cors = require("cors")
  const mongoose = require("mongoose")
  const dotenv = require("dotenv")
  const authRoutes = require("./routes/auth")
  const testsRoutes = require("./routes/tests")
  const uploadRoutes = require("./routes/upload") // <--- ADDED THIS LINE

  dotenv.config()

  const app = express()

  app.use(cors())
  app.use(express.json())

  mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log("MongoDB connection error:", err))

  // Register auth routes
  app.use("/api/auth", authRoutes)

  // Register tests routes
  app.use("/api/tests", testsRoutes)

  // Register upload routes
  app.use("/api/upload", uploadRoutes) // <--- ADDED THIS LINE

  app.listen(5000, () => {
    console.log("Server started on port 5000")
  })
