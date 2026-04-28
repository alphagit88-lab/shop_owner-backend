import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export const sendEmailWithAttachment = async (
  to: string,
  subject: string,
  text: string,
  filename: string,
  content: Buffer
) => {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn("⚠️ SendGrid API Key missing. Skipping email.");
    return;
  }

  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL || "no-reply@example.com",
    subject,
    text,
    attachments: [
      {
        content: content.toString("base64"),
        filename,
        type: "application/pdf",
        disposition: "attachment",
      },
    ],
  };

  try {
    await sgMail.send(msg);
    console.log(`📧 Email sent to ${to}`);
  } catch (error) {
    console.error("❌ SendGrid error:", error);
    throw error;
  }
};
