"use client"

import { useState } from "react"
import { StepIndicator } from "./step-indicator"
import { PersonalDetailsStep } from "./steps/personal-details-step"
import { PassportDetailsStep } from "./steps/passport-details-step"
import { AddressDetailsStep } from "./steps/address-details-step"
import { SecurityStep } from "./steps/security-step"
import { ReviewStep } from "./steps/review-step"
import { FormNavigation } from "./form-navigation"

export interface FormData {
  // Step 1: Personal Details
  surname: string
  givenName: string
  gender: string
  townOfBirth: string
  religion: string
  education: string

  // Step 2: Passport Details
  passportNumber: string
  placeOfIssue: string
  dateOfIssue: string
  dateOfExpiry: string

  // Step 3: Address Details
  presentAddress: {
    houseNo: string
    town: string
    state: string
    postal: string
    country: string
    mobile: string
    email: string
  }
  permanentAddressSameAsPresentAddress: boolean
  permanentAddress: {
    houseNo: string
    town: string
    state: string
    postal: string
    country: string
  }
  fatherName: string
  fatherNationality: string
  fatherBirthPlace: string
  motherName: string
  motherNationality: string
  motherBirthPlace: string
  spouseName: string
  spouseNationality: string
  spouseBirthPlace: string
  ancestryPakistan: string

  maritalStatus: string
  parentsGrandparentsPakistaniNational: string
  parentsGrandparentsDetails: string
  previousVisitIndia: string
  previousVisitIndiaDetails: string
  arrested: string
  humanTrafficking: string
  drugCrimes: string
  visaOverstay: string
  cybercrime: string
  terrorist: string

  // Step 4: Visa & Travel Details
  placesToVisit: string
  portOfExit: string
  previousIndianAddress: string
  previousVisaNumber: string
  yearOfVisit: string
  visaType: string
  referenceInIndia: {
    name: string
    phone: string
    address: string
    email: string
  }
  referenceInHomeCountry: {
    name: string
    phone: string
    address: string
    email: string
    countryName: string
  }
}

const TOTAL_STEPS = 5

export function VisaFormContainer() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    surname: "",
    givenName: "",
    gender: "",
    townOfBirth: "",
    religion: "",
    education: "",
    passportNumber: "",
    placeOfIssue: "",
    dateOfIssue: "",
    dateOfExpiry: "",
    presentAddress: {
      houseNo: "",
      town: "",
      state: "",
      postal: "",
      country: "",
      mobile: "",
      email: "",
    },
    permanentAddressSameAsPresentAddress: false,
    permanentAddress: {
      houseNo: "",
      town: "",
      state: "",
      postal: "",
      country: "",
    },
    fatherName: "",
    fatherNationality: "",
    fatherBirthPlace: "",
    motherName: "",
    motherNationality: "",
    motherBirthPlace: "",
    spouseName: "",
    spouseNationality: "",
    spouseBirthPlace: "",
    ancestryPakistan: "",
    maritalStatus: "",
    parentsGrandparentsPakistaniNational: "",
    parentsGrandparentsDetails: "",
    previousVisitIndia: "",
    previousVisitIndiaDetails: "",
    arrested: "",
    humanTrafficking: "",
    drugCrimes: "",
    visaOverstay: "",
    cybercrime: "",
    terrorist: "",
    placesToVisit: "",
    portOfExit: "",
    previousIndianAddress: "",
    previousVisaNumber: "",
    yearOfVisit: "",
    visaType: "",
    referenceInIndia: {
      name: "",
      phone: "",
      address: "",
      email: "",
    },
    referenceInHomeCountry: {
      name: "",
      phone: "",
      address: "",
      email: "",
      countryName: "",
    },
  })

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleSubmit = () => {
    alert("Application submitted successfully! Please check your email for confirmation.")
  }

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* <FormHeader /> */}
        <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />

        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-8 shadow-xs">
          {currentStep === 1 && <PersonalDetailsStep formData={formData} updateFormData={updateFormData} />}
          {currentStep === 2 && <PassportDetailsStep formData={formData} updateFormData={updateFormData} />}
          {currentStep === 3 && <AddressDetailsStep formData={formData} updateFormData={updateFormData} />}
          {currentStep === 4 && <SecurityStep formData={formData} updateFormData={updateFormData} />}
          {currentStep === 5 && <ReviewStep formData={formData} />}

          <FormNavigation
            currentStep={currentStep}
            totalSteps={TOTAL_STEPS}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  )
}
