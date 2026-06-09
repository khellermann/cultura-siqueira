import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, CalendarDays, LibraryBig, Users } from "lucide-react";

import { SecretariaPage } from "@/components/SecretariaPage";

export const Route = createFileRoute("/biblioteca")({
  head: () => ({
    meta: [
      { title: "Biblioteca — Secretaria Municipal de Cultura" },
      {
        name: "description",
        content:
          "Biblioteca Municipal de Siqueira Campos: leitura, pesquisa, empréstimos e ações literárias.",
      },
    ],
  }),
  component: Biblioteca,
});

function Biblioteca() {
  return (
    <SecretariaPage
      accentColor="#00A859"
      eyebrow="Biblioteca Municipal"
      icon={LibraryBig}
      title="Leitura, pesquisa e encontro com o conhecimento."
      description="Um espaço público para empréstimo de livros, apoio à pesquisa, incentivo à leitura e atividades de formação de leitores."
      cards={[
        {
          icon: BookOpen,
          title: "Acervo literário",
          text: "Livros para consulta, estudo e empréstimo.",
          color: "#00A859",
        },
        {
          icon: Users,
          title: "Mediação de leitura",
          text: "Ações para escolas, grupos e comunidade.",
          color: "#414296",
        },
        {
          icon: CalendarDays,
          title: "Programação",
          text: "Clubes, contações de histórias e encontros.",
          color: "#F7A600",
        },
      ]}
    />
  );
}
