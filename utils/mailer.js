import nodemailer from "nodemailer";
import { config } from "dotenv";
config({
  path: "./.env",
});

export const sendMail = async (to, subject, text) => {
  try {
    const testAccount = nodemailer.createTransport({
      host: process.env.MAILTRAP_SMTP_HOST,
      prototype: process.env.MAILTRAP_SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.MAILTRAP_SMTP_USER,
        pass: process.env.MAILTRAP_SMTP_PASSWORD,
      },
    });
    const info = await testAccount.sendMail({
      from: "Inngest TMS",
      to: to,
      subject: subject,
      text: text,
    });

    console.log("Message sent:", info.messageId);
    return info;
  } catch (error) {
    console.log("❌Mail Error", error.message);
    throw error;
  }
};
