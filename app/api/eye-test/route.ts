// app/api/eye-test/route.ts
// Eye test appointment registration form API

import { NextResponse } from "next/server"
import { wixServerClient } from "@/lib/wix"
import { escapeHtml } from "@/lib/utils/html-escape"
import { assertWixConfigured } from "@/lib/config/env"
import { sendViaResend, sendThankYouEmail, getEmailConfig } from "@/lib/services/email-resend"

interface EyeTestFormData {
  name: string
  email: string
  countryName: string
  whatsapp: string
  message: string
  appointmentDate: string
  appointmentTime: string
  appointmentVenue: string
  appointmentLocation: string
  serviceType: string
}

function validate(input: any):
  | { ok: true; data: EyeTestFormData }
  | { ok: false; error: string } {
  const name = String(input?.name ?? "").trim()
  const email = String(input?.email ?? "").trim()
  const countryName = String(input?.countryName ?? "").trim()
  const whatsapp = String(input?.whatsapp ?? "").trim()
  const message = String(input?.message ?? "").trim()
  const appointmentDate = String(input?.appointmentDate ?? "").trim()
  const appointmentTime = String(input?.appointmentTime ?? "").trim()
  const appointmentVenue = String(input?.appointmentVenue ?? "").trim()
  const appointmentLocation = String(input?.appointmentLocation ?? "").trim()
  const serviceType = String(input?.serviceType ?? "Eye Test").trim()

  if (!name) return { ok: false, error: "Please enter your name." }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Please enter a valid email." }
  if (!whatsapp) return { ok: false, error: "Please enter a valid WhatsApp number." }
  if (!appointmentDate) return { ok: false, error: "Please select an appointment date." }
  if (!appointmentTime) return { ok: false, error: "Please select an appointment time." }

  return {
    ok: true,
    data: {
      name,
      email,
      countryName,
      whatsapp,
      message,
      appointmentDate,
      appointmentTime,
      appointmentVenue,
      appointmentLocation,
      serviceType
    }
  }
}

function toE164(whatsapp: string) {
  const cleaned = whatsapp.replace(/\s/g, '')
  return cleaned
}

function buildEmailHtml(
  serviceType: string,
  name: string,
  email: string,
  countryName: string,
  fullPhone: string,
  appointmentDate: string,
  appointmentTime: string,
  appointmentVenue: string,
  appointmentLocation: string,
  message: string
): string {
  const s = escapeHtml
  return `
  <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333; line-height: 1.6;">
    <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #f9f9f9;">
      <h2 style="color: #E22026; text-align: center;">New Eye Test Appointment Registration</h2>
      <p>You have a new eye test appointment registration from your website. Here are the details:</p>

      <div style="background-color: #fff; padding: 15px; border-radius: 6px; border: 1px solid #ddd;">
        <p style="margin: 0 0 10px;"><strong>Service Type:</strong> <span style="font-weight: normal;">${s(serviceType)}</span></p>
        <p style="margin: 0 0 10px;"><strong>Name:</strong> <span style="font-weight: normal;">${s(name)}</span></p>
        <p style="margin: 0 0 10px;"><strong>Email:</strong> <span style="font-weight: normal;">${s(email)}</span></p>
        <p style="margin: 0 0 10px;"><strong>Country/Location:</strong> <span style="font-weight: normal;">${s(appointmentLocation || countryName)}</span></p>
        <p style="margin: 0 0 10px;"><strong>WhatsApp:</strong> <span style="font-weight: normal;">${s(fullPhone)}</span></p>
        <p style="margin: 0 0 10px;"><strong>Appointment Date:</strong> <span style="font-weight: normal;">${s(appointmentDate)}</span></p>
        <p style="margin: 0 0 10px;"><strong>Appointment Time:</strong> <span style="font-weight: normal;">${s(appointmentTime)}</span></p>
        <p style="margin: 0 0 10px;"><strong>Venue:</strong> <span style="font-weight: normal;">${s(appointmentVenue || 'Not specified')}</span></p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="margin: 0 0 5px;"><strong>Eye Concerns / Additional Information:</strong></p>
        <p style="white-space: pre-wrap; margin: 0; background-color: #f0f0f0; padding: 10px; border-radius: 4px;">${s(message || 'No additional information provided')}</p>
      </div>

      <p style="text-align: center; margin-top: 20px; font-size: 14px; color: #888;">This email was sent from your eye test registration form.</p>
    </div>
  </div>
  `
}

async function processSubmission(data: EyeTestFormData): Promise<{ ok: boolean; error?: string }> {
  assertWixConfigured()
  const emailConfig = getEmailConfig()
  if (!emailConfig.hasResend) {
    return { ok: false, error: "Email service not configured" }
  }

  const {
    name,
    email,
    countryName,
    whatsapp,
    message,
    appointmentDate,
    appointmentTime,
    appointmentVenue,
    appointmentLocation,
    serviceType
  } = data

  const fullPhone = toE164(whatsapp)

  const collectionId = process.env.WIX_CONTACT_COLLECTION_ID || "eyetest"

  if (!collectionId) {
    return {
      ok: false,
      error: "Missing Wix CMS collection ID. Set WIX_CONTACT_COLLECTION_ID in Project Settings.",
    }
  }

  try {
    const nowIso = new Date().toISOString()
    const payload = {
      name,
      email,
      countryName,
      whatsapp: fullPhone,
      phone: fullPhone,
      message,
      appointmentDate,
      appointmentTime,
      appointmentVenue,
      appointmentLocation,
      serviceType,
      source: "eye-test-form",
      createdAt: nowIso,
      submissionTime: nowIso,
    }

    if (typeof (wixServerClient as any)?.items?.insert === "function") {
      await (wixServerClient as any).items.insert(collectionId, payload)
    } else {
      throw new Error("Wix data items.insert API not available on wixServerClient")
    }

    try {
      await sendViaResend({
        to: emailConfig.recipientEmail,
        subject: `New Eye Test Appointment Registration from ${escapeHtml(name)}`,
        html: buildEmailHtml(serviceType, name, email, countryName, fullPhone, appointmentDate, appointmentTime, appointmentVenue, appointmentLocation, message),
        replyTo: email,
        headers: {
          'X-Priority': '3',
          'X-MSMail-Priority': 'Normal',
          'Importance': 'Normal',
        },
      }, emailConfig)
    } catch (emailError: any) {
      console.error("[eye-test] Resend email sending failed:", emailError)
      return { ok: false, error: "Failed to send notification email. Please try again." }
    }

    try {
      await sendThankYouEmail(name, email, message, countryName, fullPhone)
    } catch (thankYouError: any) {
      console.error("[eye-test] Thank-you email failed:", thankYouError?.message || thankYouError)
    }

    return { ok: true }
  } catch (err: any) {
    console.error("[eye-test] CMS error:", {
      message: err?.message || String(err),
      code: err?.code,
    })
    return { ok: false, error: "Failed to submit. Please try again." }
  }
}

export async function POST(request: Request) {
  try {
    assertWixConfigured()
    const body = await request.json()
    const parsed = validate(body)

    if (!parsed.ok) {
      return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 })
    }

    const result = await processSubmission(parsed.data)

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request format" }, { status: 400 })
  }
}

export async function submitContact(input: unknown): Promise<{ ok: boolean; error?: string }> {
  const parsed = validate(input)
  if (!parsed.ok) return { ok: false, error: parsed.error }

  return processSubmission(parsed.data)
}
