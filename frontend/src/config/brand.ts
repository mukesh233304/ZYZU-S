/**
 * ZYZU'S — Tutors & Libraries
 * Official Centralized Brand Configuration
 *
 * This configuration serves as the single source of truth for all brand identity,
 * naming, tagline, logos, color palette, document headers, signatures, and communication templates.
 */

export const BRAND_CONFIG = {
  // Official Core Identity
  name: "ZYZU'S",
  tagline: "Tutors & Libraries",
  fullTitle: "ZYZU'S — Tutors & Libraries",
  shortName: "ZYZU'S",
  symbol: "Z",
  
  // Official Brand Asset Paths
  assets: {
    logoOriginal: "/assets/branding/zyzus-official-logo.jpg",
    logoPng: "/assets/branding/zyzus-official-logo.png",
    logo512: "/assets/branding/zyzus-logo-512.png",
    logo192: "/assets/branding/zyzus-logo-192.png",
    logo128: "/assets/branding/zyzus-logo-128.png",
    logo64: "/assets/branding/zyzus-logo-64.png",
    symbol192: "/assets/branding/zyzus-symbol-192.png",
    symbol48: "/assets/branding/zyzus-symbol-48.png",
    faviconIco: "/favicon.ico",
    favicon16: "/favicon-16x16.png",
    favicon32: "/favicon-32x32.png",
    favicon48: "/favicon-48x48.png",
    appleTouchIcon: "/apple-touch-icon.png",
    ogImage: "/og-image.jpg"
  },
  
  // Legal & Corporate Identity
  legalName: "ZYZU'S EdTech Technologies Private Limited",
  companySub: "Central Sovereign Knowledge & Academic Settlement Desk • National Directorate",
  registeredTag: "GOVT. REG. EDTECH",
  cin: "U80904UP2026PTC184920",
  gstin: "09AAACF2026P1Z4",
  pan: "AAACF2026P",
  
  // Platform & Domain
  domain: "zyzus.com",
  webAppUrl: "https://zyzus.com",
  verificationPortalUrl: "https://zyzus.com/verify/doc",
  supportEmail: "focuspoint011@gmail.com",
  supportEmailSecondary: "support@zyzus.com",
  supportPhone: "+91 91964 34387",
  supportPhoneSecondary: "+91 95696 44387",
  supportPhones: ["+91 91964 34387", "+91 95696 44387"],
  headquarters: "Saidpur, Ghazipur 233304, Uttar Pradesh, India",
  pincode: "233304",
  
  // Authorities & Clearances
  clearinghouseName: "ZYZU'S Clearinghouse",
  directorateName: "ZYZU'S National Directorate",
  academicBureau: "ZYZU'S Academic Bureau",
  sovereignLedger: "ZYZU'S Sovereign Ledger",
  verificationNode: "ZYZU'S Digital Verification Node",
  accreditationAuthority: "ZYZU'S Directorate of Educator Accreditation",
  
  // Communications & Notifications
  emailSender: "ZYZU'S Notifications <notifications@zyzus.com>",
  signature: "ZYZU'S | Tutors & Libraries",
  whatsappSignature: "\n\n— ZYZU'S | Tutors & Libraries\nwww.zyzus.com",
  smsSenderId: "ZYZUED",
  
  // Brand Slogans & Descriptions
  slogan: "India's Premier Tutors & Self-Study Libraries Ecosystem",
  metaDescription: "Find verified home tutors and premium self-study digital libraries with ZYZU'S — Tutors & Libraries. Trusted by students, parents, educators, and library owners across India.",
  copyright: `© ${new Date().getFullYear()} ZYZU'S — Tutors & Libraries. All rights reserved.`,
  
  // Color Palette Tokens
  colors: {
    navyDark: "#0a192f",
    navyDeep: "#0f172a",
    brandBlue: "#1e40af",
    primaryBlue: "#2563eb",
    cyanAccent: "#38bdf8",
    orange: "#f97316",
    orangeDark: "#ea580c",
    orangeLight: "#fb923c",
    amberGold: "#f59e0b",
    emeraldGreen: "#10b981",
    white: "#ffffff",
    slateLight: "#f8fafc",
  }
} as const;

export type BrandConfig = typeof BRAND_CONFIG;

// Standard Helper Formatters
export function formatBrandHeader(includeTagline: boolean = true): string {
  return includeTagline ? `${BRAND_CONFIG.name} — ${BRAND_CONFIG.tagline}` : BRAND_CONFIG.name;
}

export function formatWhatsAppMessage(body: string, actionUrl?: string): string {
  let message = body.trim();
  if (actionUrl) {
    message += `\n\nExplore here: ${actionUrl}`;
  }
  message += `\n\n${BRAND_CONFIG.signature}`;
  message += `\nReply STOP to unsubscribe from promotional alerts.`;
  return message;
}
