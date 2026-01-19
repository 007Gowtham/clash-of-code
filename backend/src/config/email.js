const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

// Verify email configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Email configuration error:', error.message);
        console.log('⚠️  Email service will not work. Please configure EMAIL_USER and EMAIL_PASSWORD in .env');
    } else {
        console.log('✅ Email server ready');
    }
});

module.exports = transporter;
