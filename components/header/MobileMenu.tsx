'use client';

import { X } from 'lucide-react';
import Image from 'next/image';
import NavItem from './NavItem';
import { Trans } from '@/lib/i18n/Trans';
import { useTranslatedString } from '@/lib/i18n';
import type { MobileMenuProps } from './types';

export default function MobileMenu({
  isOpen,
  onClose,
  navItems,
  windowWidth,
  openSubmenu,
  onSubmenuToggle,
  treatments,
  hospitals,
  doctors,
  testDiagnoses,
  treatmentSearch,
  setTreatmentSearch,
  hospitalSearch,
  setHospitalSearch,
  doctorSearch,
  setDoctorSearch,
  testDiagnosisSearch,
  setTestDiagnosisSearch,
  socialLinks,
}: MobileMenuProps) {
  if (!isOpen) return null;

  const closeLabel = useTranslatedString('Close menu');

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="fixed top-0 end-0 h-full w-full bg-white z-50 md:hidden shadow-xl flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="relative w-[150px] h-[40px]">
            <Image
              src="/medivisor-logo.png"
              alt="Medivisor India Treatment"
              fill
              className="object-contain"
              priority
            />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-md"
aria-label={closeLabel}
            data-i18n-original="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-4">
            {navItems.map((item) => (
              <NavItem
                key={item.label}
                item={item}
                isOpen={openSubmenu === item.label}
                onToggle={onSubmenuToggle}
                isMobile
                windowWidth={windowWidth}
                treatments={treatments}
                hospitals={hospitals}
                doctors={doctors}
                testDiagnoses={testDiagnoses}
                treatmentSearch={treatmentSearch}
                setTreatmentSearch={setTreatmentSearch}
                hospitalSearch={hospitalSearch}
                setHospitalSearch={setHospitalSearch}
                doctorSearch={doctorSearch}
                setDoctorSearch={setDoctorSearch}
                testDiagnosisSearch={testDiagnosisSearch}
                setTestDiagnosisSearch={setTestDiagnosisSearch}
                onCloseMobile={onClose}
              />
            ))}
          </ul>
        </nav>

        <div className="border-t border-gray-200 p-4">
          <div className="flex gap-3 justify-center">
            {socialLinks.map((social: any) => {
              const IconComponent = social.icon;
              return (
                <a
                  key={social.title}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={social.title}
                  className={`w-10 h-10 flex items-center justify-center rounded-full text-white shadow-md ${social.className}`}
                  aria-label={social.title}
                  data-i18n-original={social.title}
                >
                  <IconComponent size={20} />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
