import type { CulturalEvent } from "@/lib/events";
import type { MuseumGalleryItem } from "@/lib/museumCatalog";

export const siteUrl =
  (import.meta.env.VITE_PUBLIC_SITE_URL as string | undefined)?.replace(/\/+$/, "") ??
  "https://cultura.siqueiracampos.pr.gov.br";

export const siteName = "Secretaria Municipal de Cultura de Siqueira Campos";
export const defaultSocialImage = "/museu-galeria/museu-galeria-12.jpeg";

export type BreadcrumbItem = {
  name: string;
  path: string;
};

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getEventSlug(event: Pick<CulturalEvent, "id" | "name">) {
  return `${slugify(event.name) || "evento"}--${event.id}`;
}

export function getEventIdFromSlug(slug: string) {
  const separatorIndex = slug.lastIndexOf("--");
  return separatorIndex >= 0 ? slug.slice(separatorIndex + 2) : slug;
}

export function getMuseumItemSlug(item: Pick<MuseumGalleryItem, "id" | "title">) {
  return `${slugify(item.title)}--${item.id}`;
}

export function getMuseumItemIdFromSlug(slug: string) {
  const separatorIndex = slug.lastIndexOf("--");
  return separatorIndex >= 0 ? slug.slice(separatorIndex + 2) : slug;
}

export function seoHead({
  title,
  description,
  path,
  image = defaultSocialImage,
  type = "website",
  noIndex = false,
  jsonLd = [],
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  noIndex?: boolean;
  jsonLd?: Record<string, unknown>[];
}) {
  const canonical = absoluteUrl(path);
  const fullTitle = title.includes("Siqueira Campos") ? title : `${title} | Siqueira Campos`;

  return {
    meta: [
      { title: fullTitle },
      { name: "description", content: description },
      { name: "robots", content: noIndex ? "noindex, nofollow" : "index, follow" },
      { property: "og:locale", content: "pt_BR" },
      { property: "og:site_name", content: siteName },
      { property: "og:type", content: type },
      { property: "og:title", content: fullTitle },
      { property: "og:description", content: description },
      { property: "og:url", content: canonical },
      { property: "og:image", content: absoluteUrl(image) },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: fullTitle },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: absoluteUrl(image) },
    ],
    links: [{ rel: "canonical", href: canonical }],
    scripts: jsonLd.map((value) => ({
      type: "application/ld+json",
      children: JSON.stringify(value).replace(/</g, "\\u003c"),
    })),
  };
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "GovernmentOrganization",
  name: siteName,
  url: siteUrl,
  email: "cultura@siqueiracampos.pr.gov.br",
  telephone: "+55 43 3571-1122",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Rua José de Anchieta, 82",
    addressLocality: "Siqueira Campos",
    addressRegion: "PR",
    addressCountry: "BR",
  },
};

export const museumJsonLd = {
  "@context": "https://schema.org",
  "@type": "Museum",
  name: "Museu Histórico Municipal de Siqueira Campos",
  url: absoluteUrl("/museu"),
  image: absoluteUrl(defaultSocialImage),
  isAccessibleForFree: true,
  email: "cultura@siqueiracampos.pr.gov.br",
  telephone: "+55 43 3571-1122",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Rua José de Anchieta, 82",
    addressLocality: "Siqueira Campos",
    addressRegion: "PR",
    addressCountry: "BR",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "17:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "09:00",
      closes: "13:00",
    },
  ],
};
