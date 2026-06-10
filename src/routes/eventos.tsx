import { createFileRoute } from "@tanstack/react-router";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { CalendarDays, MapPin, Music2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { SecretariaPage } from "@/components/SecretariaPage";
import { firebaseDb, isFirebaseConfigured } from "@/lib/firebase";
import { eventsCollection, type CulturalEvent } from "@/lib/events";

export const Route = createFileRoute("/eventos")({
  head: () => ({
    meta: [
      { title: "Eventos — Secretaria Municipal de Cultura" },
      {
        name: "description",
        content:
          "Agenda cultural de Siqueira Campos: eventos, apresentações, mostras, oficinas e ações públicas.",
      },
    ],
  }),
  component: Eventos,
});

function Eventos() {
  const [events, setEvents] = useState<CulturalEvent[]>([]);
  const [loading, setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
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
      setLoading(false);
    });
  }, []);

  const upcomingEvents = useMemo(
    () => events.filter((event) => !event.date || event.date >= new Date().toISOString().slice(0, 10)),
    [events],
  );

  return (
    <SecretariaPage
      accentColor="#0B86D8"
      eyebrow="Eventos"
      icon={CalendarDays}
      title="A agenda cultural do município em um só lugar."
      description="Programação de apresentações, mostras, oficinas, ações educativas e eventos promovidos ou apoiados pela Secretaria."
      cards={[
        {
          icon: CalendarDays,
          title: "Calendário",
          text: "Datas, horários e atividades confirmadas.",
          color: "#0B86D8",
        },
        {
          icon: MapPin,
          title: "Locais",
          text: "Eventos nos espaços culturais e em áreas públicas.",
          color: "#F7A600",
        },
        {
          icon: Music2,
          title: "Programação",
          text: "Mostras, apresentações, encontros e festivais.",
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
          ) : upcomingEvents.length === 0 ? (
            <p className="border-2 border-[#E7E7EF] p-6 text-[#5F5D70]">
              Nenhum evento cadastrado no momento.
            </p>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event) => (
                <article
                  key={event.id}
                  className="overflow-hidden border-2 border-[#E7E7EF] bg-white transition hover:-translate-y-1 hover:border-[#0B86D8] hover:shadow-[0_18px_40px_rgba(65,66,150,0.14)]"
                >
                  {event.flyerUrl && (
                    <img
                      src={event.flyerUrl}
                      alt={`Flyer do evento ${event.name}`}
                      className="aspect-[4/3] w-full object-cover"
                      loading="lazy"
                    />
                  )}
                  <div className="p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0B86D8]">
                      {event.date}
                    </p>
                    <h3 className="mt-3 font-sans text-2xl font-black leading-tight text-[#24223A]">
                      {event.name}
                    </h3>
                    <p className="mt-4 text-sm leading-relaxed text-[#5F5D70]">
                      Periodo: {event.periodAmount} {event.periodUnit}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-[#5F5D70]">{event.secretary}</p>
                    {event.equipment.length > 0 && (
                      <p className="mt-2 text-sm leading-relaxed text-[#5F5D70]">
                        Equipamentos: {event.equipment.join(", ")}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </SecretariaPage>
  );
}
