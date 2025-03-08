const express = require("express");
const { sendEmail } = require("../utils/email.js"); // Assuming sendEmail is defined in utils/sendEmail
const { userInquirySubject } = require("../Enums/Email.js");

const router = express.Router();

router.post("/", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ error: "Name, email, and message are required" });
  }

  try {
    const otp = Math.floor(100000 + Math.random() * 900000); // Generate a random OTP
    await sendEmail(
      process.env.EMAIL,
      `Name: ${name} 
       Message : ${message}`,
      { from: email, subject: userInquirySubject }
    );
    res.status(200).json({ success: "Email sent successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to send email" });
  }
});

module.exports = router;
