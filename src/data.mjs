// Conteúdo institucional do site grafMED.
// Produtos: src/products.json (extraído do site atual + Drive da marca). Artigos: src/articles.json (blog atual).
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
// Ordem de exibição: produtos principais primeiro, filtros no fim da linha hospitalar (briefing).
const FIRST = ['etiqueta-duplo-uso-para-esterilizacao-a-vapor', 'etiqueta-duplo-uso-para-esterilizacao', 'etiqueta-duplo-uso-para-etiquetadoras', 'etiqueta-duplo-uso-vpph-para-etiquetadoras', 'etiqueta-colorida-para-esterilizacao', 'fita-identificadora-para-instrumental-cirurgico', 'micro-etiqueta-com-qr-code', 'tag-duplo-uso-com-lacre-para-containers', 'etiquetas-adesivas-para-seringas'];
const LAST = ['filtro-circular-de-papel-hidrofobo-para-containers', 'filtro-para-conteiner-para-esterilizacao-retangular'];
const rank = (p) => (FIRST.includes(p.id) ? FIRST.indexOf(p.id) : LAST.includes(p.id) ? 100 + LAST.indexOf(p.id) : p.img ? 50 : 90);
export const products = JSON.parse(readFileSync(join(here, 'products.json'), 'utf8')).sort((a, b) => rank(a) - rank(b));
export const articles = JSON.parse(readFileSync(join(here, 'articles.json'), 'utf8'));

export const site = {
  name: 'grafMED',
  url: 'https://www.grafmed.ind.br',
  description:
    'Indústria brasileira de etiquetas, fitas e indicadores para rastreabilidade na esterilização, linha grafDENTAL, rótulos, pulseiras e conversão de matéria-prima. Mais de 20 anos de tecnologia nacional.',
};

// Linhas de produto (menu Produtos). chip = etiqueta curta no card.
export const lines = [
  {
    slug: 'cme-hospitalar', chip: 'CME', name: 'CME Hospitalar',
    short: 'Etiquetas, fitas e indicadores para a esterilização.',
    audience: 'Enfermagem de CME, CCIH e compras hospitalares',
    title: 'Rastreabilidade do instrumental, <strong>da autoclave ao prontuário.</strong>',
    text: 'Etiquetas com indicador químico Tipo 1, fitas identificadoras e tags para a Central de Material e Esterilização, conforme a RDC-15.',
    img: 'assets/img/fotos/rolos-duplo-uso.webp', original: true, norms: ['RDC-15 ANVISA', 'ABNT NBR ISO 26825:2021'],
  },
  {
    slug: 'grafdental', chip: 'DENTAL', name: 'grafDENTAL',
    short: 'Identificação para o consultório, conforme a nova RDC.',
    audience: 'Dentistas, clínicas e distribuidores dentais',
    title: 'A esterilização do consultório, <strong>conforme a RDC 1002.</strong>',
    text: 'A linha grafDENTAL leva a rastreabilidade da CME hospitalar para a rotina do consultório odontológico, de forma simples e prática.',
    img: 'assets/img/fotos/grafdental-pacote.webp', original: true, norms: ['RDC 1002/2025 ANVISA'],
  },
  {
    slug: 'rotulos-etiquetas', chip: 'RÓTULOS', name: 'Rótulos e Etiquetas',
    short: 'Rótulos com a sua arte, medida e acabamento.',
    audience: 'Indústria, alimentos, delivery e varejo',
    title: 'Etiquetas que garantem <strong>integridade e rastreio do seu produto.</strong>',
    text: 'Lacres, validade, QR Code, despacho e rótulos personalizados para alimentos, food service, farmácia e logística.',
    img: 'assets/img/fotos/etiquetas-rolos.webp', original: false, norms: [],
  },
  {
    slug: 'pulseiras', chip: 'PULSEIRAS', name: 'Pulseiras de Identificação',
    short: 'Para hospitais, eventos e parques.',
    audience: 'Hospitais, eventos e parques aquáticos',
    title: 'Identificação segura <strong>do começo ao fim.</strong>',
    text: 'Pulseiras para identificação de pacientes e classificação de risco, e modelos personalizados para eventos e parques.',
    img: 'assets/img/fotos/pulseiras-leque.webp', original: false, norms: [],
  },
];

export const extras = [
  { slug: 'conversao-materia-prima', chip: 'CONVERSÃO', name: 'Conversão de Matéria-Prima', short: 'Você envia o material, a gente converte.', img: 'assets/img/fotos/industria.webp' },
  { slug: 'projetos', chip: 'P&D', name: 'Projetos sob medida', short: 'Não encontrou no site? A grafMED desenvolve.', img: 'assets/img/fotos/autoclave-pb.webp' },
];

export const faqs = {
  'cme-hospitalar': [
    ['Qual etiqueta usar na autoclave a vapor?', 'A Etiqueta Duplo Uso para Esterilização a Vapor tem indicador químico Tipo 1 que muda de rosa para marrom ou preto e dupla camada adesiva: uma parte fica no pacote e a outra vai para o prontuário.'],
    ['Vocês têm etiqueta para peróxido de hidrogênio (VPPH)?', 'Sim. As etiquetas VPPH têm indicador específico para esterilização a baixa temperatura por plasma de peróxido de hidrogênio, inclusive para etiquetadoras.'],
    ['As etiquetas atendem à RDC-15?', 'Sim. As etiquetas apoiam os registros de rastreabilidade previstos na RDC-15 para o processamento de produtos para saúde.'],
    ['A fita identificadora resiste à esterilização?', 'Sim. As fitas autoadesivas para instrumental estão disponíveis em até 19 cores e diversos padrões, e foram desenvolvidas para os processos de esterilização.'],
  ],
  grafdental: [
    ['A linha grafDENTAL atende à nova RDC 1002?', 'Sim. As etiquetas grafDENTAL foram desenvolvidas para que o consultório registre cada ciclo de esterilização conforme a RDC 1002/2025.'],
    ['Preciso de impressora para usar as etiquetas?', 'Não. As etiquetas têm campos para preenchimento manual de data, validade, lote e responsável.'],
    ['Como sei que o ciclo foi concluído?', 'O indicador químico Tipo 1 muda de cor após o processo a vapor, confirmando visualmente a passagem pelo ciclo.'],
  ],
  'rotulos-etiquetas': [
    ['Vocês fazem etiquetas com a marca do meu restaurante?', 'Sim. Os lacres, etiquetas de validade e de O.S. podem vir com ou sem marca d\'água personalizada.'],
    ['Qual etiqueta usar para congelados?', 'A Etiqueta Validade Congelados suporta até -30°C e umidade, com preenchimento manual.'],
    ['Vocês produzem rótulos personalizados?', 'Sim. Desenvolvemos rótulos para embalagens com a sua arte, medida e acabamento.'],
  ],
  pulseiras: [
    ['As pulseiras servem para classificação de risco?', 'Sim. As pulseiras de identificação hospitalar são usadas na classificação de risco (Protocolo de Manchester) e na identificação do paciente.'],
    ['Posso personalizar as pulseiras?', 'Sim. Cor, texto e numeração podem ser personalizados conforme a aplicação.'],
    ['Vocês fazem pulseiras para eventos?', 'Sim. Fale com um especialista para modelos de eventos e parques.'],
  ],
  conversao: [
    ['Como funciona o serviço de conversão de matéria-prima?', 'Você envia a bobina ou o rolo de material. A grafMED corta, monta, embala e entrega pronto para uso ou revenda.'],
    ['Quais materiais vocês convertem?', 'Velcro, feltro, micropore, fita de bordo, silicone em rolo, espumas técnicas, fitas industriais e materiais adesivos, entre outros.'],
    ['Preciso ter máquina de corte?', 'Não. A ideia é justamente tirar essa etapa da sua planta.'],
  ],
  geral: [
    ['A grafMED fabrica caixas, sacolas ou embalagens?', 'Não. A grafMED fabrica etiquetas, rótulos, fitas, indicadores, pulseiras e faz conversão de matéria-prima.'],
    ['Como peço um orçamento?', 'Pelo botão "Fale com um especialista", que abre o WhatsApp, ou adicionando produtos ao orçamento e enviando a lista.'],
    ['Vocês atendem todo o Brasil?', 'Sim, com uma rede de distribuição nacional e atendimento direto da fábrica em São Paulo.'],
    ['Há quanto tempo a grafMED está no mercado?', 'Há mais de 20 anos, com tecnologia 100% nacional em identificação e rastreabilidade.'],
  ],
};

export const homeFaq = [faqs['cme-hospitalar'][0], faqs.grafdental[0], faqs.conversao[0], faqs.geral[0]];

// Depoimentos: textos provisórios, substituir por depoimentos autorizados.
export const testimonials = [
  ['Coordenação de CME', 'Hospital de referência, São Paulo', 'Qualidade e prazo sempre mantidos. A equipe confia na leitura do indicador.'],
  ['Gerência de operações', 'Indústria, São Paulo', 'A conversão tirou uma etapa inteira da nossa linha de montagem.'],
  ['Gestão clínica', 'Rede odontológica', 'Atende à nova RDC sem complicar a rotina do consultório.'],
];

// Etapas do ciclo (seção com rolagem na Home)
export const cycle = [
  ['01', 'Preparo', 'O material é limpo, inspecionado e embalado.', 'assets/img/fotos/cme-equipe.webp'],
  ['02', 'Identificação', 'A etiqueta grafMED registra lote, data, validade e responsável.', 'assets/img/fotos/grafdental-pacote.webp'],
  ['03', 'Esterilização', 'Na autoclave, o indicador químico Tipo 1 muda de cor.', 'assets/img/fotos/autoclave-luvas.webp'],
  ['04', 'Armazenamento', 'Pacotes identificados e organizados até o uso.', 'assets/img/fotos/cme-pacotes.webp'],
  ['05', 'Prontuário', 'A parte destacável vai para o registro do paciente.', 'assets/img/fotos/instrumentais-fita.webp'],
];

export const materials = ['Velcro', 'Feltro', 'Micropore', 'Fita de bordo (madeira)', 'Silicone em rolo', 'Espuma técnica', 'Fitas industriais', 'Materiais adesivos'];

// Mapa de redirecionamentos 301 (URLs atuais para as novas). Revisar com o export de URLs indexadas.
export const redirects = [
  ['/quemsomos', '/quem-somos.html'],
  ['/medico-hospitalar', '/produtos/cme-hospitalar.html'],
  ['/linha-medico-hospitalar', '/produtos/cme-hospitalar.html'],
  ['/linha-odontologica', '/produtos/grafdental.html'],
  ['/linha-odontol-gica', '/produtos/grafdental.html'],
  ['/logistica', '/produtos/rotulos-etiquetas.html'],
  ['/linha-logistica', '/produtos/rotulos-etiquetas.html'],
  ['/servicos-e-oem', '/produtos/conversao-materia-prima.html'],
  ['/linha-servicos-e-oem', '/produtos/conversao-materia-prima.html'],
  ['/produtos', '/produtos/index.html'],
  ['/distribuidores', '/canal-parceiro.html'],
  ['/artigosenoticias', '/noticias.html'],
  ['/orcamentos', '/orcamento.html'],
  ['/contato', '/contato.html'],
];
