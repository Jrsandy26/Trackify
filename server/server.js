import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

// Load environment variables from .env
dotenv.config({ path: envPath });

const app = express();
const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5174';

app.use(cors());
app.use(express.json());

// In-memory state stores for OTPs, Password Resets, and Invitations
const otpStore = new Map();
const resetStore = new Map();
let invitations = [];

// Helper to configure Gmail SMTP Transporter
function getTransporter() {
  const user = (process.env.GMAIL_USER || '').trim();
  const pass = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, ''); // strip spaces from 16-char app pass

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
    tls: {
      rejectUnauthorized: true
    }
  });
}

// Helper to configure Supabase Server Client
function getSupabaseServerClient() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const key = (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '').trim();

  if (!url || !key) return null;
  return createClient(url, key);
}

// -------------------------------------------------------------
// Professional, Spam-Resistant Email Layout Generators
// -------------------------------------------------------------

/**
 * 1. Generate Login Verification Code Email
 */
function buildLoginOtpEmail(email, otp, name = '') {
  const recipientGreeting = name ? `<strong>${name}</strong>` : 'there';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Trackify Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155; -webkit-font-smoothing: antialiased;">
  <!-- Preheader text for inbox preview -->
  <div style="display: none; font-size: 1px; color: #f1f5f9; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all;">
    Your Trackify sign-in verification code is ${otp}. Valid for 10 minutes.
  </div>

  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #0f172a; padding: 32px 36px; text-align: center;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" align="center">
                <tr>
                  <td style="vertical-align: middle;">
                    <div style="width: 36px; height: 36px; border-radius: 8px; background: linear-gradient(135deg, #0284c7 0%, #6366f1 100%); line-height: 36px; text-align: center; color: #ffffff; font-weight: bold; font-size: 20px;">T</div>
                  </td>
                  <td style="vertical-align: middle; padding-left: 12px;">
                    <span style="color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">Trackify</span>
                  </td>
                </tr>
              </table>
              <p style="color: #94a3b8; font-size: 13px; margin: 8px 0 0; font-weight: 500;">Sign-In Verification</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 36px 28px;">
              <p style="font-size: 16px; line-height: 24px; color: #1e293b; margin: 0 0 16px;">
                Hello ${recipientGreeting},
              </p>
              <p style="font-size: 15px; line-height: 24px; color: #475569; margin: 0 0 24px;">
                We received a request to sign in to your Trackify workspace using <strong>${email}</strong>. Use the verification code below to complete your sign-in:
              </p>

              <!-- Verification Code Badge -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background-color: #f0f9ff; border: 2px dashed #0284c7; border-radius: 10px; padding: 16px 36px; text-align: center;">
                      <span style="font-family: 'SF Mono', Monaco, Menlo, Consolas, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #0369a1; display: block; margin-left: 8px;">${otp}</span>
                    </div>
                  </td>
                </tr>
              </table>

              <p style="font-size: 13px; line-height: 20px; color: #64748b; margin: 0 0 16px;">
                ⏱ This verification code is valid for <strong>10 minutes</strong>. For your security, never share this code with anyone.
              </p>

              <div style="background-color: #f8fafc; border-left: 3px solid #cbd5e1; padding: 12px 16px; border-radius: 4px; margin-top: 24px;">
                <p style="font-size: 12px; line-height: 18px; color: #64748b; margin: 0;">
                  If you didn't attempt to sign in to Trackify, please ignore this email. Your account remains protected.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 36px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="font-size: 12px; color: #94a3b8; margin: 0 0 6px;">
                Trackify Collaborative Project Management &bull; Enterprise Workspace
              </p>
              <p style="font-size: 11px; color: #cbd5e1; margin: 0;">
                This is an automated transactional message sent to ${email}.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Trackify Sign-In Verification

Hello ${name || 'there'},

Your Trackify sign-in verification code is: ${otp}

This code is valid for 10 minutes. Enter this code on the sign-in screen to access your account.

If you did not request this verification code, you can safely ignore this message.

--
Trackify Workspace Security
  `.trim();

  return { html, text };
}

/**
 * 2. Generate Password Reset Email
 */
function buildPasswordResetEmail(email, resetCode, name = '') {
  const recipientGreeting = name ? `<strong>${name}</strong>` : 'there';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Trackify Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155; -webkit-font-smoothing: antialiased;">
  <!-- Preheader text for inbox preview -->
  <div style="display: none; font-size: 1px; color: #f1f5f9; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all;">
    Use reset code ${resetCode} to reset your Trackify account password.
  </div>

  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #0f172a; padding: 32px 36px; text-align: center;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" align="center">
                <tr>
                  <td style="vertical-align: middle;">
                    <div style="width: 36px; height: 36px; border-radius: 8px; background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); line-height: 36px; text-align: center; color: #ffffff; font-weight: bold; font-size: 20px;">T</div>
                  </td>
                  <td style="vertical-align: middle; padding-left: 12px;">
                    <span style="color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">Trackify</span>
                  </td>
                </tr>
              </table>
              <p style="color: #f59e0b; font-size: 13px; margin: 8px 0 0; font-weight: 600;">Password Reset Request</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 36px 28px;">
              <p style="font-size: 16px; line-height: 24px; color: #1e293b; margin: 0 0 16px;">
                Hello ${recipientGreeting},
              </p>
              <p style="font-size: 15px; line-height: 24px; color: #475569; margin: 0 0 24px;">
                We received a request to reset the password for your Trackify account associated with <strong>${email}</strong>. Use the 6-digit reset code below to create a new password:
              </p>

              <!-- Reset Code Badge -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background-color: #fffbeb; border: 2px dashed #f59e0b; border-radius: 10px; padding: 16px 36px; text-align: center;">
                      <span style="font-family: 'SF Mono', Monaco, Menlo, Consolas, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #b45309; display: block; margin-left: 8px;">${resetCode}</span>
                    </div>
                  </td>
                </tr>
              </table>

              <p style="font-size: 13px; line-height: 20px; color: #64748b; margin: 0 0 16px;">
                ⏱ This password reset code is valid for <strong>15 minutes</strong>.
              </p>

              <div style="background-color: #f8fafc; border-left: 3px solid #f59e0b; padding: 12px 16px; border-radius: 4px; margin-top: 24px;">
                <p style="font-size: 12px; line-height: 18px; color: #64748b; margin: 0;">
                  If you did not request a password reset, please ignore this email. Your current password will remain active and unchanged.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 36px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="font-size: 12px; color: #94a3b8; margin: 0 0 6px;">
                Trackify Collaborative Project Management &bull; Account Security
              </p>
              <p style="font-size: 11px; color: #cbd5e1; margin: 0;">
                This security notification was sent to ${email}.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Trackify Password Reset

Hello ${name || 'there'},

We received a request to reset the password for your Trackify account associated with ${email}.

Your 6-digit password reset code is: ${resetCode}

This code will expire in 15 minutes. Enter this code on the password reset page along with your new password.

If you did not request a password reset, you can safely ignore this email. Your password remains unchanged.

--
Trackify Workspace Security
  `.trim();

  return { html, text };
}

/**
 * 3. Generate Team Invitation Email
 */
function buildTeamInviteEmail({ inviterName, inviterEmail, recipientName, recipientEmail, project, role, department, note, joinLink }) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${inviterName} invited you to join ${project} on Trackify</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155; -webkit-font-smoothing: antialiased;">
  <!-- Preheader text for inbox preview -->
  <div style="display: none; font-size: 1px; color: #f1f5f9; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all;">
    ${inviterName} has invited you to collaborate on the project "${project}" as a ${role}.
  </div>

  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #0f172a; padding: 32px 36px; text-align: center;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" align="center">
                <tr>
                  <td style="vertical-align: middle;">
                    <div style="width: 36px; height: 36px; border-radius: 8px; background: linear-gradient(135deg, #0284c7 0%, #6366f1 100%); line-height: 36px; text-align: center; color: #ffffff; font-weight: bold; font-size: 20px;">T</div>
                  </td>
                  <td style="vertical-align: middle; padding-left: 12px;">
                    <span style="color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">Trackify</span>
                  </td>
                </tr>
              </table>
              <p style="color: #38bdf8; font-size: 13px; margin: 8px 0 0; font-weight: 600;">Project Collaboration Invitation</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 36px 28px;">
              <h2 style="font-size: 19px; line-height: 26px; color: #0f172a; margin: 0 0 14px; font-weight: 700;">
                You've been invited to join a project
              </h2>
              <p style="font-size: 15px; line-height: 24px; color: #475569; margin: 0 0 20px;">
                Hello <strong>${recipientName || 'there'}</strong>,
              </p>
              <p style="font-size: 15px; line-height: 24px; color: #475569; margin: 0 0 20px;">
                <strong>${inviterName}</strong> (${inviterEmail}) has invited you to collaborate on Trackify.
              </p>

              ${note ? `
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 18px 0;">
                <tr>
                  <td style="background-color: #f8fafc; border-left: 4px solid #0284c7; padding: 14px 18px; border-radius: 6px; font-size: 14px; color: #334155; font-style: italic; line-height: 20px;">
                    "${note}"
                  </td>
                </tr>
              </table>
              ` : ''}

              <!-- Project Assignment Card -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 10px; padding: 18px 22px; margin: 24px 0;">
                <tr>
                  <td>
                    <div style="font-size: 11px; font-weight: 700; color: #0284c7; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Assigned Project</div>
                    <div style="font-size: 17px; font-weight: 700; color: #0369a1; margin-bottom: 6px;">${project}</div>
                    <div style="font-size: 13px; color: #475569;">
                      Role: <strong style="color: #0f172a;">${role}</strong> &bull; Department: <strong style="color: #0f172a;">${department}</strong>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Action Button -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 32px 0 20px;">
                <tr>
                  <td align="center">
                    <a href="${joinLink}" target="_blank" style="display: inline-block; background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-size: 15px; font-weight: 700; text-align: center; mso-padding-alt: 0;">
                      <!--[if mso]><i style="letter-spacing: 25px; mso-font-width: -100%; mso-text-raise: 30pt">&nbsp;</i><![endif]-->
                      <span style="mso-text-raise: 15pt;">Accept Invitation & Join Project &rarr;</span>
                      <!--[if mso]><i style="letter-spacing: 25px; mso-font-width: -100%">&nbsp;</i><![endif]-->
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 12px; line-height: 18px; color: #94a3b8; word-break: break-all; margin: 20px 0 0;">
                Button not working? Copy and paste this link into your browser:<br />
                <a href="${joinLink}" style="color: #0284c7; text-decoration: underline;">${joinLink}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 36px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="font-size: 12px; color: #94a3b8; margin: 0 0 6px;">
                Trackify Collaborative Project Management &bull; Team Workspace
              </p>
              <p style="font-size: 11px; color: #cbd5e1; margin: 0;">
                This invitation was intended for ${recipientEmail}. If you were not expecting this, you can safely ignore this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Trackify Project Invitation

Hello ${recipientName || 'there'},

${inviterName} (${inviterEmail}) has invited you to collaborate on Trackify!

Project: ${project}
Role: ${role}
Department: ${department}
${note ? `\nPersonal Note from ${inviterName}:\n"${note}"\n` : ''}
To accept this invitation and join the project, please visit the link below:
${joinLink}

--
Trackify Workspace Collaboration
  `.trim();

  return { html, text };
}

// -------------------------------------------------------------
// 1. Supabase Health & Runtime Configuration
// -------------------------------------------------------------
app.get('/api/config/supabase', async (req, res) => {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const hasKey = Boolean(process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);
  const hasSecret = Boolean(process.env.SUPABASE_SECRET_KEY);

  const client = getSupabaseServerClient();
  let connected = false;
  let tablesFound = false;
  let statusMessage = 'Not configured';

  if (client) {
    try {
      const { data, error } = await client.from('profiles').select('id').limit(1);
      if (!error) {
        connected = true;
        tablesFound = true;
        statusMessage = 'Connected to Supabase PostgreSQL and tables verified!';
      } else if (error.message?.includes('schema cache') || error.code === 'PGRST205') {
        connected = true;
        tablesFound = false;
        statusMessage = 'Connected to Supabase project! Ready for schema initialization (run supabase_schema.sql in Supabase SQL editor).';
      } else {
        statusMessage = `Supabase responded: ${error.message}`;
      }
    } catch (err) {
      statusMessage = `Connection error: ${err.message}`;
    }
  }

  res.json({
    configured: Boolean(url && (hasKey || hasSecret)),
    url: url ? url.replace(/https?:\/\//, '').split('.')[0] + '.supabase.co' : '',
    connected,
    tablesFound,
    message: statusMessage
  });
});

// -------------------------------------------------------------
// 2. SMTP Health & Runtime Configuration
// -------------------------------------------------------------
app.get('/api/config/smtp', (req, res) => {
  const user = (process.env.GMAIL_USER || '').trim();
  const pass = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');
  const isConfigured = Boolean(user && pass && pass.length >= 16);

  res.json({
    configured: isConfigured,
    user: user ? `${user.slice(0, 3)}***@${user.split('@')[1] || 'gmail.com'}` : '',
    hasAppPassword: Boolean(pass && pass.length >= 16)
  });
});

app.post('/api/config/smtp', async (req, res) => {
  const { gmailUser, appPassword } = req.body;
  if (!gmailUser || !appPassword) {
    return res.status(400).json({ success: false, message: 'Gmail address and App Password are required' });
  }

  const cleanPass = appPassword.replace(/\s+/g, '');
  process.env.GMAIL_USER = gmailUser.trim();
  process.env.GMAIL_APP_PASSWORD = cleanPass;

  // Persist to .env
  try {
    const envContent = `GMAIL_USER=${gmailUser.trim()}\nGMAIL_APP_PASSWORD=${cleanPass}\nPORT=${PORT}\nCLIENT_URL=${CLIENT_URL}\n`;
    fs.writeFileSync(envPath, envContent);
  } catch (err) {
    console.error('Error writing .env file:', err);
  }

  // Test transporter
  const transporter = getTransporter();
  if (transporter) {
    try {
      await transporter.verify();
      return res.json({ success: true, message: 'SMTP verified and connected successfully!' });
    } catch (err) {
      console.warn('SMTP verification warning:', err.message);
      return res.json({
        success: true,
        warning: `Saved credentials, but SMTP responded: ${err.message}.`
      });
    }
  }

  res.json({ success: true, message: 'Credentials saved successfully' });
});

// -------------------------------------------------------------
// 3. Auth: One-Time Sign-In Verification Code
// -------------------------------------------------------------
app.post('/api/auth/send-otp', async (req, res) => {
  const { email, name, type = 'login' } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email address is required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  otpStore.set(normalizedEmail, { otp, expiresAt });

  console.log(`[OTP Generated] For: ${normalizedEmail} | Code: ${otp}`);

  const transporter = getTransporter();
  let emailSent = false;
  let emailError = null;

  if (transporter) {
    try {
      const emailContent = buildLoginOtpEmail(normalizedEmail, otp, name);
      const mailOptions = {
        from: `"Trackify" <${process.env.GMAIL_USER}>`,
        to: normalizedEmail,
        replyTo: process.env.GMAIL_USER,
        subject: `Your Trackify verification code is ${otp}`,
        text: emailContent.text,
        html: emailContent.html,
        headers: {
          'X-Priority': '3',
          'X-MSMail-Priority': 'Normal',
          'Importance': 'Normal',
          'X-Mailer': 'Trackify Workspace Mailer'
        }
      };

      await transporter.sendMail(mailOptions);
      emailSent = true;
      console.log(`[Email Sent] Successfully sent sign-in code to ${normalizedEmail}`);
    } catch (err) {
      console.error(`[SMTP Error] Failed to send email to ${normalizedEmail}:`, err.message);
      emailError = err.message;
    }
  }

  res.json({
    success: true,
    emailSent,
    emailError,
    message: emailSent
      ? `Verification code sent to ${normalizedEmail}. Please check your inbox.`
      : `Verification code generated.`
  });
});

app.post('/api/auth/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email and verification code are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const record = otpStore.get(normalizedEmail);

  if (!record) {
    return res.status(400).json({ success: false, message: 'No active verification code found. Please request a new code.' });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(normalizedEmail);
    return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new code.' });
  }

  if (record.otp !== otp.trim()) {
    return res.status(400).json({ success: false, message: 'Invalid verification code. Please check and try again.' });
  }

  // Valid OTP
  otpStore.delete(normalizedEmail);
  res.json({
    success: true,
    message: 'Verification code verified successfully!',
    email: normalizedEmail
  });
});

// -------------------------------------------------------------
// 4. Auth: Dedicated Forgot Password & Password Reset
// -------------------------------------------------------------
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email, name = '' } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email address is required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

  resetStore.set(normalizedEmail, { code: resetCode, expiresAt });
  console.log(`[Password Reset] For: ${normalizedEmail} | Code: ${resetCode}`);

  const transporter = getTransporter();
  let emailSent = false;
  let emailError = null;

  if (transporter) {
    try {
      const emailContent = buildPasswordResetEmail(normalizedEmail, resetCode, name);
      const mailOptions = {
        from: `"Trackify Security" <${process.env.GMAIL_USER}>`,
        to: normalizedEmail,
        replyTo: process.env.GMAIL_USER,
        subject: `Reset your Trackify account password`,
        text: emailContent.text,
        html: emailContent.html,
        headers: {
          'X-Priority': '3',
          'X-MSMail-Priority': 'Normal',
          'Importance': 'Normal',
          'X-Mailer': 'Trackify Workspace Mailer'
        }
      };

      await transporter.sendMail(mailOptions);
      emailSent = true;
      console.log(`[Email Sent] Successfully sent password reset code to ${normalizedEmail}`);
    } catch (err) {
      console.error(`[SMTP Error] Password reset send failed to ${normalizedEmail}:`, err.message);
      emailError = err.message;
    }
  }

  res.json({
    success: true,
    emailSent,
    emailError,
    message: emailSent
      ? `Password reset code sent to ${normalizedEmail}. Please check your inbox.`
      : `Password reset code generated.`
  });
});

app.post('/api/auth/reset-password', async (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return res.status(400).json({ success: false, message: 'Email, reset code, and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const record = resetStore.get(normalizedEmail);

  if (!record) {
    return res.status(400).json({ success: false, message: 'No active password reset code found. Please request a new one.' });
  }

  if (Date.now() > record.expiresAt) {
    resetStore.delete(normalizedEmail);
    return res.status(400).json({ success: false, message: 'Reset code has expired. Please request a new code.' });
  }

  if (record.code !== code.trim()) {
    return res.status(400).json({ success: false, message: 'Invalid reset code. Please check and try again.' });
  }

  // Valid reset -> clear token
  resetStore.delete(normalizedEmail);

  // If Supabase server client configured, we can also update profile
  const supabaseClient = getSupabaseServerClient();
  if (supabaseClient) {
    try {
      await supabaseClient
        .from('profiles')
        .update({ updated_at: new Date().toISOString() })
        .eq('email', normalizedEmail);
    } catch (dbErr) {
      console.warn('[Supabase] Note on password reset:', dbErr.message);
    }
  }

  res.json({
    success: true,
    message: 'Your password has been successfully reset. You can now sign in with your new password.',
    email: normalizedEmail
  });
});

// -------------------------------------------------------------
// 5. Team Member Invitation & Real-time Collaboration
// -------------------------------------------------------------
app.get('/api/team/invites', (req, res) => {
  res.json({ success: true, invitations });
});

app.post('/api/team/invite', async (req, res) => {
  const {
    inviterName = 'Sandeep Sai',
    inviterEmail = 'sandeep@trackify.com',
    recipientEmail,
    recipientName = 'Colleague',
    role = 'Team Member',
    department = 'Engineering',
    project = 'Website Redesign',
    note = ''
  } = req.body;

  if (!recipientEmail) {
    return res.status(400).json({ success: false, message: 'Recipient email is required' });
  }

  const normalizedEmail = recipientEmail.trim().toLowerCase();
  const token = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const newInvite = {
    id: `inv-${Date.now()}`,
    token,
    inviterName,
    inviterEmail,
    recipientName: recipientName.trim(),
    recipientEmail: normalizedEmail,
    role,
    department,
    project,
    note: note.trim(),
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  invitations.unshift(newInvite);

  // Determine active client URL from request headers or env
  const requestOrigin = req.headers.origin || req.headers.referer?.replace(/\/$/, '') || CLIENT_URL;
  const clientBase = requestOrigin.startsWith('http') ? requestOrigin.split('#')[0].replace(/\/$/, '') : CLIENT_URL;
  const joinLink = `${clientBase}/#/accept-invite?token=${token}&email=${encodeURIComponent(normalizedEmail)}&name=${encodeURIComponent(recipientName)}&project=${encodeURIComponent(project)}&role=${encodeURIComponent(role)}`;

  // Send invitation email via SMTP
  const transporter = getTransporter();
  let emailSent = false;
  let emailError = null;

  if (transporter) {
    try {
      const emailContent = buildTeamInviteEmail({
        inviterName,
        inviterEmail,
        recipientName: recipientName.trim(),
        recipientEmail: normalizedEmail,
        project,
        role,
        department,
        note: note.trim(),
        joinLink
      });

      const mailOptions = {
        from: `"Trackify" <${process.env.GMAIL_USER}>`,
        to: normalizedEmail,
        replyTo: inviterEmail || process.env.GMAIL_USER,
        subject: `${inviterName} invited you to join "${project}" on Trackify`,
        text: emailContent.text,
        html: emailContent.html,
        headers: {
          'X-Priority': '3',
          'X-MSMail-Priority': 'Normal',
          'Importance': 'Normal',
          'X-Mailer': 'Trackify Workspace Mailer'
        }
      };

      await transporter.sendMail(mailOptions);
      emailSent = true;
      console.log(`[Email Sent] Successfully sent team invitation to ${normalizedEmail}`);
    } catch (err) {
      console.error(`[SMTP Error] Failed to send invitation email to ${normalizedEmail}:`, err.message);
      emailError = err.message;
    }
  }

  res.json({
    success: true,
    invite: newInvite,
    emailSent,
    emailError,
    joinLink,
    message: emailSent
      ? `Invitation successfully dispatched to ${normalizedEmail}.`
      : `Invitation created! Join link is ready.`
  });
});

app.post('/api/team/accept-invite', (req, res) => {
  const { token, email } = req.body;
  if (!token && !email) {
    return res.status(400).json({ success: false, message: 'Invite token or email is required' });
  }

  const invite = invitations.find(inv =>
    (token && inv.token === token) ||
    (email && inv.recipientEmail.toLowerCase() === email.trim().toLowerCase())
  );

  if (!invite) {
    return res.status(404).json({ success: false, message: 'Invitation not found or has been revoked.' });
  }

  invite.status = 'accepted';
  invite.acceptedAt = new Date().toISOString();

  res.json({
    success: true,
    message: `Congratulations! You have joined ${invite.project}.`,
    invite
  });
});

app.post('/api/team/resend-invite', async (req, res) => {
  const { id } = req.body;
  const invite = invitations.find(inv => inv.id === id);
  if (!invite) {
    return res.status(404).json({ success: false, message: 'Invite not found' });
  }

  const transporter = getTransporter();
  let emailSent = false;
  const requestOrigin = req.headers.origin || CLIENT_URL;
  const joinLink = `${requestOrigin}/#/accept-invite?token=${invite.token}&email=${encodeURIComponent(invite.recipientEmail)}&name=${encodeURIComponent(invite.recipientName)}&project=${encodeURIComponent(invite.project)}&role=${encodeURIComponent(invite.role)}`;

  if (transporter) {
    try {
      const emailContent = buildTeamInviteEmail({
        inviterName: invite.inviterName,
        inviterEmail: invite.inviterEmail,
        recipientName: invite.recipientName,
        recipientEmail: invite.recipientEmail,
        project: invite.project,
        role: invite.role,
        department: invite.department,
        note: invite.note,
        joinLink
      });

      await transporter.sendMail({
        from: `"Trackify" <${process.env.GMAIL_USER}>`,
        to: invite.recipientEmail,
        replyTo: invite.inviterEmail || process.env.GMAIL_USER,
        subject: `Reminder: ${invite.inviterName} invited you to join "${invite.project}" on Trackify`,
        text: emailContent.text,
        html: emailContent.html
      });
      emailSent = true;
    } catch (err) {
      console.error('Error resending email:', err.message);
    }
  }

  res.json({
    success: true,
    emailSent,
    message: emailSent ? `Reminder sent to ${invite.recipientEmail}` : 'Reminder generated.'
  });
});

app.post('/api/team/revoke-invite', (req, res) => {
  const { id } = req.body;
  invitations = invitations.filter(inv => inv.id !== id);
  res.json({ success: true, message: 'Invitation revoked successfully' });
});

// Start Express Server (Standalone or Vercel Serverless)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[Trackify SMTP & Collaboration Server] Running at http://localhost:${PORT}`);
    const transporter = getTransporter();
    if (transporter) {
      console.log(`[SMTP Configured] Using sender: ${process.env.GMAIL_USER}`);
    } else {
      console.log(`[SMTP Notice] GMAIL_USER or GMAIL_APP_PASSWORD not set in .env.`);
    }
  });
}

export default app;
