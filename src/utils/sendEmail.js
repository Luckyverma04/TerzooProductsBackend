import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

  connectionTimeout: 8000,
  greetingTimeout: 8000,
  socketTimeout: 12000,
});

const sendEmail = async ({ to, subject, html }) => {
  return await transporter.sendMail({
    from: `"Trazoo Global" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

export default sendEmail;