import nodemailer from "nodemailer";

export type ContactEmailInput = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export async function sendContactEmail(input: ContactEmailInput) {
  const required = [
    process.env.SMTP_HOST,
    process.env.SMTP_PORT,
    process.env.SMTP_USER,
    process.env.SMTP_PASS,
    process.env.SMTP_FROM,
    process.env.ADMIN_EMAIL,
  ];

  if (required.some((value) => !value)) {
    throw new Error("SMTP is not configured.");
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: process.env.ADMIN_EMAIL,
    replyTo: input.email,
    subject: `[St. Dominic Hoopers] ${input.subject}`,
    text: `Name: ${input.name}\nEmail: ${input.email}\n\n${input.message}`,
  });
}
