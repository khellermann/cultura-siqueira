export const museumGalleryFilters = [
  "Todos",
  "Moradia",
  "Memória política",
  "Cultura indígena",
  "Religiosidade",
  "Ofícios e tecnologia",
  "Colônia Mineira",
  "Vitrines",
] as const;

export type MuseumGalleryFilter = (typeof museumGalleryFilters)[number];

type MuseumCategory = Exclude<MuseumGalleryFilter, "Todos">;

export type MuseumGalleryItem = {
  id: string;
  title: string;
  category: MuseumCategory;
  description: string;
  image: string;
  alt: string;
};

export type MuseumTheme = {
  title: string;
  description: string;
  image: string;
  alt: string;
};

export const museumHomeHighlights = [
  {
    title: "Salas do museu",
    image: "/museu-galeria/museu-galeria-12.jpeg",
    alt: "Sala principal do Museu Histórico Municipal com vitrines e assoalho de madeira",
  },
  {
    title: "Colônia Mineira",
    image: "/museu-galeria/museu-galeria-31.jpeg",
    alt: "Espaço Colônia Mineira 1905 com objetos rurais e painel do café",
  },
  {
    title: "Memória visual",
    image: "/museu-galeria/museu-galeria-10.jpeg",
    alt: "Câmeras fotográficas antigas preservadas em vitrine",
  },
  {
    title: "Moradia antiga",
    image: "/museu-galeria/museu-galeria-23.jpeg",
    alt: "Cenário de moradia antiga preservado no museu",
  },
] as const;

export const museumThemes: MuseumTheme[] = [
  {
    title: "Cotidiano e Moradia",
    description:
      "Louças, mobiliário, sala de jantar e ambientes reconstituídos revelam hábitos domésticos e modos de viver de outras épocas.",
    image: "/museu-galeria/museu-galeria-23.jpeg",
    alt: "Reconstituição de moradia antiga com móveis e utensílios",
  },
  {
    title: "Etnografia e Identidade",
    description:
      "Esculturas, painéis e registros da Aldeia Indígena do Pinhalzinho aproximam o visitante das raízes culturais da região.",
    image: "/museu-galeria/museu-galeria-06.jpeg",
    alt: "Painel sobre a Aldeia Indígena do Pinhalzinho",
  },
  {
    title: "Poder Público e Sociedade",
    description:
      "Retratos, documentos, uniformes e registros institucionais preservam a memória política e social de Siqueira Campos.",
    image: "/museu-galeria/museu-galeria-01.jpeg",
    alt: "Parede com retratos dos prefeitos de Siqueira Campos",
  },
  {
    title: "Ofícios, Ciência e Tecnologia",
    description:
      "Máquinas, câmeras, instrumentos de laboratório e equipamentos técnicos contam a história dos trabalhos, saberes e ferramentas.",
    image: "/museu-galeria/museu-galeria-10.jpeg",
    alt: "Câmeras fotográficas antigas expostas em vitrine",
  },
  {
    title: "História Regional e Colonização",
    description:
      "O café, a Colônia Mineira, os recortes de jornal e os registros locais ajudam a narrar a formação regional do município.",
    image: "/museu-galeria/museu-galeria-31.jpeg",
    alt: "Sala Colônia Mineira 1905 com objetos rurais",
  },
  {
    title: "Vistas do Acervo",
    description:
      "Salas, corredores e vitrines mostram a diversidade de objetos preservados e a atmosfera do Museu Histórico Municipal.",
    image: "/museu-galeria/museu-galeria-13.jpeg",
    alt: "Sala expositiva com vitrines e fotografias históricas",
  },
];

export const museumGalleryItems: MuseumGalleryItem[] = [
  {
    id: "galeria-prefeitos",
    title: "Galeria dos Prefeitos",
    category: "Memória política",
    description: "Retratos e registros de gestores municipais preservam a memória administrativa de Siqueira Campos.",
    image: "/museu-galeria/museu-galeria-01.jpeg",
    alt: "Parede com retratos dos prefeitos de Siqueira Campos",
  },
  {
    id: "materias-museu",
    title: "Matérias Sobre o Museu",
    category: "Memória política",
    description: "Recortes e quadros registram a presença do museu na imprensa e na vida cultural da cidade.",
    image: "/museu-galeria/museu-galeria-02.jpeg",
    alt: "Quadros e matérias históricas sobre o museu",
  },
  {
    id: "maquina-escrever",
    title: "O Registro da História",
    category: "Ofícios e tecnologia",
    description: "A máquina de escrever e outros objetos de escritório lembram formas de trabalho e documentação.",
    image: "/museu-galeria/museu-galeria-03.jpeg",
    alt: "Máquina de escrever verde e objetos antigos em vitrine",
  },
  {
    id: "uniforme-documentos",
    title: "Honra e Dever",
    category: "Memória política",
    description: "Uniforme, fotografias e documentos preservam marcas da vida pública e militar no município.",
    image: "/museu-galeria/museu-galeria-04.jpeg",
    alt: "Uniforme antigo, fotografias e documentos históricos em vitrine",
  },
  {
    id: "vitrine-objetos",
    title: "Objetos em Vitrine",
    category: "Vitrines",
    description: "Peças catalogadas mostram a variedade de utensílios, ferramentas e lembranças do acervo.",
    image: "/museu-galeria/museu-galeria-05.jpeg",
    alt: "Peças antigas catalogadas em vitrine de vidro",
  },
  {
    id: "aldeia-pinhalzinho",
    title: "Aldeia Indígena do Pinhalzinho",
    category: "Cultura indígena",
    description: "Painel dedicado à aldeia e aos registros da presença indígena no Norte Pioneiro.",
    image: "/museu-galeria/museu-galeria-06.jpeg",
    alt: "Painel sobre a Aldeia Indígena do Pinhalzinho",
  },
  {
    id: "utensilios-antigos",
    title: "Utensílios e Peças Antigas",
    category: "Vitrines",
    description: "Objetos catalogados revelam usos cotidianos, ofícios e hábitos de diferentes períodos.",
    image: "/museu-galeria/museu-galeria-07.jpeg",
    alt: "Utensílios antigos e peças catalogadas em vitrine de vidro",
  },
  {
    id: "cristaleira-loucas",
    title: "Relíquias da Cozinha",
    category: "Moradia",
    description: "Cristaleira, louças e mobiliário preservam memórias da vida doméstica e da mesa familiar.",
    image: "/museu-galeria/museu-galeria-08.jpeg",
    alt: "Mobiliário antigo com louças preservadas no museu",
  },
  {
    id: "mesa-epoca",
    title: "O Banquete de Época",
    category: "Moradia",
    description: "Mesa e cadeiras de época ajudam a imaginar encontros familiares e costumes de sociabilidade.",
    image: "/museu-galeria/museu-galeria-09.jpeg",
    alt: "Mesa e cadeiras antigas em ambiente expositivo",
  },
  {
    id: "cameras-fotograficas",
    title: "Memória Visual",
    category: "Ofícios e tecnologia",
    description: "Câmeras antigas preservam modos de registrar pessoas, paisagens e acontecimentos locais.",
    image: "/museu-galeria/museu-galeria-10.jpeg",
    alt: "Câmeras fotográficas antigas expostas em vitrine",
  },
  {
    id: "escultura-indigena",
    title: "Arte e Notícia",
    category: "Cultura indígena",
    description: "Escultura em madeira e registros impressos aproximam arte, memória e identidade regional.",
    image: "/museu-galeria/museu-galeria-11.jpeg",
    alt: "Escultura e registros sobre a cultura indígena local",
  },
  {
    id: "sala-principal",
    title: "Sala Principal",
    category: "Vitrines",
    description: "A sala principal reúne vitrines, objetos e fotografias que introduzem o visitante ao acervo.",
    image: "/museu-galeria/museu-galeria-12.jpeg",
    alt: "Sala principal do museu com vitrines e assoalho de madeira",
  },
  {
    id: "sala-expositiva",
    title: "Sala Expositiva",
    category: "Vitrines",
    description: "Ambiente com vitrines e fotografias históricas que conectam objetos e narrativas locais.",
    image: "/museu-galeria/museu-galeria-13.jpeg",
    alt: "Sala expositiva com vitrines e fotografias históricas",
  },
  {
    id: "laboratorio",
    title: "Ciência e Laboratório",
    category: "Ofícios e tecnologia",
    description: "Instrumentos científicos e frascos antigos contam parte da história técnica e educacional.",
    image: "/museu-galeria/museu-galeria-14.jpeg",
    alt: "Instrumentos e objetos de laboratório preservados em vitrine",
  },
  {
    id: "sala-esculturas",
    title: "Legado Indígena",
    category: "Cultura indígena",
    description: "Esculturas e objetos criam um percurso visual sobre identidade, território e memória.",
    image: "/museu-galeria/museu-galeria-15.jpeg",
    alt: "Sala com esculturas, janelas abertas e piso de madeira",
  },
  {
    id: "escrivaninha",
    title: "Gabinete de Trabalho",
    category: "Ofícios e tecnologia",
    description: "A escrivaninha histórica reúne livros, documentos e utensílios ligados ao trabalho intelectual.",
    image: "/museu-galeria/museu-galeria-16.jpeg",
    alt: "Escrivaninha antiga com livros, documentos e objetos de escritório",
  },
  {
    id: "ambiente-domestico",
    title: "Sala de Jantar do Museu",
    category: "Moradia",
    description: "Mobiliário, louças e objetos domésticos compõem um ambiente de memória familiar.",
    image: "/museu-galeria/museu-galeria-17.jpeg",
    alt: "Ambiente com mobiliário histórico, cristaleira e louças",
  },
  {
    id: "traje-religioso",
    title: "A Arte do Bordado",
    category: "Moradia",
    description: "Traje bordado à mão destaca saberes artesanais, cuidado com detalhes e memória material.",
    image: "/museu-galeria/museu-galeria-18.jpeg",
    alt: "Traje religioso vermelho e vitrines em sala expositiva",
  },
  {
    id: "sala-religiosa",
    title: "Fé e Tradição",
    category: "Religiosidade",
    description: "A sala apresenta objetos e registros ligados à religiosidade e às práticas culturais.",
    image: "/museu-galeria/museu-galeria-19.jpeg",
    alt: "Sala religiosa com documentos, mobiliário e vestimenta",
  },
  {
    id: "religiosidade-identidade",
    title: "Religiosidade e Identidade",
    category: "Religiosidade",
    description: "Ambiente que aproxima referências religiosas, cultura indígena e memória comunitária.",
    image: "/museu-galeria/museu-galeria-20.jpeg",
    alt: "Sala dedicada à religiosidade e cultura indígena",
  },
  {
    id: "objetos-cotidiano",
    title: "Objetos do Cotidiano",
    category: "Vitrines",
    description: "Vitrines e peças diversas revelam hábitos, trabalhos e histórias de moradores.",
    image: "/museu-galeria/museu-galeria-21.jpeg",
    alt: "Sala ampla com vitrines e objetos do cotidiano",
  },
  {
    id: "vitrines-acervo",
    title: "Vitrines do Acervo",
    category: "Vitrines",
    description: "As vitrines organizam o encontro entre peças catalogadas, documentos e ambientes preservados.",
    image: "/museu-galeria/museu-galeria-22.jpeg",
    alt: "Vitrines do museu em sala com piso de madeira",
  },
  {
    id: "moradia-antiga",
    title: "Moradia Antiga",
    category: "Moradia",
    description: "Reconstituição de ambiente antigo preserva objetos rurais, móveis e cenas da vida doméstica.",
    image: "/museu-galeria/museu-galeria-23.jpeg",
    alt: "Cenário de moradia antiga preservado no museu",
  },
  {
    id: "corredor-expositivo",
    title: "Corredor Expositivo",
    category: "Vitrines",
    description: "O corredor conecta salas, vitrines e peças que compõem o percurso pelo museu.",
    image: "/museu-galeria/museu-galeria-24.jpeg",
    alt: "Corredor expositivo com traje religioso e vitrines",
  },
  {
    id: "sala-prefeitos",
    title: "Sala dos Prefeitos",
    category: "Memória política",
    description: "Retratos e objetos contam parte da trajetória administrativa do município.",
    image: "/museu-galeria/museu-galeria-25.jpeg",
    alt: "Sala dos prefeitos com retratos e objetos históricos",
  },
  {
    id: "recortes-jornal",
    title: "Arquivos do Tempo",
    category: "Memória política",
    description: "Recortes de jornal preservam acontecimentos, personagens e registros públicos da cidade.",
    image: "/museu-galeria/museu-galeria-26.jpeg",
    alt: "Sala expositiva com vitrines e recortes de jornal",
  },
  {
    id: "prefeitos-secretarios",
    title: "Prefeitos e Secretários",
    category: "Memória política",
    description: "A galeria reúne referências de gestores e secretários que marcaram períodos da história local.",
    image: "/museu-galeria/museu-galeria-27.jpeg",
    alt: "Ambiente da galeria de prefeitos e secretários do município",
  },
  {
    id: "jornais-registros",
    title: "Jornais e Registros",
    category: "Memória política",
    description: "Jornais, documentos e vitrines preservam fragmentos da memória escrita de Siqueira Campos.",
    image: "/museu-galeria/museu-galeria-28.jpeg",
    alt: "Sala com vitrines, jornais e registros históricos",
  },
  {
    id: "ambiente-rural",
    title: "Ambiente Rural Antigo",
    category: "Moradia",
    description: "Objetos rurais e mobiliário ajudam a reconstruir práticas de trabalho e vida no campo.",
    image: "/museu-galeria/museu-galeria-29.jpeg",
    alt: "Ambiente de moradia antiga com objetos rurais",
  },
  {
    id: "reconstituicao-historica",
    title: "Reconstituição Histórica",
    category: "Moradia",
    description: "A composição do ambiente aproxima o visitante de cenas domésticas e rurais do passado.",
    image: "/museu-galeria/museu-galeria-30.jpeg",
    alt: "Reconstituição de ambiente antigo com mobiliário e utensílios",
  },
  {
    id: "colonia-mineira",
    title: "Colônia Mineira 1905",
    category: "Colônia Mineira",
    description: "A sala apresenta ferramentas, objetos e painéis ligados à memória rural e ao ciclo do café.",
    image: "/museu-galeria/museu-galeria-31.jpeg",
    alt: "Sala Colônia Mineira 1905 com objetos rurais",
  },
  {
    id: "ferramentas-rurais",
    title: "Ferramentas Rurais",
    category: "Colônia Mineira",
    description: "Ferramentas e utensílios destacam o trabalho rural e a presença do café na história regional.",
    image: "/museu-galeria/museu-galeria-32.jpeg",
    alt: "Acervo da Colônia Mineira com ferramentas e utensílios",
  },
  {
    id: "mural-cafe",
    title: "Mural do Café",
    category: "Colônia Mineira",
    description: "Painéis da Colônia Mineira conectam fotografias, lavouras, ferramentas e memória do café.",
    image: "/museu-galeria/museu-galeria-33.jpeg",
    alt: "Painéis e objetos históricos da Colônia Mineira",
  },
];

export const museumFeaturedItems = [
  "colonia-mineira",
  "aldeia-pinhalzinho",
  "cameras-fotograficas",
  "maquina-escrever",
  "moradia-antiga",
  "galeria-prefeitos",
].map((id) => museumGalleryItems.find((item) => item.id === id)!);
