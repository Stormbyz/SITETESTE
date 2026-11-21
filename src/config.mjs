// Configuração central. É copiada para site/assets/js/config.js no build.
// Dados de contato conferidos no site atual (grafmed.ind.br). O endereço muda quando o galpão do Jaraguá ficar pronto.
export const config = {
  whatsapp: '5511945610928', // (11) 94561-0928, confirmar se é o WhatsApp comercial
  email: 'comercial@grafmed.ind.br',
  phone: '+55 (11) 2777-5001',
  phoneHref: '+551127775001',
  address: 'R. Horácio Vergueiro Rudge, 495, Casa Verde, São Paulo/SP, CEP 02512-060',
  mapEmbed: '', // URL do embed do Google Maps: preencher quando o galpão novo estiver pronto
  instagram: 'https://www.instagram.com/grafmed.oficial/',
  linkedin: 'https://www.linkedin.com/company/grafmed/',
  // Endpoint opcional para receber formulários (Wix Forms, webhook). Vazio = envio por e-mail (mailto).
  formEndpoint: '',
  // Rastreamento Google Ads + GA4 (códigos do site atual, preservar). Ative só na publicação.
  tracking: {
    enabled: false,
    ads: 'AW-674888037',
    ga4: 'G-3FPHZXN63W',
    whatsappLabel: 'AW-674888037/WHATSAPP_LABEL',
    obrigadoLabel: 'AW-674888037/OBRIGADO_LABEL',
  },
};
