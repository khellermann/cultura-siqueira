import { createFileRoute } from "@tanstack/react-router";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  ExternalLink,
  MapPin,
  Music2,
  X,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { SecretariaPage } from "@/components/SecretariaPage";
import { SecretariaHeader, SiteFooter } from "@/components/SiteHeader";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { firebaseDb, isFirebaseConfigured } from "@/lib/firebase";
import {
  eventsCollection,
  expandEventOccurrences,
  formatEventRecurrence,
  formatEventSchedule,
  formatEventVenue,
  type CulturalEvent,
} from "@/lib/events";
import { richTextToPlainText, sanitizeRichText } from "@/lib/richText";

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

export const Route = createFileRoute("/eventos")({
  head: () => ({
    meta: [
      { title: "Eventos - Secretaria Municipal de Cultura" },
      {
        name: "description",
        content:
          "Agenda cultural de Siqueira Campos: eventos, apresentacoes, mostras, oficinas e acoes publicas.",
      },
    ],
  }),
  component: Eventos,
});

function Eventos() {
  const [events, setEvents] = useState<CulturalEvent[]>([]);
  const [error, setError] = useState("");
  const [lightboxImage, setLightboxImage] = useState<{ alt: string; src: string } | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [selectedEventId, setSelectedEventId] = useState("");

  useEffect(() => {
    setSelectedEventId(new URLSearchParams(window.location.search).get("evento") ?? "");

    async function loadEvents() {
      if (!firebaseDb) {
        setLoading(false);
        return;
      }

      const snapshot = await getDocs(query(collection(firebaseDb, eventsCollection), orderBy("date", "asc")));
      setEvents(
        snapshot.docs.map((eventDoc) => ({
          id: eventDoc.id,
          ...(eventDoc.data() as Omit<CulturalEvent, "id">),
        })),
      );
      setLoading(false);
    }

    loadEvents().catch((error) => {
      console.error(error);
      setError("Nao foi possivel carregar os eventos. Confira as regras de leitura do Firestore.");
      setLoading(false);
    });
  }, []);

  const visibleEvents = useMemo(() => {
    const today = getTodayDate();
    const rangeEnd = addDays(new Date(), 180).toISOString().slice(0, 10);

    return expandEventOccurrences(events, today, rangeEnd)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [events]);
  const featuredEvents = useMemo(() => {
    const today = getTodayDate();
    const weekLimit = addDays(new Date(), 7).toISOString().slice(0, 10);
    const currentMonth = today.slice(0, 7);
    const weekEvents = visibleEvents.filter((event) => event.date <= weekLimit);
    const monthEvents = visibleEvents.filter((event) => event.date.startsWith(currentMonth));

    return uniqueEvents([...weekEvents, ...monthEvents, ...visibleEvents]).slice(0, 6);
  }, [visibleEvents]);
  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId),
    [events, selectedEventId],
  );
  const calendarDays = useMemo(() => {
    const grouped = visibleEvents.reduce<Record<string, CulturalEvent[]>>((current, event) => {
      const date = event.date || "Sem data";
      current[date] = [...(current[date] ?? []), event];
      return current;
    }, {});

    return Object.entries(grouped).sort(([dateA], [dateB]) => dateA.localeCompare(dateB));
  }, [visibleEvents]);
  const detailUpcomingEvents = useMemo(() => {
    return visibleEvents
      .filter((event) => event.id !== selectedEventId)
      .slice(0, 3);
  }, [selectedEventId, visibleEvents]);

  if (selectedEventId) {
    return (
      <EventDetailPage
        error={error}
        event={selectedEvent}
        loading={loading}
        upcomingEvents={detailUpcomingEvents}
      />
    );
  }

  return (
    <SecretariaPage
      accentColor="#0B86D8"
      eyebrow="Eventos"
      icon={CalendarDays}
      title="A agenda cultural do municipio em um so lugar."
      description="Programacao de apresentacoes, mostras, oficinas, acoes educativas e eventos promovidos ou apoiados pela Secretaria."
      heroContent={
        <EventHighlightsCarousel
          events={featuredEvents}
          loading={loading}
          error={error}
          full
        />
      }
      cards={[
        {
          icon: CalendarDays,
          title: "Calendario",
          text: "Datas, horarios e atividades confirmadas.",
          color: "#0B86D8",
        },
        {
          icon: MapPin,
          title: "Locais",
          text: "Eventos nos espacos culturais e em areas publicas.",
          color: "#F7A600",
        },
        {
          icon: Music2,
          title: "Programacao",
          text: "Mostras, apresentacoes, encontros e festivais.",
          color: "#EF1B2D",
        },
      ]}
    >
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
          <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#0B86D8]">
                Agenda
              </p>
              <h2 className="mt-4 font-sans text-4xl font-black tracking-normal text-[#414296] md:text-5xl">
                Proximos eventos
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-[#5F5D70]">
              Eventos cadastrados pela area administrativa da Secretaria.
            </p>
          </div>

          {loading ? (
            <p className="border-2 border-[#E7E7EF] p-6 text-[#5F5D70]">Carregando agenda...</p>
          ) : error ? (
            <p className="border-2 border-[#EF1B2D] p-6 font-semibold text-[#EF1B2D]">{error}</p>
          ) : visibleEvents.length === 0 ? (
            <p className="border-2 border-[#E7E7EF] p-6 text-[#5F5D70]">
              Nenhum evento cadastrado no momento.
            </p>
          ) : (
            <div className="grid gap-10">
              <section className="border-2 border-[#E7E7EF] p-6 md:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <CalendarDays className="h-6 w-6 text-[#0B86D8]" />
                  <h3 className="font-sans text-3xl font-black text-[#414296]">
                    Calendario de eventos
                  </h3>
                </div>
                <div className="grid gap-4">
                  {calendarDays.map(([date, dayEvents]) => (
                    <article key={date} className="grid gap-3 border-2 border-[#E7E7EF] p-5 md:grid-cols-[10rem_1fr]">
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0B86D8]">
                        {date}
                      </p>
                      <div className="grid gap-3">
                        {dayEvents.map((event) => (
                          <a
                            key={event.occurrenceId ?? event.id}
                            href={`/eventos?evento=${event.id}`}
                            className="flex flex-col gap-1 border-l-4 border-[#00A859] pl-4 text-sm transition hover:text-[#414296]"
                          >
                            <span className="font-semibold text-[#24223A]">{event.name}</span>
                            <span className="text-[#5F5D70]">{formatEventSchedule(event)}</span>
                          </a>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {visibleEvents.map((event) => (
                  <article
                    key={event.occurrenceId ?? event.id}
                    className="overflow-hidden border-2 border-[#E7E7EF] bg-white transition duration-300 hover:-translate-y-1 hover:border-[#0B86D8] hover:shadow-[0_18px_40px_rgba(65,66,150,0.14)]"
                  >
                    {event.flyerUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          setLightboxImage({
                            alt: `Flyer do evento ${event.name}`,
                            src: event.flyerUrl ?? "",
                          })
                        }
                        className="block w-full cursor-zoom-in overflow-hidden text-left"
                        aria-label={`Ampliar flyer do evento ${event.name}`}
                      >
                        <img
                          src={event.flyerUrl}
                          alt={`Flyer do evento ${event.name}`}
                          className="aspect-[4/3] w-full object-cover transition duration-500 hover:scale-105"
                          loading="lazy"
                        />
                      </button>
                    )}
                    <div className="p-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0B86D8]">
                        {event.date}
                      </p>
                      <h3 className="mt-3 font-sans text-2xl font-black leading-tight text-[#24223A]">
                        {event.name}
                      </h3>
                      <p className="mt-4 text-sm leading-relaxed text-[#5F5D70]">
                        {formatEventSchedule(event)}
                      </p>
                      {formatEventRecurrence(event) && (
                        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#00A859]">
                          {formatEventRecurrence(event)}
                        </p>
                      )}
                      <p className="mt-2 text-sm leading-relaxed text-[#5F5D70]">
                        {formatEventVenue(event)}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-[#5F5D70]">{event.secretary}</p>
                      {event.description && (
                        <EventDescriptionSummary
                          className="mt-3 line-clamp-3 text-sm leading-relaxed text-[#5F5D70]"
                          description={event.description}
                        />
                      )}
                      <a
                        href={`/eventos?evento=${event.id}`}
                        className="mt-5 inline-flex border-2 border-[#414296] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#414296] transition hover:bg-[#414296] hover:text-white"
                      >
                        Ver evento
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
      {lightboxImage && (
        <ImageLightbox
          alt={lightboxImage.alt}
          src={lightboxImage.src}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </SecretariaPage>
  );
}

function EventHighlightsCarousel({
  error,
  events,
  full = false,
  loading,
}: {
  error: string;
  events: CulturalEvent[];
  full?: boolean;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="border-2 border-[#0B86D8] bg-white p-6 shadow-[0_24px_70px_rgba(65,66,150,0.12)] md:col-span-12">
        <p className="text-sm font-semibold text-[#5F5D70]">Carregando destaques...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-2 border-[#EF1B2D] bg-white p-6 shadow-[0_24px_70px_rgba(65,66,150,0.12)] md:col-span-12">
        <p className="text-sm font-semibold text-[#EF1B2D]">{error}</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="border-2 border-[#E7E7EF] bg-white p-6 shadow-[0_24px_70px_rgba(65,66,150,0.12)] md:col-span-12">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0B86D8]">
          Destaques
        </p>
        <p className="mt-4 text-sm leading-relaxed text-[#5F5D70]">
          Nenhum evento futuro cadastrado no momento.
        </p>
      </div>
    );
  }

  return (
    <div
      className={[
        "bg-[#414296] text-white shadow-[0_24px_70px_rgba(65,66,150,0.18)]",
        full ? "md:col-span-12 p-5 md:p-8" : "p-4 md:p-5",
      ].join(" ")}
    >
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#F7A600]">
            Destaques
          </p>
          <h2 className={["mt-2 font-sans font-black text-white", full ? "text-4xl md:text-6xl" : "text-2xl"].join(" ")}>
            Eventos da semana
          </h2>
        </div>
        {full && (
          <p className="max-w-md text-sm leading-relaxed text-white/75">
            Os proximos eventos aparecem aqui, com prioridade para a semana e complemento com a agenda do mes.
          </p>
        )}
      </div>

      <Carousel opts={{ align: "start", loop: events.length > 1 }} className="px-0">
        <CarouselContent>
          {events.map((event) => (
            <CarouselItem key={event.occurrenceId ?? event.id} className={full ? "md:basis-1/2 lg:basis-1/3" : ""}>
              <a
                href={`/eventos?evento=${event.id}`}
                className={[
                  "group block overflow-hidden bg-white text-[#24223A] transition hover:-translate-y-1",
                  full ? "min-h-[29rem]" : "",
                ].join(" ")}
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
                <div className={full ? "p-6" : "p-5"}>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0B86D8]">
                    {event.date}
                  </p>
                  <h3 className="mt-3 font-sans text-2xl font-black leading-tight text-[#24223A]">
                    {event.name}
                  </h3>
                  <p className="mt-3 text-sm font-semibold text-[#5F5D70]">
                    {formatEventSchedule(event)}
                  </p>
                  {formatEventRecurrence(event) && (
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#00A859]">
                      {formatEventRecurrence(event)}
                    </p>
                  )}
                  <p className="mt-2 text-sm text-[#5F5D70]">{formatEventVenue(event)}</p>
                  {event.description && (
                    <EventDescriptionSummary
                      className="mt-3 line-clamp-2 text-sm leading-relaxed text-[#5F5D70]"
                      description={event.description}
                    />
                  )}
                </div>
              </a>
            </CarouselItem>
          ))}
        </CarouselContent>
        {events.length > 1 && (
          <>
            <CarouselPrevious className="left-2 hidden border-white/40 bg-white text-[#414296] hover:bg-[#F7A600] md:inline-flex" />
            <CarouselNext className="right-2 hidden border-white/40 bg-white text-[#414296] hover:bg-[#F7A600] md:inline-flex" />
          </>
        )}
      </Carousel>
    </div>
  );
}

function EventDetailPage({
  error,
  event,
  loading,
  upcomingEvents,
}: {
  error: string;
  event?: CulturalEvent;
  loading: boolean;
  upcomingEvents: CulturalEvent[];
}) {
  const [lightboxImage, setLightboxImage] = useState<{ alt: string; src: string } | null>(null);

  return (
    <div className="min-h-screen bg-white text-[#24223A]">
      <SecretariaHeader />
      <main className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-16">
        {loading ? (
          <EventStatus text="Carregando evento..." />
        ) : error ? (
          <EventStatus tone="error" text={error} />
        ) : !event ? (
          <EventStatus text="Evento nao encontrado. Ele pode ter sido removido ou o link pode estar incorreto." />
        ) : (
          <div className="grid gap-14">
            <section className="transition-all duration-700 ease-out">
              <a
                href="/eventos"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#414296] transition hover:text-[#00A859]"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar para eventos
              </a>

              <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:items-start">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#0B86D8]">
                    Evento
                  </p>
                  <h1 className="mt-4 font-sans text-4xl font-black leading-tight tracking-normal text-[#414296] md:text-6xl">
                    {event.name}
                  </h1>

                  <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold text-[#5F5D70]">
                    <span className="inline-flex items-center gap-2 border-2 border-[#E7E7EF] px-4 py-3">
                      <CalendarDays className="h-4 w-4 text-[#0B86D8]" />
                      {event.date}
                    </span>
                    <span className="inline-flex items-center gap-2 border-2 border-[#E7E7EF] px-4 py-3">
                      <Clock className="h-4 w-4 text-[#00A859]" />
                      {formatEventSchedule(event)}
                    </span>
                    <span className="inline-flex items-center gap-2 border-2 border-[#E7E7EF] px-4 py-3">
                      <MapPin className="h-4 w-4 text-[#F7A600]" />
                      {formatEventVenue(event)}
                    </span>
                  </div>
                  {formatEventRecurrence(event) && (
                    <p className="mt-4 text-sm font-semibold text-[#00A859]">
                      {formatEventRecurrence(event)}
                    </p>
                  )}

                  <div className="mt-10 grid gap-6">
                    <section>
                      <h2 className="font-sans text-3xl font-black text-[#24223A]">Sobre</h2>
                      {event.description ? (
                        <EventDescription description={event.description} />
                      ) : (
                        <p className="mt-4 text-base leading-8 text-[#5F5D70]">
                          Mais informacoes sobre este evento serao divulgadas em breve.
                        </p>
                      )}
                    </section>

                    <section className="border-l-4 border-[#F7A600] pl-5">
                      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#414296]">
                        <UserRound className="h-4 w-4" />
                        Idealizador
                      </p>
                      <p className="mt-2 text-lg font-semibold text-[#24223A]">{event.secretary}</p>
                    </section>

                    {event.registrationEnabled && event.registrationUrl && (
                      <a
                        href={event.registrationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex w-fit items-center gap-2 bg-[#414296] px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:-translate-y-1 hover:bg-[#00A859]"
                      >
                        Inscrever-se
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="lg:pl-6">
                  {event.flyerUrl ? (
                    <button
                      type="button"
                      onClick={() =>
                        setLightboxImage({
                          alt: `Flyer do evento ${event.name}`,
                          src: event.flyerUrl ?? "",
                        })
                      }
                      className="mx-auto block w-full max-w-xl cursor-zoom-in overflow-hidden text-left shadow-[0_28px_70px_rgba(65,66,150,0.18)] transition duration-700 hover:-translate-y-1"
                      aria-label={`Ampliar flyer do evento ${event.name}`}
                    >
                      <img
                        src={event.flyerUrl}
                        alt={`Flyer do evento ${event.name}`}
                        className="aspect-[4/5] w-full object-cover transition duration-500 hover:scale-105"
                      />
                    </button>
                  ) : (
                    <div className="flex aspect-[4/5] w-full max-w-xl items-center justify-center border-2 border-[#E7E7EF] bg-[#F8FBFF] p-8 text-center">
                      <p className="font-sans text-3xl font-black text-[#414296]">{event.name}</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="border-t border-[#E7E7EF] pt-10">
              <div className="mb-6 flex items-center gap-3">
                <CalendarDays className="h-6 w-6 text-[#0B86D8]" />
                <h2 className="font-sans text-3xl font-black text-[#414296]">Proximos eventos</h2>
              </div>

              {upcomingEvents.length === 0 ? (
                <p className="border-2 border-[#E7E7EF] p-6 text-sm text-[#5F5D70]">
                  Nenhum outro evento cadastrado no momento.
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-3">
                  {upcomingEvents.map((upcomingEvent) => (
                    <a
                      key={upcomingEvent.occurrenceId ?? upcomingEvent.id}
                      href={`/eventos?evento=${upcomingEvent.id}`}
                      className="border-2 border-[#E7E7EF] p-5 transition hover:-translate-y-1 hover:border-[#0B86D8] hover:shadow-[0_18px_40px_rgba(65,66,150,0.12)]"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0B86D8]">
                        {upcomingEvent.date}
                      </p>
                      <h3 className="mt-3 font-sans text-2xl font-black leading-tight text-[#24223A]">
                        {upcomingEvent.name}
                      </h3>
                      <p className="mt-3 text-sm text-[#5F5D70]">
                        {formatEventSchedule(upcomingEvent)}
                      </p>
                    </a>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
      {lightboxImage && (
        <ImageLightbox
          alt={lightboxImage.alt}
          src={lightboxImage.src}
          onClose={() => setLightboxImage(null)}
        />
      )}
      <SiteFooter />
    </div>
  );
}

function EventDescription({ description }: { description: string }) {
  return (
    <div
      className="mt-4 text-base leading-8 text-[#5F5D70] [&_a]:font-semibold [&_a]:text-[#414296] [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-[#F7A600] [&_blockquote]:pl-4 [&_h2]:font-sans [&_h2]:text-3xl [&_h2]:font-black [&_h2]:leading-tight [&_h2]:text-[#414296] [&_h3]:font-sans [&_h3]:text-2xl [&_h3]:font-black [&_h3]:leading-tight [&_h3]:text-[#24223A] [&_h4]:font-sans [&_h4]:text-xl [&_h4]:font-black [&_h4]:text-[#24223A] [&_li]:ml-6 [&_ol]:list-decimal [&_p]:my-3 [&_ul]:list-disc"
      dangerouslySetInnerHTML={{ __html: sanitizeRichText(description) }}
    />
  );
}

function EventDescriptionSummary({
  className,
  description,
}: {
  className: string;
  description: string;
}) {
  return <p className={className}>{richTextToPlainText(description)}</p>;
}

function ImageLightbox({
  alt,
  onClose,
  src,
}: {
  alt: string;
  onClose: () => void;
  src: string;
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm transition-opacity duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Imagem ampliada"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-5 top-5 inline-flex h-11 w-11 items-center justify-center border border-white/30 bg-black/30 text-white transition hover:bg-white hover:text-[#24223A]"
        aria-label="Fechar imagem"
      >
        <X className="h-5 w-5" />
      </button>
      <img
        src={src}
        alt={alt}
        className="max-h-[88vh] max-w-[92vw] object-contain shadow-[0_28px_90px_rgba(0,0,0,0.45)]"
        onClick={(event) => event.stopPropagation()}
      />
    </div>
  );
}

function EventStatus({ text, tone = "default" }: { text: string; tone?: "default" | "error" }) {
  return (
    <section
      className={[
        "border-2 bg-white p-8 text-sm font-semibold",
        tone === "error" ? "border-[#EF1B2D] text-[#EF1B2D]" : "border-[#E7E7EF] text-[#5F5D70]",
      ].join(" ")}
    >
      <p>{text}</p>
      <a
        href="/eventos"
        className="mt-5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#414296] transition hover:text-[#00A859]"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para agenda
      </a>
    </section>
  );
}
