import React from 'react';
import { Helmet } from 'react-helmet-async';
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
  const metadata: SEOMetadata = getSEOMetadata(pageKey, {
    title,
    description,
    keywords,
    canonicalUrl,
    ogImage,
    ogType,
    schemaData
  });

  const keywordsString = metadata.keywords.join(', ');
  const currentCanonical = metadata.canonicalUrl || 'https://kenfoss.co.ke';
  const currentOgImage = metadata.ogImage || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=1200';

  return (
    <Helmet>
      {/* Primary HTML Meta Tags */}
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <meta name="keywords" content={keywordsString} />
      <meta name="author" content="Kenfoss Refrigeration Limited" />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'} />
      <meta name="theme-color" content="#0057B8" />

      {/* Canonical URL */}
      {currentCanonical && <link rel="canonical" href={currentCanonical} />}

      {/* Open Graph / Facebook / LinkedIn Meta Tags */}
      <meta property="og:site_name" content="Kenfoss Refrigeration Limited" />
      <meta property="og:type" content={metadata.ogType || 'website'} />
      <meta property="og:url" content={currentCanonical} />
      <meta property="og:title" content={metadata.title} />
      <meta property="og:description" content={metadata.description} />
      <meta property="og:image" content={currentOgImage} />
      <meta property="og:image:alt" content="Kenfoss Refrigeration Industrial Cold Room & HVAC Engineering" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metadata.title} />
      <meta name="twitter:description" content={metadata.description} />
      <meta name="twitter:image" content={currentOgImage} />

      {/* Structured JSON-LD Schema.org Data */}
      {metadata.schemaData && (
        <script type="application/ld+json">
          {JSON.stringify(metadata.schemaData)}
        </script>
      )}
    </Helmet>
  );
};
