import type { CulturalEvent } from "@/lib/events";
import type { MuseumGalleryItem } from "@/lib/museumCatalog";

export const siteUrl =
  (import.meta.env.VITE_PUBLIC_SITE_URL as string | undefined)?.replace(/\/+$/, "") ??
  "https://cultura.siqueiracampos.pr.gov.br";

export const siteName = "Secretaria Municipal de Cultura de Siqueira Campos";

export type SocialImage = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  type?: string;
};

function socialCard(fileName: string, alt: string): SocialImage {
  return {
    src: `/social/${fileName}`,
    alt,
    width: 1200,
    height: 630,
    type: "image/png",
  };
}

export const socialImages = {
  home: socialCard("home.png", "Secretaria Municipal de Cultura de Siqueira Campos"),
  museum: socialCard("museu.png", "Museu Histórico Municipal de Siqueira Campos"),
  library: socialCard("biblioteca.png", "Biblioteca Municipal de Siqueira Campos"),
  cultureHouse: socialCard("casa-da-cultura.png", "Casa da Cultura de Siqueira Campos"),
  events: socialCard("eventos.png", "Agenda cultural de Siqueira Campos"),
  edicts: socialCard("editais.png", "Editais e chamadas culturais de Siqueira Campos"),
  registrations: socialCard("inscricoes.png", "Inscrições culturais abertas em Siqueira Campos"),
  collection: socialCard("acervo.png", "Acervo do Museu Histórico Municipal"),
  about: socialCard("sobre.png", "Sobre o Museu Histórico Municipal"),
  visit: socialCard("visite.png", "Planeje sua visita ao Museu Histórico Municipal"),
  contribute: socialCard("contribua.png", "Contribua com o Museu Histórico Municipal"),
  stories: socialCard("historias.png", "Histórias do Museu e da Cultura"),
} as const;

export const defaultSocialImage = socialImages.home.src;

export type BreadcrumbItem = {
  name: string;
  path: string;
};

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function inferImageMimeType(path: string) {
  const cleanPath = path.split(/[?#]/, 1)[0].toLowerCase();
  if (cleanPath.endsWith(".png")) return "image/png";
  if (cleanPath.endsWith(".webp")) return "image/webp";
  if (cleanPath.endsWith(".jpg") || cleanPath.endsWith(".jpeg") || cleanPath.endsWith(".jfif")) {
    return "image/jpeg";
  }
  return undefined;
}

export function eventSocialImage(image: string | undefined, eventName: string): SocialImage {
  const trimmedImage = image?.trim();
  if (!trimmedImage) return socialImages.events;

  const isPublicImage =
    (/^\//.test(trimmedImage) || /^https:\/\//i.test(trimmedImage)) &&
    (Boolean(inferImageMimeType(trimmedImage)) || /[?&]alt=media(?:&|$)/i.test(trimmedImage));

  if (!isPublicImage) return socialImages.events;

  return {
    src: trimmedImage,
    alt: `Cartaz do evento ${eventName}`,
    type: inferImageMimeType(trimmedImage),
  };
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
  image = socialImages.home,
  type = "website",
  noIndex = false,
  jsonLd = [],
}: {
  title: string;
  description: string;
  path: string;
  image?: string | SocialImage;
  type?: "website" | "article";
  noIndex?: boolean;
  jsonLd?: Record<string, unknown>[];
}) {
  const canonical = absoluteUrl(path);
  const fullTitle = title.includes("Siqueira Campos") ? title : `${title} | Siqueira Campos`;
  const socialImage: SocialImage =
    typeof image === "string"
      ? {
          src: image,
          alt: fullTitle,
          type: inferImageMimeType(image),
        }
      : image;
  const imageUrl = absoluteUrl(socialImage.src);

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
      { property: "og:image", content: imageUrl },
      { property: "og:image:secure_url", content: imageUrl },
      ...(socialImage.type ? [{ property: "og:image:type", content: socialImage.type }] : []),
      ...(socialImage.width
        ? [{ property: "og:image:width", content: String(socialImage.width) }]
        : []),
      ...(socialImage.height
        ? [{ property: "og:image:height", content: String(socialImage.height) }]
        : []),
      { property: "og:image:alt", content: socialImage.alt },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: fullTitle },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: imageUrl },
      { name: "twitter:image:alt", content: socialImage.alt },
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
