import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Thank You | Medivisor India Treatment',
  description: 'Thank you for your submission. Our team will get back to you shortly.',
  alternates: {
    canonical: 'https://medivisorindiatreatment.com/thank-you',
  },
  openGraph: {
    title: 'Thank You | Medivisor India Treatment',
    description: 'Thank you for your submission. Our team will get back to you shortly.',
    url: 'https://medivisorindiatreatment.com/thank-you',
    siteName: 'Medivisor India Treatment',
    type: 'website',
    images: ['/banner/homepage.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Thank You | Medivisor India Treatment',
    description: 'Thank you for your submission. Our team will get back to you shortly.',
    images: ['/banner/homepage.png'],
  },
  robots: 'noindex, follow',
};

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle w-12 h-12 text-emerald-600">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-8.5" />
    <path d="M22 4L12 14.01l-3-3" />
  </svg>
);

const MessageCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle w-4 h-4 mr-2">
    <path d="M7.9 20A9.3 9.3 0 0 1 4 16.1L2 22l6.1-2c.4.1.8.2 1.2.3" />
    <path d="M12 21a9 9 0 1 0-8.5-7.5c-1.7 2.1-1.3 5.4.3 7.3a9.4 9.4 0 0 0 6.6.7Z" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left w-4 h-4 mr-2">
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock w-3 h-3 mr-1">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users w-6 h-6 text-[#241d1f]">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const FileTextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text w-6 h-6 text-[#241d1f]">
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M10 9H8" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar w-6 h-6 text-[#241d1f]">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

const steps = [
  {
    icon: FileTextIcon,
    title: 'Case Review',
    description: 'Our medical consultant reviews your submission',
    time: 'Within 2 hours'
  },
  {
    icon: UsersIcon,
    title: 'Team Assignment',
    description: 'We assign specialized medical experts to your case',
    time: 'Within 4 hours'
  },
  {
    icon: FileTextIcon,
    title: 'Treatment Plan',
    description: 'Personalized treatment plan with cost breakdown',
    time: 'Within 12 hours'
  },
  {
    icon: CalendarIcon,
    title: 'Video Consultation',
    description: 'Schedule a video call with our specialist',
    time: 'Within 24 hours'
  }
];

export default function ThankYou() {
  return (
    <div className="relative z-10 flex flex-col items-center justify-center px-4 py-12 bg-gray-50">
      <div
        className="w-full max-w-4xl p-6 md:p-12 bg-white rounded-2xl shadow-xl space-y-12"
      >
        {/* Success Header Section */}
        <div className="flex flex-col items-center text-center space-y-6">
          <div
            className="inline-flex items-center justify-center w-24 h-24 bg-emerald-100 rounded-full shadow-lg shadow-emerald-500/25"
          >
            <CheckCircleIcon />
          </div>

          <div className="space-y-4">
<h1 className="text-4xl md:text-3xl font-extrabold text-gray-800 leading-tight" data-i18n-original="Thank you for connecting with Medivisor ">
              Thank you for connecting with Medivisor 
            </h1>

            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed" data-i18n-original="Your application has been successfully received. We will get back to you soon.">
              Your application has been successfully received. We will get back to you soon.
            </p>
          </div>

        </div>

        {/* What's Next Section */}


        {/* Action Buttons Section */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
        >
          <a
            href="https://wa.me/918340780250"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-3 rounded-full text-white bg-green-500 hover:bg-green-600 transition-colors shadow-md flex items-center justify-center"
            data-i18n-original="Chat on WhatsApp"
          >
            <MessageCircleIcon />
            Chat on WhatsApp
          </a>
          <a
            href="/"
            className="w-full sm:w-auto px-8 py-3 rounded-full border-2 border-gray-300 text-[#241d1f] hover:bg-gray-100 transition-colors shadow-sm flex items-center justify-center"
            data-i18n-original="Back to Home"
          >
            <ArrowLeftIcon />
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
