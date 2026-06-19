import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Sparkles, X } from "lucide-react";
import { useMemo, useState } from "react";

import { PageHeader, SiteFooter } from "@/components/SiteHeader";
import {
  museumFeaturedItems,
  museumGalleryFilters,
  museumGalleryItems,
  type MuseumGalleryFilter,
  type MuseumGalleryItem,
} from "@/lib/museumCatalog";
import { getMuseumItemSlug, seoHead, socialImages } from "@/lib/seo";

export const Route = createFileRoute("/acervo")({
  head: () =>
    seoHead({
      title: "Acervo do Museu",
      description:
        "Conheça retratos, mobiliário, indumentária, documentos, objetos e ambientes que preservam a memória de Siqueira Campos.",
      path: "/acervo",
      image: socialImages.collection,
    }),
  component: Acervo,
});

function Acervo() {
  const [activeFilter, setActiveFilter] = useState<MuseumGalleryFilter>("Todos");
  const [selectedItem, setSelectedItem] = useState<MuseumGalleryItem | null>(null);

  const filteredItems = useMemo(() => {
    if (activeFilter === "Todos") return museumGalleryItems;
    return museumGalleryItems.filter((item) => item.category === activeFilter);
  }, [activeFilter]);

  const heroItems = museumGalleryItems.slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <PageHeader menu="museu" />

      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-12 md:px-10 md:py-28">
          <div className="md:col-span-5">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Acervo permanente
            </p>
            <h1 className="mt-6 max-w-4xl font-display text-5xl leading-[1.05] md:text-7xl">
              Objetos que guardam a memória da cidade.
            </h1>
            <p className="mt-8 text-lg leading-relaxed text-muted-foreground">
              Fotografias, mobiliário, indumentária, ferramentas, documentos e ambientes
              reconstituídos doados por famílias siqueirenses ao longo de décadas.
            </p>
          </div>
          <div className="grid gap-3 md:col-span-7 md:grid-cols-6">
            {heroItems.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedItem(item)}
                className={`group relative overflow-hidden border border-border bg-muted ${
                  index === 0 ? "md:col-span-4 md:row-span-2" : "md:col-span-2"
                }`}
              >
                <img
                  src={item.image}
                  alt={item.alt}
                  loading={index === 0 ? "eager" : "lazy"}
                  className={`w-full object-cover transition duration-700 group-hover:scale-[1.04] ${
                    index === 0 ? "aspect-[4/3] h-full" : "aspect-[4/3]"
                  }`}
                />
                <span className="absolute inset-x-0 bottom-0 bg-black/60 px-4 py-3 text-left text-background">
                  <span className="block text-[10px] uppercase tracking-[0.24em] text-background/70">
                    {item.category}
                  </span>
                  <span className="mt-1 block font-display text-xl leading-tight">
                    {item.title}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-secondary/35">
        <div className="mx-auto grid max-w-7xl gap-5 px-6 py-16 md:grid-cols-3 md:px-10">
          <article className="border border-border bg-background p-6">
            <Sparkles className="h-6 w-6 text-accent" />
            <h2 className="mt-8 font-display text-2xl">Acervo vivo</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Cada peça ganha sentido quando encontra uma história, uma lembrança ou um nome que a
              comunidade ajuda a preservar.
            </p>
          </article>
          <article className="border border-border bg-background p-6">
            <Search className="h-6 w-6 text-accent" />
            <h2 className="mt-8 font-display text-2xl">Olhar de perto</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Clique nas imagens para ampliar detalhes, ler a descrição e perceber pequenos sinais
              do tempo.
            </p>
          </article>
          <article className="border border-border bg-background p-6">
            <span className="font-display text-5xl text-accent">{museumGalleryItems.length}</span>
            <h2 className="mt-5 font-display text-2xl">Registros nesta galeria</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Um recorte visual do acervo, organizado por temas para facilitar a descoberta.
            </p>
          </article>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
          <div className="mb-10 max-w-3xl">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Olhe mais de perto
            </p>
            <h2 className="mt-4 font-display text-4xl md:text-5xl">
              Destaques que contam várias camadas da cidade
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {museumFeaturedItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedItem(item)}
                className="group border border-border bg-card p-3 text-left transition hover:-translate-y-1 hover:border-accent"
              >
                <div className="overflow-hidden bg-muted">
                  <img
                    src={item.image}
                    alt={item.alt}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-4">
                  <p className="text-[10px] uppercase tracking-[0.26em] text-accent">
                    {item.category}
                  </p>
                  <h3 className="mt-2 font-display text-2xl leading-tight">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-background">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Galeria temática
              </p>
              <h2 className="mt-4 font-display text-4xl md:text-5xl">
                Escolha um caminho pelo acervo
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              Os filtros aproximam peças que conversam entre si: moradia, memória política, cultura
              indígena, religiosidade, ofícios, Colônia Mineira e vitrines.
            </p>
          </div>

          <div className="mb-10 flex flex-wrap gap-3">
            {museumGalleryFilters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`border px-4 py-3 text-xs uppercase tracking-[0.18em] transition ${
                  activeFilter === filter
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background hover:border-foreground"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedItem(item)}
                className={`group border border-border bg-card p-3 text-left transition hover:-translate-y-1 hover:border-accent ${
                  index % 7 === 0 ? "lg:col-span-2" : ""
                }`}
              >
                <div className="overflow-hidden bg-muted">
                  <img
                    src={item.image}
                    alt={item.alt}
                    loading="lazy"
                    className={`w-full object-cover transition duration-700 group-hover:scale-[1.03] ${
                      index % 7 === 0 ? "aspect-[16/9]" : "aspect-[4/3]"
                    }`}
                  />
                </div>
                <div className="p-4">
                  <p className="text-[10px] uppercase tracking-[0.26em] text-accent">
                    {item.category}
                  </p>
                  <h3 className="mt-2 font-display text-2xl leading-tight">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {selectedItem && <AcervoDialog item={selectedItem} onClose={() => setSelectedItem(null)} />}

      <SiteFooter />
    </div>
  );
}

function AcervoDialog({
  item,
  onClose,
}: {
  item: MuseumGalleryItem;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-5xl overflow-auto border border-white/20 bg-background"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.26em] text-accent">{item.category}</p>
            <h2 className="mt-2 font-display text-3xl leading-tight">{item.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center border border-border transition hover:border-foreground"
            aria-label="Fechar imagem"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <img src={item.image} alt={item.alt} className="max-h-[68vh] w-full bg-black object-contain" />
        <div className="p-5">
          <p className="text-base leading-relaxed text-muted-foreground">{item.description}</p>
          <Link
            to="/acervo/$slug"
            params={{ slug: getMuseumItemSlug(item) }}
            className="mt-5 inline-block border border-border px-5 py-3 text-xs uppercase tracking-[0.18em]"
            onClick={onClose}
          >
            Abrir página desta peça
          </Link>
        </div>
      </div>
    </div>
  );
}
