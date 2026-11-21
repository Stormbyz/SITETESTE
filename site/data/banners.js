// BANNERS DAS PÁGINAS: editável pela equipe, sem depender do desenvolvedor.
// Para trocar um banner: troque a imagem (pasta assets/img/banners ou fotos) e os textos abaixo, salve e publique.
// "titulo" aceita <strong> para a parte em negrito. "tema": "laranja" (fundo gradiente da marca) ou "claro".
// "imagemModo": "produto" (foto de produto, com animação 3D) ou "foto" (foto de aplicação, recortada).
// A Home aceita vários banners (carrossel). As demais páginas usam um banner cada.
// Na versão Wix: Coleção do CMS "Banners" (página, ordem, imagem, título, texto, botão, link, ativo).
window.GM_BANNERS = {
  home: [
    {
      selo: 'Identificação e rastreabilidade',
      titulo: 'Cada instrumental tem um histórico. <strong>Nós o tornamos visível.</strong>',
      texto: 'Etiquetas com indicador químico, fitas e tags para CME, odontologia e indústria. Mais de 20 anos de tecnologia nacional.',
      imagem: 'assets/img/produtos/etiqueta-duplo-uso-para-esterilizacao.webp',
      imagemModo: 'produto',
      tema: 'laranja',
      botao: 'Ver linha CME', link: 'produtos/cme-hospitalar.html',
    },
    {
      selo: 'Nova RDC 1002',
      titulo: 'grafDENTAL: <strong>o consultório em conformidade.</strong>',
      texto: 'Etiquetas duplo uso com indicador para a autoclave do consultório, com campos para cada registro.',
      imagem: 'assets/img/fotos/grafdental-pacote.webp',
      imagemModo: 'produto',
      tema: 'claro',
      botao: 'Conhecer grafDENTAL', link: 'produtos/grafdental.html',
    },
    {
      selo: 'Fitas identificadoras',
      titulo: 'Organize o instrumental <strong>com até 19 cores.</strong>',
      texto: 'Fitas autoadesivas para segregar e identificar instrumentais cirúrgicos, resistentes à esterilização.',
      imagem: 'assets/img/fotos/instrumentais-fita.webp',
      imagemModo: 'foto',
      tema: 'laranja',
      botao: 'Ver fitas', link: 'produtos/cme-hospitalar/fita-identificadora-para-instrumental-cirurgico.html',
    },
  ],
  'cme-hospitalar': { imagem: 'assets/img/fotos/rolos-duplo-uso.webp', imagemModo: 'produto', tema: 'laranja' },
  grafdental: { imagem: 'assets/img/fotos/grafdental-pacote.webp', imagemModo: 'produto', tema: 'claro' },
  'rotulos-etiquetas': { imagem: 'assets/img/fotos/etiquetas-rolos.webp', imagemModo: 'produto', tema: 'laranja' },
  pulseiras: { imagem: 'assets/img/fotos/pulseiras-leque.webp', imagemModo: 'produto', tema: 'claro' },
  'conversao-materia-prima': { imagem: 'assets/img/fotos/industria.webp', imagemModo: 'foto', tema: 'laranja' },
  projetos: { imagem: 'assets/img/fotos/autoclave-pb.webp', imagemModo: 'foto', tema: 'claro' },
  noticias: { imagem: 'assets/img/fotos/autoclave-luvas.webp', imagemModo: 'foto', tema: 'laranja' },
  'quem-somos': { imagem: 'assets/img/fotos/autoclave-operador.webp', imagemModo: 'foto', tema: 'laranja' },
  'canal-parceiro': { imagem: 'assets/img/fotos/cme-pacotes.webp', imagemModo: 'foto', tema: 'claro' },
  contato: { imagem: 'assets/img/fotos/cme-equipe.webp', imagemModo: 'foto', tema: 'laranja' },
};
