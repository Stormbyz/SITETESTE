// MAIS VENDIDO DA SEMANA — rotação automática.
// Como funciona: o site calcula a semana do ano (ISO) e mostra o próximo item desta lista, em rodízio.
// A equipe só mantém a lista (ordem = ordem do rodízio). Para fixar um produto numa semana específica,
// use "fixo": { "2026-W48": "id-do-produto" }. Nenhuma edição de página é necessária.
// Na versão Wix: esta lista vira uma Coleção do CMS (campos: produto, ordem, ativo) e o mesmo cálculo roda em Velo.
window.GM_DESTAQUES = {
  rodizio: [
    { id: 'etiqueta-duplo-uso-vapor', name: 'Etiqueta duplo uso a vapor', line: 'CME Hospitalar', mock: 'roll',
      desc: 'Indicador químico para esterilização a vapor. Uma parte fica no pacote, a outra vai para o registro do ciclo.',
      url: 'produtos/cme-hospitalar/etiqueta-duplo-uso-vapor.html' },
    { id: 'fita-indicadora-vapor', name: 'Fita indicadora para autoclave', line: 'CME Hospitalar', mock: 'tape',
      desc: 'Muda de cor após o processo. Indicação visual imediata para a CME, sem etapa extra.',
      url: 'produtos/cme-hospitalar/fita-indicadora-vapor.html' },
    { id: 'etiqueta-duplo-uso-grafdental', name: 'Etiqueta duplo uso grafDENTAL', line: 'grafDENTAL', mock: 'roll',
      desc: 'Registra o ciclo da autoclave do consultório e vai direto para a ficha do paciente.',
      url: 'produtos/grafdental/etiqueta-duplo-uso-grafdental.html' },
    { id: 'pulseira-hospitalar', name: 'Pulseira de identificação hospitalar', line: 'Pulseiras', mock: 'band',
      desc: 'Confortável, resistente à água e a álcool, com campo imprimível para os dados do paciente.',
      url: 'produtos/pulseiras/pulseira-hospitalar.html' }
  ],
  fixo: {}
};
