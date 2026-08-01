import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req) {
  try {
    const body = await req.json();
    const { type, recipientEmail, recipientName, companyName, token, actionUrl } = body;

    if (!recipientEmail) {
      return NextResponse.json({ error: 'Recipient email required' }, { status: 400 });
    }

    const emailHost = process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com';
    const emailPort = Number(process.env.EMAIL_SERVER_PORT || 587);
    const emailUser = process.env.EMAIL_SERVER_USER || 'noreply@solaragent.pk';
    const emailPass = process.env.EMAIL_SERVER_PASSWORD || '';

    let subject = 'Solar Agent System Notification';
    let htmlContent = '';

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const activationLink = actionUrl || `${baseUrl}/activate-account?token=${token}`;
    const resetLink = actionUrl || `${baseUrl}/reset-password?token=${token}`;

    if (type === 'ACCOUNT_APPROVED') {
      subject = 'Your Solar Agent Distributor Account Has Been Approved';
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #0f172a; padding: 24px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 22px; font-weight: bold; color: #10b981;">SOLAR AGENT</h1>
            <p style="margin: 4px 0 0; font-size: 13px; color: #94a3b8;">B2B Solar Engineering Platform</p>
          </div>
          <div style="padding: 32px; color: #334155; line-height: 1.6;">
            <h2 style="color: #0f172a; font-size: 18px; margin-top: 0;">Account Approval Notification</h2>
            <p>Dear <strong>${companyName || recipientName || 'Distributor Partner'}</strong>,</p>
            <p>Congratulations! Your distributor account request has been officially reviewed and approved by the Super Admin.</p>
            <p>Before you can log in to your workspace, please activate your account by creating your secure password:</p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${activationLink}" style="background-color: #10b981; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">Activate Account & Create Password</a>
            </div>
            <p style="font-size: 13px; color: #64748b;"><em>Note: This activation link is secure and will expire in 24 hours.</em></p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="font-size: 12px; color: #94a3b8; margin: 0;">If you did not request this registration, please ignore this email.</p>
          </div>
        </div>
      `;
    } else if (type === 'PASSWORD_RESET') {
      subject = 'Reset Your Solar Agent Password';
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #0f172a; padding: 24px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 22px; font-weight: bold; color: #10b981;">SOLAR AGENT</h1>
          </div>
          <div style="padding: 32px; color: #334155; line-height: 1.6;">
            <h2 style="color: #0f172a; font-size: 18px; margin-top: 0;">Password Reset Request</h2>
            <p>Dear <strong>${companyName || recipientEmail}</strong>,</p>
            <p>We received a request to reset the password for your Solar Agent account.</p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetLink}" style="background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">Reset My Password</a>
            </div>
            <p style="font-size: 13px; color: #64748b;">This password reset link will expire in 1 hour.</p>
          </div>
        </div>
      `;
    }

    if (emailPass && emailUser && !emailUser.includes('noreply@solaragent.pk')) {
      const transporter = nodemailer.createTransport({
        host: emailHost,
        port: emailPort,
        secure: emailPort === 465,
        auth: { user: emailUser, pass: emailPass }
      });

      await transporter.sendMail({
        from: `"Solar Agent" <${emailUser}>`,
        to: recipientEmail,
        subject,
        html: htmlContent
      });
    }

    return NextResponse.json({
      success: true,
      message: `Email dispatched successfully to ${recipientEmail}`,
      activationLink,
      resetLink
    });

  } catch (error) {
    console.error("Auth Email Dispatch Error:", error);
    return NextResponse.json({ error: 'Failed to dispatch email', details: error.message }, { status: 500 });
  }
}
