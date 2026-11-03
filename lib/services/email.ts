import { Resend } from 'resend'
import { escapeHtml } from '@/lib/utils/html-escape'
import { PATTERNS } from '@/lib/services/validation'
import { canSendThankYouEmail, markThankYouEmailSent } from '@/lib/services/email-deduplicator'

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string
  headers?: Record<string, string>
}

interface EmailServiceConfig {
  hasGmail: boolean
  hasResend: boolean
  gmailUser?: string
  gmailAppPassword?: string
  resendApiKey?: string
  senderEmail: string
  recipientEmail: string
}


// Get email service configuration
export function getEmailConfig(): EmailServiceConfig {
  return {
    hasGmail: !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD),
    hasResend: !!process.env.RESEND_API_KEY,
    gmailUser: process.env.GMAIL_USER,
    gmailAppPassword: process.env.GMAIL_APP_PASSWORD,
    resendApiKey: process.env.RESEND_API_KEY,
    senderEmail: process.env.EMAIL_FROM || 'Medivisor India Treatment <noreply@noreply.medivisorhealth.com>',
    recipientEmail: process.env.EMAIL_TO || 'info@medivisorhealth.com',
  }
}

// Check if any email service is configured
export function isEmailServiceConfigured(): boolean {
  const config = getEmailConfig()
  return config.hasGmail || config.hasResend
}

// Send email using Gmail SMTP
async function sendViaGmail(options: EmailOptions, config: EmailServiceConfig): Promise<void> {
  if (!config.gmailUser || !config.gmailAppPassword) {
    throw new Error('Gmail credentials not configured')
  }

  const { createTransport } = await import('nodemailer')
  const transporter = createTransport({
    service: 'gmail',
    auth: {
      user: config.gmailUser,
      pass: config.gmailAppPassword,
    },
  })

  await transporter.sendMail({
    from: options.from || config.senderEmail,
    to: options.to || config.recipientEmail,
    subject: options.subject,
    html: options.html,
    text: options.text,
    replyTo: options.replyTo,
  })
}

// Send email using Resend
export async function sendViaResend(options: EmailOptions, config: EmailServiceConfig): Promise<void> {
  if (!config.resendApiKey) {
    throw new Error('RESEND_API_KEY not configured')
  }

  const resend = new Resend(config.resendApiKey)
  const from = options.from || config.senderEmail

  await resend.emails.send({
    from,
    to: options.to || config.recipientEmail,
    subject: options.subject,
    html: options.html,
    text: options.text,
    replyTo: options.replyTo,
  })
}

// Main email sending function - tries Gmail first, falls back to Resend
export async function sendEmail(options: EmailOptions): Promise<void> {
  const config = getEmailConfig()

  if (!config.hasGmail && !config.hasResend) {
    throw new Error('No email service configured. Set RESEND_API_KEY or GMAIL_USER/GMAIL_APP_PASSWORD')
  }

  // Try Gmail first if configured
  if (config.hasGmail) {
    try {
      await sendViaGmail(options, config)
      return
    } catch (error) {
      console.error('[Email] Gmail SMTP failed, trying Resend:', error)
    }
  }

  // Fallback to Resend
  if (config.hasResend) {
    try {
      await sendViaResend(options, config)
      return
    } catch (error) {
      console.error('[Email] Resend failed:', error)
      throw error
    }
  }

  throw new Error('Failed to send email via all configured services')
}

// Generate HTML email template for contact form
export function generateContactFormEmailHtml(
  name: string,
  email: string,
  countryName: string,
  whatsappNumber: string,
  message: string
): string {
  const s = escapeHtml

  return `
  <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333; line-height: 1.6;">
    <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #f9f9f9;">
    <h2 style="color: #74BF44; text-align: center;">Pacific Patient Meet 2026</h2>
      <h4 style="color: #74BF44; text-align: center;">New Contact Form Submission</h4>
      <p>You have a new message from your website's contact form. Here are the details:</p>

      <div style="background-color: #fff; padding: 15px; border-radius: 6px; border: 1px solid #ddd;">
        <p style="margin: 0 0 10px;"><strong>Name:</strong> <span style="font-weight: normal;">${s(name)}</span></p>
        <p style="margin: 0 0 10px;"><strong>Email:</strong> <span style="font-weight: normal;">${s(email)}</span></p>
        <p style="margin: 0 0 10px;"><strong>Country:</strong> <span style="font-weight: normal;">${s(countryName)}</span></p>
        <p style="margin: 0 0 10px;"><strong>WhatsApp:</strong> <span style="font-weight: normal;">${s(whatsappNumber)}</span></p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="margin: 0 0 5px;"><strong>Message:</strong></p>
        <p style="white-space: pre-wrap; margin: 0; background-color: #f0f0f0; padding: 10px; border-radius: 4px;">${s(message)}</p>
      </div>

      <p style="text-align: center; margin-top: 20px; font-size: 14px; color: #888;">This email was sent from Medivisor Contact Form.</p>
    </div>
  </div>
  `
}

export function generateContactFormEmailText(
  name: string,
  email: string,
  countryName: string,
  whatsappNumber: string,
  message: string
): string {
  return `
New Contact Form Submission
===========================

Name: ${name}
Email: ${email}
Country: ${countryName}
WhatsApp: ${whatsappNumber}

Message:
${message}

---
This email was sent from the Medivisor website contact form.
  `.trim()
}

// Generate HTML email template for thank-you (user-facing)
export function generateThankYouEmailHtml(
  name: string,
  message: string,
  countryName?: string,
  recipientEmail?: string,
  whatsappNumber?: string,
): string {
  const s = escapeHtml
  const displayName = name && name.trim() ? s(name.trim()) : 'Dear Patient'
  const userEmail = recipientEmail ? s(recipientEmail) : ''
  const userCountry = countryName ? s(countryName) : ''
  const userWhatsapp = whatsappNumber ? s(whatsappNumber) : ''
  const userMessage = message ? s(message) : ''
  const currentYear = new Date().getFullYear()

  const emailLink = userEmail ? `mailto:${userEmail}` : '#'

  return `

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="format-detection" content="telephone=no">
  <meta name="x-apple-disable-message-reformatting">

  <title>Thank You - Medivisor India Treatment</title>

  <style>
    body {
      margin: 0;
      padding: 0;
      width: 100%;
      background: #f6f8fa;
      font-family: Arial, Helvetica, sans-serif;
      color: #334155;
    }

    table {
      border-spacing: 0;
      border-collapse: collapse;
    }

    img {
      border: 0;
      display: block;
    }

    a {
      text-decoration: none;
    }

    .wrapper {
      width: 100%;
      padding: 32px 16px;
      background: #f6f8fa;
    }

    .container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e5e9ee;
      border-radius: 12px;
      overflow: hidden;
    }

    /* Header */
    .header {
      padding: 28px 30px 24px;
      background: #ffffff;
      text-align: center;
      border-bottom: 1px solid #edf0f3;
    }

    .logo {
      width: 170px;
      max-width: 170px;
      height: auto;
      margin: 0 auto;
    }

    .header-line {
      width: 42px;
      height: 3px;
      margin: 20px auto 0;
      background: #29A9B9;
      border-radius: 4px;
      box-shadow: 18px 0 0 #74BF44;
    }

    /* Main */
    .content {
      padding: 34px 38px 32px;
      background: #ffffff;
    }

    .title {
      margin: 0 0 18px;
      color: #23366E;
      font-size: 21px;
      line-height: 1.4;
      font-weight: 700;
    }

    .content p {
      margin: 0 0 15px;
      color: #4b5563;
      font-size: 15px;
      line-height: 1.7;
    }

    .greeting {
      color: #23366E !important;
      font-weight: 600;
    }

    /* Simple status */
    .status {
      margin: 25px 0;
      padding: 13px 16px;
      background: #f4fbfc;
      border: 1px solid #d8eef1;
      border-radius: 8px;
      text-align: center;
    }

    .status-text {
      margin: 0 !important;
      color: #168694 !important;
      font-size: 13px !important;
      font-weight: 700;
    }

    /* Next Step */
    .next-step {
      margin: 26px 0;
      padding: 22px;
      background: #f8fafb;
      border: 1px solid #e6ebef;
      border-radius: 9px;
    }

    .next-title {
      margin: 0 0 9px;
      color: #23366E;
      font-size: 16px;
      line-height: 1.4;
      font-weight: 700;
    }

    .next-text {
      margin: 0 !important;
      color: #536170 !important;
      font-size: 14px !important;
      line-height: 1.7 !important;
    }

    .next-text a {
      color: #168b9a;
      font-weight: 600;
    }

    /* Contact */
    .contact {
      margin-top: 22px;
      padding-top: 20px;
      border-top: 1px solid #edf0f2;
    }

    .contact-label {
      margin: 0 0 5px !important;
      color: #8a95a3 !important;
      font-size: 11px !important;
      line-height: 1.4 !important;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .contact-value {
      margin: 0 !important;
      color: #23366E !important;
      font-size: 14px !important;
      line-height: 1.5 !important;
      font-weight: 600;
    }

    .contact-value a {
      color: #23366E;
    }

    /* Note */
    .note {
      margin: 26px 0 0 !important;
      color: #9aa3ad !important;
      font-size: 11px !important;
      line-height: 1.6 !important;
      text-align: center;
    }

    /* Footer */
    .footer {
      padding: 22px 30px;
      background: #f7f9fb;
      border-top: 1px solid #e9edf1;
      text-align: center;
    }

    .footer-name {
      margin: 0 0 6px;
      color: #23366E;
      font-size: 13px;
      line-height: 1.5;
      font-weight: 700;
    }

    .footer-address {
      margin: 0 0 8px;
      color: #7b8794;
      font-size: 11px;
      line-height: 1.6;
    }

    .footer-contact {
      margin: 0 0 9px;
      color: #7b8794;
      font-size: 11px;
      line-height: 1.6;
    }

    .footer-contact a {
      color: #168b9a;
    }

    .copyright {
      margin: 0;
      color: #a5adb6;
      font-size: 10px;
      line-height: 1.5;
    }

    /* Mobile */
    @media only screen and (max-width: 600px) {

      .wrapper {
        padding: 16px 10px;
      }

      .header {
        padding: 25px 20px 22px;
      }

      .logo {
        width: 150px;
        max-width: 150px;
      }

      .content {
        padding: 28px 22px;
      }

      .title {
        font-size: 19px;
      }

      .next-step {
        padding: 18px;
      }

      .footer {
        padding: 20px 18px;
      }
    }
  </style>
</head>

<body>

  <table role="presentation" width="100%" class="wrapper">
    <tr>
      <td align="center">

        <table
          role="presentation"
          width="100%"
          class="container"
        >

          <!-- HEADER -->
          <tr>
            <td class="header">

              <img
                src="https://medivisorindiatreatment.com/medivisor-logo.png"
                alt="Medivisor India Treatment"
                width="170"
                class="logo"
              >

              <div class="header-line"></div>

            </td>
          </tr>

          <!-- CONTENT -->
          <tr>
  <td class="content">

<h1 class="title">
  Dear Sir/Ma'am, ${displayName},
</h1>

<p>
  Greetings from <strong>Medivisor India Treatment!</strong>
</p>

${userEmail || userCountry || userWhatsapp || userMessage ? `<div class="details">
  ${userEmail ? `<p><strong>Email Address:</strong> <a href="${emailLink}">${userEmail}</a></p>` : ''}
  ${userCountry ? `<p><strong>Country:</strong> ${userCountry}</p>` : ''}
  ${userWhatsapp ? `<p><strong>WhatsApp:</strong> ${userWhatsapp}</p>` : ''}
  ${userMessage ? `<p><strong>Your Message:</strong> ${userMessage}</p>` : ''}
</div>` : ''}

<p>
  Thank you for submitting your appointment request. We have received
  it successfully, and our patient care team will contact you shortly
  to guide you through the next steps.
</p>

<!-- STATUS -->
<div class="status">
  <p class="status-text">
    ✓ Appointment Request Received
  </p>
</div>

<!-- NEXT STEP -->
<div class="next-step">
  <h2 class="next-title">
    Next Steps
  </h2>

  <p class="next-text">
    Please share your medical reports with our team via WhatsApp at
    <strong style="color:#23366E;">+91 83682 47758</strong>
    or email them to
    <a href="mailto:info@medivisorhealth.com">
      info@medivisorhealth.com
    </a>.
  </p>

  <p class="next-text">
    Our team will review your reports and guide you on the appropriate
    consultation and treatment options.
  </p>
</div>

<!-- CONTACT -->
<div class="contact">
  <p class="contact-label">WhatsApp</p>
  <p class="contact-value">
    <a href="https://wa.me/918340780250">
      +91 83682 47758
    </a>
  </p>
</div>

<div style="margin-top:16px;">
  <p class="contact-label">Email</p>
  <p class="contact-value">
    <a href="mailto:info@medivisorhealth.com">
      info@medivisorhealth.com
    </a>
  </p>
</div>

<p class="note">
  Our patient care team will be in touch with you shortly.
</p>


  </td>
</tr>

        </table>

        <p style="padding: 0 38px 24px; text-align: center; color: #8a95a3; font-size: 12px;">
          &copy; ${currentYear} Medivisor India Treatment
        </p>

      </td>
    </tr>
  </table>

</body>
</html>


  `
}

export function generateThankYouEmailText(
  name: string,
  message: string,
  countryName?: string,
  recipientEmail?: string,
  whatsappNumber?: string,
): string {
  const displayName = name && name.trim() ? name.trim() : 'Dear Patient'
  return `
Thank You, ${displayName}!
============================

Dear Sir/Ma'am,

Greetings from Medivisor India Treatment!

Thank you for your appointment request.

As the next step, kindly share your medical reports with us at +91 83682 47758 on WhatsApp. Our medical team will review the reports and provide you with the recommended treatment plan.

Once you receive the treatment plan, you may proceed with the appointment payment to the following account:

Account Number: 7021910158

After making the payment, kindly share the payment receipt with us. Upon verification, we will confirm your appointment slot accordingly.

We look forward to assisting you.

${countryName ? `Country: ${countryName}` : ''}
${recipientEmail ? `Email: ${recipientEmail}` : ''}
${whatsappNumber ? `WhatsApp: ${whatsappNumber}` : ''}

${message ? `Your Message:\n${message}` : ''}

---
Medivisor India Treatment
Medivisor House 359, Sector 1, Vaishali, Ghaziabad, (Delhi/NCR) India
Phone: +91 83682 47758
Email: info@medivisorhealth.com

This is an automated confirmation message. Please do not reply to this email.
  `.trim()
}

// Validate that an email address is safe to send to
function isValidEmail(email: string): boolean {
  return !!email && PATTERNS.email.test(email)
}

// Send thank-you confirmation email to the user.
// Returns true if the email was sent, false if it was skipped
// (invalid email, duplicate, or service not configured).
export async function sendThankYouEmail(
  name: string,
  email: string,
  message: string,
  countryName?: string,
  whatsappNumber?: string,
): Promise<boolean> {
  // Guard 1 — reject missing or invalid email
  if (!email || !email.trim()) {
    console.warn('[sendThankYouEmail] Skipped: recipient email is empty or missing')
    return false
  }
  const trimmedEmail = email.trim()
  if (!isValidEmail(trimmedEmail)) {
    console.warn(`[sendThankYouEmail] Skipped: invalid recipient email "${trimmedEmail}"`)
    return false
  }

  const config = getEmailConfig()

  // Guard 2 — prevent duplicate thank-you emails via in-memory dedup
  if (!canSendThankYouEmail(trimmedEmail)) {
    console.log(`[sendThankYouEmail] Skipped: already sent within dedup window for "${trimmedEmail}"`)
    return false
  }

  const from = config.senderEmail

  await sendEmail({
    from,
    to: trimmedEmail,
    replyTo: 'info@medivisorhealth.com',
    subject: `Thank You, ${name.trim() || 'Dear Patient'}! Your Appointment Request Received`,
    html: generateThankYouEmailHtml(name, message, countryName, trimmedEmail, whatsappNumber),
    text: generateThankYouEmailText(name, message, countryName, trimmedEmail, whatsappNumber),
    headers: {
      'X-Priority': '3',
      'X-MSMail-Priority': 'Normal',
      'Importance': 'Normal',
    },
  })

  // Record that a thank-you email was sent so we don't send a duplicate
  markThankYouEmailSent(trimmedEmail)
  return true
}

// Send contact form notification email to admin
export async function sendContactFormEmail(
  name: string,
  email: string,
  countryName: string,
  whatsappNumber: string,
  message: string
): Promise<void> {
  const config = getEmailConfig()
  const from = config.senderEmail

  await sendEmail({
    from,
    to: config.recipientEmail,
    replyTo: email,
    subject: `New Contact Form Submission from ${name}`,
    html: generateContactFormEmailHtml(name, email, countryName, whatsappNumber, message),
    text: generateContactFormEmailText(name, email, countryName, whatsappNumber, message),
    headers: {
      'X-Priority': '3',
      'X-MSMail-Priority': 'Normal',
      'Importance': 'Normal',
    },
  })
}
