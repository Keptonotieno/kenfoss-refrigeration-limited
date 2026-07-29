export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'business.business';
  schemaData?: Record<string, any>;
}

export const DEFAULT_SEO: SEOMetadata = {
  title: "Kenfoss Refrigeration Limited | Commercial Cold Room & HVAC Engineers Kenya",
  description: "Kenya's trusted refrigeration engineering firm specializing in commercial cold room installation, HVAC systems, industrial chillers, blast freezers, and 24/7 emergency repair services in Nairobi, Ruiru, and nationwide.",
  keywords: [
    "Kenfoss Refrigeration",
    "Cold Room Installation Kenya",
    "Commercial Refrigeration Repair Nairobi",
    "Industrial Chiller Maintenance",
    "Blast Freezer Construction Kenya",
    "HVAC Engineering Ruiru",
    "Cold Storage Sizing Calculator",
    "Milk Chilling Plants Kenya",
    "Horticultural Cold Storage",
    "Supermarket Display Fridges Repair"
  ],
  canonicalUrl: "https://kenfoss.co.ke",
  ogImage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=1200",
  ogType: "website",
  schemaData: {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Kenfoss Refrigeration Limited",
    "image": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=1200",
    "@id": "https://kenfoss.co.ke",
    "url": "https://kenfoss.co.ke",
    "telephone": "+254745411923",
    "email": "info@kenfoss.co.ke",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Ivy's Park Business Park, Next to Mark Hotel, Thika Superhighway Service Lane",
      "addressLocality": "Ruiru",
      "addressRegion": "Kiambu County",
      "postalCode": "00232",
      "addressCountry": "Kenya"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -1.1620371,
      "longitude": 36.9586472
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
      ],
      "opens": "00:00",
      "closes": "23:59"
    },
    "sameAs": [
      "https://facebook.com/kenfossrefrigeration",
      "https://linkedin.com/company/kenfoss-refrigeration"
    ],
    "priceRange": "$$"
  }
};

export const PAGE_SEO_PRESETS: Record<string, SEOMetadata> = {
  home: DEFAULT_SEO,
  services: {
    title: "Cold Room & HVAC Engineering Services | Kenfoss Refrigeration Kenya",
    description: "Explore our expert services including cold room design, blast freezer setup, chiller servicing, supermarket refrigeration, and 24/7 emergency repair across Kenya.",
    keywords: [
      "Cold room installation services",
      "Refrigeration repairs Kenya",
      "Industrial chiller servicing",
      "HVAC preventive maintenance",
      "Blast freezer engineering"
    ],
    canonicalUrl: "https://kenfoss.co.ke/#services",
    ogImage: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=1200",
    ogType: "website",
    schemaData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Refrigeration & HVAC Engineering",
      "provider": {
        "@type": "LocalBusiness",
        "name": "Kenfoss Refrigeration Limited"
      },
      "areaServed": "Kenya",
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Refrigeration Services",
        "itemListElement": [
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Cold Room Installation & Sizing" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Blast Freezer Construction" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Industrial Chiller Servicing" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Commercial HVAC & VRF Systems" } }
        ]
      }
    }
  },
  calculator: {
    title: "Cold Room Heat Load & Sizing Calculator | Kenfoss Engineering",
    description: "Accurately calculate required cooling capacity (BTU & kW), insulation thickness, and compressor wattage for your horticultural, dairy, or meat cold room in Kenya.",
    keywords: [
      "Cold room sizing calculator Kenya",
      "Heat load calculation refrigeration",
      "Cold storage BTU calculator",
      "Compressor tonnage estimator",
      "PUF panel thickness guide"
    ],
    canonicalUrl: "https://kenfoss.co.ke/#calculator",
    ogImage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=1200",
    ogType: "website"
  },
  industries: {
    title: "Refrigeration Solutions by Industry | Agriculture, Dairy, Pharma | Kenfoss",
    description: "Custom thermal storage and chilling systems engineered for Kenya's floriculture, dairy processors, pharmaceutical stores, hospitality, and meat distributors.",
    keywords: [
      "Dairy cooling tanks Kenya",
      "Horticulture flower cold rooms",
      "Pharma GDP cold chain storage",
      "Supermarket display chiller repairs"
    ],
    canonicalUrl: "https://kenfoss.co.ke/#industries"
  },
  projects: {
    title: "Refrigeration & Cold Storage Projects Portfolio | Kenfoss Kenya",
    description: "Browse completed commercial cold storage projects, milk chilling plants, and industrial freezer installations executed by Kenfoss across Kenya.",
    keywords: [
      "Cold storage projects Kenya",
      "Installed cold rooms Nairobi",
      "Kenfoss engineering portfolio",
      "Industrial refrigeration case studies"
    ],
    canonicalUrl: "https://kenfoss.co.ke/#projects"
  },
  blog: {
    title: "Refrigeration & HVAC Knowledge Hub | Technical Guides & Articles",
    description: "Learn best practices for cold room maintenance, energy savings, refrigerant safety (R404A/R134a/R290), and compressor troubleshooting from Kenfoss engineers.",
    keywords: [
      "Cold room maintenance guide",
      "Compressor fault codes HVAC",
      "Energy efficient cold storage Kenya",
      "Refrigerant leak detection"
    ],
    canonicalUrl: "https://kenfoss.co.ke/#blog"
  },
  contact: {
    title: "Contact Kenfoss Refrigeration | Ruiru Office & Emergency Hotline",
    description: "Reach out to Kenfoss Refrigeration Limited in Ruiru, Kiambu. Call +254 745 411923 for immediate 24/7 emergency repair or site survey requests.",
    keywords: [
      "Contact Kenfoss Refrigeration",
      "Refrigeration repair phone number Ruiru",
      "Cold room technician hotline Nairobi"
    ],
    canonicalUrl: "https://kenfoss.co.ke/#contact"
  },
  admin: {
    title: "Admin & Operations Portal | Kenfoss Refrigeration Limited",
    description: "Secure management portal for authorized Kenfoss staff, administrators, and field technicians.",
    keywords: ["Kenfoss Admin Portal", "Staff Login"],
    canonicalUrl: "https://kenfoss.co.ke/#admin"
  }
};

/**
 * Helper function to retrieve SEO metadata with fallbacks
 */
export function getSEOMetadata(pageKey?: string, customOverride?: Partial<SEOMetadata>): SEOMetadata {
  const base = (pageKey && PAGE_SEO_PRESETS[pageKey]) ? PAGE_SEO_PRESETS[pageKey] : DEFAULT_SEO;
  
  if (!customOverride) return base;

  return {
    title: customOverride.title || base.title,
    description: customOverride.description || base.description,
    keywords: customOverride.keywords ? [...new Set([...base.keywords, ...customOverride.keywords])] : base.keywords,
    canonicalUrl: customOverride.canonicalUrl || base.canonicalUrl,
    ogImage: customOverride.ogImage || base.ogImage,
    ogType: customOverride.ogType || base.ogType,
    schemaData: customOverride.schemaData || base.schemaData
  };
}
