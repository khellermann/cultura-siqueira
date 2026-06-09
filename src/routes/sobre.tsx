import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SiteFooter } from "@/components/SiteHeader";
import img from "@/assets/museu_53_1.asset.json";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre — Museu de Siqueira Campos" },
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
        <div className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            — Sobre o museu
          </p>
          <h1 className="mt-6 max-w-4xl font-display text-5xl leading-[1.05] md:text-7xl">
            Preservar é, antes de tudo, um <em className="italic">ato de amor</em> à cidade.
          </h1>
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-7xl gap-16 px-6 py-24 md:grid-cols-12 md:px-10 md:py-32">
          <div className="md:col-span-7">
            <img
              src={img.url}
              alt="Sala expositiva com mobiliário antigo"
              loading="lazy"
              className="w-full object-cover"
            />
          </div>
          <div className="md:col-span-5">
            <h2 className="font-display text-3xl md:text-4xl">Nossa missão</h2>
            <p className="mt-6 leading-relaxed text-muted-foreground">
              O Museu de Siqueira Campos é um espaço dedicado à preservação, valorização e
              divulgação da memória histórica, cultural e artística da região. Nosso acervo conta a
              trajetória do município desde seus primeiros habitantes até os dias atuais.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Mais do que um centro de preservação, somos também um ambiente educativo e cultural —
              promovendo exposições temporárias, visitas guiadas, atividades pedagógicas e eventos
              voltados à comunidade e aos visitantes.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-secondary/40">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 md:grid-cols-3 md:px-10">
          {[
            { n: "+100", t: "peças catalogadas" },
            { n: "Séc. XIX", t: "documentos mais antigos" },
            { n: "Gratuito", t: "para toda a comunidade" },
          ].map((s) => (
            <div key={s.t} className="border-t border-foreground pt-6">
              <p className="font-display text-6xl text-accent">{s.n}</p>
              <p className="mt-4 text-sm uppercase tracking-[0.25em] text-muted-foreground">
                {s.t}
              </p>
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
