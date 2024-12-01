const Contact = require("../models/Contact");
const nodemailer = require("nodemailer");
const path = require("path"); 

exports.submitForm = async (req, res) => {
  const { firstName,phone, companyName, lastName, email,subject, message } = req.body;
  console.log("Request body:", req.body);
  
  try {
    const newContact = new Contact({  firstName,
      lastName,
      email,
      phone,
      subject,
      companyName,
      message, });
    await newContact.save();

    // Setup email transport
    const transporter = nodemailer.createTransport({
      host: "mail.kamsware.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Define the logo path and cid
    const logoPath = path.resolve(__dirname, "../assets/aberrange-logo-themed.png");  
    const logoCid = "aberrangeLogo";  

    // Send email with the embedded logo
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Thank you for reaching out",
      html: `
        <html>
          <body>
            <h1>Hi ${firstName},</h1>
            <p>Thank you for your message. We'll get back to you soon.</p>
            <p>Best regards,<br />Aberrange Solutions</p>
            <img src="cid:${logoCid}" alt="Aberrange Solutions Logo" />
          </body>
        </html>`,
      attachments: [
        {
          filename: "aberrange-logo-themed.png",  
          path: logoPath, 
          cid: logoCid, 
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// Fetch all messages for the frontend
exports.getMessages = async (req, res) => {
  try {
    const messages = await Contact.find();

    // Transform data into the format expected by Messages.jsx
    const formattedMessages = messages.map((msg) => ({
      id: msg._id, // Use MongoDB ID as unique identifier
      sender: `${msg.firstName} ${msg.lastName}${msg.companyName ? ` (${msg.companyName})` : ""}`,
      email: msg.email,
      subject: msg.subject,
      content: msg.message,
      phone: msg.phone,
      status: "Unread", // Default status for now
    }));

    res.status(200).json(formattedMessages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};
