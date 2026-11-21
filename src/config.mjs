// Configuração central. É copiada para site/assets/js/config.js no build.
export const config = {
  // Número do WhatsApp comercial no formato internacional, só dígitos (ex.: 5511912345678).
  // PLACEHOLDER: substituir pelo número oficial da grafMED.
  whatsapp: '5511900000000',
  email: 'comercial@grafmed.ind.br', // a confirmar com a grafMED
  phone: '+55 (11) 0000-0000', // a confirmar
  address: 'Jaraguá · São Paulo/SP', // endereço completo do galpão novo: a grafMED envia quando estiver pronto
  mapEmbed: '', // URL do embed do Google Maps — fica vazio até o galpão novo ficar pronto
  instagram: 'https://www.instagram.com/grafmed.oficial/',
  linkedin: 'https://www.linkedin.com/company/grafmed/',
  // Endpoint opcional para receber formulários (ex.: Wix Forms / webhook). Vazio = envio por e-mail (mailto).
  formEndpoint: '',
  // Rastreamento Google Ads + GA4 (códigos do site atual — preservar). Ative só na publicação.
  tracking: {
    enabled: false,
    ads: 'AW-674888037',
    ga4: 'G-3FPHZXN63W',
    // Rótulos de conversão (fornecidos pela SPiCOM8)
    whatsappLabel: 'AW-674888037/WHATSAPP_LABEL',
    obrigadoLabel: 'AW-674888037/OBRIGADO_LABEL',
  },
};
