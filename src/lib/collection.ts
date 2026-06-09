import a51 from "@/assets/museu_51.asset.json";
import a51_2 from "@/assets/museu_51_2.asset.json";
import a52 from "@/assets/museu_52.asset.json";
import a52_1 from "@/assets/museu_52_1.asset.json";
import a52_3 from "@/assets/museu_52_3.asset.json";
import a53_1 from "@/assets/museu_53_1.asset.json";
import a53_2 from "@/assets/museu_53_2.asset.json";
import a53 from "@/assets/museu_53.asset.json";
import a54 from "@/assets/museu_54.asset.json";
import a54_1 from "@/assets/museu_54_1.asset.json";
import a54_2 from "@/assets/museu_54_2.asset.json";
import a55 from "@/assets/museu_55.asset.json";
import a55_1 from "@/assets/museu_55_1.asset.json";
import a56 from "@/assets/museu_56.asset.json";
import a56_1 from "@/assets/museu_56_1.asset.json";
import a56_2 from "@/assets/museu_56_2.asset.json";
import a56_3 from "@/assets/museu_56_3.asset.json";

export type Piece = {
  url: string;
  title: string;
  category: string;
  period: string;
  description: string;
};

export const collection: Piece[] = [
  {
    url: "/museu-galeria/museu-galeria-01.jpeg",
    title: "Prefeitos do Nosso Município",
    category: "Galeria de Retratos",
    period: "Séc. XIX — XXI",
    description:
      "Painel com retratos dos administradores que conduziram Siqueira Campos desde sua emancipação, organizados em ordem cronológica.",
  },
  {
    url: "/museu-galeria/museu-galeria-03.jpeg",
    title: "Máquina de escrever Olivetti",
    category: "Objeto",
    period: "Décadas de 1950 — 70",
    description:
      "Instrumentos de trabalho do Dr. Carlos Alberto Mordalski, médico e figura pública da cidade.",
  },
  {
    url: "/museu-galeria/museu-galeria-10.jpeg",
    title: "Câmeras fotográficas",
    category: "Coleção",
    period: "1930 — 1980",
    description:
      "Conjunto de máquinas fotográficas analógicas que registraram a vida cotidiana e os principais eventos do município.",
  },
  {
    url: a51.url,
    title: "Uniforme militar e memorabilia",
    category: "Indumentária",
    period: "Primeira metade do séc. XX",
    description:
      "Farda, polainas, chapéu e itens pessoais expostos ao lado de fotografias e documentos da época.",
  },
  {
    url: a52.url,
    title: "Utensílios e artefatos do cotidiano",
    category: "Vitrine permanente",
    period: "Séc. XIX — XX",
    description:
      "Navalhas, polvilhadores, ferraduras, cachimbos e peças do dia a dia dos primeiros moradores da região.",
  },
  {
    url: a52_1.url,
    title: "Ferramentas e ornamentos",
    category: "Vitrine permanente",
    period: "Séc. XIX — XX",
    description:
      "Objetos metálicos, gravuras e fragmentos cerâmicos que compõem o acervo doado pela comunidade.",
  },
  {
    url: a53_1.url,
    title: "Sala de jantar — porcelanas e cristais",
    category: "Mobiliário",
    period: "Início do séc. XX",
    description:
      "Cristaleira de jacarandá, baixela e aparelhos de jantar de famílias tradicionais siqueirenses.",
  },
  {
    url: a53_2.url,
    title: "Mesa oval e cadeiras de palhinha",
    category: "Mobiliário",
    period: "Início do séc. XX",
    description:
      "Conjunto restaurado que reconstitui a atmosfera doméstica das casas senhoriais da cidade.",
  },
  {
    url: a51_2.url,
    title: "Jornal A Gralha — Dona Neusa",
    category: "Imprensa",
    period: "2022",
    description:
      "Homenagem a Dona Neusa Mariano, símbolo do amor ao Museu Histórico e à cultura siqueirense.",
  },
  {
    url: a52_3.url,
    title: "Aldeia Indígena do Pinhalzinho — Yvy Porã",
    category: "Documento",
    period: "Reportagem · Folha Extra",
    description:
      "Painel que apresenta a comunidade Guarani do município de Tomazina, parte da memória indígena do Norte Pioneiro.",
  },
  {
    url: a53.url,
    title: "Escultura em madeira — figura pensante",
    category: "Arte popular",
    period: "Séc. XX",
    description:
      "Talha em madeira maciça em diálogo com os painéis sobre a aldeia Yvy Porã e cestaria indígena.",
  },
  {
    url: a56.url,
    title: "Sala da indianidade",
    category: "Ambiente",
    period: "Exposição permanente",
    description:
      "Esculturas, cestaria e painéis que celebram a presença indígena no território siqueirense.",
  },
  {
    url: a56_2.url,
    title: "Manto bordado em ouro sobre veludo",
    category: "Arte sacra",
    period: "Séc. XIX",
    description:
      "Peça litúrgica de rara beleza, em destaque na Sala da Religiosidade junto a imagens e objetos devocionais.",
  },
  {
    url: a56_3.url,
    title: "Harmônio e hábito franciscano",
    category: "Arte sacra",
    period: "Séc. XIX — XX",
    description:
      "Instrumento musical de igreja e indumentária religiosa que compõem o conjunto da Sala da Religiosidade.",
  },
  {
    url: a55.url,
    title: "Escrivaninha de cortina (roll-top)",
    category: "Mobiliário",
    period: "Início do séc. XX",
    description:
      "Móvel de jacarandá com gavetas e nichos, ambientado com livros, carimbos e o jornal A Gralha.",
  },
  {
    url: a54.url,
    title: "Vitrine de farmácia — Dr. Carlos Alberto Mordalski",
    category: "Vitrine permanente",
    period: "1ª metade do séc. XX",
    description:
      "Frascos de boticário, balança de precisão, almofariz e utensílios da farmácia histórica do município.",
  },
  {
    url: a54_1.url,
    title: "Salão principal",
    category: "Ambiente",
    period: "Exposição permanente",
    description:
      "O grande salão de assoalho de peroba reúne vitrines, mobiliário e painéis fotográficos de Siqueira Campos em três períodos.",
  },
  {
    url: a54_2.url,
    title: "Siqueira Campos em três períodos",
    category: "Ambiente",
    period: "Exposição permanente",
    description:
      "Painéis fotográficos panorâmicos que reconstituem a paisagem urbana da cidade ao longo das décadas.",
  },
  {
    url: a55_1.url,
    title: "Corredor — esculturas e mapas",
    category: "Ambiente",
    period: "Exposição permanente",
    description:
      "Percurso que conduz o visitante por esculturas, mapas históricos e janelas voltadas ao centro da cidade.",
  },
  {
    url: a56_1.url,
    title: "Sala de jantar histórica",
    category: "Ambiente",
    period: "Início do séc. XX",
    description:
      "Reconstituição do interior doméstico de famílias siqueirenses, com mobiliário, louças e cristais originais.",
  },
];
