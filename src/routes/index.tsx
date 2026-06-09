import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Landmark, LibraryBig, Music2, PenLine, Theater } from "lucide-react";
import type { CSSProperties } from "react";

import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import culturaLogo from "@/assets/cultura-logo-horizontal.png";
import culturaLogoStacked from "@/assets/cultura-logo-stacked.png";

const areas = [
  {
    title: "Museu",
    description: "Memória histórica, acervo permanente, exposições e visitas guiadas.",
    to: "/museu",
    icon: Landmark,
    color: "#414296",
  },
  {
    title: "Biblioteca",
    description: "Leitura, pesquisa, empréstimos, ações literárias e formação de leitores.",
    to: "/biblioteca",
    icon: LibraryBig,
    color: "#00A859",
  },
  {
    title: "Casa da Cultura",
    description: "Cursos, oficinas, apresentações e encontros para artistas e comunidade.",
    to: "/casa-da-cultura",
    icon: Theater,
    color: "#F7A600",
  },
  {
    title: "Inscrições",
    description: "Editais, oficinas, chamamentos e formulários abertos ao público.",
    to: "/inscricoes",
    icon: PenLine,
    color: "#EF1B2D",
  },
  {
    title: "Eventos",
    description: "Agenda cultural do município, festivais, mostras e atividades públicas.",
    to: "/eventos",
    icon: CalendarDays,
    color: "#0B86D8",
  },
] as const;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Secretaria Municipal de Cultura de Siqueira Campos" },
      {
        name: "description",
        content:
          "Portal da Secretaria Municipal de Cultura de Siqueira Campos: museu, biblioteca, casa da cultura, inscrições e eventos.",
      },
      { property: "og:title", content: "Secretaria Municipal de Cultura de Siqueira Campos" },
      {
        property: "og:description",
        content: "Cultura, memória, leitura e criação no Norte Pioneiro do Paraná.",
      },
      { property: "og:image", content: culturaLogo },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-white text-[#24223A]">
      <section className="relative min-h-[88vh] overflow-hidden bg-white">
        <SiteHeader />
        <div className="absolute inset-x-0 bottom-0 h-3 grid grid-cols-5">
          <div className="bg-[#414296]" />
          <div className="bg-[#00A859]" />
          <div className="bg-[#F7A600]" />
          <div className="bg-[#EF1B2D]" />
          <div className="bg-[#0B86D8]" />
        </div>
        <div className="mx-auto grid min-h-[88vh] max-w-7xl items-center gap-12 px-6 pb-20 pt-32 md:grid-cols-12 md:px-10 md:pt-36">
          <div className="md:col-span-7">
            <p className="mb-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.32em] text-[#00A859]">
              <Music2 className="h-4 w-4" />
              Siqueira Campos · Paraná
            </p>
            <h1 className="max-w-4xl font-sans text-5xl font-black leading-[0.96] tracking-normal text-[#414296] md:text-7xl lg:text-[5.4rem]">
              Secretaria Municipal de Cultura
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-[#4B4A5F] md:text-xl">
              Um portal para reunir espaços culturais, ações formativas, eventos, inscrições e
              serviços públicos de cultura do município.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/eventos"
                className="inline-flex items-center justify-center bg-[#414296] px-7 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-[#00A859]"
              >
                Ver eventos
              </Link>
              <Link
                to="/inscricoes"
                className="inline-flex items-center justify-center border-2 border-[#414296] px-7 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#414296] transition hover:border-[#00A859] hover:text-[#00A859]"
              >
                Inscrições abertas
              </Link>
            </div>
          </div>
          <div className="md:col-span-5">
            <img
              src={culturaLogoStacked}
              alt="Marca da Secretaria Municipal de Cultura"
              className="mx-auto w-full max-w-[30rem] object-contain"
              width={1800}
              height={1500}
            />
          </div>
        </div>
      </section>

      <section className="border-b border-[#E7E7EF] bg-[#F8F8FB]">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-12 md:px-10 md:py-28">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#EF1B2D] md:col-span-3">
            — A Secretaria
          </p>
          <div className="md:col-span-9">
            <h2 className="max-w-4xl font-sans text-4xl font-black leading-tight tracking-normal text-[#414296] md:text-5xl">
              Cultura como serviço público, memória coletiva e espaço de participação.
            </h2>
            <p className="mt-8 max-w-3xl text-lg leading-relaxed text-[#4B4A5F]">
              A Secretaria Municipal de Cultura conecta equipamentos públicos, ações educativas,
              preservação do patrimônio, incentivo à leitura e programação artística para fortalecer
              a vida cultural de Siqueira Campos.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
          <div className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#00A859]">
              — Áreas
            </p>
            <h2 className="mt-4 font-sans text-4xl font-black tracking-normal text-[#414296] md:text-5xl">
              Acesse os espaços culturais
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {areas.map((area) => {
              const Icon = area.icon;
              return (
                <Link
                  key={area.to}
                  to={area.to}
                  className="group min-h-[18rem] border-2 border-[#E7E7EF] bg-white p-6 transition hover:-translate-y-1 hover:border-[var(--area-color)] hover:shadow-[0_18px_40px_rgba(65,66,150,0.14)]"
                  style={{ "--area-color": area.color } as CSSProperties}
                >
                  <Icon className="h-7 w-7 text-[var(--area-color)]" />
                  <h3 className="mt-12 font-sans text-3xl font-black leading-tight tracking-normal text-[#24223A]">
                    {area.title}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-[#5F5D70]">{area.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#414296] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-3 md:px-10 md:py-24">
          {[
            {
              n: "01",
              t: "Patrimônio e memória",
              d: "Preservação do museu, acervos, registros e narrativas da cidade.",
              color: "#F7A600",
            },
            {
              n: "02",
              t: "Formação cultural",
              d: "Oficinas, leitura, ações educativas e atividades para diferentes públicos.",
              color: "#00A859",
            },
            {
              n: "03",
              t: "Agenda pública",
              d: "Eventos, chamadas, inscrições e oportunidades culturais em um só lugar.",
              color: "#EF1B2D",
            },
          ].map((item) => (
            <div key={item.n} className="border-t border-white/30 pt-6">
              <p className="text-3xl font-black" style={{ color: item.color }}>
                {item.n}
              </p>
              <h3 className="mt-6 font-sans text-2xl font-black tracking-normal">{item.t}</h3>
              <p className="mt-3 text-white/75">{item.d}</p>
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
