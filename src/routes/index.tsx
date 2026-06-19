import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  Landmark,
  LibraryBig,
  Music2,
  PenLine,
  Theater,
} from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";

import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import culturaLogoStacked from "@/assets/cultura-logo-stacked.png";
import {
  expandEventOccurrences,
  formatEventRecurrence,
  formatEventSchedule,
  formatEventVenue,
  type CulturalEvent,
} from "@/lib/events";
import { getPublicEvents } from "@/lib/api/publicEvents.functions";
import { museumHomeHighlights } from "@/lib/museumCatalog";
import { readPublicEventsFromBrowser } from "@/lib/publicEvents.browser";
import { richTextToPlainText } from "@/lib/richText";
import { getEventSlug, seoHead, socialImages } from "@/lib/seo";

const areas = [
  {
    title: "Museu",
    description: "Memoria historica, acervo permanente, exposicoes e visitas guiadas.",
    to: "/museu",
    icon: Landmark,
    color: "#414296",
  },
  {
    title: "Biblioteca",
    description: "Leitura, pesquisa, emprestimos, acoes literarias e formacao de leitores.",
    to: "/biblioteca",
    icon: LibraryBig,
    color: "#00A859",
  },
  {
    title: "Casa da Cultura",
    description: "Cursos, oficinas, apresentacoes e encontros para artistas e comunidade.",
    to: "/casa-da-cultura",
    icon: Theater,
    color: "#F7A600",
  },
  {
    title: "Inscricoes",
    description: "Editais, oficinas, chamamentos e formularios abertos ao publico.",
    to: "/inscricoes",
    icon: PenLine,
    color: "#EF1B2D",
  },
  {
    title: "Eventos",
    description: "Agenda cultural do municipio, festivais, mostras e atividades publicas.",
    to: "/eventos",
    icon: CalendarDays,
    color: "#0B86D8",
  },
] as const;

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function uniqueEvents(events: CulturalEvent[]) {
  const seen = new Set<string>();
  return events.filter((event) => {
    if (seen.has(event.id)) return false;
    seen.add(event.id);
    return true;
  });
}

export const Route = createFileRoute("/")({
  loader: () => getPublicEvents(),
  head: () =>
    seoHead({
      title: "Secretaria Municipal de Cultura de Siqueira Campos",
      description:
        "Museu, biblioteca, Casa da Cultura, eventos, inscrições e serviços culturais reunidos em um só portal.",
      path: "/",
      image: socialImages.home,
    }),
  component: Index,
});

function Index() {
  const serverEvents = Route.useLoaderData();
  const [events, setEvents] = useState(serverEvents);
  const [eventsError, setEventsError] = useState("");
  const [eventsLoading, setEventsLoading] = useState(serverEvents.length === 0);

  useEffect(() => {
    if (serverEvents.length > 0) return;
    readPublicEventsFromBrowser()
      .then(setEvents)
      .catch((error) => {
        console.error(error);
        setEventsError("Não foi possível carregar os eventos em destaque.");
      })
      .finally(() => setEventsLoading(false));
  }, [serverEvents]);

  const featuredEvents = useMemo(() => {
    const today = getTodayDate();
    const weekLimit = addDays(new Date(), 7).toISOString().slice(0, 10);
    const rangeEnd = addDays(new Date(), 180).toISOString().slice(0, 10);
    const currentMonth = today.slice(0, 7);
    const futureEvents = expandEventOccurrences(events, today, rangeEnd).sort((a, b) =>
      a.date.localeCompare(b.date),
    );
    const weekEvents = futureEvents.filter((event) => event.date <= weekLimit);
    const monthEvents = futureEvents.filter((event) => event.date.startsWith(currentMonth));

    return uniqueEvents([...weekEvents, ...monthEvents, ...futureEvents]).slice(0, 6);
  }, [events]);

  return (
    <div className="min-h-screen bg-white text-[#24223A]">
      <section className="relative min-h-[88vh] overflow-hidden bg-white">
        <SiteHeader />
        <div className="absolute inset-x-0 bottom-0 grid h-3 grid-cols-5">
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
              Siqueira Campos - Parana
            </p>
            <h1 className="max-w-4xl font-sans text-5xl font-black leading-[0.96] tracking-normal text-[#414296] md:text-7xl lg:text-[5.4rem]">
              Secretaria Municipal de Cultura
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-[#4B4A5F] md:text-xl">
              Um portal para reunir espacos culturais, acoes formativas, eventos, inscricoes e
              servicos publicos de cultura do municipio.
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
                Inscricoes abertas
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
            A Secretaria
          </p>
          <div className="md:col-span-9">
            <h2 className="max-w-4xl font-sans text-4xl font-black leading-tight tracking-normal text-[#414296] md:text-5xl">
              Cultura como servico publico, memoria coletiva e espaco de participacao.
            </h2>
            <p className="mt-8 max-w-3xl text-lg leading-relaxed text-[#4B4A5F]">
              A Secretaria Municipal de Cultura conecta equipamentos publicos, acoes educativas,
              preservacao do patrimonio, incentivo a leitura e programacao artistica para fortalecer
              a vida cultural de Siqueira Campos.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
          <div className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#00A859]">Areas</p>
            <h2 className="mt-4 font-sans text-4xl font-black tracking-normal text-[#414296] md:text-5xl">
              Acesse os espacos culturais
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

      <section className="border-y border-[#E7E7EF] bg-[#F8F8FB]">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-12 md:px-10 md:py-28">
          <div className="md:col-span-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#EF1B2D]">
              Museu Histórico Municipal
            </p>
            <h2 className="mt-4 max-w-xl font-sans text-4xl font-black leading-tight tracking-normal text-[#414296] md:text-5xl">
              A memória de Siqueira Campos preservada em ambientes, objetos e histórias.
            </h2>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-[#4B4A5F]">
              Entre salas, vitrines e objetos preservados, o Museu Histórico Municipal aproxima
              moradores e visitantes da memória de Siqueira Campos.
            </p>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[#5F5D70]">
              Um espaço dedicado à preservação da memória local, reunindo objetos, fotografias,
              documentos, ambientes reconstituídos e registros da vida cultural, social e política
              do município.
            </p>
            <Link
              to="/museu"
              className="mt-9 inline-flex items-center justify-center gap-3 bg-[#414296] px-7 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#00A859]"
            >
              Conhecer o Museu
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:col-span-7">
            {museumHomeHighlights.map((item, index) => (
              <Link
                key={item.image}
                to="/museu"
                className={`group block overflow-hidden border-2 border-white bg-white shadow-[0_18px_48px_rgba(65,66,150,0.1)] transition hover:-translate-y-1 hover:border-[#F7A600] ${
                  index === 0 ? "sm:row-span-2" : ""
                }`}
              >
                <img
                  src={item.image}
                  alt={item.alt}
                  loading="lazy"
                  className={`w-full object-cover transition duration-700 group-hover:scale-[1.03] ${
                    index === 0 ? "h-full min-h-[24rem]" : "aspect-[4/3]"
                  }`}
                />
                <div className="border-t border-[#E7E7EF] px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#414296]">
                    {item.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#414296] text-white">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-24">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#F7A600]">
                Destaques
              </p>
              <h2 className="mt-4 font-sans text-4xl font-black tracking-normal md:text-5xl">
                Eventos da semana
              </h2>
            </div>
            <Link
              to="/eventos"
              className="inline-flex w-fit items-center justify-center border-2 border-white/70 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:border-[#F7A600] hover:text-[#F7A600]"
            >
              Ver agenda
            </Link>
          </div>

          {eventsLoading ? (
            <p className="border-2 border-white/25 p-6 text-sm text-white/75">
              Carregando eventos em destaque...
            </p>
          ) : eventsError ? (
            <p className="border-2 border-[#EF1B2D] p-6 text-sm font-semibold text-white">
              {eventsError}
            </p>
          ) : featuredEvents.length === 0 ? (
            <p className="border-2 border-white/25 p-6 text-sm text-white/75">
              Nenhum evento futuro cadastrado no momento.
            </p>
          ) : (
            <Carousel opts={{ align: "start" }} className="px-0 md:px-12">
              <CarouselContent>
                {featuredEvents.map((event) => (
                  <CarouselItem
                    key={event.occurrenceId ?? event.id}
                    className="md:basis-1/2 lg:basis-1/3"
                  >
                    <a
                      href={`/eventos/${getEventSlug(event)}`}
                      className="group block min-h-[28rem] overflow-hidden border-2 border-white/20 bg-white text-[#24223A] transition hover:-translate-y-1 hover:border-[#F7A600]"
                    >
                      {event.flyerUrl ? (
                        <img
                          src={event.flyerUrl}
                          alt={`Flyer do evento ${event.name}`}
                          className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex aspect-[4/3] items-center justify-center bg-[#F8FBFF] p-6 text-center">
                          <CalendarDays className="h-12 w-12 text-[#0B86D8]" />
                        </div>
                      )}
                      <div className="p-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0B86D8]">
                          {event.date}
                        </p>
                        <h3 className="mt-3 font-sans text-2xl font-black leading-tight text-[#24223A]">
                          {event.name}
                        </h3>
                        <p className="mt-4 text-sm font-semibold text-[#5F5D70]">
                          {formatEventSchedule(event)}
                        </p>
                        {formatEventRecurrence(event) && (
                          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#00A859]">
                            {formatEventRecurrence(event)}
                          </p>
                        )}
                        <p className="mt-2 text-sm text-[#5F5D70]">{formatEventVenue(event)}</p>
                        <p className="mt-2 text-sm text-[#5F5D70]">{event.secretary}</p>
                        {event.description && (
                          <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-[#5F5D70]">
                            {richTextToPlainText(event.description)}
                          </p>
                        )}
                      </div>
                    </a>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden border-white/40 bg-white text-[#414296] hover:bg-[#F7A600] md:inline-flex" />
              <CarouselNext className="hidden border-white/40 bg-white text-[#414296] hover:bg-[#F7A600] md:inline-flex" />
            </Carousel>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
