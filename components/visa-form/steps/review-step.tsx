"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, CheckCircle, FileText, User, Home, Globe, Shield } from "lucide-react"
import type { FormData } from "../visa-form-container"
import jsPDF from "jspdf"

interface ReviewStepProps {
  formData: FormData
}

const cardClassName = "border border-gray-200 bg-gray-50 p-6 rounded-lg transition-all duration-200 hover:bg-white hover:border-gray-300"
const sectionTitleClassName = "mb-4 text-lg font-semibold text-gray-900 flex items-center gap-2"

export function ReviewStep({ formData }: ReviewStepProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const generatePDF = () => {
    setIsGeneratingPDF(true)
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      let yPosition = 20

      // Header
      doc.setFontSize(16)
      doc.setTextColor(31, 41, 55)
      doc.text("INDIA E-VISA APPLICATION", pageWidth / 2, yPosition, { align: "center" })

      yPosition += 10
      doc.setFontSize(10)
      doc.setTextColor(75, 85, 99)
      doc.text("Application Summary", pageWidth / 2, yPosition, { align: "center" })

      yPosition += 15

      // Helper function to add section
      const addSection = (title: string) => {
        if (yPosition > pageHeight - 30) {
          doc.addPage()
          yPosition = 20
        }
        doc.setFontSize(12)
        doc.setTextColor(31, 41, 55)
        doc.text(title, 15, yPosition)
        doc.setDrawColor(209, 213, 219)
        doc.line(15, yPosition + 2, pageWidth - 15, yPosition + 2)
        yPosition += 15
      }

      // Helper function to add field
      const addField = (label: string, value: string | boolean | object) => {
        if (yPosition > pageHeight - 30) {
          doc.addPage()
          yPosition = 20
        }
        doc.setFontSize(9)
        doc.setTextColor(55, 65, 81)

        const displayValue =
          typeof value === "object"
            ? Object.values(value)
                .filter((v) => v)
                .join(", ")
            : value || "Not provided"

        const lines = doc.splitTextToSize(`${label}: ${displayValue}`, pageWidth - 30)
        lines.forEach((line: string) => {
          doc.text(line, 20, yPosition)
          yPosition += 5
        })
        yPosition += 2
      }

      // Step 1: Personal Details
      addSection("1. PERSONAL DETAILS")
      addField("Surname", formData.surname)
      addField("Given Name", formData.givenName)
      addField("Gender", formData.gender)
      addField("Town of Birth", formData.townOfBirth)
      addField("Religion", formData.religion)
      addField("Education", formData.education)

      // Step 2: Passport Details
      addSection("2. PASSPORT DETAILS")
      addField("Passport Number", formData.passportNumber)
      addField("Place of Issue", formData.placeOfIssue)
      addField("Date of Issue", formData.dateOfIssue)
      addField("Date of Expiry", formData.dateOfExpiry)

      // Step 3: Address & Family
      addSection("3. ADDRESS & FAMILY DETAILS")
      addField(
        "Present Address",
        `${formData.presentAddress.houseNo}, ${formData.presentAddress.town}, ${formData.presentAddress.state}, ${formData.presentAddress.postal}, ${formData.presentAddress.country}`,
      )
      addField("Mobile", formData.presentAddress.mobile)
      addField("Email", formData.presentAddress.email)

      if (!formData.permanentAddressSameAsPresentAddress) {
        addField(
          "Permanent Address",
          `${formData.permanentAddress.houseNo}, ${formData.permanentAddress.town}, ${formData.permanentAddress.state}, ${formData.permanentAddress.postal}, ${formData.permanentAddress.country}`,
        )
      }

      addField("Father's Name", formData.fatherName)
      addField("Father's Nationality", formData.fatherNationality)
      addField("Mother's Name", formData.motherName)
      addField("Mother's Nationality", formData.motherNationality)
      addField("Pakistan Ancestry", formData.ancestryPakistan)
      addField("Marital Status", formData.maritalStatus)

      // Step 4: Security & Travel
      addSection("4. SECURITY & TRAVEL HISTORY")
      addField("Previous Visit to India", formData.previousVisitIndia)
      if (formData.previousVisitIndiaDetails) {
        addField("Visit Details", formData.previousVisitIndiaDetails)
      }

      addSection("SECURITY QUESTIONNAIRE RESPONSES")
      addField("Arrested or Convicted", formData.arrested)
      addField("Human Trafficking Involvement", formData.humanTrafficking)
      addField("Drug-related Crimes", formData.drugCrimes)
      addField("Visa Overstay or Violation", formData.visaOverstay)
      addField("Cybercrime or Online Fraud", formData.cybercrime)
      addField("Terrorist Activities Association", formData.terrorist)

      // Footer
      yPosition = pageHeight - 15
      doc.setFontSize(8)
      doc.setTextColor(156, 163, 175)
      doc.text("Generated on: " + new Date().toLocaleString(), 15, yPosition)
      doc.text("Confidential Document", pageWidth - 15, yPosition, { align: "right" })

      doc.save(`india-evisa-application-${Date.now()}.pdf`)
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <CheckCircle className="h-8 w-8 text-gray-700" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Step 5: Review & Submit</h2>
          <p className="text-sm text-gray-600">Please review all information before submitting</p>
        </div>
      </div>

      {/* Personal Details Summary */}
      <Card className={cardClassName}>
        <h3 className={sectionTitleClassName}>
          <User className="h-5 w-5 text-gray-700" />
          Personal Details
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Surname</p>
            <p className="font-semibold text-gray-900">{formData.surname || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Given Name</p>
            <p className="font-semibold text-gray-900">{formData.givenName || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Gender</p>
            <p className="font-semibold text-gray-900">{formData.gender || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Town of Birth</p>
            <p className="font-semibold text-gray-900">{formData.townOfBirth || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Religion</p>
            <p className="font-semibold text-gray-900">{formData.religion || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Education</p>
            <p className="font-semibold text-gray-900">{formData.education || "-"}</p>
          </div>
        </div>
      </Card>

      {/* Passport Details Summary */}
      <Card className={cardClassName}>
        <h3 className={sectionTitleClassName}>
          <FileText className="h-5 w-5 text-gray-700" />
          Passport Details
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Passport Number</p>
            <p className="font-semibold text-gray-900">{formData.passportNumber || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Place of Issue</p>
            <p className="font-semibold text-gray-900">{formData.placeOfIssue || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Date of Issue</p>
            <p className="font-semibold text-gray-900">{formData.dateOfIssue || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Date of Expiry</p>
            <p className="font-semibold text-gray-900">{formData.dateOfExpiry || "-"}</p>
          </div>
        </div>
      </Card>

      {/* Address, Family & Personal Information Summary */}
      <Card className={cardClassName}>
        <h3 className={sectionTitleClassName}>
          <Home className="h-5 w-5 text-gray-700" />
          Address, Family & Personal Information
        </h3>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-semibold text-gray-900 break-words">{formData.presentAddress.email || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Mobile</p>
              <p className="font-semibold text-gray-900">{formData.presentAddress.mobile || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Marital Status</p>
              <p className="font-semibold text-gray-900">{formData.maritalStatus || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Pakistan Ancestry</p>
              <p className="font-semibold text-gray-900">{formData.ancestryPakistan || "-"}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-600">Father's Name</p>
              <p className="font-semibold text-gray-900">{formData.fatherName || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Mother's Name</p>
              <p className="font-semibold text-gray-900">{formData.motherName || "-"}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Travel History Summary */}
      <Card className={cardClassName}>
        <h3 className={sectionTitleClassName}>
          <Globe className="h-5 w-5 text-gray-700" />
          Travel History
        </h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">Previous Visit to India</p>
            <p className="font-semibold text-gray-900">{formData.previousVisitIndia || "-"}</p>
          </div>
          {formData.previousVisitIndiaDetails && (
            <div className="bg-gray-100 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Visit Details</p>
              <p className="text-gray-900">{formData.previousVisitIndiaDetails}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Security Questionnaire Summary */}
      <Card className={cardClassName}>
        <h3 className={sectionTitleClassName}>
          <Shield className="h-5 w-5 text-gray-700" />
          Security Questionnaire Responses
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Arrested or Convicted</p>
            <p className="font-semibold text-gray-900">{formData.arrested || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Human Trafficking</p>
            <p className="font-semibold text-gray-900">{formData.humanTrafficking || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Drug-related Crimes</p>
            <p className="font-semibold text-gray-900">{formData.drugCrimes || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Visa Overstay</p>
            <p className="font-semibold text-gray-900">{formData.visaOverstay || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Cybercrime</p>
            <p className="font-semibold text-gray-900">{formData.cybercrime || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Terrorist Activities</p>
            <p className="font-semibold text-gray-900">{formData.terrorist || "-"}</p>
          </div>
        </div>
      </Card>

      {/* PDF Download Section */}
      <Card className="border border-gray-200 bg-gray-50 p-6 rounded-lg hover:bg-white hover:border-gray-300 transition-all duration-200">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-700" />
              Export Application
            </h3>
            <p className="text-sm text-gray-600">
              Download your complete application as a PDF file for your records
            </p>
          </div>
          <Button
            onClick={generatePDF}
            disabled={isGeneratingPDF}
            className="gap-2 bg-gray-800 hover:bg-gray-900 text-white whitespace-nowrap transition-all duration-200"
          >
            <Download className="h-4 w-4" />
            {isGeneratingPDF ? "Generating PDF..." : "Download PDF"}
          </Button>
        </div>
      </Card>

      {/* Final Declaration */}
      <Card className="border border-gray-200 bg-gray-50 p-6 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-gray-100 p-2">
            <CheckCircle className="h-5 w-5 text-gray-700" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Final Declaration</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              By submitting this application, I hereby declare that all information provided is true, accurate, and complete to the best of my knowledge. I understand that providing false or misleading information may result in the rejection of my application, visa cancellation, and possible legal consequences under applicable laws.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}