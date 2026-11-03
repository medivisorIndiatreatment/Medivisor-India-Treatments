import { createClient, OAuthStrategy } from "@wix/sdk"
import { posts, categories } from "@wix/blog"
import { proGallery } from "@wix/pro-gallery"
import { items } from "@wix/data"
import { submissions } from "@wix/forms"
import { env, isWixConfigured } from "@/lib/config/env"
import { type Locale, LOCALES, DEFAULT_LOCALE } from "@/lib/i18n/config"

export { createClient } from "@wix/sdk"

const wixModules = {
  posts,
  categories,
  proGallery,
  items,
  submissions,
}

function createConfiguredClient(clientId: string) {
  return createClient({
    auth: OAuthStrategy({ clientId }),
    modules: wixModules,
  })
}

const serverClientId = env.WIX_CLIENT_ID

if (!isWixConfigured()) {
  console.error(
    "[wix-server] FATAL: NEXT_PUBLIC_WIX_CLIENT_ID (or WIX_CLIENT_ID) is not set. " +
      "All CMS-backed APIs and pages will fail. Configure it in the Vercel project " +
      "Environment Variables or vercel.json 'env'.",
  )
}

const _wixServerClient = createConfiguredClient(serverClientId || "missing")

const publicClientId = process.env.NEXT_PUBLIC_WIX_CLIENT_ID || env.WIX_CLIENT_ID
const _wixClient = createConfiguredClient(publicClientId || "missing")

export { _wixServerClient as wixServerClient, _wixClient as wixClient }

export function getWixServerClient() {
  return createConfiguredClient(env.WIX_CLIENT_ID || "missing")
}

export function getWixClient() {
  return createConfiguredClient(
    process.env.NEXT_PUBLIC_WIX_CLIENT_ID || env.WIX_CLIENT_ID || "missing",
  )
}

export function getWixServerClientWithLocale(locale?: Locale) {
  const client = createConfiguredClient(env.WIX_CLIENT_ID || "missing")
  if (locale && LOCALES.includes(locale)) {
    client.setHeaders({
      'wix-locale': locale,
      'Accept-Language': locale === 'hi' ? 'hi-IN,hi;q=0.9' : 'en-US,en;q=0.9',
    })
  }
  return client
}

export function getWixClientWithLocale(locale?: Locale) {
  const client = createConfiguredClient(
    process.env.NEXT_PUBLIC_WIX_CLIENT_ID || env.WIX_CLIENT_ID || "missing",
  )
  if (locale && LOCALES.includes(locale)) {
    client.setHeaders({
      'wix-locale': locale,
      'Accept-Language': locale === 'hi' ? 'hi-IN,hi;q=0.9' : 'en-US,en;q=0.9',
    })
  }
  return client
}
