export interface MedicalAdvisor {
  _id?: string;
  name: string;
  title?: string;
  specialty?: string;
  image?: string;
  photo?: string; 
  experience?: string;
  languages?: string;
   woking_hospital?: string;
  hospitals?: string;
  contactPhone?: string;
  whatsapp?: string;
  about?: string;
  workExperience?: string;
  education?: string;
  memberships?: string;
  awards?: string;
  specialtyInterests1?: string[] | null;
  slug?: string;
}

interface Hospital {
  _id: string
  Name: string
  specialty: string
  Type: string
  Tagline: string
  Description: string
  Logo: string
  slug: string
  department1Name: string[]
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
  type: "hospital"
}

interface Treatment {
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
  image: string | null
  type: "treatment"
}