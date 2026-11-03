'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Info, 
  BriefcaseMedical, 
  Image as ImageIcon, 
  Phone, 
  Newspaper, 
  Users, 
  ShieldCheck 
} from 'lucide-react';

export default function QuickLinks() {
  const pathname = usePathname();

  const navItems = [
   
    { href: '/aboutus', label: 'About Us', icon: Info },
    { href: '/services', label: 'Our Services', icon: BriefcaseMedical },
  
    { href: '/blog', label: 'Blog', icon: Newspaper },
   
    { href: '/safety-measures', label: 'Safety Measures', icon: ShieldCheck },
{ href: '/contact', label: 'Contact Us', icon: Phone, i18nKey: 'nav.contact' },
  ];

  return (
    <aside className="w-full px-6 py-4">
<h2 className="title-heading" data-i18n-original="Quick Links" data-i18n="blog.quick-links">
        Quick Links
      </h2>

      <ul className="divide-y divide-gray-100">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center justify-between py-3 px-2 group transition-colors duration-200 ${
                  isActive
                    ? 'text-[#E22026] font-medium'
                    : 'text-[#241d1f] hover:text-[#E22026]'
                }`}
              >
<span className="flex items-center gap-3" data-i18n-original={item.label} data-i18n={item.i18nKey}>
                     <Icon
                       size={30}
                       className={`${
                         isActive
                           ? 'text-[#E22026] bg-white '
                           : 'text-gray-500 bg-gray-100 p-1 group-hover:text-[#E22026]'
                       }`}
                     />
                     {item.label}
                   </span>
                <span
                  className={`h-2 w-2 rounded-full ${
                    isActive ? 'bg-[#E22026]' : 'bg-geay=50 group-hover:bg-gray-300'
                  }`}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
