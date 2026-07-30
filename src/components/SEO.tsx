import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useAdmin } from '../context/AdminContext';
import { getSEOMetadata, SEOMetadata } from '../services/seoService';

export interface SEOProps {
  pageKey?: string;
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'business.business';
  schemaData?: Record<string, any>;
  noIndex?: boolean;
}

export const SEO: React.FC<SEOProps> = ({
  pageKey,
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage,
  ogType,
  schemaData,
  noIndex = false
}) => {
  const { websiteSettings, contactInfo } = useAdmin();

  const siteTitleOverride = websiteSettings?.siteTitle || websiteSettings?.companyName;
  const siteDescOverride = websiteSettings?.metaDescription;
  const siteKeywordsOverride = websiteSettings?.metaKeywords ? websiteSettings.metaKeywords.split(',').map(k => k.trim()) : undefined;

  const metadata: SEOMetadata = getSEOMetadata(pageKey, {
    title: title || (pageKey === 'home' && siteTitleOverride ? siteTitleOverride : undefined),
    description: description || siteDescOverride,
    keywords: keywords || siteKeywordsOverride,
    canonicalUrl,
    ogImage: ogImage || websiteSettings?.ogImageUrl || websiteSettings?.logoUrl,
    ogType,
    schemaData
  });

  // Dynamically patch schema with live contact & office info
  let finalSchema = metadata.schemaData;
  if (finalSchema && contactInfo) {
    finalSchema = JSON.parse(JSON.stringify(finalSchema));
    if (finalSchema['@type'] === 'LocalBusiness') {
      if (contactInfo.mainPhone) finalSchema.telephone = contactInfo.mainPhone;
      if (contactInfo.email) finalSchema.email = contactInfo.email;
      if (contactInfo.address && finalSchema.address) finalSchema.address.streetAddress = contactInfo.address;
      if (contactInfo.city && finalSchema.address) finalSchema.address.addressLocality = contactInfo.city;
    }
  }

  const keywordsString = metadata.keywords.join(', ');
  const currentCanonical = metadata.canonicalUrl || 'https://kenfoss.co.ke';
  const currentOgImage = metadata.ogImage || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=1200';
  const themeColor = websiteSettings?.primaryColor || '#0057B8';

  return (
    <Helmet>
      {/* Primary HTML Meta Tags */}
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <meta name="keywords" content={keywordsString} />
      <meta name="author" content={websiteSettings?.companyName || "Kenfoss Refrigeration Limited"} />
      <meta name="robots" content={noIndex || websiteSettings?.enableMaintenanceMode ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'} />
      <meta name="theme-color" content={themeColor} />

      {/* Dynamic Favicon */}
      {websiteSettings?.faviconUrl && (
        <link rel="icon" type="image/x-icon" href={websiteSettings.faviconUrl} />
      )}

      {/* Canonical URL */}
      {currentCanonical && <link rel="canonical" href={currentCanonical} />}

      {/* Open Graph / Facebook / LinkedIn Meta Tags */}
      <meta property="og:site_name" content={websiteSettings?.companyName || "Kenfoss Refrigeration Limited"} />
      <meta property="og:type" content={metadata.ogType || 'website'} />
      <meta property="og:url" content={currentCanonical} />
      <meta property="og:title" content={metadata.title} />
      <meta property="og:description" content={metadata.description} />
      <meta property="og:image" content={currentOgImage} />
      <meta property="og:image:alt" content={`${websiteSettings?.companyName || 'Kenfoss'} Cold Room & HVAC Engineering`} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metadata.title} />
      <meta name="twitter:description" content={metadata.description} />
      <meta name="twitter:image" content={currentOgImage} />

      {/* Google Analytics GA4 Script */}
      {websiteSettings?.googleAnalyticsId && (
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${websiteSettings.googleAnalyticsId}`} />
      )}
      {websiteSettings?.googleAnalyticsId && (
        <script>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${websiteSettings.googleAnalyticsId}');
          `}
        </script>
      )}

      {/* Structured JSON-LD Schema.org Data */}
      {finalSchema && (
        <script type="application/ld+json">
          {JSON.stringify(finalSchema)}
        </script>
      )}
    </Helmet>
  );
};
