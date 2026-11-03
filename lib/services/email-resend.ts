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
  hasResend: boolean
  resendApiKey?: string
  senderEmail: string
  recipientEmail: string
}


export function getEmailConfig(): EmailServiceConfig {
  return {
    hasResend: !!process.env.RESEND_API_KEY,
    resendApiKey: process.env.RESEND_API_KEY,
    senderEmail: process.env.EMAIL_FROM || 'Medivisor India Treatment <noreply@noreply.medivisorhealth.com>',
    recipientEmail: process.env.EMAIL_TO || 'info@medivisorhealth.com',
  }
}

export function isEmailServiceConfigured(): boolean {
  return getEmailConfig().hasResend
}

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
    headers: options.headers,
  })
}

export function generateContactFormEmailHtml(
  name: string,
  email: string,
  countryName: string,
  whatsappNumber: string,
  message: string
): string {
  const s = escapeHtml

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="format-detection" content="telephone=no">
    <title>New Contact Form Submission</title>
    <style>
      body { margin: 0; padding: 0; background-color: #f4f4f4; }
      .wrapper { width: 100%; table-layout: fixed; background-color: #f4f4f4; padding-bottom: 40px; }
      .webkit { max-width: 600px; margin: 0 auto; }
      .outer { margin: 0 auto; width: 100%; max-width: 600px; background-color: #ffffff; }
      .header { background-color: #23366E; padding: 20px 30px; text-align: center; }
      .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-family: Arial, sans-serif; }
      .content { padding: 30px; font-family: Arial, sans-serif; font-size: 16px; color: #333333; line-height: 1.6; }
      .footer { padding: 20px 30px; text-align: center; font-family: Arial, sans-serif; font-size: 12px; color: #999999; }
      .data-row { margin-bottom: 12px; }
      .data-label { font-weight: bold; color: #23366E; }
      .message-box { background-color: #f9f9f9; border-left: 4px solid #23366E; padding: 15px; margin: 20px 0; border-radius: 4px; }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="webkit">
        <div class="outer">
          <div class="header">
            <h1>Medivisor Health</h1>
          </div>
          <div class="content">
            <p style="margin-top: 0;">You have a new contact form submission. Here are the details:</p>
            <div class="data-row"><span class="data-label">Name:</span> ${s(name)}</div>
            <div class="data-row"><span class="data-label">Email:</span> <a href="mailto:${s(email)}" style="color: #23366E;">${s(email)}</a></div>
            <div class="data-row"><span class="data-label">Country:</span> ${s(countryName)}</div>
            <div class="data-row"><span class="data-label">WhatsApp:</span> ${s(whatsappNumber)}</div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <div class="data-row"><span class="data-label">Message:</span></div>
            <div class="message-box">${s(message)}</div>
          </div>
          <div class="footer">
            <p>This email was sent from the Medivisor website contact form.</p>
            <p>&copy; ${new Date().getFullYear()} Medivisor Health. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  </body>
  </html>
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

export async function sendContactFormEmail(
  name: string,
  email: string,
  countryName: string,
  whatsappNumber: string,
  message: string
): Promise<void> {
  const config = getEmailConfig()
  const from = config.senderEmail

  await sendViaResend({
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
   }, config)
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
  <title>Thank You - Medivisor India Treatment</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f4f4f6; font-family: Arial, sans-serif; }
    .wrapper { width: 100%; background-color: #f4f4f6; padding: 20px 0; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(35, 54, 110, 0.08); }
    .header { background: linear-gradient(135deg, #23366E 0%, #1A2A52 100%); padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 0.5px; }
    .logo { width: 160px; margin: 0 auto 10px; }
    .content { padding: 30px; }
    .content h2 { color: #23366E; margin-top: 0; font-size: 20px; font-weight: bold; }
    .content p { color: #333333; line-height: 1.6; font-size: 15px; margin-bottom: 15px; }
    .highlight-box { background: linear-gradient(135deg, #E6F4EA 0%, #E6F4EA 100%); border: 1px solid #29A9B9; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .highlight-box p { margin: 0 0 8px; line-height: 1.5; }
    .highlight-box .label { font-weight: bold; color: #23366E; }
    .divider { border: none; border-top: 1px solid #e5e7eb; margin: 25px 0; }
    .footer-box { background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .footer-box p { margin: 0; line-height: 1.5; font-size: 14px; color: #555; }
    .button-container { text-align: center; margin: 25px 0; }
    .button { display: inline-block; background: linear-gradient(135deg, #29A9B9 0%, #1F8A96 100%); color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: bold; font-size: 15px; box-shadow: 0 4px 12px rgba(41, 169, 185, 0.3); }
    .badge { display: inline-block; background-color: #74BF44; color: #ffffff; font-size: 12px; font-weight: bold; padding: 4px 10px; border-radius: 12px; }
    .footer { background-color: #23366E; padding: 20px; text-align: center; font-size: 12px; color: #ffffff; }
    .footer a { color: #29A9B9; text-decoration: none; }
    .contact-info { font-size: 13px; color: #ffffff; line-height: 1.6; }
    .contact-info a { color: #29A9B9; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo"><img src="https://medivisorindiatreatment.com/medivisor-logo.png" alt="Medivisor India Treatment" width="160" style="width: 160px; height: auto;"></div>
        <h1>Thank You, ${displayName}!</h1>
      </div>
      <div class="content">
        <h2>Your Appointment Request Has Been Received</h2>
        <p>Dear ${displayName},</p>
        <p>Thank you for reaching out to Medivisor India Treatment. We have successfully received your appointment request and our medical team will review your details.</p>

        <div class="highlight-box">
          <p><span class="label">Patient Name:</span> ${displayName}</p>
          ${userEmail ? `<p><span class="label">Email Address:</span> ${userEmail}</p>` : ''}
          ${userCountry ? `<p><span class="label">Country:</span> ${userCountry}</p>` : ''}
          ${userWhatsapp ? `<p><span class="label">WhatsApp:</span> ${userWhatsapp}</p>` : ''}
        </div>

        <p>
          <span class="badge">CONFIRMED</span> &nbsp; Your submission has been received and is being processed.
        </p>

        <div class="divider"></div>

        ${userMessage ? `<p style="font-weight: bold; color: #23366E; margin-bottom: 8px;">Your Message:</p><div class="footer-box"><p style="white-space: pre-wrap; margin: 0; color: #555;">${userMessage}</p></div>` : ''}

        <p style="color: #555; font-size: 14px; line-height: 1.6;">
          <strong style="color: #23366E;">What happens next?</strong><br>
          Our healthcare team will contact you within 1 business day to confirm your appointment and discuss your treatment requirements.
        </p>

        <div class="button-container">
          ${userEmail ? `<a href="${emailLink}" class="button">Contact Us at ${userEmail}</a>` : '<a href="https://wa.me/918340780250" class="button">Chat on WhatsApp</a>'}
        </div>

        <p style="font-size: 13px; color: #888; text-align: center; margin-top: 25px;">
          This is an automated confirmation message. Please do not reply to this email.
        </p>
      </div>
      <div class="footer">
        <div class="contact-info">
          <p style="margin: 0 0 5px; font-weight: bold;">Medivisor India Treatment</p>
          <p style="margin: 0 0 5px;">Medivisor House 359, Sector 1, Vaishali, Ghaziabad, (Delhi/NCR) India</p>
          <p style="margin: 0 0 5px;">Phone: +91 83682 47758 &nbsp;|&nbsp; Email: <a href="mailto:info@medivisorhealth.com">info@medivisorhealth.com</a></p>
          <p style="margin: 0;">&copy; ${currentYear} Medivisor India Treatment. All rights reserved.</p>
        </div>
      </div>
    </div>
  </div>
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

Dear ${displayName},

Thank you for reaching out to Medivisor India Treatment. We have successfully
received your appointment request and our medical team will review your details.

We will contact you within 1 business day to confirm your appointment and
discuss your treatment requirements.

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

function isValidEmail(email: string): boolean {
  return !!email && PATTERNS.email.test(email)
}

// Send thank-you confirmation email to the user via Resend.
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

  await sendViaResend({
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
  }, config)

  // Record that a thank-you email was sent so we don't send a duplicate
  markThankYouEmailSent(trimmedEmail)
  return true
}