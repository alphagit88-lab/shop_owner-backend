import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create Mailtrap transporter
const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST || "sandbox.smtp.mailtrap.io",
  port: Number(process.env.MAILTRAP_PORT) || 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

export const sendEmailWithAttachment = async (
  to: string,
  subject: string,
  text: string,
  filename: string,
  content: Buffer
) => {
  if (!process.env.MAILTRAP_USER || !process.env.MAILTRAP_PASS) {
    console.warn("⚠️ Mailtrap credentials missing. Skipping email.");
    return;
  }

  const msg = {
    from: `"${process.env.MAIL_FROM_NAME || "Gem Palace Jewelry"}" <${process.env.MAIL_FROM_EMAIL || "no-reply@example.com"}>`,
    to,
    subject,
    text,
    attachments: [
      {
        filename,
        content,
        contentType: "application/pdf",
      },
    ],
  };

  try {
    const info = await transporter.sendMail(msg);
    console.log(`📧 Email sent to ${to} (Message ID: ${info.messageId})`);
  } catch (error) {
    console.error("❌ Mailtrap error:", error);
    throw error;
  }
};
