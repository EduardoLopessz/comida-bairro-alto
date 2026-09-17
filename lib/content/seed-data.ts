/**
 * CONTEÚDO BASE DO RESTAURANTE — fonte única de verdade.
 *
 * Usado em dois lugares:
 *  1. `scripts/seed.mjs` popula o Supabase a partir daqui;
 *  2. o site usa como fallback quando o banco ainda não respondeu/está vazio,
 *     para que nenhuma página quebre em build ou em preview sem credenciais.
 *
 * Cardápio autoral, construído sobre a herança de imigração de Curitiba
 * (italiana, polonesa, ucraniana e alemã) e ingredientes do Paraná —
 * pinhão, erva-mate, barreado, truta de Morretes. Ver DECISIONS.md.
 *
 * Fotos: Unsplash (licença livre). Todos os URLs foram verificados.
 */

export type SeedCategory = {
  slug: string;
  nome: string;
  descricao: string;
  ordem: number;
};

export type SeedItem = {
  categoria: string;
  nome: string;
  descricao: string;
  preco: number;
  imagem_url: string;
  imagem_credito: string;
  tags: string[];
  destaque?: boolean;
  ordem: number;
};

const UNSPLASH = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const SEED_CATEGORIES: SeedCategory[] = [
  {
    slug: "entradas",
    nome: "Entradas",
    descricao:
      "Pequenos pratos para abrir a mesa — conservas, defumados e a massa recheada que atravessou o oceano.",
    ordem: 1,
  },
  {
    slug: "caldos",
    nome: "Caldos & Sopas",
    descricao:
      "Curitiba é fria oito meses por ano. Aqui isso é uma vantagem, não um problema.",
    ordem: 2,
  },
  {
    slug: "massas",
    nome: "Massas",
    descricao:
      "Massa fresca feita todos os dias, na tradição das colônias italianas de Santa Felicidade.",
    ordem: 3,
  },
  {
    slug: "principais",
    nome: "Pratos principais",
    descricao:
      "Cocção longa, fogo baixo e o tempo que cada corte pede. A cozinha do Paraná sem pressa.",
    ordem: 4,
  },
  {
    slug: "sobremesas",
    nome: "Sobremesas",
    descricao:
      "Doces de avó relidos — papoula, maçã, erva-mate e o sagu que nunca sai da carta.",
    ordem: 5,
  },
  {
    slug: "bebidas",
    nome: "Bebidas",
    descricao:
      "Vinhos coloniais, destilados da casa e mate em todas as suas formas possíveis.",
    ordem: 6,
  },
];

export const SEED_ITEMS: SeedItem[] = [
  // ---------------------------------------------------------------- entradas
  {
    categoria: "entradas",
    nome: "Pierogi de Pinhão",
    descricao:
      "Massa fina recheada de pinhão da Lapa, cebola caramelizada e requeijão de fazenda. Servidos na manteiga noisette com cebolinha queimada.",
    preco: 46,
    imagem_url: UNSPLASH("photo-1529042410759-befb1204b468"),
    imagem_credito: "Unsplash",
    tags: ["vegetariano"],
    destaque: true,
    ordem: 1,
  },
  {
    categoria: "entradas",
    nome: "Bolinho de Barreado",
    descricao:
      "O barreado de Morretes desfiado, moldado e frito na hora. Farinha de mandioca torrada, banana-da-terra e vinagrete de laranja.",
    preco: 42,
    imagem_url: UNSPLASH("photo-1504674900247-0877df9cc836"),
    imagem_credito: "Unsplash",
    tags: ["sem-lactose"],
    ordem: 2,
  },
  {
    categoria: "entradas",
    nome: "Tábua da Colônia",
    descricao:
      "Linguiça defumada artesanal, morcela, queijo colonial curado, pepino em conserva e mostarda de mel. Pão de centeio da casa.",
    preco: 78,
    imagem_url: UNSPLASH("photo-1498837167922-ddd27525d352"),
    imagem_credito: "Unsplash",
    tags: [],
    ordem: 3,
  },
  {
    categoria: "entradas",
    nome: "Cogumelos do Paraná na Brasa",
    descricao:
      "Shimeji e shiitake de produtor de Colombo, grelhados na lenha, com creme de castanha, ervas do quintal e azeite de salsa.",
    preco: 44,
    imagem_url: UNSPLASH("photo-1466637574441-749b8f19452f"),
    imagem_credito: "Unsplash",
    tags: ["vegano", "sem-gluten", "sem-lactose"],
    ordem: 4,
  },

  // ----------------------------------------------------------------- caldos
  {
    categoria: "caldos",
    nome: "Borsch de Beterraba",
    descricao:
      "A sopa ucraniana da avó, clarificada. Beterraba assada, repolho roxo, endro fresco e um fio de creme azedo servido à parte.",
    preco: 38,
    imagem_url: UNSPLASH("photo-1547592180-85f173990554"),
    imagem_credito: "Unsplash",
    tags: ["vegetariano", "sem-gluten"],
    destaque: true,
    ordem: 1,
  },
  {
    categoria: "caldos",
    nome: "Caldo de Pinhão e Alho-poró",
    descricao:
      "Pinhão cozido na brasa e batido com alho-poró tostado. Finalizado com azeite de erva-mate e lascas de pinhão crocante.",
    preco: 36,
    imagem_url: UNSPLASH("photo-1516684732162-798a0062be99"),
    imagem_credito: "Unsplash",
    tags: ["vegano", "sem-gluten", "sem-lactose"],
    ordem: 2,
  },
  {
    categoria: "caldos",
    nome: "Żurek da Casa",
    descricao:
      "Sopa azeda polonesa fermentada por sete dias com centeio. Linguiça branca artesanal, ovo caipira mole e raiz-forte.",
    preco: 44,
    imagem_url: UNSPLASH("photo-1490645935967-10de6ba17061"),
    imagem_credito: "Unsplash",
    tags: [],
    ordem: 3,
  },

  // ----------------------------------------------------------------- massas
  {
    categoria: "massas",
    nome: "Capeletti in Brodo",
    descricao:
      "O prato de domingo de Santa Felicidade. Capeletti recheado de galinha caipira em caldo claro de doze horas, com parmesão de estância.",
    preco: 72,
    imagem_url: UNSPLASH("photo-1473093295043-cdd812d0e601"),
    imagem_credito: "Unsplash",
    tags: [],
    destaque: true,
    ordem: 1,
  },
  {
    categoria: "massas",
    nome: "Nhoque de Pinhão",
    descricao:
      "Nhoque leve de pinhão e batata-doce, manteiga de sálvia, avelã tostada e queijo curado de Witmarsum.",
    preco: 68,
    imagem_url: UNSPLASH("photo-1551183053-bf91a1d81141"),
    imagem_credito: "Unsplash",
    tags: ["vegetariano"],
    ordem: 2,
  },
  {
    categoria: "massas",
    nome: "Tagliatelle ao Ragu de Pato",
    descricao:
      "Massa fresca ao ovo com ragu de pato cozido lentamente no vinho tinto colonial, laranja-da-terra e louro.",
    preco: 86,
    imagem_url: UNSPLASH("photo-1481931098730-318b6f776db0"),
    imagem_credito: "Unsplash",
    tags: [],
    ordem: 3,
  },
  {
    categoria: "massas",
    nome: "Polenta Cremosa de Milho Crioulo",
    descricao:
      "Polenta de milho crioulo do oeste do estado, cogumelos salteados, tomates confitados e azeite de manjericão.",
    preco: 58,
    imagem_url: UNSPLASH("photo-1512058564366-18510be2db19"),
    imagem_credito: "Unsplash",
    tags: ["vegano", "sem-gluten", "sem-lactose"],
    ordem: 4,
  },

  // ------------------------------------------------------------- principais
  {
    categoria: "principais",
    nome: "Barreado Contemporâneo",
    descricao:
      "Coxão duro cozido dezoito horas em panela de barro, servido em duas texturas com farinha biju, banana e laranja. Nosso prato-assinatura.",
    preco: 124,
    imagem_url: UNSPLASH("photo-1544025162-d76694265947"),
    imagem_credito: "Unsplash",
    tags: ["sem-gluten"],
    destaque: true,
    ordem: 1,
  },
  {
    categoria: "principais",
    nome: "Costela de Porco e Repolho Roxo",
    descricao:
      "Costela suína glaceada em melado de cana e mostarda, chucrute roxo da casa e purê de maçã verde. Herança alemã, fogo curitibano.",
    preco: 108,
    imagem_url: UNSPLASH("photo-1600891964092-4316c288032e"),
    imagem_credito: "Unsplash",
    tags: ["sem-gluten", "sem-lactose"],
    ordem: 2,
  },
  {
    categoria: "principais",
    nome: "Galeto ao Vinho Tinto",
    descricao:
      "Galeto inteiro marinado por 24 horas, assado na lenha, com polenta frita e salada de radicchio. Para dois, como nas cantinas.",
    preco: 138,
    imagem_url: UNSPLASH("photo-1432139555190-58524dae6a55"),
    imagem_credito: "Unsplash",
    tags: ["sem-lactose"],
    ordem: 3,
  },
  {
    categoria: "principais",
    nome: "Truta de Morretes",
    descricao:
      "Truta da serra grelhada na pele, purê de couve-flor tostada, alcaparras crocantes e manteiga de limão-cravo.",
    preco: 96,
    imagem_url: UNSPLASH("photo-1519708227418-c8fd9a32b7a2"),
    imagem_credito: "Unsplash",
    tags: ["sem-gluten"],
    ordem: 4,
  },
  {
    categoria: "principais",
    nome: "Raiz e Brasa",
    descricao:
      "Legumes de raiz assados na cinza — cenoura roxa, pastinaca, beterraba —, húmus de feijão branco, gremolata de avelã e mate.",
    preco: 74,
    imagem_url: UNSPLASH("photo-1540189549336-e6e99c3679fe"),
    imagem_credito: "Unsplash",
    tags: ["vegano", "sem-gluten", "sem-lactose"],
    ordem: 5,
  },

  // ------------------------------------------------------------- sobremesas
  {
    categoria: "sobremesas",
    nome: "Sagu ao Vinho Colonial",
    descricao:
      "Sagu cozido no vinho tinto da colônia com especiarias e creme de baunilha queimada. O doce que nunca sai da carta.",
    preco: 34,
    imagem_url: UNSPLASH("photo-1551024601-bec78aea704b"),
    imagem_credito: "Unsplash",
    tags: ["vegetariano", "sem-gluten"],
    destaque: true,
    ordem: 1,
  },
  {
    categoria: "sobremesas",
    nome: "Cuca de Banana e Farofa Doce",
    descricao:
      "Massa fofa de fermentação lenta, banana caramelizada e farofa de canela. Servida morna, com sorvete de nata.",
    preco: 32,
    imagem_url: UNSPLASH("photo-1567620905732-2d1ec7ab7445"),
    imagem_credito: "Unsplash",
    tags: ["vegetariano"],
    ordem: 2,
  },
  {
    categoria: "sobremesas",
    nome: "Makowiec",
    descricao:
      "Rocambole polonês de semente de papoula, casca de laranja cristalizada e calda de mel silvestre.",
    preco: 30,
    imagem_url: UNSPLASH("photo-1484723091739-30a097e8f929"),
    imagem_credito: "Unsplash",
    tags: ["vegetariano"],
    ordem: 3,
  },
  {
    categoria: "sobremesas",
    nome: "Sorvete de Erva-Mate",
    descricao:
      "Sorvete artesanal de erva-mate tostada, com crocante de pinhão caramelizado e raspas de limão-siciliano.",
    preco: 28,
    imagem_url: UNSPLASH("photo-1493770348161-369560ae357d"),
    imagem_credito: "Unsplash",
    tags: ["vegetariano", "sem-gluten"],
    ordem: 4,
  },

  // ---------------------------------------------------------------- bebidas
  {
    categoria: "bebidas",
    nome: "Negroni de Erva-Mate",
    descricao:
      "Gim infusionado com erva-mate tostada, vermute rosso e bitter. Servido sobre pedra grande, com casca de laranja queimada.",
    preco: 42,
    imagem_url: UNSPLASH("photo-1510812431401-41d2bd2722f3"),
    imagem_credito: "Unsplash",
    tags: [],
    ordem: 1,
  },
  {
    categoria: "bebidas",
    nome: "Vinho Colonial da Casa",
    descricao:
      "Tinto seco de uva bordô, produzido por pequena vinícola do interior do Paraná. Taça ou garrafa.",
    preco: 36,
    imagem_url: UNSPLASH("photo-1517244683847-7456b63c5969"),
    imagem_credito: "Unsplash",
    tags: ["vegano"],
    ordem: 2,
  },
  {
    categoria: "bebidas",
    nome: "Quentão de Inverno",
    descricao:
      "Cachaça envelhecida, gengibre, cravo e canela, cozidos lentamente. De maio a setembro, na frente da lareira.",
    preco: 26,
    imagem_url: UNSPLASH("photo-1470337458703-46ad1756a187"),
    imagem_credito: "Unsplash",
    tags: ["vegano", "sem-gluten"],
    ordem: 3,
  },
  {
    categoria: "bebidas",
    nome: "Café Coado da Serra",
    descricao:
      "Grãos de produtor do norte do Paraná, torra média, coado na hora em pano. Acompanha um biscoito de polvilho.",
    preco: 16,
    imagem_url: UNSPLASH("photo-1495474472287-4d71bcdd2085"),
    imagem_credito: "Unsplash",
    tags: ["vegano", "sem-lactose"],
    ordem: 4,
  },
];

export const SEED_GALLERY = [
  {
    titulo: "Salão principal ao entardecer",
    imagem_url: UNSPLASH("photo-1414235077428-338989a2e8c0", 1600),
    credito: "Unsplash",
    categoria: "ambiente" as const,
    ordem: 1,
  },
  {
    titulo: "Mesa comunitária de madeira maciça",
    imagem_url: UNSPLASH("photo-1517248135467-4c7edcad34c4", 1600),
    credito: "Unsplash",
    categoria: "ambiente" as const,
    ordem: 2,
  },
  {
    titulo: "O balcão e a adega",
    imagem_url: UNSPLASH("photo-1514933651103-005eec06c04b", 1600),
    credito: "Unsplash",
    categoria: "ambiente" as const,
    ordem: 3,
  },
  {
    titulo: "Café da tarde no inverno",
    imagem_url: UNSPLASH("photo-1559339352-11d035aa65de", 1600),
    credito: "Unsplash",
    categoria: "ambiente" as const,
    ordem: 4,
  },
  {
    titulo: "Salão visto da cozinha",
    imagem_url: UNSPLASH("photo-1555396273-367ea4eb4db5", 1600),
    credito: "Unsplash",
    categoria: "ambiente" as const,
    ordem: 5,
  },
  {
    titulo: "Barreado servido na panela de barro",
    imagem_url: UNSPLASH("photo-1544025162-d76694265947", 1600),
    credito: "Unsplash",
    categoria: "pratos" as const,
    ordem: 6,
  },
  {
    titulo: "Massa fresca do dia",
    imagem_url: UNSPLASH("photo-1473093295043-cdd812d0e601", 1600),
    credito: "Unsplash",
    categoria: "pratos" as const,
    ordem: 7,
  },
  {
    titulo: "Legumes de raiz assados na cinza",
    imagem_url: UNSPLASH("photo-1540189549336-e6e99c3679fe", 1600),
    credito: "Unsplash",
    categoria: "pratos" as const,
    ordem: 8,
  },
  {
    titulo: "Mesa posta para o jantar",
    imagem_url: UNSPLASH("photo-1498837167922-ddd27525d352", 1600),
    credito: "Unsplash",
    categoria: "pratos" as const,
    ordem: 9,
  },
  {
    titulo: "Sobremesa e café",
    imagem_url: UNSPLASH("photo-1551024601-bec78aea704b", 1600),
    credito: "Unsplash",
    categoria: "pratos" as const,
    ordem: 10,
  },
  {
    titulo: "Produtos da feira do Bairro Alto",
    imagem_url: UNSPLASH("photo-1466637574441-749b8f19452f", 1600),
    credito: "Unsplash",
    categoria: "equipe" as const,
    ordem: 11,
  },
  {
    titulo: "A brasa acesa desde as sete da manhã",
    imagem_url: UNSPLASH("photo-1504674900247-0877df9cc836", 1600),
    credito: "Unsplash",
    categoria: "equipe" as const,
    ordem: 12,
  },
];

/**
 * Conteúdo institucional editável pelo painel.
 * `tipo` define qual campo o admin enxerga (input curto, textarea, etc.).
 */
export const SEED_CONTENT: Array<{
  chave: string;
  valor: string;
  rotulo: string;
  grupo: string;
  tipo: "texto" | "texto_longo" | "url" | "email" | "telefone";
  ordem: number;
}> = [
  {
    chave: "hero_sobretitulo",
    valor: "Bairro Alto · Curitiba",
    rotulo: "Sobretítulo do hero",
    grupo: "home",
    tipo: "texto",
    ordem: 1,
  },
  {
    chave: "hero_titulo",
    valor: "A cozinha que o frio de Curitiba pediu",
    rotulo: "Título do hero",
    grupo: "home",
    tipo: "texto",
    ordem: 2,
  },
  {
    chave: "hero_subtitulo",
    valor:
      "Pierogi, barreado e massa fresca do dia — a herança das colônias servida em mesa de bairro, com fogo baixo e tempo de sobra.",
    rotulo: "Subtítulo do hero",
    grupo: "home",
    tipo: "texto_longo",
    ordem: 3,
  },
  {
    chave: "home_manifesto_titulo",
    valor: "Alta gastronomia de bairro",
    rotulo: "Título do manifesto (home)",
    grupo: "home",
    tipo: "texto",
    ordem: 4,
  },
  {
    chave: "home_manifesto",
    valor:
      "Não inventamos uma cozinha: fomos buscar a que já estava aqui. A avó polonesa que sovava a massa no domingo, o italiano de Santa Felicidade que fazia o galeto no fogo de chão, o ucraniano que plantava beterraba no fundo do quintal, o alemão que defumava a linguiça no inverno. O Comida Bairro Alto pega essas mesas e as põe lado a lado, com técnica contemporânea e ingrediente do Paraná.",
    rotulo: "Texto do manifesto (home)",
    grupo: "home",
    tipo: "texto_longo",
    ordem: 5,
  },
  {
    chave: "sobre_titulo",
    valor: "Uma esquina do Bairro Alto, quatro países de distância",
    rotulo: "Título da página Sobre",
    grupo: "sobre",
    tipo: "texto",
    ordem: 1,
  },
  {
    chave: "sobre_texto",
    valor:
      "Curitiba foi construída por quem chegou de longe. Entre 1870 e 1930, italianos, poloneses, ucranianos e alemães desembarcaram no Paraná e subiram a serra atrás de terra barata e clima parecido com o de casa. Encontraram o frio, a araucária e o pinhão — e ficaram.\n\nO Bairro Alto guarda essa mistura sem cerimônia: é bairro de casa com quintal, de feira na quarta-feira, de vizinho que planta couve na calçada. Foi por isso que escolhemos esta esquina. Queríamos uma cozinha de alta gastronomia que não precisasse de centro, de vitrine, de sobrenome francês.\n\nNossa carta muda com a estação e com o que o produtor tem para entregar. O pinhão vem da Lapa entre abril e julho. A truta desce de Morretes. O queijo colonial é de Witmarsum, o vinho bordô do interior. O barreado cozinha dezoito horas em panela de barro porque não existe outro jeito de fazer barreado.\n\nSe você veio pelo prato, fique pela mesa. É ela que a gente estava tentando reconstruir desde o começo.",
    rotulo: "Texto principal da página Sobre",
    grupo: "sobre",
    tipo: "texto_longo",
    ordem: 2,
  },
  {
    chave: "sobre_chef_nome",
    valor: "Helena Kowalski",
    rotulo: "Nome do chef",
    grupo: "sobre",
    tipo: "texto",
    ordem: 3,
  },
  {
    chave: "sobre_chef_texto",
    valor:
      "Neta de poloneses de Araucária, Helena aprendeu a fazer pierogi antes de aprender a ler. Passou dez anos em cozinhas de São Paulo e Lisboa antes de voltar para Curitiba com uma ideia simples e teimosa: a comida da sua infância merecia a mesma técnica que ela tinha aprendido a aplicar em ingrediente importado. O Comida Bairro Alto é a resposta.",
    rotulo: "Bio do chef",
    grupo: "sobre",
    tipo: "texto_longo",
    ordem: 4,
  },
  {
    chave: "contato_endereco",
    valor: "Rua Nossa Senhora da Luz, 1420 — Bairro Alto, Curitiba — PR",
    rotulo: "Endereço",
    grupo: "contato",
    tipo: "texto",
    ordem: 1,
  },
  {
    chave: "contato_cep",
    valor: "82530-100",
    rotulo: "CEP",
    grupo: "contato",
    tipo: "texto",
    ordem: 2,
  },
  {
    chave: "contato_telefone",
    valor: "(41) 3333-4160",
    rotulo: "Telefone",
    grupo: "contato",
    tipo: "telefone",
    ordem: 3,
  },
  {
    chave: "contato_whatsapp",
    valor: "5541999998888",
    rotulo: "WhatsApp (somente números, com DDI)",
    grupo: "contato",
    tipo: "texto",
    ordem: 4,
  },
  {
    chave: "contato_email",
    valor: "reservas@comidabairroalto.com.br",
    rotulo: "E-mail de contato",
    grupo: "contato",
    tipo: "email",
    ordem: 5,
  },
  {
    chave: "contato_instagram",
    valor: "https://instagram.com/comidabairroalto",
    rotulo: "Instagram",
    grupo: "contato",
    tipo: "url",
    ordem: 6,
  },
  {
    chave: "contato_maps",
    valor:
      "https://www.google.com/maps/search/?api=1&query=Bairro+Alto,+Curitiba+-+PR",
    rotulo: "Link do Google Maps",
    grupo: "contato",
    tipo: "url",
    ordem: 7,
  },
  {
    chave: "horario_almoco",
    valor: "Terça a domingo · 12h — 15h",
    rotulo: "Horário do almoço",
    grupo: "horarios",
    tipo: "texto",
    ordem: 1,
  },
  {
    chave: "horario_jantar",
    valor: "Quarta a sábado · 19h — 23h",
    rotulo: "Horário do jantar",
    grupo: "horarios",
    tipo: "texto",
    ordem: 2,
  },
  {
    chave: "horario_fechado",
    valor: "Segunda-feira fechado",
    rotulo: "Dia de fechamento",
    grupo: "horarios",
    tipo: "texto",
    ordem: 3,
  },
  {
    chave: "reservas_aviso",
    valor:
      "Reservas para grupos acima de 8 pessoas, aniversários e eventos: fale com a gente pelo WhatsApp. Confirmamos todas as reservas por e-mail em até 24 horas.",
    rotulo: "Aviso da página de reservas",
    grupo: "reservas",
    tipo: "texto_longo",
    ordem: 1,
  },
];

export const SEED_EVENTS = [
  {
    titulo: "Jantar de Inverno: seis tempos e a lareira acesa",
    slug: "jantar-de-inverno",
    resumo:
      "Menu-degustação de seis tempos construído em torno do pinhão, com harmonização de vinhos coloniais. Vagas limitadas a 24 lugares.",
    conteudo:
      "Todo mês de julho a casa fecha por uma noite e serve um menu único, em serviço simultâneo, com todo mundo sentado ao mesmo tempo — como era nas casas de colônia.\n\nSeis tempos, do caldo de pinhão ao sorvete de erva-mate, harmonizados com tintos de pequenos produtores do Paraná e de Santa Catarina. A chef Helena apresenta cada prato à mesa.\n\nO valor inclui couvert, todos os tempos, harmonização e serviço.",
    imagem_url: UNSPLASH("photo-1414235077428-338989a2e8c0", 1400),
    data_evento: "2026-07-18",
    publicado: true,
  },
  {
    titulo: "Oficina de Pierogi com a chef",
    slug: "oficina-de-pierogi",
    resumo:
      "Uma manhã de sábado na nossa cozinha aprendendo a sovar, rechear e fechar pierogi à mão. Sai com massa pronta para casa.",
    conteudo:
      "Três horas de cozinha prática, para no máximo dez pessoas. A chef Helena ensina a massa que aprendeu com a avó e os três recheios que estão na carta — pinhão, ruski e cogumelos.\n\nInclui café da manhã, todo o material, avental da casa e um pacote de pierogi congelado para levar embora.",
    imagem_url: UNSPLASH("photo-1529042410759-befb1204b468", 1400),
    data_evento: "2026-05-30",
    publicado: true,
  },
  {
    titulo: "Nova carta de outono",
    slug: "nova-carta-de-outono",
    resumo:
      "O pinhão voltou. Com ele, quatro pratos novos e o retorno do barreado à carta fixa.",
    conteudo:
      "A safra de pinhão começou na Lapa e a carta mudou junto. Entram o caldo de pinhão e alho-poró, o nhoque de pinhão com queijo de Witmarsum e os cogumelos de Colombo na brasa.\n\nO barreado, que era prato de fim de semana, passa a ser servido todos os dias — em duas texturas, como sempre.",
    imagem_url: UNSPLASH("photo-1466637574441-749b8f19452f", 1400),
    data_evento: "2026-04-04",
    publicado: true,
  },
];
