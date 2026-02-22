import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
}

export default function SEO({
  title,
  description,
  canonicalUrl,
  ogImage = "https://frakktur.com/og-image.jpg",
  ogType = "website",
}: SEOProps) {
  useEffect(() => {
    // Set page title
    document.title = `${title} | Frakktur`;

    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", description);
    }

    // Set Open Graph meta tags
    const ogTitleMeta = document.querySelector('meta[property="og:title"]');
    if (ogTitleMeta) {
      ogTitleMeta.setAttribute("content", `${title} | Frakktur`);
    }

    const ogDescriptionMeta = document.querySelector('meta[property="og:description"]');
    if (ogDescriptionMeta) {
      ogDescriptionMeta.setAttribute("content", description);
    }

    const ogImageMeta = document.querySelector('meta[property="og:image"]');
    if (ogImageMeta) {
      ogImageMeta.setAttribute("content", ogImage);
    }

    const ogTypeMeta = document.querySelector('meta[property="og:type"]');
    if (ogTypeMeta) {
      ogTypeMeta.setAttribute("content", ogType);
    }

    // Set canonical URL
    if (canonicalUrl) {
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement("link");
        canonicalLink.setAttribute("rel", "canonical");
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute("href", canonicalUrl);
    }

    // Set Twitter meta tags
    const twitterTitleMeta = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitleMeta) {
      twitterTitleMeta.setAttribute("content", `${title} | Frakktur`);
    }

    const twitterDescriptionMeta = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescriptionMeta) {
      twitterDescriptionMeta.setAttribute("content", description);
    }

    const twitterImageMeta = document.querySelector('meta[name="twitter:image"]');
    if (twitterImageMeta) {
      twitterImageMeta.setAttribute("content", ogImage);
    }
  }, [title, description, canonicalUrl, ogImage, ogType]);

  return null;
}
