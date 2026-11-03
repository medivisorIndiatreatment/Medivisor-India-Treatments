import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { LANGUAGES, type LanguageCode } from '@/lib/googleTranslate';

const LOCALES = LANGUAGES.map((l) => l.code);
const DEFAULT_LOCALE = 'en' as LanguageCode;

function getLocaleFromRequest(request: NextRequest): LanguageCode {
  const cookieLang = request.cookies.get('medivisor-lang')?.value;
  if (cookieLang && LOCALES.includes(cookieLang as any)) {
    return cookieLang as LanguageCode;
  }
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const primaryLang = acceptLanguage.split(',')[0]?.split('-')[0]?.trim();
    if (primaryLang && LOCALES.includes(primaryLang as LanguageCode)) {
      return primaryLang as LanguageCode;
    }
  }
  return DEFAULT_LOCALE;
}

export const runtime = 'edge';

export function middleware(request: NextRequest) {
  const locale = getLocaleFromRequest(request);
  const response = NextResponse.next();
  response.cookies.set('medivisor-lang', locale, {
    path: '/',
    maxAge: 31536000,
    sameSite: 'lax',
  });
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/translate|api/navigation).*)',
  ],
};
