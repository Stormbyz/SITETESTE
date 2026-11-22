// BANNERS DAS PÁGINAS: editável pela equipe, sem depender do desenvolvedor.
// Cada banner é uma composição em camadas de fotos SEM FUNDO (pasta assets/img/recorte), com profundidade 3D.
//   camadas: x e y = centro da foto em % da área, w = largura em %, z = profundidade (1 fundo a 5 frente), rot = giro em graus.
//   selos:   etiquetas informativas flutuantes (texto, x, y em %).
// "titulo" aceita <strong> para a parte em negrito. "tema": "laranja" (gradiente da marca) ou "claro".
// A Home aceita vários banners (carrossel). As demais páginas usam um banner cada.
// Na versão Wix: Coleção do CMS "Banners" (página, ordem, título, texto, botão, link, imagens).
window.GM_BANNERS = {
  home: [
    {
      selo: 'Identificação e rastreabilidade',
      titulo: 'Cada instrumental tem um histórico. <strong>Nós o tornamos visível.</strong>',
      texto: 'Etiquetas com indicador químico, fitas e tags para CME, odontologia e indústria. Mais de 20 anos de tecnologia nacional.',
      tema: 'laranja',
      botao: 'Ver linha CME', link: 'produtos/cme-hospitalar.html',
      camadas: [
        { img: 'assets/img/recorte/x-fita-identificadora-para-instrumental-cirurgico.webp', x: 30, y: 34, w: 46, z: 1, rot: -14 },
        { img: 'assets/img/recorte/x-app-container-tag.webp', x: 78, y: 26, w: 34, z: 2, rot: 6 },
        { img: 'assets/img/recorte/x-app-rolos-vapor.webp', x: 54, y: 60, w: 66, z: 4, rot: -3 },
      ],
      selos: [{ texto: 'Indicador químico Tipo 1', x: 6, y: 66 }, { texto: 'Conforme RDC-15', x: 70, y: 88 }],
    },
    {
      selo: 'Nova RDC 1002',
      titulo: 'grafDENTAL: <strong>o consultório em conformidade.</strong>',
      texto: 'Etiquetas duplo uso com indicador para a autoclave do consultório, com campos para cada registro.',
      tema: 'claro',
      botao: 'Conhecer grafDENTAL', link: 'produtos/grafdental.html',
      camadas: [
        { img: 'assets/img/recorte/x-etiqueta-duplo-uso-grafdental.webp', x: 76, y: 70, w: 40, z: 5, rot: 10 },
        { img: 'assets/img/recorte/x-grafdental-pacote.webp', x: 44, y: 50, w: 44, z: 3, rot: -6 },
      ],
      selos: [{ texto: 'Indicador azul para marrom', x: 4, y: 30 }, { texto: 'Conforme RDC 1002', x: 64, y: 14 }],
    },
    {
      selo: 'Instrumental cirúrgico',
      titulo: 'Organize e proteja o instrumental <strong>com até 19 cores.</strong>',
      texto: 'Fitas identificadoras, micro etiquetas com QR Code e protetores de ponta, resistentes à esterilização.',
      tema: 'laranja',
      botao: 'Ver fitas', link: 'produtos/cme-hospitalar/fita-identificadora-para-instrumental-cirurgico.html',
      camadas: [
        { img: 'assets/img/recorte/x-micro-qr.webp', x: 82, y: 40, w: 22, z: 2, rot: 6 },
        { img: 'assets/img/recorte/x-fita-identificadora-para-instrumental-cirurgico.webp', x: 46, y: 46, w: 70, z: 3, rot: -4 },
        { img: 'assets/img/recorte/x-protetor-de-policarbonato-para-instrumental-cirurgico.webp', x: 30, y: 78, w: 40, z: 5, rot: -10 },
      ],
      selos: [{ texto: 'Até 19 cores', x: 8, y: 16 }, { texto: 'Rastreio individual com QR Code', x: 56, y: 90 }],
    },
  ],
  'cme-hospitalar': {
    tema: 'laranja',
    camadas: [
      { img: 'assets/img/recorte/x-app-container-tag.webp', x: 76, y: 26, w: 36, z: 1, rot: 6 },
      { img: 'assets/img/recorte/x-etiqueta-duplo-uso-para-etiquetadoras.webp', x: 28, y: 32, w: 44, z: 2, rot: -8 },
      { img: 'assets/img/recorte/x-app-rolos-vapor.webp', x: 54, y: 64, w: 64, z: 4, rot: -3 },
    ],
    selos: [{ texto: 'Indicador químico Tipo 1', x: 4, y: 74 }],
  },
  grafdental: {
    tema: 'claro',
    camadas: [
      { img: 'assets/img/recorte/x-etiqueta-duplo-uso-grafdental.webp', x: 76, y: 68, w: 40, z: 5, rot: 10 },
      { img: 'assets/img/recorte/x-grafdental-pacote.webp', x: 44, y: 50, w: 46, z: 3, rot: -6 },
    ],
    selos: [{ texto: 'Conforme RDC 1002', x: 62, y: 14 }],
  },
  'rotulos-etiquetas': {
    tema: 'laranja',
    camadas: [
      { img: 'assets/img/recorte/x-gondola.webp', x: 30, y: 26, w: 40, z: 1, rot: -6 },
      { img: 'assets/img/recorte/x-void.webp', x: 76, y: 28, w: 38, z: 2, rot: 6 },
      { img: 'assets/img/recorte/x-rotulos.webp', x: 52, y: 64, w: 56, z: 4, rot: 0 },
    ],
    selos: [{ texto: 'Rótulos, lacres e etiquetas', x: 4, y: 88 }],
  },
  pulseiras: {
    tema: 'claro',
    camadas: [
      { img: 'assets/img/recorte/x-app-pulseiras-leque.webp', x: 34, y: 46, w: 52, z: 2, rot: -10 },
      { img: 'assets/img/recorte/x-pulseiras-de-identificacao-hospitalar.webp', x: 68, y: 56, w: 50, z: 4, rot: 4 },
    ],
    selos: [{ texto: 'Classificação de risco', x: 60, y: 12 }],
  },
  // páginas com animação 3D própria ou vídeo no banner
  'conversao-materia-prima': { tema: 'laranja', cena3d: 'conversao' },
  projetos: { tema: 'claro', video: 'assets/video/industria.mp4', poster: 'assets/video/industria.jpg' },
  noticias: { tema: 'laranja', video: 'assets/video/autoclave.mp4', poster: 'assets/video/autoclave.jpg' },
  'quem-somos': { tema: 'laranja', video: 'assets/video/autoclave.mp4', poster: 'assets/video/autoclave.jpg' },
  'canal-parceiro': {
    tema: 'claro',
    camadas: [
      { img: 'assets/img/recorte/x-app-rolos-vapor.webp', x: 50, y: 56, w: 70, z: 3, rot: -4 },
    ],
    selos: [{ texto: 'Exija o selo Original', x: 6, y: 18 }],
  },
  contato: { tema: 'laranja', video: 'assets/video/industria.mp4', poster: 'assets/video/industria.jpg' },
};
