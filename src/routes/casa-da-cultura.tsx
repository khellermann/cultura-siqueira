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
    links: [{ rel: "canonical", href: "https://cultura.siqueiracampos.pr.gov.br/casa-da-cultura" }],
  }),
  component: CasaDaCultura,
});

function CasaDaCultura() {
  return (
    <SecretariaPage
      accentColor="#F7A600"
      eyebrow="Casa da Cultura"
      icon={Theater}
      title="Onde a cultura sobe ao palco."
      description="Da criação ao encontro com o público, a Casa da Cultura acolhe oficinas, ensaios e apresentações que movimentam a produção artística de Siqueira Campos."
      heroVisual={
        <figure className="relative mx-auto max-w-[34rem] border-2 border-[#F7A600] bg-white p-3 shadow-[0_24px_70px_rgba(65,66,150,0.16)]">
          <div className="overflow-hidden bg-[#24223A]">
            <img
              src="/casa-da-cultura/auditorio-casa-da-cultura.jfif"
              alt="Vista do palco para a plateia do auditório da Casa da Cultura"
              className="aspect-[16/10] w-full object-cover"
              width={1600}
              height={900}
            />
          </div>
          <figcaption className="px-2 pb-1 pt-4 text-sm leading-relaxed text-[#5F5D70]">
            Um espaço preparado para receber histórias, ideias e diferentes expressões artísticas.
          </figcaption>
          <div className="absolute -bottom-5 -right-5 flex h-20 w-20 items-center justify-center bg-[#F7A600] text-white">
            <Theater className="h-9 w-9" />
          </div>
        </figure>
      }
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
