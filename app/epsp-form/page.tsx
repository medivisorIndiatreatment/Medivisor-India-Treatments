'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { submitMedivisorForm } from '@/app/api/epse-form/route';

interface EpspFormData {
  fullName: string;
  applicantType: string;
  contactPerson: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  background: string;
  backgroundDescription: string;
  yearsWorking: string;
  motivation: string;
  experience: string;
  hasOffice: string;
  officeLocation: string;
  hasSmartphone: boolean;
  hasWhatsapp: boolean;
  hasEmail: boolean;
  hasInternet: boolean;
  serviceArea: string;
  agreeTerms: boolean;
  signatureName: string;
  signatureDate: string;
}

interface Attachments {
  idProof: boolean;
  cv: boolean;
  orgRegistration: boolean;
  reference: boolean;
}

interface FormFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  isTextarea?: boolean;
  error?: string;
  required?: boolean;
}

function FormField({
  label,
  name,
  value,
  onChange,
  type = 'text',
  isTextarea = false,
  error,
  required = false,
}: FormFieldProps) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-semibold text-slate-900 mb-2">
        {label}
        {required && <span className="text-[#E22026] ml-1">*</span>}
      </label>
      {isTextarea ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          rows={4}
          className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#E22026] focus:border-transparent transition resize-vertical ${
            error ? 'border-red-500' : 'border-slate-300'
          }`}
        />
      ) : (
        <input
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#E22026] focus:border-transparent transition ${
            error ? 'border-red-500' : 'border-slate-300'
          }`}
        />
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default function MedivisorForm() {
  const router = useRouter();
  
  const [formData, setFormData] = useState<EpspFormData>({
    fullName: '',
    applicantType: '',
    contactPerson: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    city: '',
    background: '',
    backgroundDescription: '',
    yearsWorking: '',
    motivation: '',
    experience: '',
    hasOffice: '',
    officeLocation: '',
    hasSmartphone: false,
    hasWhatsapp: false,
    hasEmail: false,
    hasInternet: false,
    serviceArea: '',
    agreeTerms: false,
    signatureName: '',
    signatureDate: '',
  });

  const [attachments, setAttachments] = useState<Attachments>({
    idProof: false,
    cv: false,
    orgRegistration: false,
    reference: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      if (
        name === 'hasSmartphone' ||
        name === 'hasWhatsapp' ||
        name === 'hasEmail' ||
        name === 'hasInternet' ||
        name === 'agreeTerms'
      ) {
        setFormData((prev) => ({
          ...prev,
          [name]: checked,
        }));
      } else {
        setAttachments((prev) => ({
          ...prev,
          [name]: checked,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Required';
    if (!formData.applicantType) newErrors.applicantType = 'Required';
    if (!formData.phone.trim()) newErrors.phone = 'Required';
    if (!formData.email.trim()) {
      newErrors.email = 'Required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!formData.background) newErrors.background = 'Required';
    if (!formData.yearsWorking) newErrors.yearsWorking = 'Required';
    if (!formData.motivation.trim()) newErrors.motivation = 'Required';
    if (!formData.hasOffice) newErrors.hasOffice = 'Required';
    if (!formData.serviceArea.trim()) newErrors.serviceArea = 'Required';
    if (!formData.signatureName.trim()) newErrors.signatureName = 'Required';
    if (!formData.signatureDate) newErrors.signatureDate = 'Required';
    if (!formData.agreeTerms) newErrors.agreeTerms = 'You must agree to the declaration';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitMedivisorForm(formData, attachments);
      
      if (result.ok) {
        router.push('/thank-you');
      } else {
        setSubmitError(result.error || 'Failed to submit form');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      applicantType: '',
      contactPerson: '',
      phone: '',
      whatsapp: '',
      email: '',
      address: '',
      city: '',
      background: '',
      backgroundDescription: '',
      yearsWorking: '',
      motivation: '',
      experience: '',
      hasOffice: '',
      officeLocation: '',
      hasSmartphone: false,
      hasWhatsapp: false,
      hasEmail: false,
      hasInternet: false,
      serviceArea: '',
      agreeTerms: false,
      signatureName: '',
      signatureDate: '',
    });
    setAttachments({ idProof: false, cv: false, orgRegistration: false, reference: false });
    setErrors({});
    setSubmitError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-[#E22026] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Medivisor EPSP</h1>
          <p className="text-lg md:text-xl opacity-90 mb-2">
            Expression of Interest Form
          </p>
          <p className="text-base opacity-85">
            Community Health Partners (Health Ambassadors) – Papua New Guinea
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Error Message */}
        {submitError && (
          <div className="mb-8 bg-red-50 border border-red-300 rounded-xl p-6">
            <p className="font-bold text-red-900 mb-1">Submission Error</p>
            <p className="text-red-800">{submitError}</p>
            <p className="text-red-700 text-sm mt-2">
              Please try again or contact support at info@medivisorhealth.com
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Applicant Details */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-8 py-6 bg-gradient-to-r from-[#E22026]/10 to-transparent border-b border-slate-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E22026] text-white flex items-center justify-center font-bold text-lg">
                1
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Applicant Details</h2>
            </div>

            <div className="p-8 space-y-6">
              <FormField
                label="Full Name / Organization Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                error={errors.fullName}
                required
              />

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Type of Applicant <span className="text-[#E22026]">*</span>
                </label>
                <select
                  name="applicantType"
                  value={formData.applicantType}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#E22026] focus:border-transparent transition ${
                    errors.applicantType ? 'border-red-500' : 'border-slate-300'
                  }`}
                >
                  <option value="">Select...</option>
                  <option value="individual">Individual</option>
                  <option value="organization">Organization</option>
                </select>
                {errors.applicantType && (
                  <p className="text-red-500 text-xs mt-1">{errors.applicantType}</p>
                )}
              </div>

              {formData.applicantType === 'organization' && (
                <FormField
                  label="Contact Person (if Organization)"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Phone / Mobile Number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  error={errors.phone}
                  required
                />
                <FormField
                  label="WhatsApp Number"
                  name="whatsapp"
                  type="tel"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                />
              </div>

              <FormField
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                error={errors.email}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Full Address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                />
                <FormField
                  label="City / Province / Region"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Background Information */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-8 py-6 bg-gradient-to-r from-[#E22026]/10 to-transparent border-b border-slate-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E22026] text-white flex items-center justify-center font-bold text-lg">
                2
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Background Information</h2>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  Background <span className="text-[#E22026]">*</span>
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'medical', label: 'Medical/Healthcare' },
                    { value: 'church', label: 'Church/Faith-based' },
                    { value: 'ngo', label: 'NGO/Social Work' },
                    { value: 'community', label: 'Community Leader' },
                    { value: 'business', label: 'Business' },
                    { value: 'other', label: 'Other' },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="background"
                        value={option.value}
                        checked={formData.background === option.value}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-[#E22026] focus:ring-[#E22026] cursor-pointer"
                      />
                      <span className="text-sm text-slate-700">{option.label}</span>
                    </label>
                  ))}
                </div>
                {errors.background && (
                  <p className="text-red-500 text-xs mt-2">{errors.background}</p>
                )}
              </div>

              <FormField
                label="Briefly describe your work / role in the community"
                name="backgroundDescription"
                value={formData.backgroundDescription}
                onChange={handleInputChange}
                isTextarea
              />

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  How long have you been working in this community? <span className="text-[#E22026]">*</span>
                </label>
                <select
                  name="yearsWorking"
                  value={formData.yearsWorking}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#E22026] focus:border-transparent transition ${
                    errors.yearsWorking ? 'border-red-500' : 'border-slate-300'
                  }`}
                >
                  <option value="">Select...</option>
                  <option value="less1">&lt; 1 year</option>
                  <option value="1-3">1 - 3 years</option>
                  <option value="3-5">3 - 5 years</option>
                  <option value="more5">&gt; 5 years</option>
                </select>
                {errors.yearsWorking && (
                  <p className="text-red-500 text-xs mt-1">{errors.yearsWorking}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Motivation & Interest */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-8 py-6 bg-gradient-to-r from-[#E22026]/10 to-transparent border-b border-slate-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E22026] text-white flex items-center justify-center font-bold text-lg">
                3
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Motivation & Interest</h2>
            </div>

            <div className="p-8 space-y-6">
              <FormField
                label="Why do you want to join the Medivisor Expanded Patient Support Programme?"
                name="motivation"
                value={formData.motivation}
                onChange={handleInputChange}
                isTextarea
                error={errors.motivation}
                required
              />

              <FormField
                label="Do you have experience helping patients or families with medical issues? If yes, please explain briefly:"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                isTextarea
              />
            </div>
          </div>

          {/* Section 4: Basic Facilities */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-8 py-6 bg-gradient-to-r from-[#E22026]/10 to-transparent border-b border-slate-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E22026] text-white flex items-center justify-center font-bold text-lg">
                4
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Basic Facilities</h2>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Do you have a small office / place to meet people? <span className="text-[#E22026]">*</span>
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="hasOffice"
                      value="yes"
                      checked={formData.hasOffice === 'yes'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-[#E22026] focus:ring-[#E22026] cursor-pointer"
                    />
                    <span className="text-sm text-slate-700">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="hasOffice"
                      value="no"
                      checked={formData.hasOffice === 'no'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-[#E22026] focus:ring-[#E22026] cursor-pointer"
                    />
                    <span className="text-sm text-slate-700">No</span>
                  </label>
                </div>
                {errors.hasOffice && (
                  <p className="text-red-500 text-xs mt-2">{errors.hasOffice}</p>
                )}
              </div>

              {formData.hasOffice === 'yes' && (
                <FormField
                  label="Office Location"
                  name="officeLocation"
                  value={formData.officeLocation}
                  onChange={handleInputChange}
                />
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  Do you have access to:
                </label>
                <div className="space-y-2">
                  {[{
                    name: 'hasSmartphone', label: 'Smartphone'
                  }, {
                    name: 'hasWhatsapp', label: 'WhatsApp'
                  }, {
                    name: 'hasEmail', label: 'Email'
                  }, {
                    name: 'hasInternet', label: 'Internet'
                  }].map((item) => (
                    <label key={item.name} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name={item.name}
                        checked={formData[item.name as keyof EpspFormData] as boolean}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-[#E22026] focus:ring-[#E22026] cursor-pointer rounded"
                      />
                      <span className="text-sm text-slate-700">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Area of Service */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-8 py-6 bg-gradient-to-r from-[#E22026]/10 to-transparent border-b border-slate-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E22026] text-white flex items-center justify-center font-bold text-lg">
                5
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Area of Service</h2>
            </div>

            <div className="p-8">
              <FormField
                label="Which area / city / province would you like to serve?"
                name="serviceArea"
                value={formData.serviceArea}
                onChange={handleInputChange}
                error={errors.serviceArea}
                required
              />
            </div>
          </div>

          {/* Section 6: Documents */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-8 py-6 bg-gradient-to-r from-[#E22026]/10 to-transparent border-b border-slate-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E22026] text-white flex items-center justify-center font-bold text-lg">
                6
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Documents</h2>
            </div>

            <div className="p-8 space-y-4">
              <p className="text-sm text-slate-700 mb-4">Attach if available:</p>
              {[{
                name: 'idProof', label: 'ID Proof'
              }, {
                name: 'cv', label: 'Short CV / Profile'
              }, {
                name: 'orgRegistration', label: 'Organization Registration (if applicable)'
              }, {
                name: 'reference', label: 'Any Reference / Recommendation (if available)'
              }].map((doc) => (
                <label key={doc.name} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name={doc.name}
                    checked={attachments[doc.name as keyof Attachments]}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#E22026] focus:ring-[#E22026] cursor-pointer rounded"
                  />
                  <span className="text-sm text-slate-700">{doc.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Section 7: Declaration */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-8 py-6 bg-gradient-to-r from-[#E22026]/10 to-transparent border-b border-slate-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E22026] text-white flex items-center justify-center font-bold text-lg">
                7
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Declaration</h2>
            </div>

            <div className="p-8 space-y-6">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-700 leading-relaxed">
                  I understand that this is a service-oriented, patient-first programme. I will not misguide or force any patient. I will always act ethically and in the best interest of patients. I will follow Medivisor&apos;s guidance and processes.
                </p>
              </div>

              <p className="text-sm text-slate-700">
                I confirm that the information given above is true to the best of my knowledge.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Full Name (Signature)"
                  name="signatureName"
                  value={formData.signatureName}
                  onChange={handleInputChange}
                  error={errors.signatureName}
                  required
                />
                <FormField
                  label="Date"
                  name="signatureDate"
                  type="date"
                  value={formData.signatureDate}
                  onChange={handleInputChange}
                  error={errors.signatureDate}
                  required
                />
              </div>

              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-slate-50 transition">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-[#E22026] focus:ring-[#E22026] cursor-pointer rounded mt-1 flex-shrink-0"
                />
                <span className="text-sm text-slate-700">
                  I agree to the declaration and terms of the Medivisor EPSP programme <span className="text-[#E22026] font-medium">*</span>
                </span>
              </label>
              {errors.agreeTerms && (
                <p className="text-red-500 text-xs">{errors.agreeTerms}</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 bg-[#E22026] text-white font-semibold py-3 rounded-lg transition active:scale-95 flex items-center justify-center gap-2 ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#E22026]/90'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : 'Submit Application'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={isSubmitting}
              className="px-8 bg-slate-200 text-slate-900 font-semibold py-3 rounded-lg hover:bg-slate-300 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear Form
            </button>
          </div>
        </form>

        {/* Footer Info */}
        <div className="mt-8 bg-white rounded-md shadow-xs border border-slate-200 p-6">
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-900">Please submit this form to:</span>
            <br />
            Medivisor India Treatment / Medivisor PNG Team
            <br />
            Email: <span className="text-[#E22026]">info@medivisorhealth.com</span>
            <br />
            WhatsApp: <span className="text-[#E22026]">+1-234-567-8900</span>
            <br />
            <span className="text-xs text-slate-500 mt-2 block">
              Your data will be stored securely in our Wix CMS database.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}