import nodemailer from "nodemailer";

const hasSmtp = Boolean(process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS);

const transporter = hasSmtp
  ? nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT || 587),
      secure: String(process.env.EMAIL_SECURE || "false") === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
  : null;

export const sendVerificationCodeEmail = async ({ to, code, verificationUrl }) => {
  const from = process.env.EMAIL_FROM || "Frakktur <no-reply@frakktur.com>";
  const subject = "Frakktur verification code";
  const verificationLinkText = verificationUrl ? `\nOr verify instantly using this link: ${verificationUrl}` : "";
  const text = `Your Frakktur verification code is: ${code}. It expires in 10 minutes.${verificationLinkText}`;
  const html = `
    <p>Your Frakktur verification code is:</p>
    <h2 style="letter-spacing:4px">${code}</h2>
    <p>This code expires in 10 minutes.</p>
    ${verificationUrl ? `<p><a href="${verificationUrl}">Verify account instantly</a></p>` : ""}
  `;

  if (!transporter) {
    console.log(`[DEV EMAIL] To: ${to} | Code: ${code} | Verify URL: ${verificationUrl || "n/a"}`);
    return;
  }

  await transporter.sendMail({ from, to, subject, text, html });
};
