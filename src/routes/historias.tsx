import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHeader, SiteFooter } from "@/components/SiteHeader";
import { culturalStories } from "@/lib/stories";
import { breadcrumbJsonLd, seoHead } from "@/lib/seo";

export const Route = createFileRoute("/historias")({
  head: () =>
    seoHead({
      title: "Histórias do Museu e da Cultura",
      description:
        "Histórias do acervo, patrimônio, memória local e guias culturais de Siqueira Campos e do Norte Pioneiro.",
      path: "/historias",
      jsonLd: [
        breadcrumbJsonLd([
          { name: "Início", path: "/" },
          { name: "Histórias", path: "/historias" },
        ]),
      ],
    }),
  component: Stories,
});

function Stories() {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader menu="museu" />
      <main className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
        <p className="text-xs uppercase tracking-[0.3em] text-accent">Memória e patrimônio</p>
        <h1 className="mt-5 max-w-4xl font-display text-5xl leading-tight md:text-7xl">
          Histórias que conectam o acervo à vida de Siqueira Campos.
        </h1>
        <div className="mt-14 grid gap-8 md:grid-cols-2">
          {culturalStories.map((story) => (
            <article key={story.slug} className="border border-border bg-card p-3">
              <img
                src={story.image}
                alt={story.imageAlt}
                width={900}
                height={600}
                loading="lazy"
                className="aspect-[3/2] w-full object-cover"
              />
              <div className="p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-accent">{story.eyebrow}</p>
                <h2 className="mt-3 font-display text-3xl leading-tight">{story.title}</h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">{story.description}</p>
                <Link
                  to="/historias/$slug"
                  params={{ slug: story.slug }}
                  className="mt-6 inline-block text-xs uppercase tracking-[0.2em] underline"
                >
                  Ler história
                </Link>
              </div>
            </article>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
