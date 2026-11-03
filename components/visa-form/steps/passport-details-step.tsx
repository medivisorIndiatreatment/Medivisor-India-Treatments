"use client"

import type { FormData } from "../visa-form-container"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface StepProps {
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
}

export function PassportDetailsStep({ formData, updateFormData }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-6 text-2xl font-bold text-foreground">Step 2: Passport Details</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="passportNumber">Passport Number *</Label>
          <Input
           className="border border-gray-200 bg-gray-50 text-gray-800 
             rounded-lg px-4 py-3 transition-all duration-200
             placeholder:text-gray-500
             hover:bg-white hover:border-gray-300
             focus:outline-none focus:bg-white focus:border-gray-400 focus:ring-1 focus:ring-gray-200
             disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
            id="passportNumber"
            placeholder="6-9 alphanumeric characters"
            value={formData.passportNumber}
            onChange={(e) => updateFormData({ passportNumber: e.target.value.toUpperCase() })}
          />
          <p className="text-xs text-muted-foreground">No spaces allowed</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="placeOfIssue">Place of Issue *</Label>
          <Input
            id="placeOfIssue"
             className="border border-gray-200 bg-gray-50 text-gray-800 
             rounded-lg px-4 py-3 transition-all duration-200
             placeholder:text-gray-500
             hover:bg-white hover:border-gray-300
             focus:outline-none focus:bg-white focus:border-gray-400 focus:ring-1 focus:ring-gray-200
             disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
            placeholder="Country and issuing authority"
            value={formData.placeOfIssue}
            onChange={(e) => updateFormData({ placeOfIssue: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfIssue">Date of Issue *</Label>
          <Input
            id="dateOfIssue"
             className="border border-gray-200 bg-gray-50 text-gray-800 
             rounded-lg px-4 py-3 transition-all duration-200
             placeholder:text-gray-500
             hover:bg-white hover:border-gray-300
             focus:outline-none focus:bg-white focus:border-gray-400 focus:ring-1 focus:ring-gray-200
             disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
            type="date"
            value={formData.dateOfIssue}
            onChange={(e) => updateFormData({ dateOfIssue: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">Must be earlier than today</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfExpiry">Date of Expiry *</Label>
          <Input
            id="dateOfExpiry"
             className="border border-gray-200 bg-gray-50 text-gray-800 
             rounded-lg px-4 py-3 transition-all duration-200
             placeholder:text-gray-500
             hover:bg-white hover:border-gray-300
             focus:outline-none focus:bg-white focus:border-gray-400 focus:ring-1 focus:ring-gray-200
             disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
            type="date"
            value={formData.dateOfExpiry}
            onChange={(e) => updateFormData({ dateOfExpiry: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">Must be at least 6 months from arrival date</p>
        </div>
      </div>
    </div>
  )
}
