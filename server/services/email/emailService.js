import nodemailer from 'nodemailer';
import { config, systemStatus } from '../../config/env.js';

let transporter = null;

if (config.EMAIL_SERVICE_USER && config.EMAIL_SERVICE_PASSWORD) {
  transporter = nodemailer.createTransport({
    host: config.EMAIL_SERVICE_HOST || 'smtp.gmail.com',
    port: parseInt(config.EMAIL_SERVICE_PORT, 10) || 587,
    secure: config.EMAIL_SERVICE_PORT === '465',
    auth: {
      user: config.EMAIL_SERVICE_USER,
      pass: config.EMAIL_SERVICE_PASSWORD,
    },
  });
}

export async function sendEmail({ to, subject, html, text }) {
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: config.EMAIL_FROM,
        to,
        subject,
        text,
        html,
      });
      console.log(`[EMAIL] Delivered email to ${to}: messageId=${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error('[EMAIL ERROR] Failed to send email via SMTP:', err.message);
      // Fall through to console logging in development
      if (config.NODE_ENV === 'production') {
        throw err;
      }
    }
  }

  // Development Fallback: Safe Console Logging
  console.log('\n=================== [DEV MODE EMAIL NOTIFICATION] ===================');
  console.log(`To:      ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Content:\n${text}`);
  console.log('======================================================================\n');

  return { success: true, simulated: true };
}
