'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitMedivisorForm } from '@/app/api/submit-espe/route';
import { Trans } from '@/lib/i18n/Trans';

export default function MedivisorForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      // Get form values
      const name = formData.get('name') as string;
      const email = formData.get('email') as string;
      const whatsapp = formData.get('whatsapp') as string;
      const background = formData.get('background') as string;
      const message = formData.get('message') as string || '';

      // Transform to match submitMedivisorForm structure
      const data = {
        fullName: name,
        applicantType: 'individual',
        contactPerson: name,
        phone: whatsapp, // Use WhatsApp as the primary phone
        whatsapp: whatsapp,
        email: email,
        address: '',
        city: '',
        background: background,
        backgroundDescription: '',
        yearsWorking: '1-3',
        motivation: message || 'No motivation provided',
        experience: '',
        hasOffice: 'false',
        officeLocation: '',
        hasSmartphone: true,
        hasWhatsapp: true,
        hasEmail: true,
        hasInternet: true,
        serviceArea: 'local',
        agreeTerms: true,
        signatureName: name,
        signatureDate: new Date().toISOString().split('T')[0],
      };

      // Default attachments
      const attachments = {
        idProof: false,
        cv: false,
        orgRegistration: false,
        reference: false,
      };

      // Call server action
      const result = await submitMedivisorForm(data, attachments);

      if (result && result.ok) {
        router.push('/thank-you');
      } else {
        setError(result?.error || 'Something went wrong');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Form submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl bg-white p-4 shadow-xs border border-gray-100">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
<h3 className="text-xl font-bold text-gray-900" data-i18n="espe.title" data-i18n-original="Join Our Programme">
            <Trans id="espe.title">Join Our Programme</Trans>
          </h3>
        </div>
        <p className="text-gray-600 text-sm" data-i18n="espe.desc" data-i18n-original="Fill in the form and we will connect with you soon.">
          <Trans id="espe.desc">Fill in the form and we will connect with you soon.</Trans>
        </p>
      </div>

      {/* Error message */}
      {error && (
<div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm" data-i18n-original={error}>
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Form fields */}
        {[
          { id: "name", name: "name", label: "Full Name", type: "text", placeholder: "Enter your full name", required: true },
          { id: "email", name: "email", label: "Email Address", type: "email", placeholder: "Enter your email address", required: true },
          { id: "whatsapp", name: "whatsapp", label: "WhatsApp Number", type: "tel", placeholder: "Enter WhatsApp number", required: true }
        ].map((field) => (
          <div key={field.id}>
            <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-1" data-i18n-original={field.label}>
              {field.label}
            </label>
            <input
              type={field.type}
              id={field.id}
              name={field.name}
              placeholder={field.placeholder}
              required={field.required}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:ring-opacity-50 transition-colors text-sm"
              autoComplete={field.type === "email" ? "email" : "on"}
              disabled={isSubmitting}
              data-i18n-original={field.placeholder}
            />
          </div>
        ))}

        {/* Dropdown */}
        <div>
<label htmlFor="background" className="block text-sm font-medium text-gray-700 mb-1" data-i18n="espe.background-label" data-i18n-original="Background/Experience">
            <Trans id="espe.background-label">Background/Experience</Trans> <span className="text-red-500">*</span>
          </label>
          <div className="relative">
             <select
               id="background"
               name="background"
               required
               className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:ring-opacity-50 transition-colors appearance-none text-sm bg-white"
               disabled={isSubmitting}
             >
               <option value="" data-i18n="espe.select-background" data-i18n-original="Select your background">Select your background</option>
               <option value="medical" data-i18n="espe.medical" data-i18n-original="Medical/Healthcare">Medical/Healthcare</option>
               <option value="social" data-i18n="espe.social" data-i18n-original="Social Work">Social Work</option>
               <option value="community" data-i18n="espe.community" data-i18n-original="Community Leadership">Community Leadership</option>
               <option value="business" data-i18n="espe.business" data-i18n-original="Business/Entrepreneurship">Business/Entrepreneurship</option>
               <option value="other" data-i18n="espe.other" data-i18n-original="Other">Other</option>
             </select>
            <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-3">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Textarea */}
        <div>
 <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1" data-i18n="espe.motivation-label" data-i18n-original="Why do you want to join?">
            <Trans id="espe.motivation-label">Why do you want to join?</Trans>
            <span className="text-gray-500 font-normal ms-1" data-i18n-original="(Optional)"><Trans id="espe.optional">(Optional)</Trans></span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={3}
            placeholder="Share your motivation briefly..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:ring-opacity-50 transition-colors resize-none text-sm"
            maxLength={300}
            disabled={isSubmitting}
 data-i18n="espe.motivation-placeholder" data-i18n-original="Share your motivation briefly..."
          />
          <div className="text-end mt-1">
            <span className="text-xs text-gray-500" data-i18n="espe.max-chars" data-i18n-original="Maximum 300 characters">
              <Trans id="espe.max-chars">Maximum 300 characters</Trans>
            </span>
          </div>
        </div>

        {/* Submit button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-[#23366E] text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-[#23366E] focus:ring-offset-2 text-sm ${
              isSubmitting 
                ? 'opacity-70 cursor-not-allowed' 
                : 'hover:bg-[#23366E] active:bg-[#23366E]'
            }`}
            data-i18n-original={isSubmitting ? "Submitting..." : "Submit Application"}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ms-1 me-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
 <Trans id="espe.submitting">Submitting...</Trans>
              </span>
            ) : (
              <Trans id="espe.submit">Submit Application</Trans>
            )}
          </button>
          
          <p className="text-xs text-gray-500 mt-2 text-center" data-i18n="espe.terms" data-i18n-original="By submitting, you agree to our terms and privacy policy.">
            <Trans id="espe.terms">By submitting, you agree to our terms and privacy policy.</Trans>
          </p>
        </div>
      </form>
    </div>
  );
}
