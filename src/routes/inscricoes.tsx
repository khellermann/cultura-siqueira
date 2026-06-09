import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList, FileText, PenLine } from "lucide-react";

import { SecretariaPage } from "@/components/SecretariaPage";

export const Route = createFileRoute("/inscricoes")({
  head: () => ({
    meta: [
      { title: "Inscrições — Secretaria Municipal de Cultura" },
      {
        name: "description",
        content:
          "Inscrições abertas da Secretaria Municipal de Cultura de Siqueira Campos: oficinas, editais e eventos.",
      },
    ],
  }),
  component: Inscricoes,
});

function Inscricoes() {
  return (
    <SecretariaPage
      accentColor="#EF1B2D"
      eyebrow="Inscrições"
      icon={PenLine}
      title="Chamamentos, oficinas e oportunidades culturais."
      description="Esta página reunirá formulários, editais, oficinas abertas e processos de participação promovidos pela Secretaria."
      cards={[
        {
          icon: PenLine,
          title: "Oficinas",
          text: "Inscrições para cursos e atividades formativas.",
          color: "#EF1B2D",
        },
        {
          icon: FileText,
          title: "Editais",
          text: "Chamadas públicas e documentos de participação.",
          color: "#414296",
        },
        {
          icon: ClipboardList,
          title: "Eventos",
          text: "Credenciamentos e formulários de presença.",
          color: "#00A859",
        },
      ]}
    />
  );
}
