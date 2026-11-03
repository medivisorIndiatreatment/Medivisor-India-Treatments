/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,

  // Enable response caching with stale-while-revalidate
  httpAgentOptions: {
    keepAlive: true,
  },

  // Performance optimizations


  experimental: {
    optimizeCss: false, // Disabled: triggers Turbopack "nul" file-read panic on Windows
    optimizePackageImports: [
      'clsx',
      'tailwind-merge',
      'date-fns',
      'framer-motion',
      'lucide-react',
    ],
  },
  
  // Externalize heavy SDK packages from the server bundle to reduce
  // V8 heap usage — @wix/sdk and @google-cloud packages load large
  // protobuf/gRPC definitions that consume significant memory when
  // bundled. Server external packages are require()'d from node_modules
  // instead, reducing the bundler's in-memory representation.
  serverExternalPackages: [
    '@wix/sdk',
    '@wix/blog',
    '@wix/data',
    '@wix/forms',
    '@wix/media',
    '@wix/ricos',
    '@wix/pro-gallery',
    '@google-cloud/translate',
    'google-auth-library',
  ],

  // Enable strict mode for better development
  reactStrictMode: true,
  
  // Don't ignore build errors - fix them properly
  typescript: {
    ignoreBuildErrors: false,
  },

    // Image optimization - optimized for performance
    images: {
      unoptimized: false,
      minimumCacheTTL: 86400, // 24 hours
      formats: ['image/avif', 'image/webp'],
      deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
      imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
      qualities: [75, 90],
      dangerouslyAllowSVG: true,
      contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'static.wixstatic.com',
        },
        {
          protocol: 'https',
          hostname: 'media.wixstatic.com',
        },
        {
          protocol: 'https',
          hostname: 'frog.wix.com',
        },
        {
          protocol: 'https',
          hostname: 'www.wix.com',
        },
        {
          protocol: 'https',
          hostname: '_files.wixstatic.com',
        },
        {
          protocol: 'https',
          hostname: 'images.pexels.com',
        },
        {
          protocol: 'https',
          hostname: 'images.unsplash.com',
        },
        {
          protocol: 'https',
          hostname: 'medivisorindiatreatment.com',
        },
        {
          protocol: 'https',
          hostname: 'www.medivisorindiatreatment.com',
        },
        {
          protocol: 'https',
          hostname: 'img.youtube.com',
        },
        {
          protocol: 'https',
          hostname: 'i.ytimg.com',
        },
      ],
      // Allow all local (public/) images to be optimized, including those that
      // carry a query string (e.g. /placeholder.svg?height=200&width=400).
      // Per Next.js docs, `localPatterns` is a whitelist: once present, only
      // matching paths are allowed. Omitting `search` matches any query string
      // (or none), and `/**` matches every local path segment.
      // See: https://nextjs.org/docs/messages/next-image-unconfigured-localpatterns
      localPatterns: [
        {
          pathname: '/**',
        },
      ],
    },
  
  // Enable compression
  compress: true,
  
  // Generate ETags for caching
  generateEtags: true,
  
  // Powered by header disabled for security
  poweredByHeader: false,

  // Disable source maps in production to reduce memory usage (significant V8
  // heap savings — source maps for the entire bundle can consume hundreds of MB).
  productionBrowserSourceMaps: false,

  // Compiler optimizations - drop noisy client logs in production, but KEEP
  // console.error/console.warn so that server-side failures (e.g. CMS fetch
  // errors) are still visible in the Vercel function logs for diagnosis.
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? { exclude: ['error', 'warn'] }
        : false,
  },
  
  // NOTE: `output: 'standalone'` was removed. This project deploys to Vercel
  // (serverless functions). Vercel ignores the standalone build output and the
  // custom server.js is never executed there, so the option was misleading and
  // has been dropped.

  // Security headers with optimized caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self, "*.tawk.to")',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.clarity.ms https://scripts.clarity.ms https://static.wixstatic.com https://media.wixstatic.com https://www.youtube.com https://img.youtube.com https://embed.tawk.to https://va.tawk.to https://*.tawk.to https://maps.googleapis.com https://maps.gstatic.com https://translate.google.com https://translate.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://static.wixstatic.com https://embed.tawk.to https://*.tawk.to https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com https://static.wixstatic.com https://embed.tawk.to https://va.tawk.to https://*.tawk.to data:; img-src 'self' data: https: blob:; connect-src 'self' https://*.wix.com https://*.wixstatic.com https://*.wixapis.com https://*.medivisorindiatreatment.com https://api.resend.com https://www.googleapis.com https://clarity.ms https://scripts.clarity.ms https://*.google-analytics.com https://embed.tawk.to https://va.tawk.to https://*.tawk.to wss://*.tawk.to wss://va.tawk.to https://translate.google.com https://translate.googleapis.com; frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://embed.tawk.to https://*.tawk.to https://www.google.com https://maps.google.com; object-src 'none'; base-uri 'self'; form-action 'self' https://www.resend.com; upgrade-insecure-requests;",

          },
        ],
      },
      {
        source: '/:path*.html',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/(.*).(js|css|woff|woff2|ttf|eot|svg|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // API routes - aggressive caching for CMS data
      {
        source: '/api/cms/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, s-maxage=300, stale-while-revalidate=3600',
          },
        ],
      },
    ];
  },
  
  async redirects() {
    return [
      {
        source: "/single-post/:slug*",
        destination: "/blog/:slug*",
        permanent: true,
      },
      {
        source: "/post/:slug*",
        destination: "/blog/:slug*",
        permanent: true,
      },
      {
        source: "/pacific-patient",
        destination: "/pacific-patient-meet",
        permanent: true,
      },
      {
        source: "/search/hospitals/:slug",
        destination: "/hospital-branches/:slug",
        permanent: true,
      },
      {
        source: "/search/hospitals/:slug/",
        destination: "/hospital-branches/:slug/",
        permanent: true,
      },
      {
        source: "/hospital/:slug",
        destination: "/hospital-branches/:slug",
        permanent: true,
      },
      {
        source: "/hospital/:slug/",
        destination: "/hospital-branches/:slug/",
        permanent: true,
      },
      {
        source: "/hospitals/:slug",
        destination: "/hospital-branches/:slug",
        permanent: true,
      },

      {
        source: "/treatments/:slug",
        destination: "/treatment/:slug",
        permanent: true,
      },
      {
        source: "/doctor/:slug",
        destination: "/doctors/:slug",
        permanent: true,
      },
      {
        source: "/branch/:slug",
        destination: "/search/hospitals/:slug",
        permanent: true,
      },
      {
        source: "/city/:slug",
        destination: "/search/?city=:slug",
        permanent: true,
      },
      {
        source: "//:slug",
        destination: "/:slug",
        permanent: true,
      },
      {
        source: "/about",
        destination: "/aboutus",
        permanent: true,
      },
      {
        source: "/about-us",
        destination: "/aboutus",
        permanent: true,
      },
      {
        source: "/about-us/",
        destination: "/aboutus",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
