// Comprehensive design tokens for consistent styling across the homepage
// Senior-level: Single source of truth, complete coverage, semantic naming

// Typography scale - complete responsive system
const FONT_SIZES = {
  '2xs': '0.75rem',   // 12px
  xs: '0.8125rem',    // 13px
  sm: '0.875rem',     // 14px
  base: '1rem',       // 16px
  lg: '1.125rem',     // 18px
  xl: '1.25rem',      // 20px
  '2xl': '1.5rem',    // 24px
  '3xl': '1.875rem',  // 30px
  '4xl': '2.25rem',   // 36px
  '5xl': '3rem',      // 48px
  '6xl': '3.75rem',   // 60px
} as const

const FONT_WEIGHTS = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const

const LINE_HEIGHTS = {
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
}

export const DESIGN_TOKENS = {
  // ─── Container configurations ──────────────────────────────────────
  CONTAINER: {
    BASE: 'container mx-auto',
    PADDING: 'px-4 sm:px-6 lg:px-8',
    MAX_WIDTH: 'w-full',
    FULL: 'w-full',
  },

  // Helper to get complete container with padding
  getContainer: (fullWidth: boolean = false) => {
    const base = fullWidth ? 'w-full' : `${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH}`
    return `${base} ${DESIGN_TOKENS.CONTAINER.PADDING}`
  },

  // ─── Section spacing ────────────────────────────────────────────────
    SECTION_SPACING: {
      // Vertical padding for main content sections
      PY: 'py-8 md:py-12 lg:py-14',
      PY_LG: 'py-12 md:py-16 lg:py-20',
      PY_SM: 'py-8 md:py-10',
      // Vertical padding for hero/full-width sections
      HERO_PY: 'py-8 md:py-10',
      // Hero section outer vertical padding
      HERO_OUTER_PY: 'py-10',
      // Horizontal section padding (when full-width)
      PX: 'px-4 sm:px-6 lg:px-8',
      // Gap between grid items
      GAP: 'gap-4 md:gap-4 lg:gap-4',
      GAP_SM: 'gap-3 md:gap-4',
      // Margin between sections
      MB_SECTION: 'mb-8 md:mb-12 lg:mb-16',
    },

   // ─── Background colors ─────────────────────────────────────────────
    BACKGROUNDS: {
      WHITE: 'bg-white',
      GRAY_LIGHT: 'bg-gray-50',
      GRAY_LIGHTER: 'bg-gray-100',
      GRAY_200: 'bg-gray-200',
      GRAY_DARK: 'bg-gray-900',
      PRIMARY: 'bg-[#23366E]',
      PRIMARY_LIGHT: 'bg-[#29A9B9]',
      SECONDARY: 'bg-[#29A9B9]',
      OVERLAY: 'bg-black/50',
      ACCENT_GREEN: 'bg-[#74BF44]',
      ACCENT_RED: 'bg-[#E22026]',
      ACCENT_GREEN_LIGHT: 'bg-[#E6F4EA]',
      BANNER_NAVY: 'bg-[#0D2E6E]',
      BANNER_DARK_NAVY: 'bg-[#0B2F7A]',
    },

  // ─── Typography Scale ───────────────────────────────────────────────
    // Complete system with responsive breakpoints
    TYPOGRAPHY: {
      // Font families
      FONT_FAMILY: 'font-sans',
      FONT_MEDIUM: 'font-medium',
      FONT_SEMIBOLD: 'font-semibold',
      FONT_BOLD: 'font-bold',

      // Heading scale (H1–H6) - Dark Medical Blue primary
      H1: 'text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight tracking-tight',
      H2: 'text-2xl md:text-3xl lg:text-4xl font-medium text-gray-900 leading-tight tracking-tight',
      H3: 'text-2xl md:text-2xl font-medium text-gray-900 leading-tight',
      H4: 'text-lg md:text-xl font-medium text-gray-900 leading-snug',
      H5: 'text-base md:text-lg font-medium',
      H6: 'text-sm font-medium text-gray-700',

      // Display/section headings
      DISPLAY: 'text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight',
      SECTION_HEADING: 'text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-900 leading-tight tracking-tight',
      SECTION_HEADING_DARK: 'text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-900 leading-tight tracking-tight',
      SECTION_SUBTITLE: 'text-base md:text-lg text-gray-600 leading-relaxed',

      // Body text scale
      BODY_XL: 'text-lg md:text-xl text-gray-700 leading-relaxed',
      BODY_LG: 'text-base md:text-lg text-gray-700 leading-relaxed',
      BODY_BASE: 'text-base  leading-relaxed',
      BODY_SM: 'text-sm text-gray-900 font-normal leading-relaxed',
      BODY_XS: 'text-xs text-gray-500',
      DESCRIPTION: 'text-base font-normal md:text-base leading-relaxed',

       // Specialized
       LABEL: 'text-sm font-medium text-gray-700',
       CAPTION: 'text-xs text-gray-500',
        SECONDARY: 'text-[#29A9B9]',
       OVERLINE: 'text-xs font-medium uppercase tracking-wider text-gray-500',
       ACCENT_GREEN_TEXT: 'text-[#74BF44]',

      // Card-specific
      CARD_TITLE: 'text-xl md:text-2xl font-medium text-gray-900 leading-tight',
      CARD_SUBTITLE: 'text-sm text-gray-600',
      CARD_DESC: 'text-base font-normal  leading-relaxed',

      // Hero section
      HERO_HEADING: 'uppercase font-bold md:leading-tight tracking-wide text-3xl md:text-4xl lg:text-5xl text-white',
      HERO_BODY: 'text-base md:text-lg text-white leading-relaxed max-w-full md:max-w-4xl font-normal',
      HERO_BODY_BLUE: 'text-base md:text-lg  leading-relaxed max-w-full md:max-w-4xl font-normal',
      Pera: 'text-base md:text-base text-white leading-relaxed max-w-full md:max-w-4xl font-normal',

      // Department services
      TREATMENT_ITEM: 'text-base md:text-base text-gray-900 leading-relaxed font-normal',
    },

  // ─── Border radius (consistent scale) ──────────────────────────────
  BORDER_RADIUS: {
    NONE: 'rounded-none',
    SM: 'rounded-md',        // ~2px
    MD: 'rounded-md',        // ~6px
    LG: 'rounded-lg',        // ~8px
    XL: 'rounded-xl',        // ~12px
    '2XL': 'rounded-2xl',    // ~16px
    FULL: 'rounded-full',
  },

  // ─── Shadows (consistent depth system) ─────────────────────────────
  SHADOWS: {
    NONE: 'shadow-none',
    SM: 'shadow-sm',         // subtle elevation
    MD: 'shadow',            // standard elevation
    LG: 'shadow-lg',         // medium elevation
    XL: 'shadow-xl',         // high elevation
    '2XL': 'shadow-2xl',     // highest elevation
    INNER: 'shadow-inner',
  },

  // ─── Transitions (standardized timing) ──────────────────────────────
  TRANSITIONS: {
    BASE: 'transition-all duration-300 ease-in-out',
    FAST: 'transition-all duration-200 ease-in-out',
    SLOW: 'transition-all duration-500 ease-in-out',
    COLOR: 'transition-colors duration-200 ease-in-out',
    HOVER: 'transition-all duration-200 hover:duration-300',
  },

  // ─── Colors (semantic naming) ───────────────────────────────────────
  COLORS: {
    // Primary brand colors - Dark Medical Blue & Teal/Cyan
    PRIMARY: '#23366E',
    PRIMARY_LIGHT: '#3D5AA0',
    PRIMARY_DARK: '#1A2A52',
    SECONDARY: '#29A9B9',
    SECONDARY_LIGHT: '#4AC0D1',
    SECONDARY_DARK: '#1F8A96',
    ACCENT: '#29A9B9',

    // Neutrals
    DARK: '#23366E',
    DARK_LIGHT: '#3D5AA0',
    GRAY_50: '#f9fafb',
    GRAY_100: '#f3f4f6',
    GRAY_200: '#e5e7eb',
    GRAY_300: '#d1d5db',
    GRAY_400: '#9ca3af',
    GRAY_500: '#6b7280',
    GRAY_600: '#4b5563',
    GRAY_700: '#374151',
    GRAY_800: '#1f2937',
    GRAY_900: '#111827',
    WHITE: '#ffffff',
    BLACK: '#000000',

    // Semantic
    SUCCESS: '#10b981',
    WARNING: '#f59e0b',
    ERROR: '#ef4444',
    INFO: '#3b82f6',

    // Banner specific
    BANNER_NAVY: '#0D2E6E',
    BANNER_DARK_NAVY: '#0B2F7A',
    BANNER_GOLD: '#D8B15B',
    BANNER_TEAL: '#00A7A0',
    BORDER_GRAY_LIGHT: '#e5e7eb',
  },

  // ─── Spacing scale (standardized) ───────────────────────────────────
  SPACING: {
    NONE: '0',
    XS: '0.25rem',    // 4px
    SM: '0.5rem',     // 8px
    MD: '0.75rem',    // 12px
    LG: '1rem',       // 16px
    XL: '1.25rem',    // 20px
    '2XL': '1.5rem',  // 24px
    '3XL': '2rem',    // 32px
    '4XL': '2.5rem',  // 40px
    '5XL': '3rem',    // 48px
    '6XL': '4rem',    // 64px
    AUTO: 'auto',
  },

  // ─── Z-index scale ─────────────────────────────────────────────────
  Z_INDEX: {
    BASE: 0,
    ABOVE: 10,
    DROPDOWN: 100,
    STICKY: 100,
    FIXED: 1000,
    MODAL: 50,
    DRAWER: 60,
    TOAST: 70,
  },

  // ─── Breakpoints reference ─────────────────────────────────────────
  BREAKPOINTS: {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px',
    '2XL': '1536px',
  },

  // ─── Component-specific tokens ─────────────────────────────────────
  COMPONENT: {
    // Card defaults - Premium light theme
    CARD: {
      BASE: 'bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300',
      HOVER: 'hover:shadow-md hover:border-[#29A9B9]/30',
      PADDING: 'p-4 md:p-6',
      RADIUS: 'rounded-xl',
      SHADOW: 'shadow-sm',
      SHADOW_HOVER: 'shadow-md',
    },

    // Button defaults - Healthcare premium style
    BUTTON: {
      BASE: 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
      PRIMARY: 'bg-[#23366E] text-white hover:bg-[#1A2A52] focus:ring-[#23366E]/50 shadow-sm hover:shadow-md',
      SECONDARY: 'bg-[#29A9B9] text-white hover:bg-[#1F8A96] focus:ring-[#29A9B9]/50 shadow-sm hover:shadow-md',
      OUTLINE: 'border border-gray-300 bg-white text-[#23366E] hover:bg-[#E6F4F5] focus:ring-[#23366E]/30',
      GHOST: 'bg-transparent text-[#23366E] hover:bg-[#E6F4F5]/50 focus:ring-[#23366E]/30',
      SIZES: {
        SM: 'px-3 py-1.5 text-sm',
        MD: 'px-4 py-2 text-base',
        LG: 'px-6 py-3 text-lg',
        XL: 'px-8 py-4 text-xl',
      },
      FULL: 'w-full',
    },

    // Input defaults
    INPUT: {
      BASE: 'w-full px-4 py-2.5 border border-gray-300 bg-white text-[#23366E] placeholder:text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#23366E]/20 focus:border-[#23366E] transition-all duration-200',
      ERROR: 'border-red-500 focus:ring-red-500/20 focus:border-red-500',
      DISABLED: 'opacity-50 cursor-not-allowed bg-gray-100',
      SIZES: {
        SM: 'px-3 py-1.5 text-sm',
        MD: 'px-4 py-2.5 text-base',
        LG: 'px-5 py-3 text-lg',
      },
    },

    // Avatar/image defaults
    AVATAR: {
      BASE: 'rounded-full object-cover',
      SM: 'w-8 h-8',
      MD: 'w-10 h-10',
      LG: 'w-12 h-12',
      XL: 'w-16 h-16',
    },

     // Badge defaults - Healthcare theme
     BADGE: {
       BASE: 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
       PRIMARY: 'bg-[#23366E]/10 text-[#23366E]',
       SECONDARY: 'bg-[#29A9B9]/10 text-[#29A9B9]',
       SUCCESS: 'bg-emerald-50 text-emerald-700',
       NEUTRAL: 'bg-gray-100 text-gray-700',
     },

     // Department services treatment item button
     TREATMENT_MORE_BUTTON: 'flex items-center justify-center text-base font-medium text-[#241d1f] bg-gray-50 px-3 py-2 rounded-md border border-gray-200',
  },
}

/**
 * Get alternating background color based on section index in visual order.
 * Pattern follows: 0=White, 1=Gray-50, 2=White, 3=Gray-50, 4=White, 5=Gray-50, 6=White...
 * Even index → white, Odd index → gray-50
 *
 * Visual index mapping (for homepage main content sections in order):
 *  0: Partners (WHITE)
 *  1: DepartmentServices (GRAY_LIGHT)
 *  2: DoctorsSection (WHITE)
 *  3: PopularHospitals (GRAY_LIGHT)
 *  4: TechnologiesServices (WHITE)
 *  5: TestDiagnosisServices (GRAY_LIGHT)
 *  6: Testimonials (WHITE)
 *  7: PatientSupport (GRAY_LIGHT)
 *  8: ExtentCare (WHITE)
 *  9: Activities (GRAY_LIGHT)
 */
export function getAlternatingBackground(index: number): string {
  return index % 2 === 0
    ? DESIGN_TOKENS.BACKGROUNDS.WHITE
    : DESIGN_TOKENS.BACKGROUNDS.GRAY_LIGHT;
}

/**
 * Section Visual Index Constants - for consistent background alternation
 */
export const SECTION_INDEX = {
  PARTNERS: 0,
  DEPARTMENT_SERVICES: 1,
  DOCTORS: 2,
  POPULAR_HOSPITALS: 3,
  TECHNOLOGIES: 4,
  TEST_DIAGNOSIS: 5,
  TESTIMONIALS: 6,
  PATIENT_SUPPORT: 7,
  EXTENT_CARE: 8,
  ACTIVITIES: 9,
} as const

/**
 * Reusable typography classes for sections
 */
export const SECTION_CLASSES = {
  HEADING: 'text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-900 leading-tight tracking-tight',
  SUBHEADING: 'text-base md:text-lg text-gray-600 leading-relaxed',
  PARAGRAPH: 'text-base md:text-lg text-gray-700 leading-relaxed',
  MOBILE_PADDING: 'px-4 sm:px-6 lg:px-8',
  GRID_GAP: 'gap-4 md:gap-6',
  CARD_BASE: 'bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300',
  BUTTON_PRIMARY: 'inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-[#23366E] rounded-lg hover:bg-[#1A2A52] transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer',
  BUTTON_SECONDARY: 'inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-[#29A9B9] rounded-lg hover:bg-[#1F8A96] transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer',
} as const

/**
 * Get standard section classes with consistent spacing and background.
 * Automatically applies alternating background based on visual section index.
 * Use SECTION_INDEX constants for consistent indexing.
 */
export function getSectionClasses(visualIndex: number, options?: {
  py?: 'sm' | 'md' | 'lg';
  overflow?: boolean;
  relative?: boolean;
  noBackground?: boolean; // Use when section has own background
}): string {
  const bgClass = options?.noBackground ? '' : getAlternatingBackground(visualIndex);
  let pyClass = DESIGN_TOKENS.SECTION_SPACING.PY;

  if (options?.py === 'sm') pyClass = DESIGN_TOKENS.SECTION_SPACING.PY_SM;
  if (options?.py === 'lg') pyClass = DESIGN_TOKENS.SECTION_SPACING.PY_LG;

  let classes = '';

  if (bgClass) classes += `${bgClass} `;
  classes += pyClass;

  if (options?.overflow) classes += ' overflow-hidden';
  if (options?.relative) classes += ' relative';

  return classes.trim();
}