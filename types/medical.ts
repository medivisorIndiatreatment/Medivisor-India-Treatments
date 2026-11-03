// Shared types for medical entities
export interface MedicalAdvisor {
  _id: string
  name: string
  title: string
  specialty: string
  photo?: string
  experience: number
  languages: string[]
  hospital: string
  contactPhone?: string
  whatsapp?: string
  about?: string
  workExperience?: string
  education?: string
  memberships?: string
  awards?: string
  specialtyInterests1yy: string[]
  slug: string
  type: "doctor"
}


export interface Hospital {
  _id: string
  Name: string
  Type: string
  Tagline: string
  Description: string
  Logo?: string
  Departments: string[]
  Facilities: string[]
  Services: string[]
  "Insurance Partners": string[]
  Rating: number
  "Review Count": number
  "Established Year": number
  Website: string
  "Contact Email": string
  "Facebook Link": string
  "Instagram Link": string
  "LinkedIn Link": string
  slug: string
  type: "hospital"
  branches?: HospitalBranch[]
  gallery?: string[]
  address?: string
  phone?: string
  emergencyContact?: string
}

export interface HospitalBranch {
  _id: string
  name: string
  address: string
  phone: string
  services: string[]
  facilities: string[]
  workingHours: string
  emergencyServices: boolean
  image?: string
  slug: string
}

export interface Treatment {
  _id: string
  name: string
  description: string
  slug: string
  department: string
  tags: string[]
  priceRangeMin: number
  priceRangeMax: number
  relatedDoctors: string[]
  durationMinutes: number
  faqs: { question: string; answer: string }[]
  type: "treatment"
  beforeAfterImages?: string[]
  steps?: string[]
  benefits?: string[]
  risks?: string[]
}
