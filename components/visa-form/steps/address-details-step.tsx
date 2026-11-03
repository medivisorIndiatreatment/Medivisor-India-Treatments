"use client"

import type { FormData } from "../visa-form-container"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface StepProps {
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
}

const COUNTRIES = ["India", "United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "Japan"]
const INDIAN_STATES = ["Delhi", "Maharashtra", "Karnataka", "Tamil Nadu", "West Bengal", "Gujarat", "Rajasthan"]
const MARITAL_STATUS_OPTIONS = ["Single", "Married", "Divorced", "Widowed", "Separated"]

const inputClassName = "border border-gray-200 bg-gray-50 text-gray-800 rounded-lg px-4 py-3 transition-all duration-200 placeholder:text-gray-500 hover:bg-white hover:border-gray-300 focus:outline-none focus:bg-white focus:border-gray-400 focus:ring-1 focus:ring-gray-200 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"

const selectTriggerClassName = "border border-gray-200 bg-gray-50 text-gray-800 rounded-lg px-4 py-3 transition-all duration-200 hover:bg-white hover:border-gray-300 focus:ring-1 focus:ring-gray-200"

const selectContentClassName = "bg-gray-50 border border-gray-200 text-gray-800"

export function AddressDetailsStep({ formData, updateFormData }: StepProps) {
  const handlePermanentAddressSameAsPresent = (checked: boolean) => {
    updateFormData({ permanentAddressSameAsPresentAddress: checked })
    if (checked) {
      updateFormData({
        permanentAddress: {
          houseNo: formData.presentAddress.houseNo,
          town: formData.presentAddress.town,
          state: formData.presentAddress.state,
          postal: formData.presentAddress.postal,
          country: formData.presentAddress.country,
        },
      })
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-6 text-2xl font-bold text-foreground">Step 3: Address & Family Details</h2>
      </div>

      {/* Present Address */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Present Address</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            className={inputClassName}
            placeholder="House No. / Street *"
            value={formData.presentAddress.houseNo}
            onChange={(e) =>
              updateFormData({
                presentAddress: { ...formData.presentAddress, houseNo: e.target.value },
              })
            }
          />
          <Input
            className={inputClassName}
            placeholder="Town / City *"
            value={formData.presentAddress.town}
            onChange={(e) =>
              updateFormData({
                presentAddress: { ...formData.presentAddress, town: e.target.value },
              })
            }
          />
          <Select
            value={formData.presentAddress.state}
            onValueChange={(value) =>
              updateFormData({
                presentAddress: { ...formData.presentAddress, state: value },
              })
            }
          >
            <SelectTrigger className={selectTriggerClassName}>
              <SelectValue placeholder="State / Province *" />
            </SelectTrigger>
            <SelectContent className={selectContentClassName}>
              {INDIAN_STATES.map((state) => (
                <SelectItem key={state} value={state} className="hover:bg-gray-100 focus:bg-gray-100">
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            className={inputClassName}
            placeholder="Postal / ZIP Code *"
            value={formData.presentAddress.postal}
            onChange={(e) =>
              updateFormData({
                presentAddress: { ...formData.presentAddress, postal: e.target.value },
              })
            }
          />
          <Select
            value={formData.presentAddress.country}
            onValueChange={(value) =>
              updateFormData({
                presentAddress: { ...formData.presentAddress, country: value },
              })
            }
          >
            <SelectTrigger className={selectTriggerClassName}>
              <SelectValue placeholder="Country *" />
            </SelectTrigger>
            <SelectContent className={selectContentClassName}>
              {COUNTRIES.map((country) => (
                <SelectItem key={country} value={country} className="hover:bg-gray-100 focus:bg-gray-100">
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            className={inputClassName}
            placeholder="Mobile Number *"
            value={formData.presentAddress.mobile}
            onChange={(e) =>
              updateFormData({
                presentAddress: { ...formData.presentAddress, mobile: e.target.value },
              })
            }
          />
          <Input
            className={`${inputClassName} md:col-span-2`}
            placeholder="Email Address *"
            type="email"
            value={formData.presentAddress.email}
            onChange={(e) =>
              updateFormData({
                presentAddress: { ...formData.presentAddress, email: e.target.value },
              })
            }
          />
        </div>
      </div>

      {/* Permanent Address */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="sameAddress"
            checked={formData.permanentAddressSameAsPresentAddress}
            onCheckedChange={handlePermanentAddressSameAsPresent}
            className="border-gray-300 bg-gray-50 data-[state=checked]:bg-gray-800 data-[state=checked]:border-gray-800"
          />
          <Label htmlFor="sameAddress" className="font-medium">
            Same as Present Address
          </Label>
        </div>

        {!formData.permanentAddressSameAsPresentAddress && (
          <div>
            <h3 className="mb-4 text-lg font-semibold text-foreground">Permanent Address</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                className={inputClassName}
                placeholder="House No. / Street *"
                value={formData.permanentAddress.houseNo}
                onChange={(e) =>
                  updateFormData({
                    permanentAddress: { ...formData.permanentAddress, houseNo: e.target.value },
                  })
                }
              />
              <Input
                className={inputClassName}
                placeholder="Town / City *"
                value={formData.permanentAddress.town}
                onChange={(e) =>
                  updateFormData({
                    permanentAddress: { ...formData.permanentAddress, town: e.target.value },
                  })
                }
              />
              <Select
                value={formData.permanentAddress.state}
                onValueChange={(value) =>
                  updateFormData({
                    permanentAddress: { ...formData.permanentAddress, state: value },
                  })
                }
              >
                <SelectTrigger className={selectTriggerClassName}>
                  <SelectValue placeholder="State / Province *" />
                </SelectTrigger>
                <SelectContent className={selectContentClassName}>
                  {INDIAN_STATES.map((state) => (
                    <SelectItem key={state} value={state} className="hover:bg-gray-100 focus:bg-gray-100">
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                className={inputClassName}
                placeholder="Postal / ZIP Code *"
                value={formData.permanentAddress.postal}
                onChange={(e) =>
                  updateFormData({
                    permanentAddress: { ...formData.permanentAddress, postal: e.target.value },
                  })
                }
              />
              <Select
                value={formData.permanentAddress.country}
                onValueChange={(value) =>
                  updateFormData({
                    permanentAddress: { ...formData.permanentAddress, country: value },
                  })
                }
              >
                <SelectTrigger className={selectTriggerClassName}>
                  <SelectValue placeholder="Country *" />
                </SelectTrigger>
                <SelectContent className={selectContentClassName}>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country} value={country} className="hover:bg-gray-100 focus:bg-gray-100">
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Family Details & Marital Status */}
      <div className="space-y-6 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-50/50 p-6">
        <h3 className="text-lg font-semibold text-foreground">Family Details</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Father Details */}
          <Input
            className={inputClassName}
            placeholder="Father's Full Name *"
            value={formData.fatherName}
            onChange={(e) => updateFormData({ fatherName: e.target.value })}
          />
          <Select
            value={formData.fatherNationality}
            onValueChange={(value) => updateFormData({ fatherNationality: value })}
          >
            <SelectTrigger className={selectTriggerClassName}>
              <SelectValue placeholder="Father's Nationality *" />
            </SelectTrigger>
            <SelectContent className={selectContentClassName}>
              {COUNTRIES.map((country) => (
                <SelectItem key={country} value={country} className="hover:bg-gray-100 focus:bg-gray-100">
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            className={`${inputClassName} md:col-span-2`}
            placeholder="Father's Place of Birth"
            value={formData.fatherBirthPlace}
            onChange={(e) => updateFormData({ fatherBirthPlace: e.target.value })}
          />

          {/* Mother Details */}
          <Input
            className={inputClassName}
            placeholder="Mother's Full Name *"
            value={formData.motherName}
            onChange={(e) => updateFormData({ motherName: e.target.value })}
          />
          <Select
            value={formData.motherNationality}
            onValueChange={(value) => updateFormData({ motherNationality: value })}
          >
            <SelectTrigger className={selectTriggerClassName}>
              <SelectValue placeholder="Mother's Nationality *" />
            </SelectTrigger>
            <SelectContent className={selectContentClassName}>
              {COUNTRIES.map((country) => (
                <SelectItem key={country} value={country} className="hover:bg-gray-100 focus:bg-gray-100">
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            className={`${inputClassName} md:col-span-2`}
            placeholder="Mother's Place of Birth"
            value={formData.motherBirthPlace}
            onChange={(e) => updateFormData({ motherBirthPlace: e.target.value })}
          />
        </div>

        {/* Marital Status Selection */}
        <div className="mt-6 space-y-3 border-t border-blue-200 pt-6">
          <Label htmlFor="maritalStatus" className="block text-sm font-semibold text-foreground">
            Applicant's Marital Status *
          </Label>
          <Select value={formData.maritalStatus} onValueChange={(value) => updateFormData({ maritalStatus: value })}>
            <SelectTrigger id="maritalStatus" className={selectTriggerClassName}>
              <SelectValue placeholder="Select Marital Status" />
            </SelectTrigger>
            <SelectContent className={selectContentClassName}>
              {MARITAL_STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status} className="hover:bg-gray-100 focus:bg-gray-100">
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Spouse Details (Show only if Married) */}
        {formData.maritalStatus === "Married" && (
          <div className="grid gap-4 md:grid-cols-2 mt-4 p-4 border border-blue-100 rounded-lg bg-white/50 animate-in fade-in slide-in-from-top-2">
            <h4 className="text-md font-semibold text-foreground md:col-span-2">Spouse Details</h4>
            <Input
              className={inputClassName}
              placeholder="Spouse's Full Name *"
              value={formData.spouseName || ""}
              onChange={(e) => updateFormData({ spouseName: e.target.value })}
            />
            <Select
              value={formData.spouseNationality || ""}
              onValueChange={(value) => updateFormData({ spouseNationality: value })}
            >
              <SelectTrigger className={selectTriggerClassName}>
                <SelectValue placeholder="Spouse's Nationality *" />
              </SelectTrigger>
              <SelectContent className={selectContentClassName}>
                {COUNTRIES.map((country) => (
                  <SelectItem key={country} value={country} className="hover:bg-gray-100 focus:bg-gray-100">
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              className={`${inputClassName} md:col-span-2`}
              placeholder="Spouse's Place of Birth *"
              value={formData.spouseBirthPlace || ""}
              onChange={(e) => updateFormData({ spouseBirthPlace: e.target.value })}
            />
          </div>
        )}

        {/* Ancestry Question */}
        <div className="mt-6 space-y-4 border-t border-blue-200 pt-6">
          <Label className="text-base font-semibold">
            Were your Parents/Grandparents (paternal/maternal) Pakistan Nationals or Belong to Pakistan held area? *
          </Label>
          <div className="flex flex-col space-y-4">
            <div className="flex gap-6">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="ancestryYes"
                  name="ancestry"
                  value="yes"
                  checked={formData.ancestryPakistan === "yes"}
                  onChange={(e) => updateFormData({ ancestryPakistan: e.target.value })}
                  className="h-4 w-4 border-gray-300 bg-gray-50 text-gray-800"
                />
                <Label htmlFor="ancestryYes" className="font-normal cursor-pointer">
                  Yes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="ancestryNo"
                  name="ancestry"
                  value="no"
                  checked={formData.ancestryPakistan === "no"}
                  onChange={(e) => updateFormData({ ancestryPakistan: e.target.value })}
                  className="h-4 w-4 border-gray-300 bg-gray-50 text-gray-800"
                />
                <Label htmlFor="ancestryNo" className="font-normal cursor-pointer">
                  No
                </Label>
              </div>
            </div>

            {formData.ancestryPakistan === "yes" && (
              <div className="flex flex-col space-y-2 max-w-md animate-in fade-in slide-in-from-top-1">
                <Label htmlFor="ancestryDetails" className="text-sm font-medium">
                  If Yes, give details <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="ancestryDetails"
                  className={inputClassName}
                  placeholder="Provide specific details about ancestry"
                  value={formData.parentsGrandparentsDetails || ""}
                  onChange={(e) => updateFormData({ parentsGrandparentsDetails: e.target.value })}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}