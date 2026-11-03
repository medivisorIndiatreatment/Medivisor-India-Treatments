import { FaFacebookF, FaYoutube, FaInstagram, FaWhatsapp } from 'react-icons/fa';

// =================================================================
// Constants & Configuration
// =================================================================

export const BREAKPOINTS = {
  MOBILE: 768,
  DESKTOP: 1024,
} as const;

export const HEADER_HEIGHT = {
  SCROLLED: 75,
  DEFAULT: 56,
} as const;

export const COLORS = {
  PRIMARY: '#E22026',
  SECONDARY: '#74BF44',
  TEXT: '#241d1f',
  BACKGROUND: '#ffffff',
  BORDER: '#e5e7eb',
  HOVER_BG: '#fef2f2',
} as const;

export const SOCIAL_LINKS = [
  {
    href: 'https://www.facebook.com/medivisorindiatreatment',
    icon: FaFacebookF,
    title: 'Facebook',
    className: 'bg-blue-600',
  },
  {
    href: 'https://www.youtube.com/@medivisorindiatreatment',
    icon: FaYoutube,
    title: 'YouTube',
    className: 'bg-[#e22229]',
  },
  {
    href: 'https://www.instagram.com/medivisorindiatreatment',
    icon: FaInstagram,
    title: 'Instagram',
    className: 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600',
  },
  {
    href: 'https://wa.me/918340780250',
    icon: FaWhatsapp,
    title: 'Chat on WhatsApp',
    className: 'bg-green-500',
  },
] as const;

export const PHONE_NUMBER = '+91 83682 47758';
