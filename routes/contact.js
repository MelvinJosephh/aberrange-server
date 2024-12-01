// routes/contact.js
const express = require("express");
const router = express.Router();
const cors = require("cors");
const { submitForm, getMessages } = require("../controllers/contactController");


// Configure CORS for this router
const corsOptions = {
    origin: ["https://aberrange-server.netlify.app", "http://localhost:5000", "http://localhost:3000", "http://localhost:3001"],
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
};
router.use(cors(corsOptions));


router.post("/contact", submitForm);


router.get("/messages", getMessages);


module.exports = router;
