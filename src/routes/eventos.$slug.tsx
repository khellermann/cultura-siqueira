import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Clock, ExternalLink, MapPin } from "lucide-react";
import { useEffect, useState } from "react";

import { PageHeader, SiteFooter } from "@/components/SiteHeader";
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
  getEventIdFromSlug,
  getEventSlug,
  seoHead,
} from "@/lib/seo";

export const Route = createFileRoute("/eventos/$slug")({
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
      image: event.flyerUrl || undefined,
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
      <div className="min-h-screen bg-[#F8F8FB] text-[#24223A]">
        <PageHeader />
        <main className="mx-auto max-w-6xl px-6 py-24 md:px-10">
          <p className="border border-[#DDDDE8] bg-white p-8">Carregando evento...</p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#F8F8FB] text-[#24223A]">
        <PageHeader />
        <main className="mx-auto max-w-6xl px-6 py-24 md:px-10">
          <h1 className="text-4xl font-black text-[#414296]">Evento não encontrado</h1>
          <p className="mt-5 text-[#5F5D70]">{error}</p>
          <Link
            to="/eventos"
            className="mt-8 inline-block bg-[#414296] px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-white"
          >
            Voltar para a agenda
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const recurrence = formatEventRecurrence(event);

  return (
    <div className="min-h-screen bg-[#F8F8FB] text-[#24223A]">
      <PageHeader />
      <main>
        <article className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-12 md:px-10 md:py-24">
          <div className="md:col-span-7">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#0B86D8]">
              Agenda cultural
            </p>
            <h1 className="mt-5 text-4xl font-black leading-tight text-[#414296] md:text-6xl">
              {event.name}
            </h1>
            <div className="mt-8 grid gap-4 border-y border-[#DDDDE8] py-6 text-sm md:grid-cols-3">
              <p className="flex gap-2">
                <CalendarDays className="h-5 w-5" /> {formatEventDate(event)}
              </p>
              <p className="flex gap-2">
                <Clock className="h-5 w-5" /> {formatEventSchedule(event)}
              </p>
              <p className="flex gap-2">
                <MapPin className="h-5 w-5" /> {formatEventVenue(event)}
              </p>
            </div>
            {recurrence && <p className="mt-4 text-sm text-[#5F5D70]">{recurrence}</p>}
            {event.description && (
              <div
                className="prose mt-10 max-w-none text-base leading-relaxed"
                dangerouslySetInnerHTML={{ __html: sanitizeRichText(event.description) }}
              />
            )}
            <div className="mt-10 flex flex-wrap gap-4">
              {event.registrationUrl && (
                <a
                  href={event.registrationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-[#414296] px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-white"
                >
                  Fazer inscrição <ExternalLink className="h-4 w-4" />
                </a>
              )}
              <Link
                to="/eventos"
                className="border border-[#414296]/25 px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em]"
              >
                Ver agenda completa
              </Link>
            </div>
          </div>
          <div className="md:col-span-5">
            {event.flyerUrl ? (
              <img
                src={event.flyerUrl}
                alt={`Cartaz do evento ${event.name}`}
                width={900}
                height={1200}
                fetchPriority="high"
                className="w-full border border-[#DDDDE8] object-cover"
              />
            ) : (
              <div className="flex aspect-[3/4] items-center justify-center bg-[#414296] p-10 text-center text-3xl font-black text-white">
                {event.name}
              </div>
            )}
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
