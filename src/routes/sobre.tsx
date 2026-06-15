import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, HandHeart, Images, UsersRound } from "lucide-react";

import { PageHeader, SiteFooter } from "@/components/SiteHeader";

const values = [
  {
    title: "Preservar",
    text: "Cuidar de objetos, documentos e imagens que atravessaram gerações e ainda ajudam a contar quem somos.",
    icon: Images,
  },
  {
    title: "Educar",
    text: "Aproximar escolas, pesquisadores e visitantes da história local por meio de visitas e mediações.",
    icon: BookOpen,
  },
  {
    title: "Pertencer",
    text: "Fazer com que a comunidade reconheça suas próprias lembranças como parte do patrimônio da cidade.",
    icon: UsersRound,
  },
  {
    title: "Acolher",
    text: "Receber relatos, doações e colaborações que ampliam o sentido do acervo todos os dias.",
    icon: HandHeart,
  },
] as const;

const memoryImages = [
  {
    src: "/museu-galeria/museu-galeria-12.jpeg",
    alt: "Sala principal do Museu Histórico Municipal com vitrines e assoalho de madeira",
    label: "Salas e vitrines",
  },
  {
    src: "/museu-galeria/museu-galeria-25.jpeg",
    alt: "Sala dos prefeitos com retratos e objetos históricos",
    label: "Memória pública",
  },
  {
    src: "/museu-galeria/museu-galeria-23.jpeg",
    alt: "Reconstituição de moradia antiga preservada no museu",
    label: "Vida cotidiana",
  },
] as const;

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre - Museu de Siqueira Campos" },
      {
        name: "description",
        content:
          "A trajetória, a missão e o papel do Museu de Siqueira Campos na preservação da memória do Norte Pioneiro do Paraná.",
      },
      { property: "og:title", content: "Sobre o Museu de Siqueira Campos" },
      {
        property: "og:description",
        content: "Preservar, valorizar e divulgar a memória siqueirense.",
      },
    ],
  }),
  component: Sobre,
});

function Sobre() {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader menu="museu" />

      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-12 md:px-10 md:py-28">
          <div className="md:col-span-7">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Sobre o museu
            </p>
            <h1 className="mt-6 max-w-5xl font-display text-5xl leading-[1.05] md:text-7xl">
              O Museu guarda objetos, mas principalmente guarda encontros.
            </h1>
            <p className="mt-8 max-w-3xl text-lg leading-relaxed text-muted-foreground">
              Entre gerações, histórias e lembranças de Siqueira Campos, cada peça preservada abre
              uma conversa sobre a cidade, suas famílias, seus trabalhos, suas festas, sua fé e seus
              modos de viver.
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
                to="/contribua"
                className="inline-flex items-center gap-2 border border-border px-6 py-4 text-xs uppercase tracking-[0.22em] transition hover:border-foreground"
              >
                Contribuir com memórias
              </Link>
            </div>
          </div>
          <div className="grid gap-4 md:col-span-5">
            {memoryImages.map((image, index) => (
              <figure
                key={image.src}
                className={`border border-border bg-card p-3 ${index === 0 ? "" : "md:ml-10"}`}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  loading={index === 0 ? "eager" : "lazy"}
                  className="aspect-[16/9] w-full object-cover"
                />
                <figcaption className="pt-3 text-[10px] uppercase tracking-[0.26em] text-accent">
                  {image.label}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-12 md:px-10 md:py-28">
          <div className="md:col-span-5">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Nossa missão
            </p>
            <h2 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
              Preservar a memória para que a cidade possa se reconhecer.
            </h2>
          </div>
          <div className="space-y-5 text-base leading-relaxed text-muted-foreground md:col-span-7">
            <p>
              O Museu Histórico Municipal é um espaço dedicado à preservação, valorização e
              divulgação da memória histórica, cultural e artística de Siqueira Campos e do Norte
              Pioneiro.
            </p>
            <p>
              Seu acervo reúne fotografias, documentos, mobiliário, objetos de trabalho, peças
              religiosas, registros públicos e ambientes reconstituídos que ajudam a narrar a
              trajetória do município.
            </p>
            <p>
              Mais do que guardar peças, o Museu cria pontes: recebe escolas, acolhe visitantes,
              escuta moradores e transforma lembranças individuais em patrimônio coletivo.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-secondary/35">
        <div className="mx-auto grid max-w-7xl gap-5 px-6 py-20 md:grid-cols-4 md:px-10">
          {values.map((value) => {
            const Icon = value.icon;
            return (
              <article key={value.title} className="border border-border bg-background p-6">
                <Icon className="h-6 w-6 text-accent" />
                <h2 className="mt-8 font-display text-2xl">{value.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{value.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-12 md:px-10 md:py-28">
          <div className="md:col-span-7">
            <img
              src="/museu-galeria/museu-galeria-06.jpeg"
              alt="Painel sobre a Aldeia Indígena do Pinhalzinho"
              loading="lazy"
              className="aspect-[16/10] w-full object-cover"
            />
          </div>
          <div className="flex flex-col justify-center md:col-span-5">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Educação patrimonial
            </p>
            <h2 className="mt-4 font-display text-4xl leading-tight">
              Uma visita ao museu também é uma aula sobre pertencimento.
            </h2>
            <p className="mt-6 leading-relaxed text-muted-foreground">
              Cada turma, pesquisador ou morador que atravessa as salas do Museu encontra pistas
              sobre a formação da cidade e também deixa novas perguntas para o futuro.
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
