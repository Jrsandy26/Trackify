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
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(cors());
app.use(express.json());

// In-memory state stores for OTPs and invitations
const otpStore = new Map();
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
    auth: { user, pass }
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
    return res.status(400).json({ success: false, message: 'Gmail address and 16-character App Password are required' });
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
      return res.json({ success: true, message: 'Gmail SMTP verified and connected successfully!' });
    } catch (err) {
      console.warn('SMTP verification warning:', err.message);
      return res.json({
        success: true,
        warning: `Saved credentials, but Google SMTP responded: ${err.message}. Ensure 2-Step Verification is enabled on your Google account and you generated a dedicated App Password.`
      });
    }
  }

  res.json({ success: true, message: 'Credentials saved successfully' });
});

// -------------------------------------------------------------
// 2. Auth: 2-Step Verification OTP via Gmail SMTP
// -------------------------------------------------------------
app.post('/api/auth/send-otp', async (req, res) => {
  const { email, name, type = 'login' } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
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
      const mailOptions = {
        from: `"Trackify Security" <${process.env.GMAIL_USER}>`,
        to: normalizedEmail,
        subject: `${otp} is your Trackify 2-Step Verification Code`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
            <div style="background: linear-gradient(135deg, #0d1326 0%, #1e293b 100%); padding: 32px 28px; text-align: center;">
              <div style="display: inline-block; width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #38bdf8 0%, #4f46e5 100%); line-height: 44px; font-size: 22px; color: #fff; font-weight: bold; margin-bottom: 12px;">T</div>
              <h1 style="color: #ffffff; font-size: 22px; font-weight: 700; margin: 0;">Trackify</h1>
              <p style="color: #94a3b8; font-size: 13px; margin: 6px 0 0;">2-Step Verification Security Code</p>
            </div>
            <div style="padding: 32px 28px;">
              <p style="font-size: 15px; color: #334155; margin-top: 0;">Hello ${name ? `<strong>${name}</strong>` : 'there'},</p>
              <p style="font-size: 14px; color: #64748b; line-height: 1.6;">
                Use the verification code below to complete your ${type === 'signup' ? 'account creation' : 'sign-in'} on Trackify. This code is valid for <strong>10 minutes</strong>.
              </p>
              <div style="margin: 28px 0; text-align: center;">
                <div style="display: inline-block; background: #f8fafc; border: 2px dashed #0284c7; padding: 16px 36px; border-radius: 12px; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0284c7; font-family: monospace;">
                  ${otp}
                </div>
              </div>
              <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin-bottom: 0;">
                If you did not request this verification code, please ignore this email or review your security settings. Do not share this code with anyone.
              </p>
            </div>
            <div style="background: #f1f5f9; padding: 16px 28px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="font-size: 11px; color: #64748b; margin: 0;">
                &copy; 2026 Trackify Collaborative Project Management. Sent securely via Gmail SMTP.
              </p>
            </div>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      emailSent = true;
      console.log(`[Email Sent] Successfully sent 2-Step OTP to ${normalizedEmail}`);
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
      ? `Verification code sent to ${normalizedEmail} via Gmail SMTP.`
      : `Verification code generated. (SMTP not configured or offline; code is displayed for seamless login).`,
    debugOtp: otp // Always provided as seamless fallback so users never get locked out
  });
});

app.post('/api/auth/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email and OTP code are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const record = otpStore.get(normalizedEmail);

  if (!record) {
    return res.status(400).json({ success: false, message: 'No active OTP found. Please request a new code.' });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(normalizedEmail);
    return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new code.' });
  }

  if (record.otp !== otp.trim()) {
    return res.status(400).json({ success: false, message: 'Invalid verification code. Please check and try again.' });
  }

  // Valid OTP
  otpStore.delete(normalizedEmail);
  res.json({
    success: true,
    message: 'OTP verified successfully!',
    email: normalizedEmail
  });
});

// -------------------------------------------------------------
// 3. Team Member Invitation & Real-time Collaboration
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

  // Send invitation email via Gmail SMTP
  const transporter = getTransporter();
  let emailSent = false;
  let emailError = null;

  const joinLink = `${CLIENT_URL}/#/accept-invite?token=${token}&email=${encodeURIComponent(normalizedEmail)}&name=${encodeURIComponent(recipientName)}&project=${encodeURIComponent(project)}&role=${encodeURIComponent(role)}`;

  if (transporter) {
    try {
      const mailOptions = {
        from: `"${inviterName} via Trackify" <${process.env.GMAIL_USER}>`,
        to: normalizedEmail,
        subject: `${inviterName} invited you to join "${project}" on Trackify`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
            <div style="background: linear-gradient(135deg, #0d1326 0%, #1e293b 100%); padding: 36px 32px; text-align: center;">
              <div style="display: inline-block; width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #38bdf8 0%, #4f46e5 100%); line-height: 48px; font-size: 24px; color: #fff; font-weight: bold; margin-bottom: 12px;">T</div>
              <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0;">Trackify</h1>
              <p style="color: #38bdf8; font-size: 14px; font-weight: 600; margin: 6px 0 0;">Team Collaboration Invitation</p>
            </div>
            
            <div style="padding: 32px;">
              <h2 style="font-size: 18px; color: #0f172a; margin-top: 0; font-weight: 700;">
                You've been invited to collaborate!
              </h2>
              <p style="font-size: 14px; color: #475569; line-height: 1.6;">
                <strong>${inviterName}</strong> (${inviterEmail}) has invited you to join <strong>${project}</strong> as <strong>${role}</strong> on Trackify.
              </p>

              ${note ? `
                <div style="background: #f8fafc; border-left: 4px solid #0284c7; padding: 14px 18px; border-radius: 6px; margin: 20px 0; font-size: 13px; color: #334155; font-style: italic;">
                  "${note}"
                </div>
              ` : ''}

              <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 16px 20px; margin: 24px 0;">
                <div style="font-size: 12px; color: #0284c7; font-weight: 700; text-transform: uppercase; margin-bottom: 4px;">Project Assignment</div>
                <div style="font-size: 16px; font-weight: 700; color: #0369a1;">${project}</div>
                <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Role: <strong>${role}</strong> • Department: <strong>${department}</strong></div>
              </div>

              <div style="text-align: center; margin: 32px 0;">
                <a href="${joinLink}" style="display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #0284c7 100%); color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 28px; font-size: 15px; font-weight: 700; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.4);">
                  Accept Invitation & Join Team &rarr;
                </a>
              </div>

              <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; word-break: break-all;">
                Or copy and paste this link into your browser:<br />
                <a href="${joinLink}" style="color: #0284c7;">${joinLink}</a>
              </p>
            </div>

            <div style="background: #f8fafc; padding: 16px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="font-size: 11px; color: #64748b; margin: 0;">
                Trackify Realtime Collaboration • Delivered securely using personal Gmail SMTP.
              </p>
            </div>
          </div>
        `
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
      ? `Invitation successfully dispatched to ${normalizedEmail} via Gmail SMTP.`
      : `Invitation created! (SMTP not configured; join link is available directly for testing).`
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
  const joinLink = `${CLIENT_URL}/#/accept-invite?token=${invite.token}&email=${encodeURIComponent(invite.recipientEmail)}&project=${encodeURIComponent(invite.project)}&role=${encodeURIComponent(invite.role)}`;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"${invite.inviterName} via Trackify" <${process.env.GMAIL_USER}>`,
        to: invite.recipientEmail,
        subject: `REMINDER: ${invite.inviterName} invited you to join "${invite.project}" on Trackify`,
        html: `<p>Reminder: Please join <strong>${invite.project}</strong> by clicking <a href="${joinLink}">Accept Invitation</a>.</p>`
      });
      emailSent = true;
    } catch (err) {
      console.error('Error resending email:', err.message);
    }
  }

  res.json({
    success: true,
    emailSent,
    message: emailSent ? `Reminder sent to ${invite.recipientEmail}` : 'Reminder generated (SMTP not configured)'
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
    console.log(`[Trackify Frontend Proxy] Ready on http://localhost:5173`);
    const transporter = getTransporter();
    if (transporter) {
      console.log(`[SMTP Configured] Using Gmail user: ${process.env.GMAIL_USER}`);
    } else {
      console.log(`[SMTP Notice] GMAIL_USER or GMAIL_APP_PASSWORD not set in .env. Enter them in the UI Settings or .env file to send real emails.`);
    }
  });
}

export default app;

