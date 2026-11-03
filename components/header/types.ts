// =================================================================
// Data Types for Header
// =================================================================

export interface City {
  _id: string;
  cityName: string;
}

export interface Treatment {
  _id: string;
  name: string;
  category?: string | null;
}

export interface Specialization {
  _id: string;
  name: string;
}

export interface Doctor {
  _id: string;
  doctorName: string;
  specialization: (Specialization | string)[];
}

export interface Branch {
  _id: string;
  branchName: string;
  city: City[];
  treatments: Treatment[];
  doctors: Doctor[];
  specialist?: any[];
}

export interface Hospital {
  _id: string;
  hospitalName: string;
  treatments?: Treatment[];
  doctors?: Doctor[];
  branches: Branch[];
}

export interface TreatmentItem {
  _id: string;
  name: string;
  category?: string | null;
}

export interface HospitalGroupItem {
  _id: string;
  hospitalName: string;
  slug: string;
}

export interface DepartmentItem {
  _id: string;
  name: string;
  slug: string;
}

// Navigation Types
export interface SubItem {
  href?: string;
  label: string;
  hasNested?: boolean;
  i18nKey?: string;
}

export interface NavItem {
  href?: string;
  label: string;
  i18nKey?: string;
  subItems?: SubItem[];
  isDynamic?: boolean;
  dataType?: 'treatments' | 'hospitals' | 'doctors' | 'testDiagnoses';
}

export interface DoctorItem {
  _id: string;
  doctorName: string;
  specialization: string;
  href: string;
}

export interface TestDiagnosisItem {
  _id: string;
  name: string;
  slug: string;
}

export interface HospitalBranch {
  hospitalName: string;
  branchName: string;
  city: string;
  href: string;
}

// Props Types
export interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  onClear?: () => void;
  showClear?: boolean;
  className?: string;
}

export interface NavItemProps {
  item: NavItem;
  isOpen: boolean;
  onToggle: (label: string) => void;
  isMobile?: boolean;
  treatments: TreatmentItem[];
  hospitals: HospitalBranch[];
  doctors: DoctorItem[];
  testDiagnoses: TestDiagnosisItem[];
  treatmentSearch: string;
  setTreatmentSearch: (value: string) => void;
  hospitalSearch: string;
  setHospitalSearch: (value: string) => void;
  doctorSearch: string;
  setDoctorSearch: (value: string) => void;
  testDiagnosisSearch: string;
  setTestDiagnosisSearch: (value: string) => void;
  onCloseMobile?: () => void;
}

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
  windowWidth: number;
  openSubmenu: string | null;
  onSubmenuToggle: (label: string) => void;
  treatments: TreatmentItem[];
  hospitals: HospitalBranch[];
  doctors: DoctorItem[];
  testDiagnoses: TestDiagnosisItem[];
  treatmentSearch: string;
  setTreatmentSearch: (value: string) => void;
  hospitalSearch: string;
  setHospitalSearch: (value: string) => void;
  doctorSearch: string;
  setDoctorSearch: (value: string) => void;
  testDiagnosisSearch: string;
  setTestDiagnosisSearch: (value: string) => void;
  socialLinks: readonly any[];
}

export interface ContactCTAProps {
  phoneNumber: string;
  onClick?: () => void;
}

export interface HeaderProps {
  isScrolled: boolean;
}
