import nodemailer from 'nodemailer';

export const emailConfig = {
  smtp: nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.APP_PASS,
    },
    pool: true, // ✅ enables connection pooling
    maxConnections: 5, // max concurrent connections
    maxMessages: 100, // max messages per connection before closing
  }),
  user: process.env.EMAIL,
  verificationExpiry: 120 * 60 * 1000,
};
