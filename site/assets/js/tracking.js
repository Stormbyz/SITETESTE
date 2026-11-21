/* Rastreamento Google Ads + GA4 — preservar os códigos do site atual.
   - Tag base AW-674888037 + GA4 G-3FPHZXN63W em todas as páginas.
   - "Conversao Google Ads - WhatsApp": disparada em cada clique para o WhatsApp (equivale ao código Body-fim de todas as páginas).
   - "Conversao Google Ads - Obrigado": disparada ao abrir /obrigado.html (equivale ao código Head da página /obrigado).
   Só carrega quando GM_CONFIG.tracking.enabled = true E o visitante aceitou os cookies (LGPD).
   Na publicação, substituir os rótulos de conversão pelos fornecidos pela SPiCOM8 e validar no Tag Assistant. */
(function () {
  var C = (window.GM_CONFIG || {}).tracking || {};
  var loaded = false;
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  function consent() { try { return JSON.parse(localStorage.getItem('gm_cookies')) === true; } catch (e) { return false; } }

  window.gmLoadTracking = function () {
    if (loaded || !C.enabled || !consent()) return;
    loaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + C.ads;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', C.ads, { allow_enhanced_conversions: true });
    gtag('config', C.ga4);
    if (window.GM_CONVERSION_PAGE) gtag('event', 'conversion', { send_to: C.obrigadoLabel });
  };

  window.gmTrack = function (ev, data) {
    if (!loaded) return;
    if (ev === 'whatsapp') gtag('event', 'conversion', { send_to: C.whatsappLabel });
    else gtag('event', ev, data || {});
  };

  window.gmLoadTracking();
})();
