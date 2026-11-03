"use client"

import type { FormData } from "../visa-form-container"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface StepProps {
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
}

const SECURITY_QUESTIONS = [
  { key: "arrested", label: "Have you ever been arrested or convicted of any offense?" },
  { key: "humanTrafficking", label: "Have you ever been involved in human trafficking?" },
  { key: "drugCrimes", label: "Have you ever engaged in drug-related crimes?" },
  { key: "visaOverstay", label: "Have you ever overstayed or violated visa conditions?" },
  { key: "cybercrime", label: "Have you ever been involved in cybercrime or online fraud?" },
  { key: "terrorist", label: "Have you ever been associated with terrorist activities?" },
]

const inputClassName = "border border-gray-200 bg-gray-50 text-gray-800 rounded-lg px-4 py-3 transition-all duration-200 placeholder:text-gray-500 hover:bg-white hover:border-gray-300 focus:outline-none focus:bg-white focus:border-gray-400 focus:ring-1 focus:ring-gray-200 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"

export function SecurityStep({ formData, updateFormData }: StepProps) {
  const handleAnswerChange = (key: string, value: string) => {
    updateFormData({ [key]: value } as Partial<FormData>)
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-foreground">Step 4: Security & Travel History</h2>
        <p className="text-sm text-muted-foreground">
          Please complete all sections accurately. This information helps us process your application securely.
        </p>
      </div>

      {/* Travel History Section */}
      <div className="space-y-6 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-50/50 p-6">
        <h3 className="text-lg font-semibold text-foreground">Travel History</h3>

        <div className="space-y-4">
          <Label className="block text-sm font-semibold text-foreground">Have you previously visited India? *</Label>
          <div className="flex gap-8">
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="previousVisitIndiaYes"
                name="previousVisitIndia"
                value="yes"
                checked={formData.previousVisitIndia === "yes"}
                onChange={(e) => updateFormData({ previousVisitIndia: e.target.value })}
                className="h-5 w-5 border-gray-300 bg-gray-50 text-gray-800"
              />
              <Label htmlFor="previousVisitIndiaYes" className="cursor-pointer font-normal">
                Yes
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="previousVisitIndiaNo"
                name="previousVisitIndia"
                value="no"
                checked={formData.previousVisitIndia === "no"}
                onChange={(e) => updateFormData({ previousVisitIndia: e.target.value })}
                className="h-5 w-5 border-gray-300 bg-gray-50 text-gray-800"
              />
              <Label htmlFor="previousVisitIndiaNo" className="cursor-pointer font-normal">
                No
              </Label>
            </div>
          </div>

          {/* Conditional Previous Visit Details */}
          {formData.previousVisitIndia === "yes" && (
            <div className="mt-4 space-y-3 rounded-lg bg-white p-4">
              <Label htmlFor="previousVisitIndiaDetails" className="text-sm font-medium text-foreground">
                Please provide details of your previous visit(s) to India *
              </Label>
              <Input
                id="previousVisitIndiaDetails"
                placeholder="e.g., Duration of stay, purpose of visit, visa type, dates of visit..."
                value={formData.previousVisitIndiaDetails}
                onChange={(e) => updateFormData({ previousVisitIndiaDetails: e.target.value })}
                className={inputClassName}
              />
            </div>
          )}
        </div>
      </div>

      {/* Security Questionnaire */}
      <div className="space-y-6">
        <div>
          <h3 className="mb-4 text-lg font-semibold text-foreground">Security Questionnaire</h3>
          <p className="text-sm text-muted-foreground">
            Please answer all questions truthfully. All information will be kept confidential.
          </p>
        </div>

        <div className="space-y-4">
          {SECURITY_QUESTIONS.map((question) => (
            <Card
              key={question.key}
              className="border border-gray-200 bg-gray-50 p-5 transition-all duration-200 hover:bg-white hover:border-gray-300"
            >
              <Label className="mb-4 block text-base font-semibold text-foreground">{question.label} *</Label>
              <div className="flex gap-8">
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id={`${question.key}-yes`}
                    name={question.key}
                    value="yes"
                    checked={formData[question.key as keyof FormData] === "yes"}
                    onChange={(e) => handleAnswerChange(question.key, e.target.value)}
                    className="h-5 w-5 border-gray-300 bg-gray-50 text-gray-800"
                  />
                  <Label htmlFor={`${question.key}-yes`} className="cursor-pointer font-normal">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id={`${question.key}-no`}
                    name={question.key}
                    value="no"
                    checked={formData[question.key as keyof FormData] === "no"}
                    onChange={(e) => handleAnswerChange(question.key, e.target.value)}
                    className="h-5 w-5 border-gray-300 bg-gray-50 text-gray-800"
                  />
                  <Label htmlFor={`${question.key}-no`} className="cursor-pointer font-normal">
                    No
                  </Label>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Important Notice */}
      <Card className="border border-gray-200 bg-gray-50 p-5 rounded-lg">
        <p className="text-sm font-medium text-gray-800">
          <strong>Important:</strong> Providing false information may result in rejection of your application and
          possible legal consequences. All details must be accurate and truthful.
        </p>
      </Card>
    </div>
  )
}