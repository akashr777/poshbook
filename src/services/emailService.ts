import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT), // FIXED
  secure: false, // Gmail SMTP MUST be false for 587
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

/* Run once at startup (VERY IMPORTANT) */
export async function verifyEmailConnection() {
  try {
    await transporter.verify();
    console.log('✅ SMTP connection successful');
  } catch (error) {
    console.error('❌ SMTP connection failed:', error);
  }
}

export const emailService = {
  async sendPasswordEmail(toEmail: string, password: string) {
    try {
      const info = await transporter.sendMail({
        from: env.EMAIL_FROM,
        to: toEmail,
        subject: 'Your DriveSphere Account Password',
        text: `Your temporary password is: ${password}`,
        html: `
          <h2>Welcome to DriveSphere</h2>
          <p>Your temporary password:</p>
          <h3>${password}</h3>
        `
      });

      console.log('Email sent:', info.messageId);
    } catch (error) {
      console.error('Email send failed:', error);
    }
  },

  async sendPasswordResetEmail(
    toEmail: string,
    resetUrl: string,
    ttlSeconds: number
  ) {
    try {
      const minutes = Math.ceil(ttlSeconds / 60);

      const info = await transporter.sendMail({
        from: env.EMAIL_FROM,
        to: toEmail,
        subject: 'Reset Your Password',
        text: `Reset link: ${resetUrl} (expires in ${minutes} minutes)`,
        html: `
          <h2>Password Reset</h2>
          <a href="${resetUrl}">Reset Password</a>
          <p>Expires in ${minutes} minutes</p>
        `
      });

      console.log('Reset email sent:', info.messageId);
    } catch (error) {
      console.error('Reset email failed:', error);
    }
  }
};