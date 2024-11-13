import nodemailer from "nodemailer";

// Configure the transporter
export function getTransporter() {
  const transporter = nodemailer.createTransport({
    service: "gmail", // or your preferred email provider
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  return transporter;
}
