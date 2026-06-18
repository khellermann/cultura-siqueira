export type CulturalStory = {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  image: string;
  imageAlt: string;
  publishedAt: string;
  paragraphs: string[];
};

export const culturalStories: CulturalStory[] = [
  {
    slug: "colonia-mineira-memoria-do-cafe",
    title: "Colônia Mineira: trabalho rural e memória do café",
    description:
      "Conheça os objetos, ferramentas e registros que preservam a memória da Colônia Mineira e do ciclo do café em Siqueira Campos.",
    eyebrow: "História do acervo",
    image: "/museu-galeria/museu-galeria-31.jpeg",
    imageAlt: "Sala Colônia Mineira 1905 com ferramentas, objetos rurais e painel do café",
    publishedAt: "2026-06-18",
    paragraphs: [
      "A sala dedicada à Colônia Mineira reúne ferramentas, utensílios, fotografias e painéis que ajudam a contar a presença do trabalho rural na formação de Siqueira Campos.",
      "Os objetos aproximam o visitante das rotinas de cultivo, transporte e vida doméstica ligadas ao café. Mais do que peças isoladas, eles formam um registro material das famílias e comunidades que construíram parte da história regional.",
      "Esse percurso pode ser conhecido durante a visita ao Museu Histórico Municipal, com entrada gratuita e possibilidade de atendimento mediado para escolas e grupos.",
    ],
  },
  {
    slug: "roteiro-visita-escolar-museu-siqueira-campos",
    title: "Como organizar uma visita escolar ao Museu de Siqueira Campos",
    description:
      "Um roteiro prático para professores planejarem visitas escolares ao Museu Histórico Municipal de Siqueira Campos.",
    eyebrow: "Guia de visitação",
    image: "/museu-galeria/museu-galeria-13.jpeg",
    imageAlt: "Sala expositiva do Museu Histórico Municipal com vitrines e fotografias",
    publishedAt: "2026-06-18",
    paragraphs: [
      "A visita escolar ganha mais sentido quando começa com uma pergunta: quais histórias da cidade os estudantes já conhecem? Fotografias, ferramentas, mobiliário e documentos do museu ajudam a transformar essa pergunta em investigação.",
      "Antes da visita, a escola deve informar o tamanho do grupo, a faixa etária, a data desejada e o objetivo pedagógico. Esses dados permitem que a equipe organize o atendimento e destaque os ambientes mais relacionados ao conteúdo trabalhado em sala.",
      "Depois do percurso, os estudantes podem produzir relatos, desenhos, entrevistas com familiares ou pequenas pesquisas sobre objetos semelhantes. Assim, a experiência continua na escola e aproxima diferentes gerações da memória local.",
    ],
  },
];

export function getCulturalStory(slug: string) {
  return culturalStories.find((story) => story.slug === slug);
}
