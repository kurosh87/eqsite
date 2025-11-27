import { Resend } from 'resend';

// Lazy Resend client - only initialized when needed
let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

// Use Resend's test domain until you verify your own domain
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'EQ Platform <onboarding@resend.dev>';

export async function sendPasswordResetEmail(to: string, resetUrl: string, userName?: string) {
  const resend = getResend();
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'Reset Your Password - EQ Platform',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #6366f1; margin: 0;">EQ Platform</h1>
          </div>

          <h2 style="color: #1f2937;">Reset Your Password</h2>

          <p>Hi${userName ? ` ${userName}` : ''},</p>

          <p>We received a request to reset your password. Click the button below to create a new password:</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
              Reset Password
            </a>
          </div>

          <p style="color: #6b7280; font-size: 14px;">This link will expire in 1 hour.</p>

          <p style="color: #6b7280; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            &copy; ${new Date().getFullYear()} EQ Platform. All rights reserved.
          </p>
        </body>
      </html>
    `,
  });

  if (error) {
    console.error('Failed to send password reset email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return data;
}

export async function sendWelcomeEmail(to: string, userName?: string) {
  const resend = getResend();
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'Welcome to EQ Platform!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #6366f1; margin: 0;">EQ Platform</h1>
          </div>

          <h2 style="color: #1f2937;">Welcome${userName ? `, ${userName}` : ''}!</h2>

          <p>Thank you for joining EQ Platform. You're now ready to develop your emotional intelligence through assessments, games, and AI coaching.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://eq-platform.app'}/dashboard" style="background-color: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
              Get Started
            </a>
          </div>

          <h3 style="color: #1f2937;">What you can do:</h3>
          <ul style="color: #4b5563;">
            <li>Take EQ assessments to understand your emotional strengths</li>
            <li>Play interactive games to build emotional skills</li>
            <li>Track your mood and journal your thoughts</li>
            <li>Get personalized AI coaching and insights</li>
          </ul>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            &copy; ${new Date().getFullYear()} EQ Platform. All rights reserved.
          </p>
        </body>
      </html>
    `,
  });

  if (error) {
    console.error('Failed to send welcome email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return data;
}
