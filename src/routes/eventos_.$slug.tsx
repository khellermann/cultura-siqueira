import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Clock, ExternalLink, MapPin } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { getPublicEvent } from "@/lib/api/publicEvents.functions";
import {
  formatEventDate,
  formatEventRecurrence,
  formatEventSchedule,
  formatEventVenue,
} from "@/lib/events";
import { readPublicEventsFromBrowser } from "@/lib/publicEvents.browser";
import { richTextToPlainText, sanitizeRichText } from "@/lib/richText";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  eventSocialImage,
  getEventIdFromSlug,
  getEventSlug,
  seoHead,
} from "@/lib/seo";

export const Route = createFileRoute("/eventos_/$slug")({
  loader: async ({ params }) => {
    const eventId = getEventIdFromSlug(params.slug);
    const event = await getPublicEvent({ data: { eventId } });
    return { event, eventId, slug: params.slug };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const event = loaderData.event;
    const path = `/eventos/${event ? getEventSlug(event) : loaderData.slug}`;

    if (!event) {
      return seoHead({
        title: "Evento cultural",
        description: "Detalhes de evento da agenda cultural de Siqueira Campos, Paraná.",
        path,
      });
    }

    const description =
      richTextToPlainText(event.description ?? "") ||
      `${event.name}, evento cultural em Siqueira Campos, Paraná.`;
    const startDate = `${event.date}T${event.startTime || "00:00"}:00-03:00`;
    const endDate = event.endTime ? `${event.date}T${event.endTime}:00-03:00` : undefined;

    return seoHead({
      title: event.name,
      description,
      path,
      image: eventSocialImage(event.flyerUrl, event.name),
      type: "article",
      jsonLd: [
        breadcrumbJsonLd([
          { name: "Início", path: "/" },
          { name: "Eventos", path: "/eventos" },
          { name: event.name, path },
        ]),
        {
          "@context": "https://schema.org",
          "@type": "Event",
          name: event.name,
          description,
          startDate,
          ...(endDate ? { endDate } : {}),
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          eventStatus: "https://schema.org/EventScheduled",
          image: event.flyerUrl ? [absoluteUrl(event.flyerUrl)] : undefined,
          location: {
            "@type": "Place",
            name: formatEventVenue(event),
            address: {
              "@type": "PostalAddress",
              addressLocality: "Siqueira Campos",
              addressRegion: "PR",
              addressCountry: "BR",
            },
          },
          organizer: {
            "@type": "GovernmentOrganization",
            name: event.secretary || "Secretaria Municipal de Cultura de Siqueira Campos",
            url: absoluteUrl("/"),
          },
          url: absoluteUrl(path),
          isAccessibleForFree: true,
        },
      ],
    });
  },
  component: EventDetail,
});

function EventDetail() {
  const loaderData = Route.useLoaderData();
  const [event, setEvent] = useState(loaderData.event);
  const [loading, setLoading] = useState(!loaderData.event);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loaderData.event) return;

    readPublicEventsFromBrowser()
      .then((events) => {
        const matchingEvent = events.find((candidate) => candidate.id === loaderData.eventId);
        if (matchingEvent) setEvent(matchingEvent);
        else setError("Evento não encontrado.");
      })
      .catch((loadError) => {
        console.error(loadError);
        setError("Não foi possível carregar este evento.");
      })
      .finally(() => setLoading(false));
  }, [loaderData.event, loaderData.eventId]);

  if (loading) {
    return (
      <EventPageShell>
        <main className="mx-auto flex min-h-[70vh] max-w-7xl items-center px-6 pb-20 pt-36 md:px-10">
          <p className="border-2 border-[#E7E7EF] bg-white p-8 text-[#5F5D70]">
            Carregando evento...
          </p>
        </main>
      </EventPageShell>
    );
  }

  if (!event) {
    return (
      <EventPageShell>
        <main className="mx-auto flex min-h-[70vh] max-w-7xl flex-col justify-center px-6 pb-20 pt-36 md:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#0B86D8]">
            Agenda cultural
          </p>
          <h1 className="mt-5 text-4xl font-black text-[#414296]">Evento não encontrado</h1>
          <p className="mt-5 text-[#5F5D70]">{error}</p>
          <Link
            to="/eventos"
            className="mt-8 inline-block w-fit bg-[#414296] px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#00A859]"
          >
            Voltar para a agenda
          </Link>
        </main>
      </EventPageShell>
    );
  }

  const recurrence = formatEventRecurrence(event);

  return (
    <EventPageShell>
      <main>
        <section className="relative min-h-[76vh] overflow-hidden bg-white">
          <div className="absolute inset-x-0 bottom-0 grid h-3 grid-cols-5">
            <div className="bg-[#414296]" />
            <div className="bg-[#00A859]" />
            <div className="bg-[#F7A600]" />
            <div className="bg-[#EF1B2D]" />
            <div className="bg-[#0B86D8]" />
          </div>

          <article className="mx-auto grid min-h-[76vh] max-w-7xl items-center gap-12 px-6 pb-20 pt-32 md:grid-cols-12 md:px-10 md:pt-36">
            <div className="md:col-span-7">
              <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.32em] text-[#0B86D8]">
                <CalendarDays className="h-4 w-4" />
                Agenda cultural
              </p>
              <h1 className="mt-6 max-w-4xl font-sans text-5xl font-black leading-[0.98] tracking-normal text-[#414296] md:text-7xl">
                {event.name}
              </h1>
              <div className="mt-10 grid gap-5 border-y border-[#E7E7EF] py-7 text-sm md:grid-cols-3">
                <p className="flex items-start gap-3 font-semibold text-[#24223A]">
                  <CalendarDays className="h-5 w-5 shrink-0 text-[#0B86D8]" />
                  {formatEventDate(event)}
                </p>
                <p className="flex items-start gap-3 font-semibold text-[#24223A]">
                  <Clock className="h-5 w-5 shrink-0 text-[#F7A600]" />
                  {formatEventSchedule(event)}
                </p>
                <p className="flex items-start gap-3 font-semibold text-[#24223A]">
                  <MapPin className="h-5 w-5 shrink-0 text-[#00A859]" />
                  {formatEventVenue(event)}
                </p>
              </div>
              {recurrence && <p className="mt-5 text-sm text-[#5F5D70]">{recurrence}</p>}
              {event.description && (
                <div className="mt-10 border-t border-[#E7E7EF] pt-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#0B86D8]">
                    Sobre o evento
                  </p>
                  <div
                    className="prose mt-6 max-w-none text-base leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: sanitizeRichText(event.description) }}
                  />
                </div>
              )}
              <div className="mt-10 flex flex-wrap gap-4">
                {event.registrationUrl && (
                  <a
                    href={event.registrationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-[#414296] px-7 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#00A859]"
                  >
                    Fazer inscrição <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                <Link
                  to="/eventos"
                  className="border-2 border-[#414296] px-7 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#414296] transition hover:border-[#00A859] hover:text-[#00A859]"
                >
                  Ver agenda completa
                </Link>
              </div>
            </div>

            <div className="md:col-span-5">
              <div className="relative mx-auto max-w-[28rem] border-2 border-[#0B86D8] bg-white p-3 shadow-[0_24px_70px_rgba(65,66,150,0.16)]">
                {event.flyerUrl ? (
                  <img
                    src={event.flyerUrl}
                    alt={`Cartaz do evento ${event.name}`}
                    width={900}
                    height={1200}
                    fetchPriority="high"
                    className="max-h-[560px] w-full object-contain"
                  />
                ) : (
                  <div className="flex aspect-[3/4] items-center justify-center bg-[#414296] p-10 text-center text-3xl font-black text-white">
                    {event.name}
                  </div>
                )}
                <div className="absolute -bottom-5 -right-5 flex h-20 w-20 items-center justify-center bg-[#0B86D8] text-white">
                  <CalendarDays className="h-9 w-9" />
                </div>
              </div>
            </div>
          </article>
        </section>
      </main>
    </EventPageShell>
  );
}

function EventPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-[#24223A]">
      <div className="relative">
        <SiteHeader />
        {children}
      </div>
      <SiteFooter />
    </div>
  );
}
