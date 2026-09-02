/**
 * CODEHALAAM — The Gamified Code Hosting Platform
 * 
 * © 2026 JustShipitAI. All rights reserved.
 * 
 * CONFIDENTIAL — TRADE SECRET
 * 
 * This file is proprietary and confidential. Unauthorized
 * copying, distribution, modification, or reverse engineering
 * of this file, via any medium, is strictly prohibited.
 * 
 * This code was developed with AI assistance under strict
 * confidentiality protocols. All intellectual property rights
 * are retained by the Owner.
 * 
 * For licensing inquiries: justshipitai@gmail.com
 */

import { useEffect } from 'react'

const SITE_NAME = 'CODEHALAAM'

/**
 * Dynamically sets the document title and SEO meta tags for a page.
 * Call this from any page component after data loads.
 */
export function useSEO({
  title,
  description,
  url,
  image,
  type = 'website',
}: {
  title: string
  description?: string
  url?: string
  image?: string
  type?: string
}) {
  useEffect(() => {
    const fullTitle = title ? `${title} — ${SITE_NAME}` : SITE_NAME

    // Document title
    document.title = fullTitle

    // og:title
    const ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement
    if (ogTitle) ogTitle.content = fullTitle

    // twitter:title
    const twTitle = document.querySelector('meta[name="twitter:title"]') as HTMLMetaElement
    if (twTitle) twTitle.content = fullTitle

    // meta description
    if (description) {
      const metaDesc = document.getElementById('meta-description') as HTMLMetaElement
        || document.querySelector('meta[name="description"]') as HTMLMetaElement
      if (metaDesc) metaDesc.content = description

      const ogDesc = document.querySelector('meta[property="og:description"]') as HTMLMetaElement
      if (ogDesc) ogDesc.content = description

      const twDesc = document.querySelector('meta[name="twitter:description"]') as HTMLMetaElement
      if (twDesc) twDesc.content = description
    }

    // og:url
    if (url) {
      const ogUrl = document.querySelector('meta[property="og:url"]') as HTMLMetaElement
      if (ogUrl) ogUrl.content = url
    }

    // og:image
    if (image) {
      const ogImage = document.querySelector('meta[property="og:image"]') as HTMLMetaElement
      if (ogImage) ogImage.content = image

      const twImage = document.querySelector('meta[name="twitter:image"]') as HTMLMetaElement
      if (twImage) twImage.content = image
    }

    // og:type
    if (type) {
      const ogType = document.querySelector('meta[property="og:type"]') as HTMLMetaElement
      if (ogType) ogType.content = type
    }

    // Cleanup: restore defaults when component unmounts
    return () => {
      document.title = `${SITE_NAME} — A Gamified Code Hosting Platform`
    }
  }, [title, description, url, image, type])
}
