import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, MapPin, Music2 } from "lucide-react";

import { SecretariaPage } from "@/components/SecretariaPage";

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
    />
  );
}
