import nodemailer from 'nodemailer';

// Expects SMTP config in environment variables:
// SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM

const host = process.env.SMTP_HOST;
const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.EMAIL_FROM || process.env.SMTP_USER;

let transporter;

if (host && port && user && pass) {
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
  });
} else {
  // Fallback to ethereal for development if no SMTP configured
  transporter = null;
}

export async function sendMail({ to, subject, text, html }) {
  if (!transporter) {
    // try to create ethereal account dynamically for dev convenience
    const testAccount = await nodemailer.createTestAccount();
    const ethTransport = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const info = await ethTransport.sendMail({
      from: from || testAccount.user,
      to,
      subject,
      text,
      html,
    });

    return { messageId: info.messageId, previewUrl: nodemailer.getTestMessageUrl(info) };
  }

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });

  return { messageId: info.messageId };
}
