"use client"

import type { FormData } from "../visa-form-container"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface StepProps {
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
}

export function PersonalDetailsStep({ formData, updateFormData }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-6 text-2xl font-bold text-foreground">Step 1: Personal Details</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="surname">Surname *</Label>
          <Input
      className="border border-gray-200 bg-gray-50 text-gray-800 
             rounded-lg px-4 py-3 transition-all duration-200
             placeholder:text-gray-500
             hover:bg-white hover:border-gray-300
             focus:outline-none focus:bg-white focus:border-gray-400 focus:ring-1 focus:ring-gray-200
             disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
            id="surname"
            placeholder="Enter your surname"
            maxLength={50}
            value={formData.surname}
            onChange={(e) => updateFormData({ surname: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">Must match passport exactly</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="givenName">Given Name(s) *</Label>
          <Input
            id="givenName"
                 className="border border-gray-200 bg-gray-50 text-gray-800 
             rounded-lg px-4 py-3 transition-all duration-200
             placeholder:text-gray-500
             hover:bg-white hover:border-gray-300
             focus:outline-none focus:bg-white focus:border-gray-400 focus:ring-1 focus:ring-gray-200
             disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
            placeholder="Enter your given name(s)"
            maxLength={100}
            value={formData.givenName}
            onChange={(e) => updateFormData({ givenName: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Gender *</Label>
          <Select  value={formData.gender} onValueChange={(value) => updateFormData({ gender: value })}>
            <SelectTrigger      className="border border-gray-200 bg-gray-50 text-gray-800 
             rounded-lg px-4 py-3 transition-all duration-200
             placeholder:text-gray-500
             hover:bg-white hover:border-gray-300
             focus:outline-none focus:bg-white focus:border-gray-400 focus:ring-1 focus:ring-gray-200
             disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed" id="gender">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent      className="border border-gray-200 bg-gray-50 text-gray-800 
             rounded-lg px-4 py-3 transition-all duration-200
             placeholder:text-gray-500
             hover:bg-white hover:border-gray-300
             focus:outline-none focus:bg-white focus:border-gray-400 focus:ring-1 focus:ring-gray-200
             disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed">
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="transgender">Transgender</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="townOfBirth">Town / City of Birth *</Label>
          <Input
            id="townOfBirth"
                 className="border border-gray-200 bg-gray-50 text-gray-800 
             rounded-lg px-4 py-3 transition-all duration-200
             placeholder:text-gray-500
             hover:bg-white hover:border-gray-300
             focus:outline-none focus:bg-white focus:border-gray-400 focus:ring-1 focus:ring-gray-200
             disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
            placeholder="Enter your birth city"
            maxLength={100}
            value={formData.townOfBirth}
            onChange={(e) => updateFormData({ townOfBirth: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="religion">Religion *</Label>
          <Select value={formData.religion} onValueChange={(value) => updateFormData({ religion: value })}>
            <SelectTrigger id="religion"      className="border border-gray-200 bg-gray-50 text-gray-800 
             rounded-lg px-4 py-3 transition-all duration-200
             placeholder:text-gray-500
             hover:bg-white hover:border-gray-300
             focus:outline-none focus:bg-white focus:border-gray-400 focus:ring-1 focus:ring-gray-200
             disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed">
              <SelectValue placeholder="Select religion" />
            </SelectTrigger>
            <SelectContent      className="border border-gray-200 bg-gray-50 text-gray-800 
             rounded-lg px-4 py-3 transition-all duration-200
             placeholder:text-gray-500
             hover:bg-white hover:border-gray-300
             focus:outline-none focus:bg-white focus:border-gray-400 focus:ring-1 focus:ring-gray-200
             disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed">
              <SelectItem value="hindu">Hindu</SelectItem>
              <SelectItem value="muslim">Muslim</SelectItem>
              <SelectItem value="christian">Christian</SelectItem>
              <SelectItem value="sikh">Sikh</SelectItem>
              <SelectItem value="buddhist">Buddhist</SelectItem>
              <SelectItem value="jain">Jain</SelectItem>
              <SelectItem value="jewish">Jewish</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="education">Educational Qualification *</Label>
          <Select value={formData.education} onValueChange={(value) => updateFormData({ education: value })}>
            <SelectTrigger id="education"      className="border border-gray-200 bg-gray-50 text-gray-800 
             rounded-lg px-4 py-3 transition-all duration-200
             placeholder:text-gray-500
             hover:bg-white hover:border-gray-300
             focus:outline-none focus:bg-white focus:border-gray-400 focus:ring-1 focus:ring-gray-200
             disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed">
              <SelectValue placeholder="Select qualification" />
            </SelectTrigger>
            <SelectContent      className="border border-gray-200 bg-gray-50 text-gray-800 
             rounded-lg px-4 py-3 transition-all duration-200
             placeholder:text-gray-500
             hover:bg-white hover:border-gray-300
             focus:outline-none focus:bg-white focus:border-gray-400 focus:ring-1 focus:ring-gray-200
             disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed">
              <SelectItem value="below-matriculation">Below Matriculation</SelectItem>
              <SelectItem value="graduate">Graduate</SelectItem>
              <SelectItem value="post-graduate">Post Graduate</SelectItem>
              <SelectItem value="doctorate">Doctorate</SelectItem>
              <SelectItem value="others">Others</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
