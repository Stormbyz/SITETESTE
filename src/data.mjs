// Conteúdo do site grafMED.
// IMPORTANTE: textos, medidas e produtos abaixo são PROVISÓRIOS para a homologação.
// A versão final de textos é entregue pela SPiCOM8 e a lista de medidas em estoque pela grafMED.

export const site = {
  name: 'grafMED',
  url: 'https://www.grafmed.ind.br',
  tagline: 'Identificação e rastreabilidade para saúde e indústria',
  description:
    'Indústria brasileira de etiquetas, rótulos, fitas indicadoras e pulseiras de identificação para CME, odontologia e indústria. Conversão de matéria-prima sob medida.',
};

// Linhas de produto (menu Produtos)
export const lines = [
  {
    slug: 'cme-hospitalar',
    code: 'CME',
    name: 'CME Hospitalar',
    short: 'Etiquetas e fitas indicadoras para a esterilização.',
    audience: 'Enfermeiros de CME, CCIH e compras hospitalares',
    heroTitle: 'Rastreabilidade do instrumental, <em>do expurgo ao prontuário.</em>',
    heroText:
      'Etiquetas e fitas indicadoras para a Central de Material e Esterilização. Cada pacote identificado, cada ciclo registrado.',
    original: true,
    norms: ['RDC-15 ANVISA', 'ABNT NBR ISO 26825:2021'],
    mock: 'roll',
  },
  {
    slug: 'grafdental',
    code: 'DENT',
    name: 'grafDENTAL',
    short: 'Identificação para o consultório, conforme a nova RDC.',
    audience: 'Dentistas, gestores de clínica e distribuidores dentais',
    heroTitle: 'A esterilização do consultório, <em>registrada em segundos.</em>',
    heroText:
      'A linha grafDENTAL leva a rastreabilidade da CME hospitalar para a rotina do consultório odontológico, de forma simples e prática.',
    original: true,
    norms: ['RDC-15 ANVISA'],
    mock: 'dental',
  },
  {
    slug: 'rotulos-etiquetas',
    code: 'ROT',
    name: 'Rótulos e Etiquetas',
    short: 'Rótulos adesivos para alimentos, cosméticos e varejo.',
    audience: 'Indústrias, marcas próprias e varejo',
    heroTitle: 'O rótulo certo <em>para o seu produto chegar à prateleira.</em>',
    heroText:
      'Rótulos e etiquetas adesivas sob medida para alimentos, cosméticos, farmácia e varejo, com o mesmo rigor de quem atende hospitais.',
    original: false,
    norms: [],
    mock: 'label',
  },
  {
    slug: 'pulseiras',
    code: 'PUL',
    name: 'Pulseiras de Identificação',
    short: 'Para hospitais, eventos e parques aquáticos.',
    audience: 'Hospitais, organizadores de eventos e parques',
    heroTitle: 'Identificação que fica no pulso <em>do começo ao fim.</em>',
    heroText:
      'Pulseiras resistentes e confortáveis para identificar pacientes, controlar acesso em eventos e acompanhar o dia inteiro em parques aquáticos.',
    original: false,
    norms: [],
    mock: 'band',
  },
];

// Opções extras dentro de Produtos
export const extras = [
  {
    slug: 'conversao-materia-prima',
    code: 'CONV',
    name: 'Conversão de Matéria-Prima',
    short: 'Você envia o material, a gente converte.',
    mock: 'flow',
  },
  {
    slug: 'projetos',
    code: 'P&D',
    name: 'Projetos sob medida',
    short: 'Não encontrou no site? A grafMED desenvolve.',
    mock: 'project',
  },
];

// Produtos de prateleira (poucos e bem separados: 3 por linha)
// measures: SOMENTE medidas em estoque. Lista provisória — substituir pela lista oficial da grafMED.
export const products = [
  {
    id: 'etiqueta-duplo-uso-vapor',
    line: 'cme-hospitalar',
    name: 'Etiqueta duplo uso a vapor',
    short:
      'Etiqueta com indicador químico para esterilização a vapor. Uma parte fica no pacote, a outra vai para o registro do ciclo.',
    mock: 'roll',
    variant: 'vapor',
    printedBlank: true,
    colors: ['#F2F2F2', '#F2BF27', '#7BC4A4', '#7AA7E0', '#E58FA8', '#BFA6E0'],
    measures: ['Medida 1 (a confirmar)', 'Medida 2 (a confirmar)', 'Medida 3 (a confirmar)'],
    copied: true,
    tabs: {
      uso:
        'Aplique a etiqueta no pacote antes da autoclave. Após o ciclo, o indicador muda de cor. Destaque a parte removível e cole no registro de rastreabilidade ou prontuário.',
      caracteristicas:
        'Indicador químico impresso. Adesivo compatível com papel grau cirúrgico, SMS e tecido. Aceita impressão em impressoras térmicas de transferência.',
      diferenciais:
        'Produção nacional, estabilidade de fornecimento e suporte técnico direto com a fábrica.',
    },
  },
  {
    id: 'etiqueta-pph',
    line: 'cme-hospitalar',
    name: 'Etiqueta para peróxido (PPH)',
    short:
      'Etiqueta com indicador para esterilização por peróxido de hidrogênio, para materiais sensíveis ao calor.',
    mock: 'roll',
    variant: 'pph',
    printedBlank: true,
    colors: ['#F2F2F2', '#F2BF27', '#7BC4A4', '#7AA7E0'],
    measures: ['Medida 1 (a confirmar)', 'Medida 2 (a confirmar)'],
    copied: true,
    tabs: {
      uso:
        'Aplique no invólucro antes do ciclo de peróxido. Confira a mudança de cor do indicador na liberação do material.',
      caracteristicas:
        'Indicador específico para peróxido de hidrogênio. Adesivo próprio para invólucros de polipropileno (Tyvek®).',
      diferenciais: 'Mesma rastreabilidade das etiquetas a vapor, para o processo de baixa temperatura.',
    },
  },
  {
    id: 'fita-indicadora-vapor',
    line: 'cme-hospitalar',
    name: 'Fita indicadora para autoclave',
    short:
      'Fita adesiva com indicador que muda de cor após o processo de esterilização a vapor. Fecha e sinaliza o pacote ao mesmo tempo.',
    mock: 'tape',
    variant: 'vapor',
    colors: [],
    measures: ['Largura 1 (a confirmar)', 'Largura 2 (a confirmar)'],
    copied: true,
    tabs: {
      uso: 'Use para fechar pacotes de tecido, papel crepado ou SMS. Após o ciclo, as listras indicam a passagem pelo processo.',
      caracteristicas: 'Dorso de papel crepado, adesivo que não deixa resíduo, listras indicadoras.',
      diferenciais: 'Indicação visual imediata para a equipe da CME, sem etapa extra.',
    },
  },
  {
    id: 'etiqueta-duplo-uso-grafdental',
    line: 'grafdental',
    name: 'Etiqueta duplo uso grafDENTAL',
    short:
      'A etiqueta com indicador pensada para o consultório: registra o ciclo da autoclave e vai direto para a ficha do paciente.',
    mock: 'dental',
    variant: 'vapor',
    printedBlank: true,
    colors: ['#F2F2F2', '#7AA7E0', '#7BC4A4', '#E58FA8'],
    measures: ['Medida 1 (a confirmar)'],
    copied: true,
    tabs: {
      uso: 'Cole no envelope de esterilização, anote data e lote, e após o ciclo transfira a parte destacável para a ficha do paciente.',
      caracteristicas: 'Indicador químico para vapor, campo para anotação manual, rolo compacto para bancada.',
      diferenciais: 'Ajuda o consultório a cumprir a nova RDC sem complicar a rotina.',
    },
  },
  {
    id: 'fita-indicadora-grafdental',
    line: 'grafdental',
    name: 'Fita indicadora grafDENTAL',
    short: 'Fita indicadora em formato compacto para a autoclave do consultório.',
    mock: 'tape',
    variant: 'vapor',
    colors: [],
    measures: ['Largura 1 (a confirmar)'],
    copied: false,
    tabs: {
      uso: 'Feche os envelopes ou campos e confira a mudança de cor após o ciclo.',
      caracteristicas: 'Rolo compacto, listras indicadoras para vapor.',
      diferenciais: 'Tamanho pensado para o volume de um consultório.',
    },
  },
  {
    id: 'rotulos-personalizados',
    line: 'rotulos-etiquetas',
    name: 'Rótulos adesivos personalizados',
    short: 'Rótulos com a sua arte para alimentos, cosméticos, farmácia e varejo.',
    mock: 'label',
    colors: [],
    measures: [],
    custom: true,
    tabs: {
      uso: 'Envie a arte e as especificações. Produzimos em bobina para aplicação manual ou automática.',
      caracteristicas: 'Papel couché, BOPP branco ou transparente, acabamento fosco ou brilho.',
      diferenciais: 'Quantidade mínima acessível e prazo de indústria.',
    },
  },
  {
    id: 'etiquetas-bobina-impressao',
    line: 'rotulos-etiquetas',
    name: 'Etiquetas em bobina para impressão',
    short: 'Etiquetas em branco para impressoras térmicas e de transferência térmica.',
    mock: 'roll',
    variant: 'blank',
    colors: [],
    measures: ['Medida 1 (a confirmar)', 'Medida 2 (a confirmar)'],
    tabs: {
      uso: 'Para código de barras, preço, lote e validade em impressoras de etiquetas.',
      caracteristicas: 'Papel térmico ou couché, tubete padrão de mercado.',
      diferenciais: 'Fornecimento contínuo para não parar a sua expedição.',
    },
  },
  {
    id: 'etiquetas-validade',
    line: 'rotulos-etiquetas',
    name: 'Etiquetas de validade e controle',
    short: 'Etiquetas coloridas para controle de validade, lote e manipulação.',
    mock: 'label',
    variant: 'colors',
    colors: ['#F2BF27', '#7BC4A4', '#7AA7E0', '#E58FA8', '#BFA6E0'],
    measures: ['Medida 1 (a confirmar)'],
    tabs: {
      uso: 'Identifique datas de abertura e validade em cozinhas, farmácias e almoxarifados.',
      caracteristicas: 'Cores por dia da semana, campos pré-impressos.',
      diferenciais: 'Organização visual imediata para a equipe.',
    },
  },
  {
    id: 'pulseira-hospitalar',
    line: 'pulseiras',
    name: 'Pulseira de identificação hospitalar',
    short: 'Pulseira confortável para identificação segura do paciente durante toda a internação.',
    mock: 'band',
    variant: 'hosp',
    colors: ['#FFFFFF', '#7AA7E0', '#E58FA8', '#F2BF27', '#E46A5A'],
    measures: ['Adulto (a confirmar)', 'Infantil (a confirmar)'],
    tabs: {
      uso: 'Imprima os dados do paciente e feche no pulso com o fecho de uso único.',
      caracteristicas: 'Material macio, resistente à água e a álcool, campo imprimível.',
      diferenciais: 'Cores para sinalização de risco (alergia, queda, etc.).',
    },
  },
  {
    id: 'pulseira-eventos',
    line: 'pulseiras',
    name: 'Pulseira para eventos',
    short: 'Controle de acesso com a identidade do seu evento, numerada e inviolável.',
    mock: 'band',
    variant: 'event',
    colors: ['#F29727', '#1E212E', '#7AA7E0', '#7BC4A4', '#E58FA8'],
    measures: [],
    custom: true,
    tabs: {
      uso: 'Coloque no pulso na entrada. O fecho adesivo não permite reaproveitamento.',
      caracteristicas: 'Personalização de cor, logo e numeração sequencial.',
      diferenciais: 'Produção em volume com prazo de indústria.',
    },
  },
  {
    id: 'pulseira-parques',
    line: 'pulseiras',
    name: 'Pulseira para parques aquáticos',
    short: 'Resiste à água, ao sol e ao cloro durante o dia inteiro de uso.',
    mock: 'band',
    variant: 'water',
    colors: ['#7AA7E0', '#7BC4A4', '#F2BF27', '#E58FA8'],
    measures: [],
    custom: true,
    tabs: {
      uso: 'Identifique visitantes, pacotes e áreas de acesso.',
      caracteristicas: 'Material resistente à água, cores vivas, fecho seguro.',
      diferenciais: 'Conforto para usar o dia todo.',
    },
  },
];

export const faqs = {
  'cme-hospitalar': [
    ['Qual etiqueta usar com autoclave classe B?', 'A etiqueta duplo uso a vapor é indicada para autoclaves a vapor, incluindo classe B. Em caso de dúvida sobre o seu equipamento, fale com um especialista.'],
    ['A fita indicadora deixa resíduo no pacote?', 'Não. O adesivo foi desenvolvido para ser removido sem deixar resíduo em tecido, papel crepado ou SMS.'],
    ['As etiquetas atendem à RDC-15?', 'As etiquetas apoiam o registro de rastreabilidade exigido pela RDC-15 para processamento de produtos para saúde.'],
    ['Vocês têm etiqueta para peróxido de hidrogênio?', 'Sim. A etiqueta PPH tem indicador específico para esterilização por peróxido de hidrogênio.'],
  ],
  grafdental: [
    ['Vocês atendem à nova RDC odontológica?', 'Sim. A linha grafDENTAL foi pensada para que o consultório registre cada ciclo de esterilização de forma simples.'],
    ['Preciso de impressora para usar a etiqueta grafDENTAL?', 'Não. A etiqueta tem campos para anotação manual de data, lote e responsável.'],
    ['Onde compro grafDENTAL?', 'Pelos distribuidores credenciados ou falando direto com um especialista grafMED.'],
  ],
  'rotulos-etiquetas': [
    ['Qual a quantidade mínima de rótulos?', 'Depende do formato e do material. Fale com um especialista e receba a indicação para o seu volume.'],
    ['Vocês criam a arte do rótulo?', 'Produzimos a partir da sua arte final e orientamos sobre sangria, cores e acabamento.'],
    ['Os rótulos servem para aplicação automática?', 'Sim. Produzimos em bobina com tubete e sentido de rebobinamento conforme a sua máquina.'],
  ],
  pulseiras: [
    ['A pulseira resiste à água?', 'Sim. As pulseiras são resistentes à água, e a linha para parques aquáticos foi pensada para o dia inteiro de uso.'],
    ['Posso personalizar com o logo do evento?', 'Sim. Cor, logo e numeração sequencial podem ser personalizados.'],
    ['A pulseira hospitalar pode ser impressa?', 'Sim. Ela tem campo para impressão dos dados do paciente.'],
  ],
  conversao: [
    ['Como funciona o serviço de conversão de matéria-prima?', 'Você envia a bobina ou o rolo de material. A grafMED corta, monta, embala e entrega pronto para uso ou revenda.'],
    ['Quais materiais vocês convertem?', 'Velcro, feltro, micropore, fita de bordo, silicone em rolo, espumas técnicas, fitas industriais e materiais adesivos, entre outros.'],
    ['Preciso ter máquina de corte?', 'Não. A ideia é justamente tirar essa etapa da sua planta.'],
  ],
  geral: [
    ['A grafMED fabrica caixas, sacolas ou embalagens?', 'Não. A grafMED fabrica etiquetas, rótulos, fitas indicadoras, pulseiras e faz conversão de matéria-prima.'],
    ['Como peço um orçamento?', 'Pelo botão "Fale com um especialista", que abre o WhatsApp, ou adicionando produtos ao orçamento e enviando a lista.'],
    ['Vocês atendem todo o Brasil?', 'Sim, com uma rede de distribuição nacional e atendimento direto da fábrica.'],
    ['Em quanto tempo recebo retorno?', 'Pelo WhatsApp o retorno é rápido, em horário comercial.'],
  ],
};

export const homeFaq = [
  faqs['cme-hospitalar'][0],
  faqs.grafdental[0],
  faqs.conversao[0],
  faqs.geral[0],
];

export const testimonials = [
  ['Coordenação de CME', 'Hospital de referência · SP', 'Qualidade e prazo sempre mantidos. A equipe confia na leitura do indicador.'],
  ['Gerência de operações', 'Indústria moveleira · SP', 'A conversão tirou uma etapa inteira da nossa linha de montagem.'],
  ['Gestão clínica', 'Rede odontológica', 'Atende à nova RDC sem complicar a rotina do consultório.'],
];

export const articles = [
  {
    slug: 'etiqueta-certa-autoclave-classe-b',
    cat: 'Artigos técnicos',
    date: '2026-10-28',
    title: 'Como escolher a etiqueta certa para autoclave classe B',
    excerpt: 'Indicador, adesivo e invólucro: os três pontos que definem se a etiqueta vai funcionar no seu ciclo.',
    body: [
      ['h2', 'O que muda na autoclave classe B'],
      ['p', 'Autoclaves classe B fazem pré-vácuo fracionado, o que exige etiquetas cujo adesivo e indicador suportem as variações de pressão e temperatura do ciclo.'],
      ['h2', 'Indicador'],
      ['p', 'O indicador químico deve ser específico para vapor e apresentar mudança de cor clara, fácil de ler pela equipe na liberação do material.'],
      ['h2', 'Adesivo e invólucro'],
      ['p', 'O adesivo precisa aderir ao papel grau cirúrgico, SMS ou tecido sem descolar no ciclo e sem deixar resíduo na abertura.'],
      ['h2', 'Rastreabilidade'],
      ['p', 'Etiquetas duplo uso permitem que uma parte fique no pacote e outra siga para o registro, fechando o ciclo de rastreabilidade.'],
    ],
  },
  {
    slug: 'rastreabilidade-cme-rdc-15',
    cat: 'Artigos técnicos',
    date: '2026-09-15',
    title: 'Rastreabilidade na CME: o que a RDC-15 pede na prática',
    excerpt: 'Um resumo direto dos registros que a CME precisa manter e de como a identificação ajuda.',
    body: [
      ['h2', 'Por que rastrear'],
      ['p', 'A rastreabilidade permite saber por qual ciclo passou cada material usado no paciente, o que é essencial para a segurança e para auditorias.'],
      ['h2', 'O papel da etiqueta'],
      ['p', 'A etiqueta concentra lote, data, ciclo e responsável em um único ponto, que acompanha o pacote até o uso.'],
    ],
  },
  {
    slug: 'grafmed-feira-hospitalar-2026',
    cat: 'Eventos e feiras',
    date: '2026-05-20',
    title: 'grafMED na feira do setor hospitalar (exemplo)',
    excerpt: 'Exemplo de post de evento: estande, lançamentos e encontros com distribuidores.',
    body: [
      ['p', 'Este é um post de exemplo para a categoria Eventos e feiras. O conteúdo final será publicado pela equipe da grafMED.'],
    ],
  },
];

export const materials = ['Velcro', 'Feltro', 'Micropore', 'Fita de bordo (madeira)', 'Silicone em rolo', 'Espuma técnica', 'Fitas industriais', 'Materiais adesivos'];

// Mapa de redirecionamentos 301 (URLs atuais -> novas). Revisar com o export de URLs indexadas do Wix.
export const redirects = [
  ['/logistica', '/produtos/rotulos-etiquetas.html'],
  ['/distribuidores', '/canal-parceiro.html'],
  ['/artigos-e-noticias', '/noticias.html'],
  ['/servicos-e-oem', '/produtos/conversao-materia-prima.html'],
  ['/quem-somos', '/quem-somos.html'],
  ['/hospitalar', '/produtos/cme-hospitalar.html'],
  ['/odontologico', '/produtos/grafdental.html'],
  ['/pulseiras', '/produtos/pulseiras.html'],
  ['/contato', '/contato.html'],
];
