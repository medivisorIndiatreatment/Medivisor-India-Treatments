"use client"

import type { FormData } from "../visa-form-container"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface StepProps {
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
}

const PORTS = ["Delhi Airport", "Mumbai Airport", "Bangalore Airport", "Chennai Seaport", "Kolkata Airport"]

export function VisaTravelStep({ formData, updateFormData }: StepProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-6 text-2xl font-bold text-foreground">Step 4: Visa & Travel Details</h2>
      </div>

      {/* Visa Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Visa Details</h3>
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="placesToVisit">Places to be Visited in India *</Label>
            <Input
              id="placesToVisit"
              placeholder="e.g., Delhi, Mumbai, Goa"
              value={formData.placesToVisit}
              onChange={(e) => updateFormData({ placesToVisit: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="portOfExit">Expected Port of Exit *</Label>
            <Select value={formData.portOfExit} onValueChange={(value) => updateFormData({ portOfExit: value })}>
              <SelectTrigger id="portOfExit">
                <SelectValue placeholder="Select port" />
              </SelectTrigger>
              <SelectContent>
                {PORTS.map((port) => (
                  <SelectItem key={port} value={port}>
                    {port}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Previous Visit */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Previous Visit to India</h3>
        <div className="flex gap-6">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="visitYes"
              name="previousVisit"
              value="yes"
              checked={formData.previousVisitIndia === "yes"}
              onChange={(e) => updateFormData({ previousVisitIndia: e.target.value })}
              className="h-4 w-4"
            />
            <Label htmlFor="visitYes" className="font-normal">
              Yes
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="visitNo"
              name="previousVisit"
              value="no"
              checked={formData.previousVisitIndia === "no"}
              onChange={(e) => updateFormData({ previousVisitIndia: e.target.value })}
              className="h-4 w-4"
            />
            <Label htmlFor="visitNo" className="font-normal">
              No
            </Label>
          </div>
        </div>

        {formData.previousVisitIndia === "yes" && (
          <div className="grid gap-4 rounded-lg border border-200 bg-secondary/30 p-4 md:grid-cols-2">
            <Input
              placeholder="Previous Indian Address"
              value={formData.previousIndianAddress}
              onChange={(e) => updateFormData({ previousIndianAddress: e.target.value })}
            />
            <Input
              placeholder="Previous Visa Number"
              value={formData.previousVisaNumber}
              onChange={(e) => updateFormData({ previousVisaNumber: e.target.value })}
            />
            <Input
              placeholder="Year of Visit"
              type="number"
              value={formData.yearOfVisit}
              onChange={(e) => updateFormData({ yearOfVisit: e.target.value })}
            />
            <Input
              placeholder="Visa Type"
              value={formData.visaType}
              onChange={(e) => updateFormData({ visaType: e.target.value })}
            />
          </div>
        )}
      </div>

      {/* References */}
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Reference in India</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              placeholder="Name *"
              value={formData.referenceInIndia.name}
              onChange={(e) =>
                updateFormData({
                  referenceInIndia: { ...formData.referenceInIndia, name: e.target.value },
                })
              }
            />
            <Input
              placeholder="Phone Number *"
              value={formData.referenceInIndia.phone}
              onChange={(e) =>
                updateFormData({
                  referenceInIndia: { ...formData.referenceInIndia, phone: e.target.value },
                })
              }
            />
            <Input
              placeholder="Address *"
              className="md:col-span-2"
              value={formData.referenceInIndia.address}
              onChange={(e) =>
                updateFormData({
                  referenceInIndia: { ...formData.referenceInIndia, address: e.target.value },
                })
              }
            />
            <Input
              placeholder="Email Address *"
              type="email"
              className="md:col-span-2"
              value={formData.referenceInIndia.email}
              onChange={(e) =>
                updateFormData({
                  referenceInIndia: { ...formData.referenceInIndia, email: e.target.value },
                })
              }
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Reference in Home Country</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              placeholder="Name *"
              value={formData.referenceInHomeCountry.name}
              onChange={(e) =>
                updateFormData({
                  referenceInHomeCountry: { ...formData.referenceInHomeCountry, name: e.target.value },
                })
              }
            />
            <Input
              placeholder="Phone Number *"
              value={formData.referenceInHomeCountry.phone}
              onChange={(e) =>
                updateFormData({
                  referenceInHomeCountry: { ...formData.referenceInHomeCountry, phone: e.target.value },
                })
              }
            />
            <Input
              placeholder="Address *"
              className="md:col-span-2"
              value={formData.referenceInHomeCountry.address}
              onChange={(e) =>
                updateFormData({
                  referenceInHomeCountry: { ...formData.referenceInHomeCountry, address: e.target.value },
                })
              }
            />
            <Input
              placeholder="Email Address *"
              type="email"
              value={formData.referenceInHomeCountry.email}
              onChange={(e) =>
                updateFormData({
                  referenceInHomeCountry: { ...formData.referenceInHomeCountry, email: e.target.value },
                })
              }
            />
            <Input
              placeholder="Country Name *"
              value={formData.referenceInHomeCountry.countryName}
              onChange={(e) =>
                updateFormData({
                  referenceInHomeCountry: { ...formData.referenceInHomeCountry, countryName: e.target.value },
                })
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}
