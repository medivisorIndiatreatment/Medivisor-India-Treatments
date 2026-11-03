export interface HospitalMaster {
  _id: string;
  name: string; // Corresponds to "Name" in CSV
  logo: string | undefined; // Corresponds to "Logo (Image URL)"
  description: string; // Corresponds to "Description"
  specialties: string; // Corresponds to "Specialties (Tags)"
  // You can add more fields from the CSV as needed (e.g., slug, establishedDate)
}