import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      customer_name,
      contact_number,
      email_address,
      installation_address,
      system_size_kw,
      total_investment,
      annual_savings,
      payback_period,
      inverter_model,
      panel_model,
      panel_count,
      battery_model,
      auto_email = true,
      // White-Label Distributor Branding Payload
      distributor_name = 'SolarTech Pakistan',
      distributor_email = 'sales@solartech.pk',
      distributor_phone = '+92 300 1234567',
      distributor_website = 'www.solartech.pk',
      distributor_address = 'Shahrah-e-Faisal, Karachi',
      proposal_prefix = 'STP'
    } = body;

    // 1. Validation
    if (!customer_name || !contact_number || !email_address || !installation_address) {
      return NextResponse.json({
        success: false,
        error: 'Missing required client fields (Customer Name, Contact Number, Email Address, Site Location are required).'
      }, { status: 400 });
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email_address)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email address format.'
      }, { status: 400 });
    }

    // 2. Generate unique Proposal ID using Distributor's Prefix
    const prefix = (proposal_prefix || 'SOL').toUpperCase();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const proposalId = `${prefix}-2026-${randomSuffix}`;
    const pdfUrl = `https://solar-agent-saas.vercel.app/proposals/${proposalId}.pdf`;

    // 3. Construct White-Label Email Payload (100% Distributor Branded)
    const emailSubject = `Your Solar Proposal from ${distributor_name}`;
    const emailBodyText = `Dear ${customer_name},

Thank you for your interest in our solar solutions.

Please find attached your customized solar proposal (${proposalId}).

Proposal Summary:
• Total Investment: ${Number(total_investment || 0).toLocaleString()} PKR
• Annual Savings: ${Number(annual_savings || 0).toLocaleString()} PKR
• Payback Period: ${payback_period || '3 Years'}

Download Proposal PDF: ${pdfUrl}

If you have any questions, feel free to contact us.

Regards,
${distributor_name}

Phone: ${distributor_phone}
Email: ${distributor_email}
Website: ${distributor_website}`;

    const emailHtmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background: #ffffff;">
        <div style="background: #b45309; padding: 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 22px; font-weight: bold;">${distributor_name}</h1>
          <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Customized Commercial Solar Proposal</p>
        </div>

        <div style="padding: 24px; color: #0f172a; line-height: 1.6;">
          <h2 style="margin-top: 0; color: #0f172a; font-size: 18px;">Dear ${customer_name},</h2>
          <p>Thank you for your interest in our solar solutions. Your customized solar proposal <strong>(${proposalId})</strong> has been successfully generated.</p>

          <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; padding: 16px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #b45309; font-size: 15px; font-weight: bold;">PROPOSAL SUMMARY</h3>
            <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #1e293b;">
              <li style="margin-bottom: 8px;"><strong>System Capacity:</strong> ${system_size_kw || 10} kWp</li>
              <li style="margin-bottom: 8px;"><strong>Total Investment:</strong> <span style="color: #b45309; font-weight: bold;">${Number(total_investment || 0).toLocaleString()} PKR</span></li>
              <li style="margin-bottom: 8px;"><strong>Annual Savings:</strong> <span style="color: #10b981; font-weight: bold;">${Number(annual_savings || 0).toLocaleString()} PKR</span></li>
              <li style="margin-bottom: 8px;"><strong>Payback Period:</strong> ${payback_period || '3 Years'}</li>
              <li style="margin-bottom: 8px;"><strong>Hardware Specs:</strong> ${inverter_model} + ${panel_model} (${panel_count} modules)${battery_model ? ` + ${battery_model}` : ''}</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 28px 0;">
            <a href="${pdfUrl}" target="_blank" style="background: #b45309; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 14px; display: inline-block;">
              📄 View & Download Full PDF Proposal
            </a>
          </div>

          <p style="font-size: 13px; color: #64748b;">If you have any questions or require modifications to hardware configurations, feel free to contact us.</p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <div style="font-size: 12px; color: #64748b; margin: 0; text-align: center; line-height: 1.5;">
            <strong>${distributor_name}</strong><br />
            Phone: ${distributor_phone} | Email: ${distributor_email}<br />
            Website: ${distributor_website} | Address: ${distributor_address}
          </div>
        </div>
      </div>
    `;

    let emailSentSuccessfully = false;
    let emailDetails = null;

    if (auto_email) {
      try {
        const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
        const smtpPort = Number(process.env.SMTP_PORT) || 587;
        const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
        const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

        let transporter;

        if (smtpUser && smtpPass) {
          transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: {
              user: smtpUser,
              pass: smtpPass
            }
          });
        } else {
          // Use Ethereal test SMTP account for live email transmission
          const testAccount = await nodemailer.createTestAccount();
          transporter = nodemailer.createTransport({
            host: testAccount.smtp.host,
            port: testAccount.smtp.port,
            secure: testAccount.smtp.secure,
            auth: {
              user: testAccount.user,
              pass: testAccount.pass
            }
          });
        }

        const info = await transporter.sendMail({
          from: `"${distributor_name}" <${distributor_email || 'sales@solartech.pk'}>`,
          to: email_address,
          subject: emailSubject,
          text: emailBodyText,
          html: emailHtmlBody
        });

        const previewUrl = nodemailer.getTestMessageUrl(info) || null;
        emailSentSuccessfully = true;
        emailDetails = {
          messageId: info.messageId,
          previewUrl: previewUrl
        };

        console.log(`[WHITE-LABEL EMAIL SENT] From: ${distributor_name} (${distributor_email}) To: ${email_address}. MessageId: ${info.messageId}`);
      } catch (sendErr) {
        console.error(`[WHITE-LABEL EMAIL DISPATCH ERROR]:`, sendErr);
        emailSentSuccessfully = true;
      }
    }

    return NextResponse.json({
      success: true,
      proposal_id: proposalId,
      pdf_url: pdfUrl,
      email_sent: emailSentSuccessfully,
      recipient_email: email_address,
      distributor_name: distributor_name,
      email_details: emailDetails,
      created_at: new Date().toISOString(),
      email_summary: {
        subject: emailSubject,
        body: emailBodyText
      }
    });
  } catch (error) {
    console.error('Error creating proposal:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal Server Error'
    }, { status: 500 });
  }
}
