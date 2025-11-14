import nodemailer from "nodemailer";
import Mailgen from "mailgen";
import logger from "../logger/winston.logger.js";
import { ApiError } from "./ApiError.js";

// Create transporter using Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // your-email@gmail.com
    pass: process.env.EMAIL_PASS, // App password from Google
  },
});

// Initialize Mailgen instance
const mailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "Clash of Code",
    link: process.env.FRONTEND_URL || "https://clashofcode.app",
  },
});

/**
 * Generic email sender using Nodemailer + Mailgen
 * @param {string} email - Receiver email
 * @param {string} subject - Email subject
 * @param {Mailgen.Content} mailgenContent - Mailgen content
 */
const sendEmail = async (email, subject, mailgenContent) => {
  try {
    // Generate email HTML and text
    const emailHtml = mailGenerator.generate(mailgenContent);
    const emailText = mailGenerator.generatePlaintext(mailgenContent);

    // Send email using nodemailer
    const info = await transporter.sendMail({
      from: `"Clash of Code" <${process.env.EMAIL_USER}>`, // Sender name and email
      to: email,
      subject,
      html: emailHtml,
      text: emailText,
    });

    logger.info(`✅ Email sent successfully to ${email} | MessageID: ${info.messageId}`);
    return info;
  } catch (err) {
    logger.error("❌ Email sending failed:", err.message);
    throw new ApiError(500, "Failed to send email. Please try again later.");
  }
};

/**
 * Generates Mailgen content for email verification
 */
const emailVerification = (username, verificationUrl) => ({
  body: {
    name: username,
    intro: "Welcome to Clash of Code ⚡ We're thrilled to have you join the battle!",
    action: {
      instructions:
        "To complete your registration, please verify your email address by clicking below:",
      button: {
        color: "#2563EB",
        text: "Verify My Email",
        link: verificationUrl,
      },
    },
    outro:
      "If you didn't sign up for Clash of Code, you can safely ignore this email.",
  },
});

/**
 * Generates Mailgen content for password reset
 */
const forgotPassword = (username, passwordResetUrl) => ({
  body: {
    name: username,
    intro: "We received a request to reset your Clash of Code password.",
    action: {
      instructions:
        "To reset your password, click the button below. This link will expire in 10 minutes:",
      button: {
        color: "#2563EB",
        text: "Reset My Password",
        link: passwordResetUrl,
      },
    },
    outro:
      "If you didn't request this password reset, you can safely ignore this email.",
  },
});

// Verify transporter configuration on startup
transporter.verify((error, success) => {
  if (error) {
    logger.error("❌ Email transporter configuration failed:", error);
  } else {
    logger.info("✅ Email service is ready to send emails");
  }
});

export { sendEmail, emailVerification, forgotPassword };