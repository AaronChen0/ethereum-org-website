import { join } from "path"

import Head from "next/head"
import { useRouter } from "next/router"
import { useTranslation } from "next-i18next"

import { getOgImage } from "@/lib/utils/metadata"

import { DEFAULT_LOCALE, SITE_URL } from "@/lib/constants"

type NameMeta = {
  name: string
  content: string
}

type PropMeta = {
  property: string
  content: string
}

export type Meta = NameMeta | PropMeta

export type PageMetadataProps = {
  title: string
  description: string
  image?: string
  canonicalUrl?: string
  author?: string
}

const PageMetadata = ({
  description,
  title,
  image,
  canonicalUrl,
  author,
}: PageMetadataProps) => {
  const { locale, asPath } = useRouter()
  const { t } = useTranslation()

  const desc = description || t("site-description")
  const siteTitle = t("site-title")
  const fullTitle = `${title} | ${siteTitle}`

  // Remove any query params (?) or hash links (#)
  const path = asPath.replace(/[\?\#].*/, "")
  const slug = path.split("/")

  /**
   * Set canonical URL w/ language path to avoid duplicate content
   * If English, remove language path
   * Remove trailing slash
   * @example ethereum.org/about/ -> ethereum.org/about
   * @example ethereum.org/pt-br/web3/ -> ethereum.org/pt-br/web3
   */
  const url = new URL(
    join(locale === DEFAULT_LOCALE ? "" : locale!, path),
    SITE_URL
  ).href.replace(/\/$/, "")
  const canonical = canonicalUrl || url

  /* Set fallback ogImage based on path */
  const ogImage = image || getOgImage(slug)

  const ogImageUrl = new URL(ogImage, SITE_URL).href
  const metadata: Meta[] = [
    { name: `image`, content: ogImageUrl },
    { name: `description`, content: desc },
    { name: `docsearch:description`, content: desc },
    { name: `twitter:card`, content: `summary_large_image` },
    { name: `twitter:creator`, content: author || siteTitle },
    { name: `twitter:site`, content: author || siteTitle },
    { name: `twitter:title`, content: fullTitle },
    { name: `twitter:description`, content: desc },
    { name: `twitter:image`, content: ogImageUrl },
    { property: `og:title`, content: fullTitle },
    { property: `og:locale`, content: locale! },
    { property: `og:description`, content: desc },
    { property: `og:type`, content: `website` },
    { property: `og:url`, content: url },
    { property: `og:image`, content: ogImageUrl },
    { property: `og:site_name`, content: siteTitle },
  ]

  return (
    <Head>
      <title>{fullTitle}</title>
      {metadata.map((data) => (
        <meta
          key={(data as NameMeta).name || (data as PropMeta).property}
          {...data}
        />
      ))}
      <link rel="canonical" key={canonical} href={canonical} />
    </Head>
  )
}

export default PageMetadata
