import { createFileRoute } from "@tanstack/react-router";

import { PageHeader, SiteFooter } from "@/components/SiteHeader";
import { cultureContact, formatPhones } from "@/lib/contact";

export const Route = createFileRoute("/visite")({
  head: () => ({
    meta: [
      { title: "Visite - Museu de Siqueira Campos" },
      {
        name: "description",
        content:
          "Horarios, endereco e informacoes praticas para visitar o Museu de Siqueira Campos.",
      },
      { property: "og:title", content: "Planeje sua visita ao Museu" },
      { property: "og:description", content: "Terca a sabado - entrada gratuita." },
    ],
  }),
  component: Visite,
});

function Visite() {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader menu="museu" />

      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            - Planeje sua visita
          </p>
          <h1 className="mt-6 max-w-4xl font-display text-5xl leading-[1.05] md:text-7xl">
            No <em className="italic">coracao</em> de Siqueira Campos.
          </h1>
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-7xl gap-16 px-6 py-24 md:grid-cols-2 md:px-10 md:py-32">
          <div className="border-t border-foreground pt-6">
            <p className="text-xs uppercase tracking-[0.3em] text-accent">Horarios</p>
            <dl className="mt-8 space-y-4 font-display text-2xl">
              <div className="flex justify-between border-b border-border pb-3">
                <dt>Terca - Sexta</dt>
                <dd>09h - 17h</dd>
              </div>
              <div className="flex justify-between border-b border-border pb-3">
                <dt>Sabado</dt>
                <dd>09h - 13h</dd>
              </div>
              <div className="flex justify-between border-b border-border pb-3 text-muted-foreground">
                <dt>Domingo e Segunda</dt>
                <dd>Fechado</dd>
              </div>
            </dl>
            <p className="mt-8 text-sm uppercase tracking-[0.25em] text-muted-foreground">
              Entrada gratuita
            </p>
          </div>

          <div className="border-t border-foreground pt-6">
            <p className="text-xs uppercase tracking-[0.3em] text-accent">Endereco & Contato</p>
            <p className="mt-8 font-display text-3xl leading-tight">
              {cultureContact.addressLine1}
              <br />
              {cultureContact.addressLine2}
            </p>
            <div className="mt-10 space-y-2 text-sm">
              <p>
                <span className="uppercase tracking-[0.2em] text-muted-foreground">
                  Telefone -{" "}
                </span>
                {formatPhones()}
              </p>
              <div>
                <span className="uppercase tracking-[0.2em] text-muted-foreground">
                  Ramais -{" "}
                </span>
                <div className="mt-2 space-y-1">
                  {cultureContact.extensions.map((extension) => (
                    <p key={extension.number}>
                      {extension.number} - {extension.label}
                    </p>
                  ))}
                </div>
              </div>
              <p>
                <span className="uppercase tracking-[0.2em] text-muted-foreground">E-mail - </span>
                {cultureContact.email}
              </p>
            </div>
            <p className="mt-10 text-sm leading-relaxed text-muted-foreground">
              Para visitas escolares e grupos acima de 10 pessoas, recomendamos agendamento previo
              para que possamos oferecer mediacao dedicada.
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
