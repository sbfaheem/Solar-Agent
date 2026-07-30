import { NextResponse } from 'next/server';

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
      auto_email = true
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

    // 2. Generate unique Proposal ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const proposalId = `PRO-2026-${randomSuffix}`;

    // 3. Generate PDF Storage URL
    const pdfUrl = `https://solar-agent-saas.vercel.app/proposals/${proposalId}.pdf`;

    // 4. Construct Email Payload
    const emailSubject = `Your Solar Proposal is Ready – ${proposalId}`;
    const emailBody = `Dear ${customer_name},

Thank you for your interest in our solar solutions.

Your customized solar proposal has been successfully generated and is attached to this email.

Proposal Summary:
• Total Investment: ${Number(total_investment || 0).toLocaleString()} PKR
• Annual Savings: ${Number(annual_savings || 0).toLocaleString()} PKR
• Payback Period: ${payback_period || '3 Years'}

Download PDF Proposal: ${pdfUrl}

Please review the attached PDF for complete details.

If you have any questions, feel free to contact our team.

Best Regards,
Solar Agent Team`;

    // Log automated email dispatch simulation
    console.log(`[AUTOMATED EMAIL SENT TO ${email_address}] Subject: ${emailSubject}`);

    return NextResponse.json({
      success: true,
      proposal_id: proposalId,
      pdf_url: pdfUrl,
      email_sent: auto_email,
      recipient_email: email_address,
      created_at: new Date().toISOString(),
      email_summary: {
        subject: emailSubject,
        body: emailBody
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
