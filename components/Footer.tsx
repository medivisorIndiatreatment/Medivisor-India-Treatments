'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { DESIGN_TOKENS } from './design-tokens';
import { MapPin, Phone, Mail, Send, Check, AlertCircle, Loader2 } from 'lucide-react';
import { FaFacebookF, FaYoutube, FaInstagram } from 'react-icons/fa';
import { Trans } from '@/lib/i18n/Trans';
import { useI18n } from '@/lib/i18n';

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
}

interface FormStatus {
  state: 'idle' | 'submitting' | 'success' | 'error';
  message?: string;
}

const validateForm = (data: FormData, t: (text: string) => string): FormErrors => {
  const errors: FormErrors = {};

  if (!data.name.trim()) {
    errors.name = t('Please enter your name');
  }

  if (!data.email.trim()) {
    errors.email = t('Please enter your email');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = t('Please enter a valid email');
  }

  if (!data.phone.trim()) {
    errors.phone = t('Please enter your phone number');
  } else if (!/^[0-9+\s()-]{6,20}$/.test(data.phone)) {
    errors.phone = t('Please enter a valid phone number');
  }

  if (!data.message.trim()) {
    errors.message = t('Please enter your message');
  } else if (data.message.trim().length < 10) {
    errors.message = t('Message must be at least 10 characters');
  }

  return errors;
};

const submitFooterForm = async (data: FormData) => {
  const response = await fetch('/api/submit-form', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      countryName: 'India',
      countryCode: '+91',
      whatsapp: data.phone.replace(/\D/g, ''),
      message: data.message,
    }),
  });
  const result = await response.json().catch(() => ({}));
  return { ok: response.ok && result.ok, error: result.error };
};

const navItems = [
{
    label: 'About Us',
    i18nKey: 'footer.about',
    subItems: [
      { href: '/aboutus', label: 'About Us', i18nKey: 'footer.about' },
      { href: '/services', label: 'Our Services', i18nKey: 'footer.services' },
      { href: '/team', label: 'Our Team', i18nKey: 'footer.team' },
      { href: '/medical-advisors', label: 'Our Medical Advisors', i18nKey: 'footer.medical-advisors' },
      { href: '/safety-measures', label: 'Our Safety Measures', i18nKey: 'footer.safety' },
      { href: '/medivisor-expanded-patient-support-network', label: 'Join Our Network', i18nKey: 'footer.join-network' },
      { href: '/contact', label: 'Contact Us', i18nKey: 'footer.contact' },
    ],
  },
  {
    label: 'India Treatment',
i18nKey: 'footer.india-treatment',
    subItems: [
      { href: '/search?view=treatments', label: 'Hospitals', i18nKey: 'footer.hospitals' },
      { href: '/search?view=hospitals', label: 'Treatments', i18nKey: 'footer.treatments' },
      { href: '/treatment-cost', label: 'Treatment Cost', i18nKey: 'footer.treatment-cost' },
      { href: '/treatment-process', label: 'Treatment Process', i18nKey: 'footer.treatment-process' },
      { href: '/visa-process', label: 'Visa Process', i18nKey: 'footer.visa-process' },
      { href: '/travel-guide', label: 'Travel Guide', i18nKey: 'footer.travel-guide' },
      { href: '/faqs', label: 'FAQs', i18nKey: 'footer.faqs' },
      { href: '/why-medivisor', label: 'Why Medivisor', i18nKey: 'footer.why-medivisor' },
    ],
  },
  {
    label: 'Gallery',
i18nKey: 'footer.gallery',
    subItems: [
      { href: '/patient-testimonials', label: 'Patient Testimonials', i18nKey: 'footer.testimonials' },
      { href: '/photo-albums', label: 'Patient Activities', i18nKey: 'footer.activities' },
      { href: '/media-coverage', label: 'News Coverage', i18nKey: 'footer.news' },
      { href: '/blog', label: 'Blog', i18nKey: 'footer.blog' },
    ],
  },
];

function FooterSectionTitle({ children }: { children: React.ReactNode }) {
  return (
<h4 className="text-white font-semibold text-lg md:text-xl mb-4 pb-3 border-b border-gray-700" data-trans-managed="true">
      {children}
    </h4>
  );
}

function FooterLink({ href, children, i18nKey, originalLabel }: { href: string; children: React.ReactNode; i18nKey?: string; originalLabel?: string }) {
  return (
    <li>
      <Link
        href={href}
        className="text-gray-300 hover:text-[#29A9B9] text-sm md:text-base transition-colors duration-200 inline-block py-1"
        data-i18n={i18nKey}
        data-i18n-original={originalLabel}
      >
        {children}
      </Link>
    </li>
  );
}

export default function Footer() {
  const [formData, setFormData] = useState<FormData>({ name: '', email: '', phone: '', message: '' });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [formStatus, setFormStatus] = useState<FormStatus>({ state: 'idle' });
  const [touched, setTouched] = useState<{ name?: boolean; email?: boolean; phone?: boolean; message?: boolean }>({});
  const { t } = useI18n();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    if (formStatus.state !== 'idle') setFormStatus({ state: 'idle' });
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
const errors = validateForm(formData, t);
    if (errors[name as keyof FormErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: errors[name as keyof FormErrors] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm(formData, t);
    setTouched({ name: true, email: true, phone: true, message: true });

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormStatus({ state: 'submitting' });
    try {
      const res = await submitFooterForm(formData);
      if (res.ok) {
        setFormStatus({ state: 'success', message: t('Thank you! We will contact you shortly.') });
        setFormData({ name: '', email: '', phone: '', message: '' });
        setTouched({});
      } else {
        setFormStatus({ state: 'error', message: res.error || t('Something went wrong. Please try again.') });
      }
    } catch {
      setFormStatus({ state: 'error', message: t('Network error. Please try again.') });
    }
  };

  const currentYear = new Date().getFullYear();
const copyrightText = `© ${currentYear} Medivisor India Treatment. All rights reserved.`

  return (
    <footer className="bg-[#1a1a1a] pt-10 md:pt-12 text-white overflow-x-hidden">
      <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 overflow-hidden">
          <div className="lg:col-span-3 min-w-0">
            <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-6 max-w-xs" data-i18n="footer.description" data-i18n-original="Medivisor India Treatment is a trusted New Delhi-based medical travel company assisting international patients with advanced, affordable, and seamless treatment in India.">
              <Trans id="footer.description">Medivisor India Treatment is a trusted New Delhi-based medical travel company assisting international patients with advanced, affordable, and seamless treatment in India.</Trans>
            </p>
            <address className="not-italic">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin className="text-[#29A9B9] mt-1 w-5 h-5 flex-shrink-0" />
                  <a
                    href="https://maps.google.com/?q=Medivisor"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-[#29A9B9] text-sm md:text-base leading-relaxed transition-colors"
                    data-i18n="footer.address"
                    data-i18n-original="Medivisor House 359, Sector 1, Vaishali, Ghaziabad, (Delhi/NCR) India"
                  >
                    <Trans id="footer.address">Medivisor House 359, Sector 1, Vaishali, Ghaziabad, (Delhi/NCR) India</Trans>
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="text-[#29A9B9] w-5 h-5 flex-shrink-0" />
                  <a href="tel:+918368247758" className="text-gray-300 hover:text-[#29A9B9] text-sm md:text-base transition-colors" data-i18n="footer.phone" data-i18n-original="+91 8368 247 758">
                    <Trans id="footer.phone">+91 8368 247 758</Trans>
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="text-[#29A9B9] w-5 h-5 flex-shrink-0" />
                  <a href="mailto:info@medivisorhealth.com" className="text-gray-300 hover:text-[#29A9B9] text-sm md:text-base transition-colors" data-i18n="footer.email" data-i18n-original="info@medivisorhealth.com">
                    <Trans id="footer.email">info@medivisorhealth.com</Trans>
                  </a>
                </li>
              </ul>
            </address>
          </div>

          {/* Navigation Columns - 3 cols on lg */}
          <div className="lg:col-span-6 md:mt-0 mt-4 min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {navItems.map((item, index) => (
                <nav key={index} aria-label={`${item.label} Links`} className="min-w-0">
<FooterSectionTitle><Trans id={item.i18nKey || ''}>{item.label}</Trans></FooterSectionTitle>
                  <ul className="space-y-3">
                    {item.subItems ? (
                      item.subItems.map((subItem) => (
                        <FooterLink
                          key={subItem.href}
                          href={subItem.href}
                          i18nKey={subItem.i18nKey}
                          originalLabel={subItem.label}
                        >
                          <Trans id={subItem.i18nKey || ''}>{subItem.label}</Trans>
                        </FooterLink>
                      ))
                    ) : (
                      <FooterLink href="#">
                        <Trans id={item.i18nKey || ''}>{item.label}</Trans>
                      </FooterLink>
                    )}
                  </ul>
                </nav>
              ))}
            </div>
          </div>

<div className="lg:col-span-3 md:order-2 order-1 md:mt-0 mt-4" id="contact">
            <FooterSectionTitle><Trans id="footer.get-in-touch">Get in Touch</Trans></FooterSectionTitle>

            {formStatus.state === 'success' && (
              <div className="bg-green-500/10 border border-green-500/30 text-[#29A9B9] px-4 py-3 rounded-lg text-sm mb-4 flex items-center gap-2">
                <Check className="w-4 h-4 flex-shrink-0" />
<span data-i18n="footer.form.success" data-i18n-original={formStatus.message}>{formStatus.message}</span>
              </div>
            )}

            {formStatus.state === 'error' && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
<span data-i18n="footer.form.error" data-i18n-original={formStatus.message}>{formStatus.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 overflow-hidden" noValidate>
              <div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
placeholder={t('Your Name *')}
                  className={`
                    w-full px-3 sm:px-4 py-2.5
                    bg-[#2a2a2a] border rounded-lg
                    text-white text-sm md:text-base
                    placeholder:text-gray-400
                    focus:outline-none focus:border-[#29A9B9] focus:ring-1 focus:ring-[#29A9B9]/20
                    transition-colors
                    ${touched.name && formErrors.name ? 'border-red-500' : 'border-gray-700'}
                  `}
                  data-i18n="footer.form.name"
                  data-i18n-original={t('Your Name *')}
                  aria-invalid={touched.name && !!formErrors.name}
                  aria-describedby={formErrors.name ? 'name-error' : undefined}
                />
                {touched.name && formErrors.name && (
<p id="name-error" className="text-red-400 text-xs mt-1.5" data-i18n-original={formErrors.name}>{formErrors.name}</p>
                )}
              </div>

              <div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
placeholder={t('Email Address *')}
                  className={`
                    w-full px-3 sm:px-4 py-2.5
                    bg-[#2a2a2a] border rounded-lg
                    text-white text-sm md:text-base
                    placeholder:text-gray-400
                    focus:outline-none focus:border-[#29A9B9] focus:ring-1 focus:ring-[#29A9B9]/20
                    transition-colors
                    ${touched.email && formErrors.email ? 'border-red-500' : 'border-gray-700'}
                  `}
                  data-i18n="footer.form.email"
                  data-i18n-original={t('Email Address *')}
                  aria-invalid={touched.email && !!formErrors.email}
                  aria-describedby={formErrors.email ? 'email-error' : undefined}
                />
                {touched.email && formErrors.email && (
<p id="email-error" className="text-red-400 text-xs mt-1.5" data-i18n-original={formErrors.email}>{formErrors.email}</p>
                )}
              </div>

              <div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
placeholder={t('Phone Number *')}
                  className={`
                    w-full px-3 sm:px-4 py-2.5
                    bg-[#2a2a2a] border rounded-lg
                    text-white text-sm md:text-base
                    placeholder:text-gray-400
                    focus:outline-none focus:border-[#29A9B9] focus:ring-1 focus:ring-[#29A9B9]/20
                    transition-colors
                    ${touched.phone && formErrors.phone ? 'border-red-500' : 'border-gray-700'}
                  `}
                  data-i18n="footer.form.phone"
                  data-i18n-original={t('Phone Number *')}
                  aria-invalid={touched.phone && !!formErrors.phone}
                  aria-describedby={formErrors.phone ? 'phone-error' : undefined}
                />
                {touched.phone && formErrors.phone && (
<p id="phone-error" className="text-red-400 text-xs mt-1.5" data-i18n-original={formErrors.phone}>{formErrors.phone}</p>
                )}
              </div>

              <div>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
placeholder={t('Tell us about your medical needs... *')}
                  rows={3}
                  className={`
                    w-full px-3 sm:px-4 py-2.5
                    bg-[#2a2a2a] border rounded-lg
                    text-white text-sm md:text-base
                    placeholder:text-gray-400
                    focus:outline-none focus:border-[#29A9B9] focus:ring-1 focus:ring-[#29A9B9]/20
                    transition-colors resize-none
                    ${touched.message && formErrors.message ? 'border-red-500' : 'border-gray-700'}
                  `}
                  data-i18n="footer.form.message"
                  data-i18n-original={t('Tell us about your medical needs... *')}
                  aria-invalid={touched.message && !!formErrors.message}
                  aria-describedby={formErrors.message ? 'message-error' : undefined}
                />
                {touched.message && formErrors.message && (
<p id="message-error" className="text-red-400 text-xs mt-1.5" data-i18n-original={formErrors.message}>{formErrors.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={formStatus.state === 'submitting'}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#29A9B9] text-white rounded-lg text-sm md:text-base transition-colors disabled:bg-cyan-400 disabled:cursor-not-allowed active:scale-[0.98] touch-manipulation`}
                aria-busy={formStatus.state === 'submitting'}
                data-i18n="footer.form.submit"
                data-i18n-original={formStatus.state === 'submitting' ? 'Sending...' : 'Send Message'}
              >
                {formStatus.state === 'submitting' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
<Trans id="footer.form.sending">Sending...</Trans>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" aria-hidden="true" />
<Trans id="footer.form.submit">Send Message</Trans>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

<div className="border-t border-gray-800 mt-8">
        <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.PADDING} py-6`}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 mt-2 text-sm text-center md:text-start" data-i18n="footer.copyright" data-i18n-original={copyrightText} data-trans-managed="true">
                <Trans id="footer.copyright">{copyrightText}</Trans>
              </p>

            <div className="flex items-center md:py-4 py-3 gap-3">
              <a
                href="https://www.facebook.com/medivisorindiatreatment"
                target="_blank"
                rel="noopener noreferrer"
                title={t('Facebook')}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[#29A9B9] text-white hover:bg-[#29A9B9] hover:text-white transition-all duration-200"
                aria-label={t('Facebook')}
                data-i18n="social.facebook"
                data-i18n-original="Facebook"
              >
                <FaFacebookF size={18} />
              </a>
              <a
                href="https://www.youtube.com/@MedivisorIndiatreatment"
                target="_blank"
                rel="noopener noreferrer"
                title={t('YouTube')}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[#29A9B9] text-white hover:bg-[#29A9B9] hover:text-white transition-all duration-200"
                aria-label={t('YouTube')}
                data-i18n="social.youtube"
                data-i18n-original="YouTube"
              >
                <FaYoutube size={18} />
              </a>
              <a
                href="https://www.instagram.com/medivisorindiatreatment"
                target="_blank"
                rel="noopener noreferrer"
                title={t('Instagram')}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[#29A9B9] text-white hover:bg-[#29A9B9] hover:text-white transition-all duration-200"
                aria-label={t('Instagram')}
                data-i18n="social.instagram"
                data-i18n-original="Instagram"
              >
                <FaInstagram size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}