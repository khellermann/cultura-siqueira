import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { PageHeader, SiteFooter } from "@/components/SiteHeader";
import { getCulturalStory } from "@/lib/stories";
import { absoluteUrl, breadcrumbJsonLd, organizationJsonLd, seoHead } from "@/lib/seo";

export const Route = createFileRoute("/historias_/$slug")({
  loader: ({ params }) => {
    const story = getCulturalStory(params.slug);
    if (!story) throw notFound();
    return story;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const path = `/historias/${loaderData.slug}`;
    return seoHead({
      title: loaderData.title,
      description: loaderData.description,
      path,
      image: loaderData.image,
      type: "article",
      jsonLd: [
        breadcrumbJsonLd([
          { name: "Início", path: "/" },
          { name: "Histórias", path: "/historias" },
          { name: loaderData.title, path },
        ]),
        {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: loaderData.title,
          description: loaderData.description,
          image: absoluteUrl(loaderData.image),
          datePublished: loaderData.publishedAt,
          dateModified: loaderData.publishedAt,
          author: organizationJsonLd,
          publisher: organizationJsonLd,
          mainEntityOfPage: absoluteUrl(path),
        },
      ],
    });
  },
  component: StoryDetail,
});

function StoryDetail() {
  const story = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-background">
      <PageHeader menu="museu" />
      <main>
        <article className="mx-auto max-w-4xl px-6 py-16 md:px-10 md:py-24">
          <p className="text-xs uppercase tracking-[0.3em] text-accent">{story.eyebrow}</p>
          <h1 className="mt-6 font-display text-5xl leading-tight md:text-7xl">{story.title}</h1>
          <p className="mt-7 text-xl leading-relaxed text-muted-foreground">{story.description}</p>
          <img
            src={story.image}
            alt={story.imageAlt}
            width={1400}
            height={900}
            fetchPriority="high"
            className="mt-12 w-full border border-border object-cover"
          />
          <div className="mx-auto mt-12 max-w-3xl space-y-7 text-lg leading-relaxed">
            {story.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="mt-12 border-t border-border pt-8">
            <Link
              to="/visite"
              className="inline-block bg-foreground px-6 py-4 text-xs uppercase tracking-[0.2em] text-background"
            >
              Conheça o museu
            </Link>
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
