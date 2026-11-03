'use client';

import { FiPhoneCall } from 'react-icons/fi';
import { Trans } from '@/lib/i18n/Trans';

export default function ContactCTA({
  phoneNumber,
  onClick,
}: {
  phoneNumber: string;
  onClick?: () => void;
}) {
  return (
    <a
      href={`tel:${phoneNumber}`}
      className="items-center gap-1.5 w-auto bg-gray-100 border-gray-100 flex shadow-sm rounded-full px-2 py-1 md:py-2 border hover:bg-cyan-100 cursor-pointer"
      data-i18n-original={phoneNumber}
    >
      <div className="flex items-center justify-center md:w-8 md:h-8 w-6 h-6 rounded-full bg-[#23366E] text-white flex-shrink-0">
        <FiPhoneCall className="md:text-base text-xs" aria-hidden="true" />
      </div>

      <div className="leading-[1.10]">
        <p className="md:text-base text-xs font-medium text-gray-800">
          {phoneNumber}
        </p>
      </div>
    </a>
  );
}
