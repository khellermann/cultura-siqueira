import { createFileRoute } from "@tanstack/react-router";

import { PageHeader, SiteFooter } from "@/components/SiteHeader";

export const Route = createFileRoute("/contribua")({
  head: () => ({
    meta: [
      { title: "Contribua — Museu de Siqueira Campos" },
      {
        name: "description",
        content:
          "Saiba como contribuir com o Museu de Siqueira Campos por meio de doações, documentos, fotografias e memórias da comunidade.",
      },
      { property: "og:title", content: "Contribua com o Museu de Siqueira Campos" },
      {
        property: "og:description",
        content: "Ajude a preservar a memória histórica e cultural do município.",
      },
    ],
  }),
  component: Contribua,
});

function Contribua() {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader menu="museu" />

      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">— Contribua</p>
          <h1 className="mt-6 max-w-4xl font-display text-5xl leading-[1.05] md:text-7xl">
            Toda memória compartilhada ajuda a contar a história da cidade.
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            O Museu recebe doações de fotografias, documentos, objetos, relatos e materiais que
            ajudem a preservar a história de Siqueira Campos e de sua comunidade.
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-3 md:px-10 md:py-28">
          {[
            {
              title: "Doe ao acervo",
              text: "Objetos, documentos, fotografias e peças familiares podem ser avaliados pela equipe para catalogação.",
            },
            {
              title: "Compartilhe histórias",
              text: "Relatos, memórias e informações sobre pessoas, lugares e acontecimentos ajudam a contextualizar o acervo.",
            },
            {
              title: "Apoie atividades",
              text: "Parcerias com escolas, pesquisadores e comunidade fortalecem exposições, visitas e ações educativas.",
            },
          ].map((item) => (
            <article key={item.title} className="border-t border-foreground pt-6">
              <h2 className="font-display text-3xl">{item.title}</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-secondary/40">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10">
          <p className="text-xs uppercase tracking-[0.3em] text-accent">Contato</p>
          <p className="mt-6 max-w-3xl font-display text-3xl leading-tight md:text-4xl">
            Para propor uma doação ou parceria, entre em contato com a Secretaria Municipal de
            Cultura.
          </p>
          <div className="mt-10 space-y-2 text-sm">
            <p>
              <span className="uppercase tracking-[0.2em] text-muted-foreground">Telefone · </span>
              (43) 0000-0000
            </p>
            <p>
              <span className="uppercase tracking-[0.2em] text-muted-foreground">E-mail · </span>
              cultura@siqueiracampos.pr.gov.br
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
