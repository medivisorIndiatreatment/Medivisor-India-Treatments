import './globals.css';
import Script from 'next/script';
import { WixAuthProvider } from '@/components/wix-auth-provider';
import { ReactQueryProvider } from '@/app/providers';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Metadata } from 'next';
import { defaultMetadata } from '@/app/metadata';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import ScrollRestoration from '@/components/ScrollRestoration';
import WebVitals from '@/components/WebVitals';
import TawkChat from '@/components/Tawkchat';
import TranslationRunner from '@/components/TranslationRunner';
import { I18nProvider } from '@/lib/i18n/I18nProvider';
import { getLanguageFromCookie, LANGUAGES, isRtlLanguage } from '@/lib/googleTranslate';
import { cookies } from 'next/headers';
import { LOCALES } from '@/lib/i18n/config';
import FontPreload from '@/components/FontPreload';

export const metadata: Metadata = defaultMetadata;

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    slug?: string;
  }>;
}

export default async function RootLayout({ children, params }: RootLayoutProps) {
  const cookieStore = await cookies();
  const initialLang = getLanguageFromCookie(cookieStore.toString());
  const dir = isRtlLanguage(initialLang) ? 'rtl' : 'ltr';
  const baseUrl = defaultMetadata.metadataBase?.toString().replace(/\/$/, '') || 'https://medivisorindiatreatment.com'

  const alternatesUrls = [
    {
      url: baseUrl,
      hrefLang: 'x-default' as const,
    },
    ...LOCALES.map((loc) => ({
      url: baseUrl,
      hrefLang: loc as string,
    })),
  ];
  const availableLanguages = LANGUAGES.map((l) => l.label);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalOrganization',
    name: 'Medivisor India Treatment',
    description: defaultMetadata.description,
    url: baseUrl,
    logo: 'https://medivisorindiatreatment.com/logo_medivisor.png',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'India',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      areaServed: 'International',
      availableLanguage: availableLanguages,
    },
    sameAs: [
      'https://medivisorindiatreatment.com',
    ],
  };

  return (
    <html lang={initialLang} dir={dir} suppressHydrationWarning>
      <head>
        <meta httpEquiv="x-dns-prefetch-control" content="on" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <FontPreload />
        <noscript>
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Noto+Sans+Ethiopic:wght@400;500;600;700&display=swap" />
        </noscript>
        <link rel="preconnect" href="https://static.wixstatic.com" />
        <link rel="preconnect" href="https://media.wixstatic.com" />
        <link rel="preconnect" href="https://www.clarity.ms" />
        <link rel="preconnect" href="https://scripts.clarity.ms" />

        {alternatesUrls.map((alt) => (
          <link key={alt.hrefLang} rel="alternate" hrefLang={alt.hrefLang} href={alt.url} />
        ))}

        <Script id="json-ld" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="min-h-screen flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-[#E22026] focus:font-semibold focus:rounded-b-md"
        >
          Skip to main content
        </a>

        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-MNZKG23S"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>

        <Script id="gtm-script" strategy="lazyOnload">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-MNZKG23S');`}
        </Script>
        <Script
          id="clarity-script"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "t5hkqz15nw");`,
          }}
        />

        <ErrorBoundary>
          <ReactQueryProvider>
            <I18nProvider initialLang={initialLang}>
              <WixAuthProvider>
                <ScrollRestoration />
                <TranslationRunner />
                <Header />
                <TawkChat />
                <WebVitals />
                <main id="main-content" role="main" tabIndex={-1}>
                  {children}
                </main>
                <Footer />
              </WixAuthProvider>
            </I18nProvider>
          </ReactQueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
