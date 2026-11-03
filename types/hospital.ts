// File: types/hospital.ts
// Extracted all interfaces to a separate types file for better organization

export interface AccreditationType {
  _id: string;
  name: string;
  description: string | null;
  image: string | null;
  issuingBody: string | null;
  year: string | null;
}

export interface SpecialtyType {
  _id: string;
  name: string;
}

export interface DoctorType {
  _id: string;
  name: string;
  specialization: SpecialtyType[] | string[] | string | null;
  qualification: string | null;
  experience: string | null;
  designation: string | null;
  languagesSpoken: string | null;
  about: string | null;
  profileImage: any | null;
  popular?: boolean;
  treatments?: any[];
}

export interface ExtendedDoctorType extends DoctorType {
  hospitalName: string;
  branchName?: string;
  branchId?: string;
}

export interface TreatmentType {
  _id: string;
  name: string;
  description: string | null;
  category: string | null;
  duration: string | null;
  cost: string | null;
  treatmentImage?: string | null;
  popular?: boolean;
}

export interface ExtendedTreatmentType extends TreatmentType {
  hospitalName: string;
  branchName?: string;
  branchId?: string;
}

export interface CityType {
  _id: string;
  name: string;
  state: string | null;
  country: string | null;
}

export interface BranchType {
  _id: string;
  name: string;
  address: string | null;
  city: CityType[] | null;
  contactNumber: string | null;
  email: string | null;
  totalBeds: number | null;
  icuBeds: string | null;
  yearEstablished: number | null;
  emergencyContact: string | null;
  branchImage: any | null;
  description: string | null;
  doctors: DoctorType[];
  treatments: TreatmentType[];
  specialties: SpecialtyType[];
  accreditation: AccreditationType[];
  noOfDoctors: string | null;
  popular?: boolean;
}

export interface HospitalType {
  _id: string;
  name: string;
  slug: string | null;
  image: string | null;
  logo: string | null;
  yearEstablished: string | null;
  accreditation: AccreditationType[] | null;
  beds: string | null;
  emergencyServices: boolean | null;
  description: string | null;
  website: string | null;
  email: string | null;
  contactNumber: string | null;
  branches: BranchType[];
  doctors: DoctorType[];
  treatments: TreatmentType[];
}

export interface ViewToggleProps {
  view: 'hospitals' | 'doctors' | 'treatments';
  setView: (view: 'hospitals' | 'doctors' | 'treatments') => void;
}

export interface SortingProps {
  sortBy: 'all' | 'popular' | 'az' | 'za';
  setSortBy: (sortBy: 'all' | 'popular' | 'az' | 'za') => void;
}

export interface ResultsHeaderProps {
  view: 'hospitals' | 'doctors' | 'treatments';
  currentCount: number;
  clearFilters: () => void;
  sortBy: 'all' | 'popular' | 'az' | 'za';
  setSortBy: (sortBy: 'all' | 'popular' | 'az' | 'za') => void;
}

export interface MobileFilterButtonProps {
  setShowFilters: (show: boolean) => void;
}

export interface HospitalCardProps {
  branch: BranchType;
  hospitalName: string;
  hospitalLogo: string | null;
  treatmentName?: string | null;
}

export interface DoctorCardProps {
  doctor: ExtendedDoctorType;
  treatmentName?: string | null; // New prop for displaying treatment name in doctor card when filtered
}

export interface TreatmentCardProps {
  treatment: ExtendedTreatmentType;
}

export interface FilterDropdownProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: { id: string; name: string }[];
  selectedOption: string;
  onOptionSelect: (id: string) => void;
  onClear: () => void;
  type: "branch" | "city" | "treatment" | "doctor" | "specialty";
}

// Additional types for utils (if needed)
export type SortByType = 'all' | 'popular' | 'az' | 'za';
export type ViewType = 'hospitals' | 'doctors' | 'treatments';