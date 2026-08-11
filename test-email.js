require('dotenv').config();
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  }
});
transporter.verify(function(error, success) {
  if (error) {
    console.log("Error:", error.message);
  } else {
    console.log("Server is ready to take our messages");
  }
});
