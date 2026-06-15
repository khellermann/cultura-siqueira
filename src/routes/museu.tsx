import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Images, MapPin, X } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import { PageHeader, SiteFooter } from "@/components/SiteHeader";
import {
  museumFeaturedItems,
  museumGalleryFilters,
  museumGalleryItems,
  museumThemes,
  type MuseumGalleryFilter,
  type MuseumGalleryItem,
} from "@/lib/museumCatalog";

const hero = "/museu-galeria/museu-galeria-12.jpeg";

const museumIntro =
  "O Museu Histórico Municipal preserva parte importante da trajetória de Siqueira Campos. Entre salas, vitrines e ambientes reconstituídos, o visitante encontra objetos do cotidiano, documentos, fotografias, ferramentas, mobiliário, peças religiosas e registros que revelam diferentes momentos da vida local.";

export const Route = createFileRoute("/museu")({
  head: () => ({
    meta: [
      { title: "Museu Histórico Municipal - Secretaria Municipal de Cultura" },
      {
        name: "description",
        content:
          "Museu Histórico Municipal de Siqueira Campos: acervo, memória, visitas, ambientes históricos e galeria de imagens.",
      },
      { property: "og:title", content: "Museu Histórico Municipal de Siqueira Campos" },
      {
        property: "og:description",
        content:
          "Um espaço de preservação da memória histórica e cultural de Siqueira Campos.",
      },
      { property: "og:image", content: hero },
    ],
  }),
  component: Museu,
});

function Museu() {
  const [activeFilter, setActiveFilter] = useState<MuseumGalleryFilter>("Todos");
  const [selectedPhoto, setSelectedPhoto] = useState<MuseumGalleryItem | null>(null);

  const filteredGallery = useMemo(() => {
    if (activeFilter === "Todos") return museumGalleryItems;
    return museumGalleryItems.filter((item) => item.category === activeFilter);
  }, [activeFilter]);

  return (
    <div className="min-h-screen bg-background">
      <PageHeader menu="museu" />

      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-14 md:grid-cols-12 md:px-10 md:py-24">
          <div className="md:col-span-5">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Museu Histórico Municipal
            </p>
            <h1 className="mt-6 font-display text-5xl leading-[1.05] md:text-7xl">
              A memória de Siqueira Campos preservada em ambientes, objetos e histórias.
            </h1>
            <p className="mt-8 text-lg leading-relaxed text-muted-foreground">
              O Museu reúne fotografias, documentos, mobiliário, peças religiosas, objetos do
              cotidiano, registros políticos, memória rural e referências culturais que ajudam a
              contar a formação do município e de sua comunidade.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="#galeria"
                className="inline-flex items-center gap-2 bg-foreground px-6 py-4 text-xs uppercase tracking-[0.22em] text-background transition hover:bg-accent hover:text-accent-foreground"
              >
                Ver galeria
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                to="/visite"
                className="inline-flex items-center gap-2 border border-border px-6 py-4 text-xs uppercase tracking-[0.22em] transition hover:border-foreground"
              >
                Planejar visita
              </Link>
            </div>
          </div>
          <div className="md:col-span-7">
            <div className="relative overflow-hidden border border-border bg-secondary/40 p-3">
              <img
                src={hero}
                alt="Sala principal do Museu Histórico Municipal com vitrines e assoalho de madeira"
                className="aspect-[4/3] w-full object-cover"
                width={1400}
                height={1050}
              />
              <div className="absolute bottom-3 left-3 right-3 border border-white/25 bg-black/55 px-5 py-4 text-background backdrop-blur-sm">
                <p className="text-[10px] uppercase tracking-[0.28em] text-background/70">
                  Patrimônio e memória
                </p>
                <p className="mt-2 font-display text-2xl leading-tight">
                  Um acervo vivo para contar a história local.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-16 md:grid-cols-3 md:px-10">
          <InfoCard
            icon={<Images className="h-6 w-6 text-accent" />}
            title="Acervo permanente"
            description="Peças catalogadas, fotografias históricas, ambientes reconstituídos e objetos doados pela comunidade."
          />
          <InfoCard
            icon={<Clock className="h-6 w-6 text-accent" />}
            title="Visitação"
            description="Atendimento ao público, visitas mediadas e atividades educativas para escolas e grupos."
          />
          <InfoCard
            icon={<MapPin className="h-6 w-6 text-accent" />}
            title="Localização"
            description="Espaço cultural localizado em Siqueira Campos, no Norte Pioneiro do Paraná."
          />
        </div>
      </section>

      <section className="border-y border-border bg-secondary/35">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-12 md:px-10 md:py-28">
          <div className="md:col-span-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Percursos do acervo
            </p>
            <h2 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
              Seis caminhos para conhecer a história local
            </h2>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">{museumIntro}</p>
          </div>
          <div className="grid gap-4 md:col-span-8 md:grid-cols-2">
            {museumThemes.map((theme) => (
              <article key={theme.title} className="group border border-border bg-background p-3">
                <div className="overflow-hidden bg-muted">
                  <img
                    src={theme.image}
                    alt={theme.alt}
                    loading="lazy"
                    className="aspect-[16/10] w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-display text-2xl leading-tight">{theme.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {theme.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
          <div className="mb-12 max-w-3xl">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Destaques do acervo
            </p>
            <h2 className="mt-4 font-display text-4xl md:text-5xl">
              Peças, salas e registros em evidência
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {museumFeaturedItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedPhoto(item)}
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

      <section id="galeria" className="border-y border-border bg-background">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
          <div className="mb-10 max-w-3xl">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Galeria do Museu
            </p>
            <h2 className="mt-4 font-display text-4xl md:text-5xl">
              Acervo identificado por ambientes e objetos
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              Explore imagens do acervo e conheça ambientes que guardam histórias da cidade, da
              vida rural, dos ofícios, da religiosidade, da cultura indígena e da memória política
              do município.
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

          <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
            {filteredGallery.map((photo) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setSelectedPhoto(photo)}
                className="mb-5 block w-full break-inside-avoid overflow-hidden border border-border bg-card text-left transition hover:-translate-y-1 hover:border-accent"
              >
                <img src={photo.image} alt={photo.alt} loading="lazy" className="w-full" />
                <span className="block border-t border-border p-4">
                  <span className="block text-[10px] uppercase tracking-[0.26em] text-accent">
                    {photo.category}
                  </span>
                  <span className="mt-2 block font-display text-xl leading-tight">
                    {photo.title}
                  </span>
                  <span className="mt-3 block text-sm leading-relaxed text-muted-foreground">
                    {photo.description}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {selectedPhoto && (
        <GalleryDialog photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
      )}

      <SiteFooter />
    </div>
  );
}

function InfoCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="border border-border p-6">
      {icon}
      <h2 className="mt-8 font-display text-2xl">{title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

function GalleryDialog({
  photo,
  onClose,
}: {
  photo: MuseumGalleryItem;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label={photo.title}
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-5xl overflow-auto border border-white/20 bg-background"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.26em] text-accent">{photo.category}</p>
            <h2 className="mt-2 font-display text-3xl leading-tight">{photo.title}</h2>
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
        <img src={photo.image} alt={photo.alt} className="max-h-[68vh] w-full object-contain bg-black" />
        <p className="p-5 text-base leading-relaxed text-muted-foreground">{photo.description}</p>
      </div>
    </div>
  );
}
