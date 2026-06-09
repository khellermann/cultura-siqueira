import { createFileRoute } from "@tanstack/react-router";
import { Mic2, Palette, Theater } from "lucide-react";

import { SecretariaPage } from "@/components/SecretariaPage";

export const Route = createFileRoute("/casa-da-cultura")({
  head: () => ({
    meta: [
      { title: "Casa da Cultura — Secretaria Municipal de Cultura" },
      {
        name: "description",
        content:
          "Casa da Cultura de Siqueira Campos: oficinas, apresentações, encontros artísticos e ações comunitárias.",
      },
    ],
  }),
  component: CasaDaCultura,
});

function CasaDaCultura() {
  return (
    <SecretariaPage
      accentColor="#F7A600"
      eyebrow="Casa da Cultura"
      icon={Theater}
      title="Um espaço para criar, apresentar e aprender."
      description="A Casa da Cultura reúne oficinas, ensaios, apresentações e encontros que fortalecem a produção artística local."
      cards={[
        {
          icon: Theater,
          title: "Artes cênicas",
          text: "Teatro, dança e apresentações públicas.",
          color: "#F7A600",
        },
        {
          icon: Palette,
          title: "Oficinas",
          text: "Atividades de formação artística e cultural.",
          color: "#EF1B2D",
        },
        {
          icon: Mic2,
          title: "Música",
          text: "Ensaios, mostras e projetos musicais.",
          color: "#0B86D8",
        },
      ]}
    />
  );
}
