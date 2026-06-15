import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookMarked, Camera, HandHeart, Landmark, Search } from "lucide-react";

import { PageHeader, SiteFooter } from "@/components/SiteHeader";
import { cultureContact, formatPhones } from "@/lib/contact";

const contributionWays = [
  {
    title: "Doe uma lembrança",
    text: "Fotografias, documentos, cartas, jornais, objetos de família e materiais antigos podem ser avaliados pela equipe para integrar ou contextualizar o acervo.",
    icon: Camera,
  },
  {
    title: "Conte uma história",
    text: "Relatos sobre pessoas, lugares, festas, trabalhos e acontecimentos ajudam a dar voz às peças que já estão preservadas.",
    icon: BookMarked,
  },
  {
    title: "Ajude a identificar",
    text: "Muitas imagens ganham nova vida quando alguém reconhece um rosto, uma rua, uma casa, uma data ou um detalhe esquecido.",
    icon: Search,
  },
  {
    title: "Traga sua escola ou pesquisa",
    text: "Professores, estudantes e pesquisadores podem construir percursos educativos junto ao Museu e fortalecer a memória local.",
    icon: Landmark,
  },
] as const;

export const Route = createFileRoute("/contribua")({
  head: () => ({
    meta: [
      { title: "Contribua - Museu de Siqueira Campos" },
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
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-12 md:px-10 md:py-28">
          <div className="md:col-span-6">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Contribua</p>
            <h1 className="mt-6 max-w-4xl font-display text-5xl leading-[1.05] md:text-7xl">
              A memória de uma cidade continua viva quando a comunidade participa.
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              O Museu recebe doações, histórias, pistas e parcerias que ajudam no trabalho de
              resgate da memória de Siqueira Campos, uma cidade marcada por tantas culturas,
              encontros e trajetórias.
            </p>
          </div>
          <div className="md:col-span-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <img
                src="/museu-galeria/museu-galeria-26.jpeg"
                alt="Quadros e recortes de jornal preservados no museu"
                className="aspect-[4/5] w-full object-cover"
              />
              <div className="grid gap-4">
                <img
                  src="/museu-galeria/museu-galeria-02.jpeg"
                  alt="Matérias históricas sobre o museu em parede expositiva"
                  className="aspect-[4/3] w-full object-cover"
                />
                <img
                  src="/museu-galeria/museu-galeria-11.jpeg"
                  alt="Escultura em madeira e registros sobre cultura indígena"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-7xl gap-5 px-6 py-20 md:grid-cols-2 md:px-10 lg:grid-cols-4">
          {contributionWays.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="border border-border bg-card p-6">
                <Icon className="h-6 w-6 text-accent" />
                <h2 className="mt-8 font-display text-3xl leading-tight">{item.title}</h2>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-y border-border bg-secondary/35">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-12 md:px-10 md:py-28">
          <div className="md:col-span-5">
            <HandHeart className="h-8 w-8 text-accent" />
            <h2 className="mt-8 font-display text-4xl leading-tight md:text-5xl">
              Nem toda contribuição precisa ser um objeto.
            </h2>
          </div>
          <div className="space-y-5 text-base leading-relaxed text-muted-foreground md:col-span-7">
            <p>
              Às vezes, uma informação muda tudo: o nome de uma pessoa em uma fotografia, a história
              de uma ferramenta, a lembrança de uma festa, o endereço de uma antiga família ou o
              contexto de um documento.
            </p>
            <p>
              Por isso, o Museu também acolhe conversas. A comunidade ajuda a completar lacunas,
              corrigir datas, reconhecer personagens e ampliar o sentido do acervo.
            </p>
            <p className="font-display text-2xl leading-tight text-foreground">
              A memória de uma cidade não fica pronta dentro de uma vitrine. Ela continua viva
              quando a comunidade participa.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
          <div className="border border-border bg-background p-6 md:p-10">
            <p className="text-xs uppercase tracking-[0.3em] text-accent">Contato</p>
            <p className="mt-6 max-w-3xl font-display text-3xl leading-tight md:text-4xl">
              Para propor uma doação, compartilhar uma história ou iniciar uma parceria, entre em
              contato com a Secretaria Municipal de Cultura.
            </p>
            <div className="mt-10 grid gap-6 text-sm md:grid-cols-3">
              <div className="border-t border-border pt-4">
                <p className="uppercase tracking-[0.2em] text-muted-foreground">Telefone</p>
                <p className="mt-3 leading-relaxed">{formatPhones()}</p>
              </div>
              <div className="border-t border-border pt-4">
                <p className="uppercase tracking-[0.2em] text-muted-foreground">Ramais</p>
                <div className="mt-3 space-y-1">
                  {cultureContact.extensions.map((extension) => (
                    <p key={extension.number}>
                      {extension.number} - {extension.label}
                    </p>
                  ))}
                </div>
              </div>
              <div className="border-t border-border pt-4">
                <p className="uppercase tracking-[0.2em] text-muted-foreground">E-mail</p>
                <p className="mt-3 break-words">{cultureContact.email}</p>
              </div>
            </div>
            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href={`mailto:${cultureContact.email}?subject=${encodeURIComponent(
                  "Contribuição para o Museu Histórico Municipal",
                )}`}
                className="inline-flex items-center gap-2 bg-foreground px-6 py-4 text-xs uppercase tracking-[0.2em] text-background transition hover:bg-accent hover:text-accent-foreground"
              >
                Escrever para a Cultura
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                to="/visite"
                className="inline-flex items-center gap-2 border border-border px-6 py-4 text-xs uppercase tracking-[0.2em] transition hover:border-foreground"
              >
                Planejar visita
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
