import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SiteFooter } from "@/components/SiteHeader";
import { collection } from "@/lib/collection";

export const Route = createFileRoute("/acervo")({
  head: () => ({
    meta: [
      { title: "Acervo — Museu de Siqueira Campos" },
      {
        name: "description",
        content:
          "Conheça as peças do acervo permanente do Museu de Siqueira Campos: retratos, mobiliário, indumentária, objetos e documentos.",
      },
      { property: "og:title", content: "Acervo — Museu de Siqueira Campos" },
      { property: "og:description", content: "Peças que reconstituem a memória do município." },
    ],
  }),
  component: Acervo,
});

function Acervo() {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader menu="museu" />
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            — Acervo permanente
          </p>
          <h1 className="mt-6 max-w-4xl font-display text-5xl leading-[1.05] md:text-7xl">
            Objetos que <em className="italic">guardam</em> a memória da cidade.
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-muted-foreground">
            Mais de uma centena de peças catalogadas — fotografias, mobiliário, indumentária,
            ferramentas e documentos doados por famílias siqueirenses ao longo de décadas.
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10">
          <div className="grid gap-x-8 gap-y-20 md:grid-cols-2 lg:grid-cols-3">
            {collection.map((p, i) => (
              <article key={p.title} className={i % 5 === 0 ? "lg:col-span-2" : ""}>
                <div className="overflow-hidden bg-muted">
                  <img
                    src={p.url}
                    alt={p.title}
                    loading="lazy"
                    className={`w-full object-cover ${i % 5 === 0 ? "aspect-[16/10]" : "aspect-[4/5]"}`}
                  />
                </div>
                <div className="mt-6 flex items-baseline justify-between gap-4">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-accent">{p.category}</p>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                    {p.period}
                  </p>
                </div>
                <h3 className="mt-3 font-display text-2xl leading-tight">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {p.description}
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
