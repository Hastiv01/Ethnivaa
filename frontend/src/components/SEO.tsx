import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product';
  schema?: Record<string, any>;
}

export const SEO: React.FC<SEOProps> = ({
  title = 'Ethnivaa | Traditional Indian Jewellery | Festive Luxury',
  description = 'Discover Ethnivaa, a premium traditional Indian jewellery brand. Explore Navratri collection, Kundan, Temple jewellery, and antique oxidized ornaments designed with modern elegance.',
  keywords = 'Indian jewellery, Ethnivaa, Kundan, Oxidized jewellery, Temple jewellery, Navratri, luxury ethnic fashion, jhumkas, chokers',
  image = 'https://ethnivaa.com/logo.jpg',
  url,
  type = 'website',
  schema,
}) => {
  const currentUrl = url || window.location.origin + window.location.pathname;

  useEffect(() => {
    // 1. Update Document Title
    document.title = title;

    // Helper to query and update or create meta tags
    const updateMetaTag = (name: string, value: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let tag = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attribute, name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', value);
    };

    // 2. Update Standard Meta Tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('author', 'Ethnivaa Brand');

    // 3. Update Open Graph Meta Tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:url', currentUrl, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:site_name', 'Ethnivaa', true);

    // 4. Update Twitter Card Meta Tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);

    // 5. Update Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', currentUrl);

    // 6. Handle JSON-LD Structured Data
    let schemaScript = document.getElementById('jsonld-schema') as HTMLScriptElement | null;
    if (schema) {
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.id = 'jsonld-schema';
        schemaScript.type = 'application/ld+json';
        document.head.appendChild(schemaScript);
      }
      schemaScript.text = JSON.stringify(schema);
    } else if (schemaScript) {
      schemaScript.remove();
    }
  }, [title, description, keywords, image, currentUrl, type, schema]);

  return null;
};
