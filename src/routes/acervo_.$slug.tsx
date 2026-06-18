import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { PageHeader, SiteFooter } from "@/components/SiteHeader";
import { museumGalleryItems } from "@/lib/museumCatalog";
import {
  breadcrumbJsonLd,
  getMuseumItemIdFromSlug,
  getMuseumItemSlug,
  museumJsonLd,
  seoHead,
} from "@/lib/seo";

export const Route = createFileRoute("/acervo_/$slug")({
  loader: ({ params }) => {
    const item = museumGalleryItems.find(
      (candidate) => candidate.id === getMuseumItemIdFromSlug(params.slug),
    );
    if (!item) throw notFound();
    return item;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const path = `/acervo/${getMuseumItemSlug(loaderData)}`;
    return seoHead({
      title: `${loaderData.title} - Acervo do Museu`,
      description: loaderData.description,
      path,
      image: loaderData.image,
      type: "article",
      jsonLd: [
        breadcrumbJsonLd([
          { name: "Início", path: "/" },
          { name: "Acervo", path: "/acervo" },
          { name: loaderData.title, path },
        ]),
        museumJsonLd,
        {
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: loaderData.title,
          description: loaderData.description,
          image: loaderData.image,
          about: loaderData.category,
          isPartOf: {
            "@type": "Museum",
            name: "Museu Histórico Municipal de Siqueira Campos",
          },
        },
      ],
    });
  },
  component: CollectionDetail,
});

function CollectionDetail() {
  const item = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-background">
      <PageHeader menu="museu" />
      <main>
        <article className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-12 md:px-10 md:py-24">
          <div className="md:col-span-7">
            <img
              src={item.image}
              alt={item.alt}
              width={1400}
              height={1050}
              fetchPriority="high"
              className="w-full border border-border object-cover"
            />
          </div>
          <div className="md:col-span-5">
            <p className="text-xs uppercase tracking-[0.3em] text-accent">{item.category}</p>
            <h1 className="mt-5 font-display text-5xl leading-tight">{item.title}</h1>
            <p className="mt-8 text-lg leading-relaxed text-muted-foreground">{item.description}</p>
            <p className="mt-8 text-base leading-relaxed">
              Esta peça ou ambiente integra o acervo permanente do Museu Histórico Municipal e ajuda
              a preservar a memória cultural de Siqueira Campos e do Norte Pioneiro do Paraná.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/visite"
                className="bg-foreground px-6 py-4 text-xs uppercase tracking-[0.2em] text-background"
              >
                Planejar visita
              </Link>
              <Link
                to="/acervo"
                className="border border-border px-6 py-4 text-xs uppercase tracking-[0.2em]"
              >
                Voltar ao acervo
              </Link>
            </div>
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
