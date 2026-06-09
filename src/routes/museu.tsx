import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Images, MapPin } from "lucide-react";

import { PageHeader, SiteFooter } from "@/components/SiteHeader";
import { collection } from "@/lib/collection";
import heroAsset from "@/assets/museu_54_1.asset.json";

const hero = heroAsset.url;

const galleryPhotos = [
  {
    label: "Galeria de prefeitos",
    category: "Memória política",
    alt: "Parede com retratos dos prefeitos de Siqueira Campos",
  },
  {
    label: "Matérias sobre o museu",
    category: "Imprensa e memória",
    alt: "Quadros e matérias históricas sobre o museu",
  },
  {
    label: "Máquina de escrever",
    category: "Objetos do cotidiano",
    alt: "Máquina de escrever verde e objetos antigos em vitrine",
  },
  {
    label: "Uniforme e documentos",
    category: "Acervo militar",
    alt: "Uniforme antigo, fotografias e documentos históricos em vitrine",
  },
  {
    label: "Vitrine de objetos antigos",
    category: "Acervo catalogado",
    alt: "Peças antigas catalogadas em vitrine de vidro",
  },
  {
    label: "Aldeia Indígena do Pinhalzinho",
    category: "Cultura indígena",
    alt: "Painel sobre a Aldeia Indígena do Pinhalzinho",
  },
  {
    label: "Utensílios e peças antigas",
    category: "Acervo catalogado",
    alt: "Utensílios antigos e peças catalogadas em vitrine de vidro",
  },
  {
    label: "Cristaleira e louças",
    category: "Mobiliário histórico",
    alt: "Mobiliário antigo com louças preservadas no museu",
  },
  {
    label: "Mesa de época",
    category: "Ambiente doméstico",
    alt: "Mesa e cadeiras antigas em ambiente expositivo",
  },
  {
    label: "Câmeras fotográficas",
    category: "Tecnologia e imagem",
    alt: "Câmeras fotográficas antigas expostas em vitrine",
  },
  {
    label: "Escultura indígena",
    category: "Cultura indígena",
    alt: "Escultura e registros sobre a cultura indígena local",
  },
  {
    label: "Sala principal",
    category: "Espaços do museu",
    alt: "Sala principal do museu com vitrines e assoalho de madeira",
  },
  {
    label: "Sala expositiva",
    category: "Espaços do museu",
    alt: "Sala expositiva com vitrines e fotografias históricas",
  },
  {
    label: "Instrumentos de laboratório",
    category: "Ciência e ofícios",
    alt: "Instrumentos e objetos de laboratório preservados em vitrine",
  },
  {
    label: "Sala com esculturas",
    category: "Espaços do museu",
    alt: "Sala com esculturas, janelas abertas e piso de madeira",
  },
  {
    label: "Escrivaninha histórica",
    category: "Mobiliário histórico",
    alt: "Escrivaninha antiga com livros, documentos e objetos de escritório",
  },
  {
    label: "Ambiente doméstico",
    category: "Mobiliário histórico",
    alt: "Ambiente com mobiliário histórico, cristaleira e louças",
  },
  {
    label: "Traje religioso",
    category: "Religiosidade",
    alt: "Traje religioso vermelho e vitrines em sala expositiva",
  },
  {
    label: "Sala religiosa",
    category: "Religiosidade",
    alt: "Sala religiosa com documentos, mobiliário e vestimenta",
  },
  {
    label: "Religiosidade e cultura indígena",
    category: "Memória cultural",
    alt: "Sala dedicada à religiosidade e cultura indígena",
  },
  {
    label: "Objetos do cotidiano",
    category: "Espaços do museu",
    alt: "Sala ampla com vitrines e objetos do cotidiano",
  },
  {
    label: "Vitrines do acervo",
    category: "Espaços do museu",
    alt: "Vitrines do museu em sala com piso de madeira",
  },
  {
    label: "Moradia antiga",
    category: "Ambiente histórico",
    alt: "Cenário de moradia antiga preservado no museu",
  },
  {
    label: "Corredor expositivo",
    category: "Religiosidade",
    alt: "Corredor expositivo com traje religioso e vitrines",
  },
  {
    label: "Sala dos prefeitos",
    category: "Memória política",
    alt: "Sala dos prefeitos com retratos e objetos históricos",
  },
  {
    label: "Recortes de jornal",
    category: "Imprensa e memória",
    alt: "Sala expositiva com vitrines e recortes de jornal",
  },
  {
    label: "Prefeitos e secretários",
    category: "Memória política",
    alt: "Ambiente da galeria de prefeitos e secretários do município",
  },
  {
    label: "Jornais e registros",
    category: "Imprensa e memória",
    alt: "Sala com vitrines, jornais e registros históricos",
  },
  {
    label: "Ambiente rural antigo",
    category: "Ambiente histórico",
    alt: "Ambiente de moradia antiga com objetos rurais",
  },
  {
    label: "Reconstituição histórica",
    category: "Ambiente histórico",
    alt: "Reconstituição de ambiente antigo com mobiliário e utensílios",
  },
  {
    label: "Colônia Mineira 1905",
    category: "Memória rural",
    alt: "Sala Colônia Mineira 1905 com objetos rurais",
  },
  {
    label: "Ferramentas rurais",
    category: "Memória rural",
    alt: "Acervo da Colônia Mineira com ferramentas e utensílios",
  },
  {
    label: "Painéis da Colônia Mineira",
    category: "Memória rural",
    alt: "Painéis e objetos históricos da Colônia Mineira",
  },
].map((photo, index) => ({
  ...photo,
  src: `/museu-galeria/museu-galeria-${String(index + 1).padStart(2, "0")}.jpeg`,
}));

const featuredGalleryPhotos = [galleryPhotos[0], galleryPhotos[2], galleryPhotos[9]];
const remainingGalleryPhotos = galleryPhotos.filter(
  (photo) => !featuredGalleryPhotos.includes(photo),
);

export const Route = createFileRoute("/museu")({
  head: () => ({
    meta: [
      { title: "Museu — Secretaria Municipal de Cultura" },
      {
        name: "description",
        content:
          "Museu Histórico Municipal de Siqueira Campos: acervo, memória, visitas e exposições.",
      },
      { property: "og:title", content: "Museu Histórico Municipal de Siqueira Campos" },
      {
        property: "og:description",
        content: "Um espaço de preservação da memória histórica e cultural do município.",
      },
      { property: "og:image", content: hero },
    ],
  }),
  component: Museu,
});

function Museu() {
  const highlights = collection.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <PageHeader menu="museu" />

      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-12 md:px-10 md:py-28">
          <div className="md:col-span-5">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              — Museu Histórico Municipal
            </p>
            <h1 className="mt-6 font-display text-5xl leading-[1.05] md:text-7xl">
              A memória de Siqueira Campos em exposição.
            </h1>
            <p className="mt-8 text-lg leading-relaxed text-muted-foreground">
              O Museu preserva fotografias, documentos, mobiliário, peças religiosas, objetos do
              cotidiano e registros da vida social e política do município.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/acervo"
                className="inline-flex items-center gap-2 bg-foreground px-6 py-4 text-xs uppercase tracking-[0.22em] text-background transition hover:bg-accent hover:text-accent-foreground"
              >
                Ver acervo
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/visite"
                className="inline-flex items-center gap-2 border border-border px-6 py-4 text-xs uppercase tracking-[0.22em] transition hover:border-foreground"
              >
                Planejar visita
              </Link>
            </div>
          </div>
          <div className="md:col-span-7">
            <img
              src={hero}
              alt="Salão principal do Museu de Siqueira Campos"
              className="aspect-[4/3] w-full object-cover"
              width={1400}
              height={1050}
            />
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-16 md:grid-cols-3 md:px-10">
          <div className="border border-border p-6">
            <Images className="h-6 w-6 text-accent" />
            <h2 className="mt-8 font-display text-2xl">Acervo permanente</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Peças catalogadas, fotografias históricas e objetos doados pela comunidade.
            </p>
          </div>
          <div className="border border-border p-6">
            <Clock className="h-6 w-6 text-accent" />
            <h2 className="mt-8 font-display text-2xl">Visitação</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Atendimento ao público, visitas mediadas e atividades educativas para escolas.
            </p>
          </div>
          <div className="border border-border p-6">
            <MapPin className="h-6 w-6 text-accent" />
            <h2 className="mt-8 font-display text-2xl">Localização</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Espaço cultural localizado no centro de Siqueira Campos, no Norte Pioneiro.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-background">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
          <div className="mb-12 max-w-3xl">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              — Galeria do Museu
            </p>
            <h2 className="mt-4 font-display text-4xl md:text-5xl">
              Acervo identificado por ambientes e objetos
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              As fotos foram organizadas por assunto para destacar ambientes, vitrines, documentos,
              objetos históricos e registros da memória de Siqueira Campos.
            </p>
          </div>

          <div className="mb-14 grid gap-4 md:grid-cols-3">
            {featuredGalleryPhotos.map((photo) => (
              <figure key={photo.src} className="group border border-border bg-card p-3">
                <div className="overflow-hidden bg-muted">
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                  />
                </div>
                <figcaption className="pt-4">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-accent">
                    {photo.category}
                  </p>
                  <h3 className="mt-2 font-display text-2xl">{photo.label}</h3>
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
            {remainingGalleryPhotos.map((photo) => (
              <figure
                key={photo.src}
                className="mb-5 break-inside-avoid overflow-hidden border border-border bg-card"
              >
                <img src={photo.src} alt={photo.alt} loading="lazy" className="w-full" />
                <figcaption className="border-t border-border p-4">
                  <p className="text-[10px] uppercase tracking-[0.26em] text-accent">
                    {photo.category}
                  </p>
                  <h3 className="mt-2 font-display text-xl leading-tight">{photo.label}</h3>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary/40">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
          <div className="mb-12 flex items-end justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                — Destaques
              </p>
              <h2 className="mt-4 font-display text-4xl md:text-5xl">Peças do acervo</h2>
            </div>
            <Link
              to="/acervo"
              className="hidden whitespace-nowrap text-xs uppercase tracking-[0.25em] text-foreground underline-offset-8 hover:underline md:block"
            >
              Ver tudo →
            </Link>
          </div>
          <div className="grid gap-x-8 gap-y-12 md:grid-cols-3">
            {highlights.map((piece) => (
              <article key={piece.title} className="group">
                <div className="overflow-hidden bg-muted">
                  <img
                    src={piece.url}
                    alt={piece.title}
                    loading="lazy"
                    className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                  />
                </div>
                <p className="mt-5 text-[10px] uppercase tracking-[0.3em] text-accent">
                  {piece.category}
                </p>
                <h3 className="mt-2 font-display text-2xl leading-tight">{piece.title}</h3>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {piece.period}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
