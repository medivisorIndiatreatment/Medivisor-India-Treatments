// Data structure interfaces
export interface WorkExperience {
  position: string;
  organization: string;
  period: string;
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
}

export interface Award {
  title: string;
  year: string;
  organization: string;
}

export interface FAQ {
  q: string;
  a: string;
}



export interface DoctorProfile {
  _id: string;
  name: string;
  title: string;
  specialty: string;
  photo: string;
  experience: string;
  languages: string[];
  hospitals: string[];
  contactPhone: string;
  whatsapp: string;
  about: string;
  workExperience: WorkExperience[];
  education: Education[];
  memberships: string[];
  awards: Award[];
  specialtyInterests: string[];
  faqs: FAQ[];

}