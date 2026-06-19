const axios = require('axios');

const sendEmail = async (options) => {
  if (process.env.BREVO_API_KEY) {
    // Send using Brevo HTTPS API to bypass SMTP port blocks on Railway
    await axios.post('https://api.brevo.com/v3/smtp/email', {
      sender: { name: "Shri Swami Narayana Vidhyalaya", email: process.env.EMAIL_USER },
      to: [{ email: options.email }],
      subject: options.subject,
      textContent: options.message
    }, {
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json'
      }
    });
  } else {
    // Fallback to Nodemailer (for local testing if BREVO_API_KEY is not set)
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000,
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    await transporter.sendMail(mailOptions);
  }
};

module.exports = sendEmail;
