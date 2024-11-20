// server.js
const express = require("express");
const connectDB = require("./config/db");
const contactRoutes = require("./routes/contact");
const blogRoutes = require("./routes/blogsRoute"); // Import the blog routes
require("dotenv").config();

const app = express();
const cors = require("cors");

// Configure CORS
const corsOptions = {
    origin: ["https://aberrange-server.netlify.app", "http://localhost:3000"],
    methods: "GET,POST,PUT,DELETE", // Specify allowed HTTP methods
    allowedHeaders: "Content-Type,Authorization", // Specify allowed headers
  };

app.use(cors(corsOptions));

// Connect to the database
connectDB();

// Middleware
app.use(express.json());

// Routes
app.use("/api", contactRoutes);      // Contact routes
app.use("/api/blogs", blogRoutes);    // Blog routes

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
