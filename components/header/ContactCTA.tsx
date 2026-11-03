"use client";

import { FiPhone, FiMail } from 'react-icons/fi';
import { IoLogoWhatsapp } from 'react-icons/io';
import { Trans } from '@/lib/i18n/Trans';

interface ContactItemProps {
  type?: 'phone' | 'email';
  value: string;
  href?: string;
}

export default function ContactItem({
  type = 'phone',
  value,
  href,
}: ContactItemProps) {
  const Icon = type === 'phone' ? IoLogoWhatsapp : FiMail;
  const iconColor = type === 'phone' ? 'text-gray-100' : 'text-gray-100';

  return (
    <a
      href={
        href ||
        (type === 'phone' ? `tel:${value}` : `mailto:${value}`)
      }
className="flex items-center md:border-s ps-2 first:mt-1 md:first:border-s-0 border-gray-600 gap-x-1 group"
      data-i18n-original={value}
    >
      <div
        className={`
          flex h-5 w-5 items-center justify-center
          ${iconColor}
          rounded-full
        `}
      >
        <Icon size={20} />
      </div>

      <span className="text-sm font-normal text-white leading-none">
        {value}
      </span>
    </a>
  );
}
