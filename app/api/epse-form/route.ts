// app/api/epse-form/route.ts
// Extended Patient Support Program (EPSP) application form API

import { NextResponse } from "next/server"
import { wixServerClient } from "@/lib/wix"
import { escapeHtml } from "@/lib/utils/html-escape"
import { assertWixConfigured } from "@/lib/config/env"
import { sendViaResend, sendThankYouEmail, getEmailConfig } from "@/lib/services/email-resend"

interface FormData {
  fullName: string
  applicantType: string
  contactPerson: string
  phone: string
  whatsapp: string
  email: string
  address: string
  city: string
  background: string
  backgroundDescription: string
  yearsWorking: string
  motivation: string
  experience: string
  hasOffice: string
  officeLocation: string
  hasSmartphone: boolean
  hasWhatsapp: boolean
  hasEmail: boolean
  hasInternet: boolean
  serviceArea: string
  agreeTerms: boolean
  signatureName: string
  signatureDate: string
}

interface Attachments {
  idProof: boolean
  cv: boolean
  orgRegistration: boolean
  reference: boolean
}

function validate(input: any): { ok: true; data: { formData: FormData; attachments: Attachments } } | { ok: false; error: string } {
  const formData: FormData = {
    fullName: String(input?.formData?.fullName ?? input?.fullName ?? "").trim(),
    applicantType: String(input?.formData?.applicantType ?? input?.applicantType ?? "").trim(),
    contactPerson: String(input?.formData?.contactPerson ?? input?.contactPerson ?? "").trim(),
    phone: String(input?.formData?.phone ?? input?.phone ?? "").trim(),
    whatsapp: String(input?.formData?.whatsapp ?? input?.whatsapp ?? "").trim(),
    email: String(input?.formData?.email ?? input?.email ?? "").trim(),
    address: String(input?.formData?.address ?? input?.address ?? "").trim(),
    city: String(input?.formData?.city ?? input?.city ?? "").trim(),
    background: String(input?.formData?.background ?? input?.background ?? "").trim(),
    backgroundDescription: String(input?.formData?.backgroundDescription ?? input?.backgroundDescription ?? "").trim(),
    yearsWorking: String(input?.formData?.yearsWorking ?? input?.yearsWorking ?? "").trim(),
    motivation: String(input?.formData?.motivation ?? input?.motivation ?? "").trim(),
    experience: String(input?.formData?.experience ?? input?.experience ?? "").trim(),
    hasOffice: String(input?.formData?.hasOffice ?? input?.hasOffice ?? "").trim(),
    officeLocation: String(input?.formData?.officeLocation ?? input?.officeLocation ?? "").trim(),
    hasSmartphone: Boolean(input?.formData?.hasSmartphone ?? input?.hasSmartphone),
    hasWhatsapp: Boolean(input?.formData?.hasWhatsapp ?? input?.hasWhatsapp),
    hasEmail: Boolean(input?.formData?.hasEmail ?? input?.hasEmail),
    hasInternet: Boolean(input?.formData?.hasInternet ?? input?.hasInternet),
    serviceArea: String(input?.formData?.serviceArea ?? input?.serviceArea ?? "").trim(),
    agreeTerms: Boolean(input?.formData?.agreeTerms ?? input?.agreeTerms),
    signatureName: String(input?.formData?.signatureName ?? input?.signatureName ?? "").trim(),
    signatureDate: String(input?.formData?.signatureDate ?? input?.signatureDate ?? "").trim(),
  }

  const attachments: Attachments = {
    idProof: Boolean(input?.attachments?.idProof),
    cv: Boolean(input?.attachments?.cv),
    orgRegistration: Boolean(input?.attachments?.orgRegistration),
    reference: Boolean(input?.attachments?.reference),
  }

  if (!formData.fullName) return { ok: false, error: "Full name is required" }
  if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) return { ok: false, error: "Valid email is required" }
  if (!formData.phone) return { ok: false, error: "Phone number is required" }
  if (!formData.agreeTerms) return { ok: false, error: "You must agree to the terms" }
  if (!formData.signatureName) return { ok: false, error: "Signature is required" }

  return { ok: true, data: { formData, attachments } }
}

function buildEmailHtml(formData: FormData, attachments: Attachments, applicationId: string): string {
  const s = escapeHtml
  const backgroundDisplay = formData.background === 'medical' ? 'Medical/Healthcare' :
    formData.background === 'church' ? 'Church/Faith-based' :
    formData.background === 'ngo' ? 'NGO/Social Work' :
    formData.background === 'community' ? 'Community Leader' :
    formData.background === 'business' ? 'Business' : 'Other'

  const experienceDisplay = formData.yearsWorking === 'less1' ? '< 1 year' :
    formData.yearsWorking === '1-3' ? '1-3 years' :
    formData.yearsWorking === '3-5' ? '3-5 years' : '> 5 years'

  const motivationEscaped = s(formData.motivation.replace(/\n/g, '<br>'))
  const experienceEscaped = formData.experience ? s(formData.experience.replace(/\n/g, '<br>')) : ''
  const applicantDisplay = formData.applicantType === 'individual' ? 'Individual' : 'Organization'
  const contactPersonRow = formData.applicantType === 'organization' && formData.contactPerson
    ? `<tr><td>Contact Person:</td><td>${s(formData.contactPerson)}</td></tr>`
    : ''
  const hasOfficeDisplay = formData.hasOffice === 'yes' && formData.officeLocation
    ? `Yes (${s(formData.officeLocation)})`
    : formData.hasOffice === 'yes' ? 'Yes' : 'No'

  const docsList = [
    attachments.idProof ? '<li>ID Proof</li>' : '',
    attachments.cv ? '<li>Short CV / Profile</li>' : '',
    attachments.orgRegistration ? '<li>Organization Registration</li>' : '',
    attachments.reference ? '<li>Reference / Recommendation</li>' : '',
    !attachments.idProof && !attachments.cv && !attachments.orgRegistration && !attachments.reference ? '<li>No documents attached</li>' : '',
  ].filter(Boolean).join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Medivisor EPSP Application</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 16px; color: #333; line-height: 1.6; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 700px; margin: 20px auto; padding: 25px; border: 1px solid #e0e0e0; border-radius: 10px; background: linear-gradient(to bottom, #ffffff, #f9f9f9); }
        .header { text-align: center; margin-bottom: 25px; padding-bottom: 20px; border-bottom: 2px solid #E22026; }
        .header h1 { color: #E22026; margin: 0; font-size: 28px; }
        .header p { color: #666; margin: 10px 0 0; font-size: 16px; }
        .section { background-color: #fff; padding: 20px; border-radius: 8px; border: 1px solid #ddd; margin-bottom: 20px; }
        .section h2 { color: #E22026; font-size: 20px; margin-top: 0; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #eee; }
        .section h3 { color: #E22026; font-size: 18px; margin-top: 0; margin-bottom: 15px; }
        table { width: 100%; border-collapse: collapse; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        td { padding: 8px 0; }
        td:first-child { width: 35%; font-weight: bold; color: #555; }
        .motivation-box { background-color: #f8f8f8; padding: 15px; border-radius: 5px; border-left: 4px solid #E22026; }
        .experience-box { background-color: #f8f8f8; padding: 15px; border-radius: 5px; }
        .signature-box { background-color: #f0f7ff; padding: 20px; border-radius: 8px; border: 1px solid #cce5ff; text-align: center; }
        .footer { text-align: center; margin-top: 25px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 14px; }
        ul { margin: 0; padding-left: 20px; }
        li { margin-bottom: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Medivisor EPSP</h1>
          <p>New Application Submission</p>
        </div>

        <div class="section">
          <h2>Applicant Information</h2>
          <table>
            <tr><td>Full Name:</td><td>${s(formData.fullName)}</td></tr>
            <tr><td>Applicant Type:</td><td>${applicantDisplay}</td></tr>
            ${contactPersonRow}
            <tr><td>Email:</td><td>${s(formData.email)}</td></tr>
            <tr><td>Phone:</td><td>${s(formData.phone)}</td></tr>
            ${formData.whatsapp ? `<tr><td>WhatsApp:</td><td>${s(formData.whatsapp)}</td></tr>` : ''}
            <tr><td>Location:</td><td>${s(formData.city)}${formData.address ? `, ${s(formData.address)}` : ''}</td></tr>
            <tr><td>Service Area:</td><td>${s(formData.serviceArea)}</td></tr>
            <tr><td>Background:</td><td>${s(backgroundDisplay)}</td></tr>
            <tr><td>Experience:</td><td>${s(experienceDisplay)}</td></tr>
            <tr><td>Has Office:</td><td>${hasOfficeDisplay}</td></tr>
          </table>
        </div>

        <div class="section">
          <h3>Motivation</h3>
          <div class="motivation-box">${motivationEscaped}</div>
        </div>

        ${experienceEscaped ? `
        <div class="section">
          <h3>Experience with Medical Issues</h3>
          <div class="experience-box">${experienceEscaped}</div>
        </div>
        ` : ''}

        <div class="section">
          <h3>Available Documents</h3>
          <ul>
            ${attachments.idProof ? '<li>ID Proof</li>' : ''}
            ${attachments.cv ? '<li>Short CV / Profile</li>' : ''}
            ${attachments.orgRegistration ? '<li>Organization Registration</li>' : ''}
            ${attachments.reference ? '<li>Reference / Recommendation</li>' : ''}
            ${!attachments.idProof && !attachments.cv && !attachments.orgRegistration && !attachments.reference ? '<li>No documents attached</li>' : ''}
          </ul>
        </div>

        <div class="signature-box">
          <p style="margin: 0; color: #004085; font-size: 14px;">
            <strong>Submitted:</strong> ${new Date().toLocaleString()} <br>
            <strong>Signature:</strong> ${s(formData.signatureName)} on ${s(formData.signatureDate)}
          </p>
        </div>

        <div class="footer">
          <p style="margin: 5px 0;">This application was submitted via the Medivisor EPSP online form.</p>
          <p style="margin: 5px 0;">Application ID: ${s(applicationId)}</p>
          <p style="margin: 5px 0; font-size: 12px;">You can reply directly to this email to contact the applicant.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

async function processSubmission(input: any): Promise<{ ok: boolean; error?: string; success?: boolean; message?: string; redirectUrl?: string }> {
  const parsed = validate(input)
  if (!parsed.ok) return parsed

  const { formData, attachments } = parsed.data
  assertWixConfigured()
  const emailConfig = getEmailConfig()
  if (!emailConfig.hasResend) {
    return { ok: false, error: "Email service not configured" }
  }
  const applicationId = Date.now().toString(36).toUpperCase()

  try {
    if (typeof (wixServerClient as any)?.items?.insert === "function") {
      await (wixServerClient as any).items.insert("lightboxContact06", {
        ...formData,
        attachments: JSON.stringify(attachments),
        source: "medivisor-application-form",
        submittedAt: new Date().toISOString(),
        status: "pending",
        applicationDate: new Date().toISOString(),
      })
    } else {
      throw new Error("Wix data items.insert API not available on wixServerClient")
    }
  } catch (e: any) {
    console.error("[epse-form] Wix insert error:", e?.message)
    return { ok: false, error: "Failed to save application. Please try again." }
  }

  try {
    await sendViaResend({
      to: emailConfig.recipientEmail,
      replyTo: formData.email,
      subject: `New Medivisor EPSP Application from ${escapeHtml(formData.fullName)}`,
      html: buildEmailHtml(formData, attachments, applicationId),
      headers: {
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal',
        'Importance': 'Normal',
      },
    }, emailConfig)
  } catch (emailError: any) {
    console.error("[epse-form] Email sending error:", emailError?.message)
    return { ok: false, error: "Failed to send notification email. Please try again." }
  }

  try {
    await sendThankYouEmail(formData.fullName, formData.email, formData.motivation || '', formData.city, formData.whatsapp)
  } catch (thankYouError: any) {
    console.error("[epse-form] Thank-you email failed:", thankYouError?.message || thankYouError)
  }

  return { ok: true, success: true, message: "Application submitted successfully", redirectUrl: "/thank-you" }
}

export async function POST(request: Request) {
  try {
    assertWixConfigured()
    const body = await request.json()
    const result = await processSubmission(body)

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 500 })
    }

    return NextResponse.json({ ok: true, redirectUrl: result.redirectUrl })
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to submit application. Please try again." }, { status: 500 })
  }
}

export async function submitMedivisorForm(formData: FormData, attachments: Attachments): Promise<{ ok: boolean; error?: string; success?: boolean; message?: string; redirectUrl?: string }> {
  return processSubmission({ formData, attachments })
}
