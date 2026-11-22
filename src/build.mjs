// Gerador estático do site grafMED. Uso: node src/build.mjs
import { mkdirSync, writeFileSync, readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site, lines, extras, products, articles, faqs, homeFaq, testimonials, cycle, materials, redirects, hotspots } from './data.mjs';
import { config } from './config.mjs';
import { ico } from './mock.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'site');
const pages = [];

// banners editáveis (site/data/banners.js)
const BANNERS = (() => {
  const src = readFileSync(join(ROOT, 'data/banners.js'), 'utf8');
  const window = {};
  new Function('window', src)(window);
  return window.GM_BANNERS || {};
})();

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = (s) => String(s).replace(/<[^>]+>/g, '');
const lineBy = (slug) => [...lines, ...extras].find((l) => l.slug === slug);
const productUrl = (p) => `produtos/${p.line}/${p.id}.html`;
const fmtDate = (d) => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
const clients = readdirSync(join(ROOT, 'assets/img/clientes')).filter((f) => f.endsWith('.webp')).sort();
const P = (txt) => String(txt).split('\n').filter(Boolean).map((x) => `<p>${esc(x)}</p>`).join('');

// ---------- componentes ----------
const waIcon = `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z"/></svg>`;
const arrow = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;

const wa = (msg, label, cls = 'btn btn-wa', attrs = '') =>
  `<a class="${cls}" data-wa="${esc(msg)}" href="https://wa.me/${config.whatsapp}?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener" ${attrs}>${label}</a>`;

const ctaSpecialist = (msg = 'Olá! Quero falar com um especialista grafMED.', extra = '') =>
  wa(msg, `<span class="pulse" aria-hidden="true"></span>${waIcon}<span>Fale com um especialista</span>`, `btn btn-primary ${extra}`, 'data-track="whatsapp"');

const eyebrow = (t) => `<p class="eyebrow">${t}</p>`;

// Padrão de hexágonos oficial da marca (assets/img/hex). solar = traço branco sobre o laranja; white = traço laranja sobre branco
const hexes = (variant = 'solar', pos = 'right') => `<div class="hexbg hexbg-${variant} hexbg-${pos}" aria-hidden="true"></div>`;
// Hexágono arredondado em gradiente, com contorno deslocado (elemento gráfico da marca)
const hexblob = (cls = '') => `<svg class="hexblob ${cls}" viewBox="0 0 400 400" aria-hidden="true"><defs><linearGradient id="hbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FBC21A"/><stop offset="1" stop-color="#EC720B"/></linearGradient></defs><path class="hb-fill" d="M200 20 Q214 20 226 27 L345 96 Q370 110 370 138 L370 262 Q370 290 345 304 L226 373 Q200 388 174 373 L55 304 Q30 290 30 262 L30 138 Q30 110 55 96 L174 27 Q186 20 200 20Z"/><path class="hb-line" d="M230 40 Q244 40 256 47 L375 116 Q400 130 400 158 L400 282 Q400 310 375 324 L256 393 Q230 408 204 393 L85 324 Q60 310 60 282 L60 158 Q60 130 85 116 L204 47 Q216 40 230 40Z"/></svg>`;
const deco = hexes;

const accordion = (items, open = -1) => `
<div class="acc">
  ${items
    .map(
      ([q, a], i) => `<details class="acc-item"${i === open ? ' open' : ''}>
    <summary><span>${esc(q)}</span><i aria-hidden="true"></i></summary>
    <div class="acc-body">${a.startsWith('<') ? a : P(a)}</div>
  </details>`
    )
    .join('')}
</div>`;

const faqSchema = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
});

// Card em formato de etiqueta: área da foto, picote com recortes laterais e corpo
const addPayload = (p) => esc(JSON.stringify({ id: p.id, name: p.name, line: lineBy(p.line).name, url: productUrl(p), img: p.img }));
const productCard = (p, r, i = 0) => `
<article class="lab reveal" style="--d:${(i % 3) * 80}ms" data-tags="${esc(p.tags.join('|'))}">
  <div class="lab-media">
    <span class="lab-chip">${lineBy(p.line).chip}</span>
    <a href="${r(productUrl(p))}" class="lab-img" aria-label="${esc(p.name)}">${p.img ? `<img src="${r(p.img)}" alt="${esc(p.name)}" loading="lazy" width="600" height="600">` : `<span class="lab-ph">${ico('box', 40)}<small>Foto real do catálogo<br>em produção</small></span>`}</a>
    <button class="lab-add" type="button" data-add='${addPayload(p)}'>+ Adicionar ao orçamento</button>
  </div>
  <div class="lab-perf" aria-hidden="true"></div>
  <div class="lab-body">
    <h3><a href="${r(productUrl(p))}">${esc(p.name)}</a></h3>
    <p>${esc(p.short)}</p>
    <a class="lab-link" href="${r(productUrl(p))}">Ver produto ${arrow}</a>
  </div>
</article>`;

const lineCard = (l, r, i) => `
<article class="lab lab-line reveal" style="--d:${(i % 3) * 80}ms">
  <div class="lab-media">
    <span class="lab-chip">${l.chip}</span>
    <a href="${r(`produtos/${l.slug}.html`)}" class="lab-img" tabindex="-1" aria-hidden="true"><img src="${r(l.img)}" alt="" loading="lazy" width="600" height="450"></a>
    <a class="lab-add" href="${r(`produtos/${l.slug}.html`)}" tabindex="-1">Ver produtos</a>
  </div>
  <div class="lab-perf" aria-hidden="true"></div>
  <div class="lab-body">
    <h3><a href="${r(`produtos/${l.slug}.html`)}">${l.name}</a></h3>
    <p>${l.short}</p>
    <a class="lab-link" href="${r(`produtos/${l.slug}.html`)}" tabindex="-1">Ver linha ${arrow}</a>
  </div>
</article>`;

const sealImg = (r, size = 84, label = 'ORIGINAL') => `<span class="seal" style="--s:${size}px" aria-hidden="true"><img src="${r('assets/img/marca/logo.webp')}" alt=""><b>${label}</b></span>`;
const originalCallout = (r, txt = 'Produtos grafMED e grafDENTAL saem da fábrica com o selo Original. Exigir o original protege o paciente.') => `
<aside class="original reveal">
  ${sealImg(r)}
  <div><strong>Original grafMED</strong><p>${txt}</p></div>
  <a class="link" href="${r('canal-parceiro.html')}">Conheça o Canal Parceiro ${arrow}</a>
</aside>`;

const clientsBlock = (r, title = true) => `
<section class="section clients">${hexes('white', 'left')}
  <div class="wrap">
    ${title ? `<div class="sec-head center">${eyebrow('Quem confia')}<h2 class="h2">A confiança de quem é <strong>referência no mercado.</strong></h2></div>` : ''}
  </div>
  <div class="marquee" aria-label="Clientes atendidos pela grafMED">
    <div class="marquee-track">${[...clients, ...clients].map((c, i) => `<span class="client"${i >= clients.length ? ' aria-hidden="true"' : ''}><img src="${r('assets/img/clientes/' + c)}" alt="${i >= clients.length ? '' : 'Logo de cliente grafMED'}" loading="lazy" width="150" height="150"></span>`).join('')}</div>
  </div>
  <div class="wrap">
    <div class="testis">
      ${testimonials.map(([who, where, quote], i) => `<figure class="testi reveal" style="--d:${i * 90}ms"><svg viewBox="0 0 32 24" width="30" aria-hidden="true"><path fill="currentColor" d="M0 24V14C0 6 4 1 12 0l1 4C8 5 6 8 6 12h6v12H0zm19 0V14c0-8 4-13 12-14l1 4c-5 1-7 4-7 8h6v12H19z"/></svg><blockquote>${quote}</blockquote><figcaption><strong>${who}</strong><span>${where}</span></figcaption></figure>`).join('')}
    </div>
  </div>
</section>`;

const faqBlock = (items, r, title = 'Perguntas <strong>frequentes</strong>') => `
<section class="section faq-sec">${hexes('white', 'right')}
  <div class="wrap faq-wrap">
    <div class="faq-side reveal">${eyebrow('FAQ')}<h2 class="h2">${title}</h2><p class="muted">Não achou a sua dúvida? Um especialista responde pelo WhatsApp.</p>
      ${wa('Olá! Tenho uma dúvida sobre os produtos grafMED.', `${waIcon} Perguntar no WhatsApp`, 'btn btn-outline')}
      <a class="link" href="${r('faq.html')}">Ver todas as perguntas ${arrow}</a></div>
    ${accordion(items)}
  </div>
</section>`;

const ctaBand = (title, text, msg) => `
<section class="cta-band">
  ${deco()}
  <div class="wrap cta-in reveal">
    <div><h2 class="h2">${title}</h2><p>${text}</p></div>
    <div class="cta-actions">${ctaSpecialist(msg, 'btn-white')}<button class="btn btn-ghost-white" type="button" data-open-form>Prefiro deixar meus dados</button></div>
  </div>
</section>`;

const breadcrumb = (items, r) => `
<nav class="crumbs" aria-label="Você está em"><a href="${r('index.html')}">Home</a>${items
  .map(([t, u]) => `<span aria-hidden="true">/</span>${u ? `<a href="${r(u)}">${t}</a>` : `<span aria-current="page">${t}</span>`}`)
  .join('')}</nav>`;

// Palco do banner: composição de fotos sem fundo em camadas 3D, vídeo ou cena 3D
const stage = (r, b, eager = false) => {
  if (b.cena3d === 'conversao') return `<div class="hero-media hero-3d" data-conv3d><div class="conv-stage" data-conv-stage></div>
    <div class="conv-ui"><span class="conv-tag">Material: <b data-conv-mat>Velcro</b></span><span class="conv-tag">Peças convertidas: <b data-conv-count>0</b></span></div>
    <div class="conv-picks" role="group" aria-label="Escolha o material">${[['velcro', 'Velcro'], ['micropore', 'Micropore'], ['feltro', 'Feltro'], ['espuma', 'Espuma'], ['silicone', 'Silicone']].map(([k, n], i) => `<button type="button" data-conv-pick="${k}" aria-pressed="${i === 0}">${n}</button>`).join('')}</div></div>`;
  if (b.video) return `<div class="hero-media hero-video"><video src="${r(b.video)}" poster="${r(b.poster || '')}" autoplay muted loop playsinline preload="metadata"></video></div>`;
  const layers = (b.camadas || []).map((c, i) => `<img class="layer" src="${r(c.img)}" alt="" style="--x:${c.x}%;--y:${c.y}%;--w:${c.w}%;--z:${c.z || 3};--rot:${c.rot || 0}deg;--i:${i}" data-depth="${c.z || 3}" ${eager ? (i === b.camadas.length - 1 ? 'fetchpriority="high"' : '') : 'loading="lazy"'}>`).join('');
  const pins = (b.selos || []).map((p, i) => `<span class="pin" style="--x:${p.x}%;--y:${p.y}%;--i:${i}" data-depth="6"><i aria-hidden="true"></i>${p.texto}</span>`).join('');
  return `<div class="hero-media hero-stage" data-stage><div class="stage-floor" aria-hidden="true"></div>${layers}${pins}</div>`;
};

// Banner de página (troca interna pelo arquivo data/banners.js)
function pageHero(r, key, { crumbs = [], selo = '', title, text, actions = '', h = 'h1' }) {
  const b = BANNERS[key] || {};
  const tema = b.tema === 'claro' ? 'light' : 'orange';
  return `
<section class="hero hero-page hero--${tema}" data-banner="${key}">
  ${hexes(tema === 'light' ? 'white' : 'solar')}
  <div class="wrap hero-in">
    <div class="hero-copy">
      ${crumbs.length ? breadcrumb(crumbs, r) : ''}
      ${selo ? `<p class="selo">${selo}</p>` : ''}
      <${h} class="display">${title}</${h}>
      ${text ? `<p class="lead">${text}</p>` : ''}
      ${actions ? `<div class="hero-cta">${actions}</div>` : ''}
    </div>
    ${stage(r, b, true)}
  </div>
</section>`;
}

function homeHero(r) {
  const slides = BANNERS.home || [];
  return `
<section class="hero hero-home" data-carousel aria-roledescription="carrossel" aria-label="Destaques">
  <div class="slides" data-slides>
    ${slides
      .map((s, i) => {
        const tema = s.tema === 'claro' ? 'light' : 'orange';
        const H = i === 0 ? 'h1' : 'h2';
        return `<div class="slide hero--${tema}${i === 0 ? ' is-on' : ''}" role="group" aria-roledescription="slide" aria-label="${i + 1} de ${slides.length}"${i ? ' aria-hidden="true"' : ''}>
        ${hexes(tema === 'light' ? 'white' : 'solar')}
        <div class="wrap hero-in">
          <div class="hero-copy">
            <p class="selo">${s.selo || ''}</p>
            <${H} class="display">${s.titulo}</${H}>
            <p class="lead">${s.texto}</p>
            <div class="hero-cta">${ctaSpecialist('Olá! Vim pela página inicial e quero falar com um especialista grafMED.', 'btn-lg')}<a class="btn btn-outline btn-lg" href="${r(s.link)}">${s.botao} ${arrow}</a></div>
          </div>
          ${stage(r, s, i === 0)}
        </div>
      </div>`;
      })
      .join('')}
  </div>
  <div class="wrap hero-nav">
    <div class="dots" role="tablist" aria-label="Escolher destaque">${slides.map((_, i) => `<button role="tab" aria-selected="${i === 0}" aria-label="Destaque ${i + 1}" data-dot="${i}"><i></i></button>`).join('')}</div>
    <div class="arrows"><button type="button" data-prev aria-label="Anterior">${arrow}</button><button type="button" data-next aria-label="Próximo">${arrow}</button></div>
  </div>
</section>`;
}

// Etiqueta 3D com indicador químico Tipo 1: puxe a linha e a faixa muda de rosa para marrom
const indicatorSim = (r, compact = false) => `
<section class="section ind-sec${compact ? ' compact' : ''}" data-ind3d>
  <div class="wrap ind-in">
    <div class="ind-copy reveal">
      <p class="box-tag">Indicador químico Tipo 1</p>
      <h2 class="h2">Entenda como funciona <strong>a mudança de cor na esterilização.</strong></h2>
      <p class="muted">A faixa indicadora da etiqueta grafMED sai da fábrica rosa e fica marrom depois do ciclo a vapor. Arraste a linha da esquerda para a direita, do antes ao depois do processo. Gire e aproxime para ver o indicador de perto.</p>
      <div class="ind-panel">
        <div class="ind-row"><span>Autoclave a vapor</span><b data-ind-temp>25 °C</b></div>
        <div class="ind-bar"><i data-ind-bar></i></div>
        <div class="ind-legend"><span><i class="sw sw-pink"></i>Rosa: antes do processo</span><span><i class="sw sw-brown"></i>Marrom: processo concluído</span></div>
        <p class="ind-status" data-ind-status aria-live="polite">Arraste a linha para a direita para iniciar o ciclo a vapor.</p>
        <div class="ind-actions"><button class="btn btn-primary btn-sm" type="button" data-ind-play>Simular ciclo completo</button><button class="btn btn-outline btn-sm" type="button" data-ind-reset>Reiniciar</button></div>
      </div>
    </div>
    <div class="ind-visual reveal">
      <div class="ind-stage" data-ind-stage>
        <div class="ind-tools" role="group" aria-label="Zoom da etiqueta">
          <button type="button" data-zoom-in aria-label="Aproximar">+</button>
          <button type="button" data-zoom-out aria-label="Afastar">−</button>
          <button type="button" class="wide" data-focus>Ver o indicador de perto</button>
        </div>
        <div class="sweep-line" data-sweep-line aria-hidden="true"><span class="sl-a">Antes</span><span class="sl-b">Depois</span></div>
        <div class="sweep" data-sweep>
          <span class="sw-lbl">Antes do processo</span>
          <div class="sw-track" data-track><div class="sw-fill"></div><button class="pull" type="button" data-pull role="slider" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="Arraste para a direita para simular a esterilização"><span class="pull-grip" aria-hidden="true"></span>Arraste</button></div>
          <span class="sw-lbl">Depois do processo</span>
        </div>
        <p class="ind-hint">Arraste para girar · role ou use + e − para aproximar</p>
      </div>
    </div>
  </div>
</section>`;

// Cenas das etapas do ciclo: fotos sem fundo em 3D, vídeo real da autoclave e prontuário ilustrado
const cycleScenes = (r) => {
  const scenes = [
    `<div class="cs-layers"><img class="cl" style="--x:40%;--y:46%;--w:78%;--rot:-8deg" src="${r('assets/img/recorte/x-fita-identificadora-para-instrumental-cirurgico.webp')}" alt="Instrumental cirúrgico"><img class="cl" style="--x:70%;--y:72%;--w:46%;--rot:10deg" src="${r('assets/img/recorte/x-protetor-de-policarbonato-para-instrumental-cirurgico.webp')}" alt="Protetor de ponta para instrumental"></div><span class="cs-badge">Instrumental limpo, inspecionado e protegido</span>`,
    `<div class="cs-layers"><img class="cl" style="--x:38%;--y:52%;--w:50%;--rot:-6deg" src="${r('assets/img/recorte/x-grafdental-pacote.webp')}" alt="Pacote identificado com etiqueta"><img class="cl" style="--x:72%;--y:44%;--w:56%;--rot:8deg" src="${r('assets/img/recorte/x-etiqueta-duplo-uso-para-esterilizacao-a-vapor.webp')}" alt="Rolo de etiquetas duplo uso"></div><span class="cs-badge">Lote, data, validade e responsável na etiqueta</span>`,
    `<video src="${r('assets/video/autoclave.mp4')}" poster="${r('assets/video/autoclave.jpg')}" muted loop playsinline preload="none" data-cycle-video></video><span class="cs-badge">Indicador Tipo 1 reage no ciclo a vapor</span>`,
    `<div class="cs-layers"><img class="cl" style="--x:46%;--y:46%;--w:80%;--rot:-4deg" src="${r('assets/img/recorte/x-app-container-tag.webp')}" alt="Contêiner com tag de lacre"><img class="cl" style="--x:72%;--y:76%;--w:50%;--rot:8deg" src="${r('assets/img/recorte/x-tag-duplo-uso-com-lacre-para-containers.webp')}" alt="Tag duplo uso com lacre"></div><span class="cs-badge">Contêineres lacrados e identificados</span>`,
    `<div class="pront" aria-label="Prontuário do paciente com a parte destacável da etiqueta">
      <div class="pront-doc">
        <div class="pront-head"><b>PRONTUÁRIO DO PACIENTE</b><span>Registro de materiais utilizados</span></div>
        <dl><div><dt>Paciente</dt><dd>M. A. S.</dd></div><div><dt>Procedimento</dt><dd>Cirurgia geral</dd></div><div><dt>Sala</dt><dd>04</dd></div><div><dt>Data</dt><dd>22/11</dd></div></dl>
        <p class="pront-lbl">Material esterilizado (etiqueta de rastreabilidade)</p>
        <div class="pront-slot"><canvas data-label-art="brown" data-scale="0.42" class="pront-label"></canvas></div>
        <div class="pront-lines"><i></i><i></i><i></i></div>
        <div class="pront-sign"><span>Enfermagem CME</span><span>Circulante</span></div>
      </div>
    </div><span class="cs-badge">A parte destacável fica no registro do paciente</span>`,
  ];
  return scenes.map((h, i) => `<figure class="cycle-img${i === 0 ? ' on' : ''}" data-cycle-img>${h}<figcaption>${cycle[i][0]} · ${cycle[i][1]}</figcaption></figure>`).join('');
};

// Antes e depois do indicador químico na página do produto (arrastar na horizontal)
const INDICATOR = {
  'etiqueta-duplo-uso-para-esterilizacao-a-vapor': { a: 'assets/img/indicador/cme-antes.webp', b: 'assets/img/indicador/cme-depois.webp', ca: 'Rosa', cb: 'Marrom', mode: 'fade', txt: 'A faixa do indicador químico Tipo 1 sai da fábrica rosa e fica marrom depois do ciclo a vapor.' },
  'etiqueta-grafdental-duplo-uso-esterilizacao-a-vapor': { a: 'assets/img/indicador/dental-antes.webp', b: 'assets/img/indicador/dental-depois.webp', ca: 'Azul', cb: 'Marrom', txt: 'Na grafDENTAL, a faixa do indicador muda de azul para marrom depois da autoclave.' },
  'etiqueta-duplo-uso-grafdental': { a: 'assets/img/indicador/dental-antes.webp', b: 'assets/img/indicador/dental-depois.webp', ca: 'Azul', cb: 'Marrom', txt: 'Na grafDENTAL, a faixa do indicador muda de azul para marrom depois da autoclave.' },
};
const beforeAfter = (r, d) => `
<section class="section ba-sec">${hexes('white', 'left')}<div class="wrap ba-in">
  <div class="reveal"><p class="box-tag">Indicador químico Tipo 1</p><h2 class="h2">Veja a mudança de cor <strong>antes e depois do processo.</strong></h2><p class="muted">${d.txt} Arraste a linha para comparar.</p>
    <ul class="ba-legend"><li><i style="background:${d.ca === 'Rosa' ? '#F08C9B' : '#4080D6'}"></i>${d.ca}: antes do processo</li><li><i style="background:#5C2612"></i>${d.cb}: processo concluído</li></ul></div>
  <div class="ba reveal${d.mode === 'fade' ? ' ba-fade' : ''}" data-ba style="--p:50%">
    <img src="${r(d.a)}" alt="Etiqueta antes do processo" class="ba-a">
    <div class="ba-b-wrap"><img src="${r(d.b)}" alt="Etiqueta depois do processo" class="ba-b"></div>
    <div class="ba-line" aria-hidden="true"><span>Depois</span><span>Antes</span></div>
    <input type="range" min="0" max="100" value="50" class="ba-range" aria-label="Comparar antes e depois do processo">
  </div>
</div></section>`;

// ---------- layout ----------
function layout({ path, title, desc, body, schema = [], active = '', head = '', three = false }) {
  const depth = path.split('/').length - 1;
  const pre = '../'.repeat(depth);
  const r = (u) => pre + u;
  const canonical = `${site.url}/${path === 'index.html' ? '' : path}`;
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'grafMED',
    url: site.url,
    logo: `${site.url}/assets/img/marca/logo.png`,
    telephone: config.phone,
    email: config.email,
    address: { '@type': 'PostalAddress', streetAddress: 'R. Horácio Vergueiro Rudge, 495', addressLocality: 'São Paulo', addressRegion: 'SP', postalCode: '02512-060', addressCountry: 'BR' },
    sameAs: [config.instagram, config.linkedin],
  };
  const navProd = [...lines, ...extras];
  const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${site.url}/assets/img/marca/logo.png">
<meta property="og:locale" content="pt_BR">
<meta name="theme-color" content="#F29727">
<link rel="icon" href="${r('assets/img/favicon.png')}" type="image/png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${r('assets/css/style.css')}">
<script src="${r('assets/js/config.js')}"></script>
<script src="${r('assets/js/tracking.js')}"></script>
${head}
${[orgSchema, ...schema].map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n')}
</head>
<body data-root="${pre}" data-page="${esc(active)}">
<a class="skip" href="#main">Pular para o conteúdo</a>
<div class="progress" data-progress aria-hidden="true"></div>
<header class="hdr" data-hdr>
  <div class="wrap hdr-in">
    <a class="brand" href="${r('index.html')}" aria-label="grafMED, ir para a Home"><img src="${r('assets/img/marca/logo.webp')}" alt="grafMED" width="150" height="50"></a>
    <nav class="nav" data-nav aria-label="Menu principal">
      <div class="nav-item has-sub">
        <button class="nav-link${active.startsWith('produtos') ? ' is-active' : ''}" type="button" aria-expanded="false" data-sub>Produtos <i aria-hidden="true"></i></button>
        <div class="sub sub-mega">
          <div class="sub-grid">
            ${navProd.map((l) => `<a class="sub-card" href="${r(`produtos/${l.slug}.html`)}"><span class="sub-thumb"><img src="${r(l.img)}" alt="" loading="lazy"></span><span><span class="chip-s">${l.chip}</span><strong>${l.name}</strong><small>${l.short}</small></span></a>`).join('')}
          </div>
          <a class="sub-all" href="${r('produtos/index.html')}">Ver todas as linhas ${arrow}</a>
        </div>
      </div>
      <div class="nav-item has-sub">
        <button class="nav-link${active === 'noticias' ? ' is-active' : ''}" type="button" aria-expanded="false" data-sub>Notícias <i aria-hidden="true"></i></button>
        <div class="sub">
          <a href="${r('noticias.html#artigos-tecnicos')}">Artigos técnicos</a>
          <a href="${r('noticias.html#eventos-e-feiras')}">Eventos e feiras</a>
        </div>
      </div>
      <div class="nav-item"><a class="nav-link${active === 'contato' ? ' is-active' : ''}" href="${r('contato.html')}">Contato</a></div>
      <div class="nav-mobile-cta">${ctaSpecialist()}</div>
    </nav>
    <div class="hdr-actions">
      <a class="cart-btn" href="${r('orcamento.html')}" aria-label="Orçamento: 0 itens" data-cart-link>
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9h18l-2 11H5z"/><path d="M8 9l4-6 4 6"/></svg>
        <span class="cart-label">Orçamento</span><b class="cart-count" data-cart-count>0</b>
      </a>
      ${ctaSpecialist('Olá! Quero falar com um especialista grafMED.', 'hdr-cta')}
      <button class="burger" type="button" aria-label="Abrir menu" aria-expanded="false" data-burger><span></span><span></span></button>
    </div>
  </div>
</header>

<main id="main">
${body(r)}
</main>

<footer class="ftr">
  <div class="ftr-cta">
    ${deco()}
    <div class="wrap ftr-cta-in">
      <img src="${r('assets/img/marca/logo-branco.webp')}" alt="grafMED" width="170" height="56" loading="lazy">
      <p>Antes de comprar etiquetas, <strong>converse com quem entende do assunto.</strong></p>
      ${ctaSpecialist('Olá! Vim pelo site da grafMED.', 'btn-white')}
    </div>
  </div>
  <div class="wrap">
    <div class="ftr-top">
      <div class="ftr-brand">
        <img src="${r('assets/img/marca/logo.webp')}" alt="grafMED" width="150" height="50" loading="lazy">
        <p>Mais de 20 anos de inovação em identificação e rastreabilidade no Brasil, com tecnologia 100% nacional.</p>
        <div class="social">
          <a href="${config.instagram}" target="_blank" rel="noopener" aria-label="Instagram @grafmed.oficial"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg></a>
          <a href="${config.linkedin}" target="_blank" rel="noopener" aria-label="LinkedIn grafMED"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5.1c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V21h-4z"/></svg></a>
        </div>
      </div>
      <nav class="ftr-col" aria-label="Produtos"><h4>Produtos</h4>${navProd.map((l) => `<a href="${r(`produtos/${l.slug}.html`)}">${l.name}</a>`).join('')}</nav>
      <nav class="ftr-col" aria-label="Institucional"><h4>Institucional</h4>
        <a href="${r('quem-somos.html')}">Quem somos</a>
        <a href="${r('canal-parceiro.html')}">Canal Parceiro</a>
        <a href="${r('trabalhe-conosco.html')}">Trabalhe conosco</a>
        <a href="${r('noticias.html')}">Notícias</a>
      </nav>
      <nav class="ftr-col" aria-label="Apoio"><h4>Apoio</h4>
        <a href="${r('faq.html')}">Perguntas frequentes</a>
        <a href="${r('qualidade.html')}">Qualidade e certificações</a>
        <a href="${r('privacidade.html')}">Privacidade e LGPD</a>
        <a href="${r('contato.html')}">Contato</a>
      </nav>
      <div class="ftr-col"><h4>Fale com a gente</h4>
        ${wa('Olá! Vim pelo site da grafMED.', `${waIcon} (11) 94561-0928`, 'ftr-wa')}
        <a href="tel:${config.phoneHref}">${config.phone}</a>
        <a href="mailto:${config.email}">${config.email}</a>
        <span>${config.address}</span>
      </div>
    </div>
    <div class="ftr-map" data-map hidden></div>
    <div class="ftr-bottom">
      <span>© <span data-year>2026</span> grafMED® · Todos os direitos reservados</span>
      <span><a href="${r('privacidade.html')}">Política de privacidade</a> · <button type="button" class="linklike" data-cookie-open>Preferências de cookies</button></span>
    </div>
  </div>
</footer>

${wa('Olá! Vim pelo site da grafMED e quero falar com um especialista.', `${waIcon}<span class="sr">Falar no WhatsApp</span>`, 'wa-float', 'data-track="whatsapp" aria-label="Falar no WhatsApp"')}

<div class="toast" role="status" aria-live="polite" data-toast></div>

<dialog class="modal" data-form-modal aria-labelledby="qf-title">
  <button class="modal-x" type="button" data-close aria-label="Fechar">×</button>
  <p class="eyebrow">Leva dois minutos</p>
  <h2 id="qf-title" class="h3">Deixe seus dados e <strong>um especialista chama você.</strong></h2>
  <form class="quick-form" data-quick-form novalidate>
    <div class="qf-step is-on" data-step><label for="qf-nome">Seu nome</label><input id="qf-nome" name="nome" autocomplete="name" required placeholder="Como podemos te chamar?"></div>
    <div class="qf-step" data-step><label for="qf-email">Seu e-mail</label><input id="qf-email" name="email" type="email" autocomplete="email" required placeholder="nome@empresa.com.br"></div>
    <div class="qf-step" data-step><label for="qf-tel">Seu telefone</label><input id="qf-tel" name="telefone" type="tel" autocomplete="tel" inputmode="tel" required placeholder="(11) 90000-0000" data-mask-phone></div>
    <p class="qf-error" data-error role="alert"></p>
    <button class="btn btn-primary" type="submit" data-next>Continuar ${arrow}</button>
    <p class="qf-alt">Prefere conversar agora? ${wa('Olá! Quero falar com um especialista grafMED.', 'Abrir o WhatsApp', 'link', 'data-track="whatsapp"')}</p>
  </form>
  <div class="qf-done" data-done hidden>${ico('check', 48)}<h3>Recebemos seus dados.</h3><p>Um especialista grafMED vai falar com você em breve.</p></div>
</dialog>

<div class="cookie" data-cookie hidden>
  <p>Usamos cookies para medir o desempenho do site e das campanhas. Veja a <a href="${r('privacidade.html')}">Política de privacidade</a>.</p>
  <div><button class="btn btn-outline btn-sm" type="button" data-cookie-deny>Somente essenciais</button><button class="btn btn-primary btn-sm" type="button" data-cookie-ok>Aceitar</button></div>
</div>

<script src="${r('data/banners.js')}"></script>
<script src="${r('data/destaques.js')}"></script>
<script src="${r('assets/js/app.js')}"></script>
${three ? `<script src="${r('assets/vendor/three.min.js')}"></script>\n<script src="${r('assets/js/scenes.js')}"></script>` : ''}
</body>
</html>
`;
  if (/[–—]/.test(strip(html))) console.warn('Travessão encontrado em', path);
  const out = join(ROOT, path);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  pages.push(path);
}

// ---------- páginas ----------
const BEST = ['etiqueta-duplo-uso-para-esterilizacao-a-vapor', 'fita-identificadora-para-instrumental-cirurgico', 'etiqueta-grafdental-duplo-uso-esterilizacao-a-vapor', 'tag-duplo-uso-com-lacre-para-containers', 'etiquetas-adesivas-para-seringas', 'pulseiras-de-identificacao-hospitalar'];

// HOME
const weekProducts = products.filter((p) => p.featured && p.img);
layout({
  path: 'index.html',
  title: 'grafMED | Etiquetas e rastreabilidade para esterilização, CME e indústria',
  desc: site.description,
  active: 'home',
  three: true,
  schema: [faqSchema(homeFaq)],
  body: (r) => `
${homeHero(r)}

<section class="section lines-sec">
  ${hexes('white', 'left')}
  <div class="wrap">
    <div class="sec-head split-head">
      <div>${eyebrow('Linhas de produto')}<h2 class="h2">Encontre a <strong>linha certa</strong> para o seu processo.</h2></div>
      <a class="link" href="${r('produtos/index.html')}">Ver todas as linhas ${arrow}</a>
    </div>
    <div class="lgrid">${[...lines, ...extras].map((l, i) => lineCard(l, r, i)).join('')}</div>
  </div>
</section>

<section class="section best-sec">
  ${hexes('white', 'right')}
  <div class="wrap">
    <div class="sec-head split-head"><div>${eyebrow('Mais vendidos')}<h2 class="h2">Os produtos <strong>mais pedidos</strong> pelos nossos clientes.</h2></div><a class="link" href="${r('produtos/index.html')}">Ver todos os produtos ${arrow}</a></div>
    <div class="pgrid best-grid">${BEST.map((id, i) => productCard(products.find((x) => x.id === id), r, i)).join('')}</div>
  </div>
</section>

${indicatorSim(r)}

<section class="cycle" data-cycle>
  <div class="cycle-sticky">
    <div class="wrap cycle-in">
      <div class="cycle-copy">
        ${eyebrow('Rastreabilidade de ponta a ponta')}
        <h2 class="h2">O ciclo completo, <strong>do preparo ao prontuário.</strong></h2>
        <ol class="cycle-steps">
          ${cycle.map(([n, t, d], i) => `<li data-cycle-step${i === 0 ? ' class="on"' : ''}><span>${n}</span><div><h3>${t}</h3><p>${d}</p></div></li>`).join('')}
        </ol>
        <div class="cycle-bar"><i data-cycle-bar></i></div>
      </div>
      <div class="cycle-media">
        ${cycleScenes(r)}
      </div>
    </div>
  </div>
</section>

<section class="week-sec" data-week>
  ${hexes('solar', 'left')}${hexblob('hb-week')}
  <div class="wrap week">
    <div class="week-media" data-week-media></div>
    <div class="week-body">
      <p class="selo"><span class="pulse" aria-hidden="true"></span> Mais vendido da semana · <span data-week-label>semana</span></p>
      <h2 class="h2" data-week-name>Destaque da semana</h2>
      <p data-week-desc></p>
      <ul class="week-points" data-week-points></ul>
      <div class="week-actions" data-week-actions></div>
      <div class="week-thumbs" data-week-thumbs role="tablist" aria-label="Outros destaques"></div>
    </div>
  </div>
</section>

<section class="numbers">
  ${hexes('solar', 'center')}
  <div class="wrap">
    <h2 class="h2 numbers-title reveal">Números que mostram <strong>a força da grafMED.</strong></h2>
    <div class="stats">
      <div class="stat reveal"><b data-count="20" data-prefix="+">+20</b><span>anos de mercado</span></div>
      <div class="stat reveal" style="--d:80ms"><b data-count="100" data-suffix="%">100%</b><span>tecnologia nacional</span></div>
      <div class="stat reveal" style="--d:160ms"><b data-count="1000" data-prefix="+">+1.000</b><span>formatos de etiquetas</span></div>
      <div class="stat reveal" style="--d:240ms"><b data-count="19">19</b><span>cores de fitas identificadoras</span></div>
    </div>
  </div>
</section>

${clientsBlock(r)}
${faqBlock(homeFaq, r)}
`,
});

// PRODUTOS (índice)
layout({
  path: 'produtos/index.html',
  title: 'Produtos grafMED | CME, grafDENTAL, rótulos, pulseiras e conversão',
  desc: 'Linhas de produto grafMED: CME Hospitalar, grafDENTAL, Rótulos e Etiquetas, Pulseiras de Identificação, Conversão de Matéria-Prima e Projetos.',
  active: 'produtos',
  body: (r) => `
${pageHero(r, 'cme-hospitalar', { crumbs: [['Produtos']], selo: 'Produtos', title: 'Soluções por aplicação, <strong>não por catálogo.</strong>', text: 'Escolha a linha do seu processo. Se não encontrar o que precisa, a grafMED desenvolve.' })}
<section class="section"><div class="wrap"><div class="lgrid">${[...lines, ...extras].map((l, i) => lineCard(l, r, i)).join('')}</div></div></section>
${clientsBlock(r)}
${faqBlock(faqs.geral, r)}
`,
});

// LINHAS
for (const l of lines) {
  const items = products.filter((p) => p.line === l.slug);
  const lf = faqs[l.slug];
  const tags = [...new Set(items.flatMap((p) => p.tags))];
  layout({
    path: `produtos/${l.slug}.html`,
    title: `${l.name} | grafMED`,
    desc: `${l.short} ${strip(l.text)}`.slice(0, 158),
    active: `produtos-${l.slug}`,
    three: l.slug === 'cme-hospitalar' || l.slug === 'grafdental',
    schema: lf ? [faqSchema(lf)] : [],
    body: (r) => `
${pageHero(r, l.slug, { crumbs: [['Produtos', 'produtos/index.html'], [l.name]], selo: `${l.chip} · ${l.audience}`, title: l.title, text: l.text, actions: `${ctaSpecialist(`Olá! Quero falar com um especialista sobre a linha ${l.name}.`, 'btn-lg')}<a class="btn btn-outline btn-lg" href="#produtos">Ver produtos ${arrow}</a>` })}
${l.original ? `<div class="wrap">${originalCallout(r)}</div>` : ''}
<section class="section" id="produtos"><div class="wrap">
  <div class="sec-head split-head">
    <div>${eyebrow('Produtos de linha')}<h2 class="h2">${l.name}</h2></div>
    ${tags.length > 1 && items.length > 6 ? `<div class="filters" data-pfilter role="group" aria-label="Filtrar produtos"><button aria-pressed="true" data-f="all">Todos</button>${tags.map((t) => `<button aria-pressed="false" data-f="${esc(t)}">${t}</button>`).join('')}</div>` : ''}
  </div>
  <div class="pgrid">${items.map((p, i) => productCard(p, r, i)).join('')}</div>
  <div class="custom-note reveal">${ico('chat', 30)}<div><strong>Precisa de outra medida ou formato?</strong><p>Mostramos aqui os produtos de linha. Para medida personalizada, fale com o especialista.</p></div>${wa(`Olá! Preciso de uma medida personalizada na linha ${l.name}.`, `Falar com o especialista ${arrow}`, 'btn btn-outline', 'data-track="whatsapp"')}</div>
</div></section>
${l.slug === 'cme-hospitalar' || l.slug === 'grafdental' ? indicatorSim(r, true) : ''}
${l.norms.length ? `<section class="section section-tight"><div class="wrap"><div class="norms reveal">${ico('shield', 34)}<div><h2 class="h4">Conformidade</h2><p>Produtos desenvolvidos para apoiar a rastreabilidade e a conformidade do seu processo.</p></div><ul>${l.norms.map((n) => `<li>${n}</li>`).join('')}</ul><a class="link" href="${r('qualidade.html')}">Qualidade e certificações ${arrow}</a></div></div></section>` : ''}
${clientsBlock(r)}
${lf ? faqBlock(lf, r, `Dúvidas sobre <strong>${l.name}</strong>`) : ''}
`,
  });
}

// PRODUTOS (páginas individuais)
for (const p of products) {
  const l = lineBy(p.line);
  const measureTab = p.tabs.find((t) => t[0] === 'Medidas e formatos');
  const measures = measureTab ? measureTab[1].split('\n').filter((x) => /\d\s*(mm|cm)\b|\d+\s*x\s*\d+/i.test(x) && x.length < 40) : [];
  const tabs = p.tabs.map(([t, b]) => {
    if (t === 'Especificações técnicas' && b.includes('::')) {
      const rows = b.split('\n').map((x) => x.split('::').map((c) => c.trim()));
      return [t, `<table class="spec">${rows.map((c, i) => (i === 0 && /caracter/i.test(c[0]) ? '' : `<tr><th>${esc(c[0])}</th><td>${esc(c.slice(1).join(' '))}</td></tr>`)).join('')}</table>`];
    }
    if (t === 'Medidas e formatos' && measures.length) {
      const rest = b.split('\n').filter((x) => !measures.includes(x));
      return [t, `${P(rest.join('\n'))}<ul class="chips static">${measures.map((m) => `<li>${esc(m)}</li>`).join('')}</ul>`];
    }
    return [t, b];
  });
  const reg = p.tabs.find((t) => t[0] === 'Registro M.S.');
  const related = products.filter((x) => x.line === p.line && x.id !== p.id).slice(0, 3);
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.short,
    image: p.img ? `${site.url}/${p.img}` : undefined,
    brand: { '@type': 'Brand', name: p.line === 'grafdental' ? 'grafDENTAL' : 'grafMED' },
    manufacturer: { '@type': 'Organization', name: 'grafMED' },
    category: l.name,
    url: `${site.url}/${productUrl(p)}`,
  };
  layout({
    path: productUrl(p),
    title: `${p.name} | ${l.name} | grafMED`,
    desc: p.short.slice(0, 158),
    active: `produtos-${l.slug}`,
    schema: [productSchema],
    body: (r) => `
<section class="product"><div class="wrap">
  ${breadcrumb([['Produtos', 'produtos/index.html'], [l.name, `produtos/${l.slug}.html`], [p.name]], r)}
  <div class="product-in">
    <div class="gallery reveal">
      <div class="gallery-stage" data-gallery>
        <span class="lab-chip">${l.chip}</span>
        ${(p.imgs && p.imgs.length ? p.imgs : p.img ? [p.img] : []).map((src, i) => `<figure class="g-slide${i === 0 ? ' on' : ''}${src.includes('-foto.') ? ' is-photo' : ''}" data-zoom><img src="${r(src)}" alt="${esc(p.name)}${i ? ` (imagem ${i + 1})` : ''}" ${i ? 'loading="lazy"' : ''} width="1000" height="1000"></figure>`).join('') || `<span class="lab-ph">${ico('box', 56)}<small>Foto real do catálogo em produção</small></span>`}
        ${(p.imgs || []).length > 1 ? `<button class="g-nav g-prev" type="button" data-gprev aria-label="Imagem anterior">${arrow}</button><button class="g-nav g-next" type="button" data-gnext aria-label="Próxima imagem">${arrow}</button>` : ''}
      </div>
      ${(p.imgs || []).length > 1 ? `<div class="g-thumbs" role="tablist" aria-label="Imagens do produto">${p.imgs.map((src, i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-gthumb="${i}" class="${src.includes('-foto.') ? 'is-photo' : ''}"><img src="${r(src)}" alt="" loading="lazy"></button>`).join('')}</div>` : ''}
      ${p.tags.length ? `<ul class="ptags">${p.tags.map((t) => `<li>${t}</li>`).join('')}</ul>` : ''}
    </div>
    <div class="pinfo">
      <p class="code">${l.name}</p>
      <h1 class="h2">${esc(p.name)}</h1>
      <p class="lead dark">${esc(p.short)}</p>
      ${measures.length ? `<div class="measures"><span class="lbl">Medidas disponíveis</span><div class="chips" role="radiogroup" aria-label="Medida">${measures.map((m, i) => `<label class="chip"><input type="radio" name="medida" value="${esc(m)}"${i === 0 ? ' checked' : ''}><span>${esc(m)}</span></label>`).join('')}</div></div>` : ''}
      <div class="buy">
        <div class="qty" data-qty><button type="button" aria-label="Diminuir quantidade" data-dec>−</button><input type="number" min="1" value="1" aria-label="Quantidade" data-qty-input><button type="button" aria-label="Aumentar quantidade" data-inc>+</button></div>
        <button class="btn btn-dark" type="button" data-add='${addPayload(p)}' data-add-detail>+ Adicionar ao orçamento</button>
      </div>
      ${ctaSpecialist(`Olá! Tenho interesse no produto: ${p.name}.`, 'btn-block btn-lg')}
      <p class="custom-inline">${ico('chat', 20)} Precisa de outra medida? ${wa(`Olá! Preciso de uma medida personalizada de ${p.name}.`, 'Fale com o especialista', 'link', 'data-track="whatsapp"')}</p>
      ${accordion(tabs.filter(([t]) => t !== 'Registro M.S.'))}
      ${reg ? `<p class="reg">${esc(reg[1])}</p>` : ''}
      ${l.original ? originalCallout(r, 'Confira o selo Original grafMED e compre de parceiros credenciados. Exigir o original protege o paciente.') : ''}
    </div>
  </div>
</div></section>
${INDICATOR[p.id] ? beforeAfter(r, INDICATOR[p.id]) : ''}
${related.length ? `<section class="section section-tight"><div class="wrap"><div class="sec-head">${eyebrow('Da mesma linha')}<h2 class="h2">Veja <strong>também</strong></h2></div><div class="pgrid">${related.map((x, i) => productCard(x, r, i)).join('')}</div></div></section>` : ''}
${faqs[p.line] ? faqBlock(faqs[p.line].slice(0, 3), r) : ''}
`,
  });
}

// CONVERSÃO
layout({
  path: 'produtos/conversao-materia-prima.html',
  title: 'Conversão de Matéria-Prima | Corte de bobinas e montagem de kits | grafMED',
  desc: 'Você envia a bobina, a grafMED corta, monta, embala e entrega pronto para uso ou revenda. Conversão de velcro, feltro, micropore, espumas e mais.',
  active: 'produtos-conversao',
  three: true,
  schema: [faqSchema(faqs.conversao)],
  body: (r) => `
${pageHero(r, 'conversao-materia-prima', { crumbs: [['Produtos', 'produtos/index.html'], ['Conversão de Matéria-Prima']], selo: 'Conversão · Serviços e OEM', title: 'Precisamos apenas do seu material <strong>para a conversão.</strong>', text: 'Você envia a bobina. A grafMED corta, monta, embala e entrega pronto para uso ou revenda, sem você precisar de máquinas ou equipe de acabamento.', actions: ctaSpecialist('Olá! Quero um orçamento de conversão de matéria-prima.', 'btn-lg') })}

<section class="section"><div class="wrap">
  <div class="sec-head center">${eyebrow('Como funciona · 4 etapas')}<h2 class="h2">Do rolo ao kit, <strong>sem passar pela sua linha.</strong></h2></div>
  <ol class="flow" data-flow>
    ${[['roll', 'Você envia', 'Bobina ou rolo de matéria-prima.'], ['cut', 'grafMED processa', 'Corte, montagem e acabamento.'], ['box', 'Kit embalado', 'Unitário ou em lote.'], ['truck', 'Entrega', 'Pronto para uso ou revenda.']]
      .map(([i, t, d], n) => `<li class="flow-step" data-flow-step><span class="flow-ico">${ico(i, 34)}</span><span class="flow-n">0${n + 1}</span><h3>${t}</h3><p>${d}</p></li>`)
      .join('')}
  </ol>
</div></section>

<section class="section section-soft"><div class="wrap">
  <div class="sec-head">${eyebrow('Por que terceirizar')}<h2 class="h2">Menos etapas <strong>na sua planta.</strong></h2></div>
  <div class="benefits">
    ${[['clock', 'Tempo', 'Elimina etapas do seu processo produtivo interno.'], ['space', 'Espaço', 'Sem máquinas de corte e acabamento na sua planta.'], ['coin', 'Custo', 'Sem mão-de-obra especializada de acabamento.'], ['check', 'Qualidade', 'Corte preciso e embalagem padronizada.']]
      .map(([i, t, d], n) => `<div class="benefit reveal" style="--d:${n * 80}ms">${ico(i, 30)}<h3>${t}</h3><p>${d}</p></div>`).join('')}
  </div>
</div></section>

<section class="section"><div class="wrap">
  <div class="sec-head">${eyebrow('Quem usa')}<h2 class="h2">Cases <strong>por segmento</strong></h2></div>
  <div class="cases">
    ${[['Automotivo', 'Peças em velcro', 'Bobinas de velcro convertidas em moedas e pastilhas para montagem de câmbio e peças de silicone.'], ['Moveleiro', 'Fita de bordo', 'Lâminas de madeira em rolo convertidas em peças cortadas prontas para aplicação no MDF.'], ['Farmacêutico', 'Kits de micropore', 'Bobinas de micropore e feltro montadas em kits individuais prontos para o processo do cliente.']]
      .map(([tag, t, d], n) => `<article class="case reveal" style="--d:${n * 80}ms"><span class="lab-chip static">${tag}</span><h3>${t}</h3><p>${d}</p></article>`).join('')}
  </div>
  <div class="materials">
    <h2 class="h4">Materiais que a grafMED converte</h2>
    <div class="chips">${materials.map((m) => wa(`Olá! Quero converter: ${m}.`, m, 'chip-link')).join('')}${wa('Olá! Quero saber se vocês convertem o meu material.', '+ consulte o seu material', 'chip-link dashed')}</div>
  </div>
</div></section>

<section class="section section-tight"><div class="wrap">
  <div class="sec-head">${eyebrow('Produtos industriais')}<h2 class="h2">Soluções <strong>OEM</strong></h2></div>
  <div class="pgrid">${products.filter((p) => p.line === 'conversao-materia-prima').map((p, i) => productCard(p, r, i)).join('')}</div>
</div></section>

${ctaBand('Mande seu material. <strong>A gente converte.</strong>', 'Descreva o que precisa e receba o orçamento pelo WhatsApp.', 'Olá! Quero um orçamento de conversão de matéria-prima.')}
${faqBlock(faqs.conversao, r)}
`,
});

// PROJETOS
layout({
  path: 'produtos/projetos.html',
  title: 'Projetos sob medida | grafMED desenvolve para você',
  desc: 'Não encontrou no nosso site? Fale com um especialista em projetos da grafMED e descreva a sua necessidade.',
  active: 'produtos-projetos',
  three: true,
  body: (r) => `
${pageHero(r, 'projetos', { crumbs: [['Produtos', 'produtos/index.html'], ['Projetos']], selo: 'Projetos · P&D', title: 'Não encontrou no nosso site? <strong>Fale com um especialista em projetos.</strong>', text: 'Conte o que você precisa. A grafMED avalia e desenvolve a solução para o seu processo.' })}
<section class="section cfg-sec"><div class="wrap">
  <div class="sec-head">${eyebrow('Monte uma prévia em 3D')}<h2 class="h2">Desenhe a sua etiqueta <strong>e envie para o especialista.</strong></h2><p class="muted">Escolha forma, medida, material e indicador. A prévia gira em 3D e as informações vão prontas na mensagem.</p></div>
  <div class="cfg" data-cfg3d>
    <div class="cfg-view"><div class="cfg-stage" data-cfg-stage></div><span class="cfg-size" data-cfg-size>60 × 40 mm</span><p class="ind-hint">Arraste para girar</p></div>
    <div class="cfg-controls">
      <fieldset class="seg-group"><legend>Forma</legend>
        <label><input type="radio" name="forma" value="retangular" checked><span>Retangular</span></label>
        <label><input type="radio" name="forma" value="redonda"><span>Redonda</span></label>
        <label><input type="radio" name="forma" value="oval"><span>Oval</span></label>
      </fieldset>
      <label class="field range"><span>Largura <output data-for="largura">60 mm</output></span><input type="range" name="largura" min="15" max="150" value="60"></label>
      <label class="field range"><span>Altura <output data-for="altura">40 mm</output></span><input type="range" name="altura" min="10" max="150" value="40"></label>
      <label class="field"><span>Material</span><select name="material"><option value="papel">Papel couché branco</option><option value="bopp">BOPP transparente</option><option value="prata">Poliéster prata</option><option value="kraft">Papel kraft</option></select></label>
      <label class="field"><span>Indicador químico</span><select name="indicador"><option value="nenhum">Sem indicador</option><option value="vapor">Vapor (Tipo 1)</option><option value="vpph">Peróxido (VPPH)</option></select></label>
      <label class="field"><span>Texto principal</span><input name="texto" maxlength="20" value="SUA MARCA"></label>
      ${wa('Olá! Quero desenvolver uma etiqueta sob medida.', `${waIcon} Enviar este projeto no WhatsApp`, 'btn btn-primary btn-block', 'data-cfg-wa data-track="whatsapp"')}
    </div>
  </div>
</div></section>
<section class="section"><div class="wrap">
  <div class="project-box reveal">
    <form class="form" data-form="projeto" novalidate>
      <div class="form-grid">
        <label class="field"><span>Nome</span><input name="nome" required autocomplete="name"></label>
        <label class="field"><span>Empresa</span><input name="empresa" autocomplete="organization"></label>
        <label class="field"><span>Telefone / WhatsApp</span><input name="telefone" type="tel" required data-mask-phone autocomplete="tel"></label>
        <label class="field"><span>E-mail</span><input name="email" type="email" required autocomplete="email"></label>
        <label class="field field-full"><span>Descreva a sua necessidade</span><textarea name="descricao" rows="5" required placeholder="Material, aplicação, medidas, volume. Quanto mais detalhes, melhor."></textarea></label>
      </div>
      <p class="qf-error" data-error role="alert"></p>
      <button class="btn btn-dark" type="submit">Enviar para o especialista</button>
    </form>
    <div class="project-side">
      ${deco()}
      ${ico('chat', 40)}
      <h2 class="h3">Prefere explicar <strong>por mensagem?</strong></h2>
      <p>Fotos, desenhos e amostras ajudam. Mande tudo pelo WhatsApp.</p>
      ${ctaSpecialist('Olá! Tenho um projeto sob medida e quero falar com um especialista em projetos.', 'btn-white')}
    </div>
  </div>
</div></section>
`,
});

// NOTÍCIAS
const catSlug = (c) => (c === 'Artigos técnicos' ? 'artigos-tecnicos' : 'eventos-e-feiras');
layout({
  path: 'noticias.html',
  title: 'Notícias grafMED | Artigos técnicos, eventos e feiras',
  desc: 'Artigos técnicos sobre esterilização, rastreabilidade e identificação, e a agenda de eventos e feiras da grafMED.',
  active: 'noticias',
  body: (r) => `
${pageHero(r, 'noticias', { crumbs: [['Notícias']], selo: 'Notícias', title: 'Mantenha-se atualizado <strong>com nossos especialistas.</strong>', text: 'Artigos técnicos sobre CME, esterilização e rastreabilidade, além de eventos e feiras.' })}
<section class="section"><div class="wrap">
  <div class="filters" role="tablist" data-filters>
    <button role="tab" aria-selected="true" data-filter="all">Todos</button>
    <button role="tab" aria-selected="false" data-filter="artigos-tecnicos" id="artigos-tecnicos">Artigos técnicos</button>
    <button role="tab" aria-selected="false" data-filter="eventos-e-feiras" id="eventos-e-feiras">Eventos e feiras</button>
  </div>
  <div class="agrid" data-articles>
    ${articles.map((a, i) => `<article class="acard reveal" style="--d:${(i % 3) * 80}ms" data-cat="${catSlug(a.cat)}">
      <a href="${r(`noticias/${a.slug}.html`)}" class="acard-media"><img src="${r(a.img)}" alt="" loading="lazy"></a>
      <div class="acard-meta"><span class="lab-chip static">${a.cat}</span><time datetime="${a.date}">${fmtDate(a.date)}</time></div>
      <h2 class="h4"><a href="${r(`noticias/${a.slug}.html`)}">${esc(a.title)}</a></h2>
      <p>${esc(a.excerpt)}</p>
      <a class="lab-link" href="${r(`noticias/${a.slug}.html`)}">Ler artigo ${arrow}</a>
    </article>`).join('')}
    <p class="empty-cat" data-empty hidden>Em breve, a agenda de eventos e feiras da grafMED.</p>
  </div>
</div></section>
`,
});

for (const a of articles) {
  const rel = articles.filter((x) => x.slug !== a.slug).slice(0, 3);
  layout({
    path: `noticias/${a.slug}.html`,
    title: `${a.title} | grafMED`,
    desc: a.excerpt.slice(0, 158),
    active: 'noticias',
    schema: [{ '@context': 'https://schema.org', '@type': 'Article', headline: a.title, datePublished: a.date, image: `${site.url}/${a.img}`, author: { '@type': 'Organization', name: 'grafMED' }, publisher: { '@type': 'Organization', name: 'grafMED' } }],
    body: (r) => `
<article class="post"><div class="wrap narrow">
  ${breadcrumb([['Notícias', 'noticias.html'], [a.cat]], r)}
  <span class="lab-chip static">${a.cat}</span>
  <h1 class="h1">${esc(a.title)}</h1>
  <time datetime="${a.date}" class="muted">${fmtDate(a.date)}</time>
  <figure class="post-cover"><img src="${r(a.img)}" alt=""></figure>
  <div class="post-body">${a.body.map(([t, c]) => `<${t}>${esc(c)}</${t}>`).join('')}</div>
  <div class="post-cta">${ctaSpecialist(`Olá! Li o artigo "${a.title}" e quero falar com um especialista.`)}</div>
</div></article>
<section class="section section-tight"><div class="wrap"><div class="sec-head">${eyebrow('Continue lendo')}<h2 class="h2">Artigos <strong>relacionados</strong></h2></div>
<div class="agrid">${rel.map((x) => `<article class="acard"><a href="${r(`noticias/${x.slug}.html`)}" class="acard-media"><img src="${r(x.img)}" alt="" loading="lazy"></a><h3 class="h4"><a href="${r(`noticias/${x.slug}.html`)}">${esc(x.title)}</a></h3></article>`).join('')}</div></div></section>
`,
  });
}

// CONTATO
layout({
  path: 'contato.html',
  title: 'Contato | grafMED',
  desc: 'Fale com um especialista grafMED pelo WhatsApp, telefone ou e-mail. Trabalhe conosco.',
  active: 'contato',
  body: (r) => `
${pageHero(r, 'contato', { crumbs: [['Contato']], selo: 'Contato', title: 'Fale com nossos <strong>especialistas.</strong>', text: 'O jeito mais rápido é pelo WhatsApp. Se preferir, deixe seus dados e a gente chama você.' })}
<section class="section"><div class="wrap contact">
  <div class="contact-main reveal">
    ${ico('chat', 40)}
    <h2 class="h3">WhatsApp <strong>comercial</strong></h2>
    <p class="muted">Atendimento em horário comercial, direto com um especialista.</p>
    ${ctaSpecialist('Olá! Vim pela página de contato da grafMED.', 'btn-lg')}
    <hr>
    <h3 class="h4">Ou deixe seus dados</h3>
    <form class="quick-form inline" data-quick-form novalidate>
      <div class="qf-step is-on" data-step><label for="c-nome">Seu nome</label><input id="c-nome" name="nome" required autocomplete="name"></div>
      <div class="qf-step" data-step><label for="c-email">Seu e-mail</label><input id="c-email" name="email" type="email" required autocomplete="email"></div>
      <div class="qf-step" data-step><label for="c-tel">Seu telefone</label><input id="c-tel" name="telefone" type="tel" required data-mask-phone autocomplete="tel"></div>
      <p class="qf-error" data-error role="alert"></p>
      <button class="btn btn-dark" type="submit" data-next>Continuar ${arrow}</button>
    </form>
    <div class="qf-done" data-done hidden>${ico('check', 40)}<h3>Recebemos seus dados.</h3><p>Um especialista vai falar com você em breve.</p></div>
  </div>
  <div class="contact-side">
    <div class="ch reveal">${ico('phone', 26)}<div><strong>Telefone</strong><a href="tel:${config.phoneHref}">${config.phone}</a></div></div>
    <div class="ch reveal">${ico('mail', 26)}<div><strong>E-mail</strong><a href="mailto:${config.email}">${config.email}</a></div></div>
    <div class="ch reveal">${ico('pin', 26)}<div><strong>Fábrica</strong><span>${config.address}</span><small class="muted">Novo endereço no Jaraguá em breve.</small></div></div>
    <div class="ch ch-highlight reveal">${ico('people', 26)}<div><strong>Trabalhe conosco</strong><span>Quer participar do nosso time?</span><a class="link" href="${r('trabalhe-conosco.html')}">Envie seu currículo ${arrow}</a></div></div>
  </div>
</div></section>
`,
});

// ORÇAMENTO
layout({
  path: 'orcamento.html',
  title: 'Meu orçamento | grafMED',
  desc: 'Revise os produtos, ajuste as quantidades e envie seu pedido de orçamento para a grafMED.',
  active: 'orcamento',
  head: '<meta name="robots" content="noindex">',
  body: (r) => `
<section class="section page-top"><div class="wrap">
  ${breadcrumb([['Orçamento']], r)}
  <h1 class="h1">Meu <strong>orçamento</strong></h1>
  <p class="lead dark">Confira a lista, ajuste as quantidades e envie. Sem preço e sem checkout: um especialista retorna com a proposta.</p>
  <div class="quote">
    <div class="quote-list">
      <div data-cart-list></div>
      <div class="empty" data-cart-empty hidden>
        ${ico('box', 48)}
        <h2 class="h4">Seu orçamento está vazio.</h2>
        <p class="muted">Navegue pelas linhas e use “+ Adicionar ao orçamento” nos produtos.</p>
        <a class="btn btn-primary" href="${r('produtos/index.html')}">Ver produtos</a>
      </div>
    </div>
    <form class="form quote-form" data-form="orcamento" novalidate>
      <h2 class="h4">Seus dados</h2>
      <label class="field"><span>Nome *</span><input name="nome" required autocomplete="name"></label>
      <label class="field"><span>Empresa *</span><input name="empresa" required autocomplete="organization"></label>
      <label class="field"><span>Telefone / WhatsApp *</span><input name="telefone" type="tel" required data-mask-phone autocomplete="tel"></label>
      <label class="field"><span>E-mail *</span><input name="email" type="email" required autocomplete="email"></label>
      <div class="form-grid tight">
        <label class="field"><span>Cidade *</span><input name="cidade" required autocomplete="address-level2"></label>
        <label class="field"><span>UF *</span><select name="uf" required><option value="">--</option>${'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ').map((u) => `<option>${u}</option>`).join('')}</select></label>
      </div>
      <label class="field"><span>Segmento de atuação *</span><select name="segmento" required><option value="">Selecione</option><option>Hospitalar</option><option>Odontológico</option><option>Indústria</option><option>Eventos</option><option>Outro</option></select></label>
      <label class="field"><span>Observações</span><textarea name="obs" rows="3"></textarea></label>
      <label class="check"><input type="checkbox" name="lgpd" required> <span>Concordo com o uso dos meus dados para retorno do orçamento, conforme a <a href="${r('privacidade.html')}">Política de privacidade</a>.</span></label>
      <p class="qf-error" data-error role="alert"></p>
      <button class="btn btn-primary btn-block" type="submit" data-via="whatsapp">${waIcon} Enviar pelo WhatsApp</button>
      <button class="btn btn-outline btn-block" type="submit" data-via="email">Enviar por e-mail</button>
    </form>
  </div>
</div></section>
`,
});

// OBRIGADO
layout({
  path: 'obrigado.html',
  title: 'Obrigado | grafMED',
  desc: 'Recebemos sua solicitação. Um especialista grafMED vai falar com você em breve.',
  active: 'obrigado',
  head: '<meta name="robots" content="noindex"><script>window.GM_CONVERSION_PAGE = true;</script>',
  body: (r) => `
<section class="hero hero-page hero--orange thanks">${deco()}<div class="wrap narrow center">
  <div class="thanks-ico">${ico('check', 64)}</div>
  <h1 class="display">Obrigado! <strong>Recebemos sua solicitação.</strong></h1>
  <p class="lead">Um especialista grafMED vai falar com você em breve. Se quiser adiantar, chame no WhatsApp.</p>
  <div class="hero-cta center">${ctaSpecialist('Olá! Acabei de enviar uma solicitação pelo site.', 'btn-white')}<a class="btn btn-ghost-white" href="${r('index.html')}">Voltar para a Home</a></div>
  <div class="thanks-summary" data-thanks-summary></div>
</div></section>
`,
});

// QUEM SOMOS
layout({
  path: 'quem-somos.html',
  title: 'Quem somos | grafMED',
  desc: 'A grafMED é uma indústria brasileira de identificação e rastreabilidade, com mais de 20 anos de inovação e tecnologia 100% nacional.',
  active: 'quem-somos',
  body: (r) => `
${pageHero(r, 'quem-somos', { crumbs: [['Quem somos']], selo: 'Quem somos', title: 'Mais de 20 anos de inovação <strong>em identificação e rastreabilidade.</strong>', text: 'A grafMED nasceu para resolver uma dor comum em hospitais: a rastreabilidade dos processos de esterilização.' })}
<section class="section about-sec">${hexes('white', 'right')}<div class="wrap two-col">
  <div class="prose reveal">
    ${eyebrow('Nossa história')}
    <h2 class="h2">Nascemos para resolver <strong>a rastreabilidade na esterilização.</strong></h2>
    <p>Maurício Calicchio e Luís Henrique Batista perceberam uma oportunidade em um mercado que ainda engatinhava no Brasil e fundaram, há mais de duas décadas, a grafMED. Hoje a empresa está presente em todo o território nacional por meio de distribuidores e consultores.</p>
    <p>Somos uma gráfica especializada em etiquetas médicas para rastreabilidade, usadas durante todo o fluxo de processamento de materiais na CME. Nossas soluções usam tecnologia de ponta totalmente nacional, o que protege os clientes da volatilidade do câmbio e do mercado externo.</p>
    <p>Construímos soluções sólidas e versáteis, uma equipe experiente e homologada e um atendimento reconhecidamente caprichado. Seguimos em expansão para logística, indústria alimentícia, farmacêutica, veterinária, engenharia e construção.</p>
  </div>
  <div class="about-visual reveal">
    ${hexblob('hb-about')}
    <img src="${r('assets/img/recorte/x-composicao.webp')}" alt="Produtos grafMED: etiquetas, filtros, contêineres e etiquetas para seringas" loading="lazy">
  </div>
</div></section>
<section class="numbers">
  ${hexes('solar', 'center')}
  <div class="wrap">
    <h2 class="h2 numbers-title reveal">grafMED <strong>em números.</strong></h2>
    <div class="stats">
      <div class="stat reveal"><b data-count="20" data-prefix="+">+20</b><span>anos de mercado</span></div>
      <div class="stat reveal" style="--d:80ms"><b data-count="100" data-suffix="%">100%</b><span>tecnologia nacional</span></div>
      <div class="stat reveal" style="--d:160ms"><b data-count="1000" data-prefix="+">+1.000</b><span>formatos de etiquetas</span></div>
      <div class="stat reveal" style="--d:240ms"><b>Brasil</b><span>atendimento em todo o território</span></div>
    </div>
  </div>
</section>
<section class="section">${hexes('white', 'left')}<div class="wrap">
  <div class="sec-head center">${eyebrow('Nossos pilares')}<h2 class="h2">O que nos <strong>move.</strong></h2></div>
  <div class="benefits three">
    <div class="benefit reveal">${ico('shield', 30)}<h3>Qualidade e conformidade no nosso DNA</h3><p>Produtos que atendem e superam normas como a RDC-15 e a ABNT NBR ISO 26825:2021.</p></div>
    <div class="benefit reveal" style="--d:80ms">${ico('factory', 30)}<h3>Tecnologia nacional, segurança global</h3><p>Agilidade e estabilidade de fornecimento, sem depender do câmbio e de tarifas externas.</p></div>
    <div class="benefit reveal" style="--d:160ms">${ico('people', 30)}<h3>Parceria que gera valor</h3><p>Desenvolvimento de soluções sob medida e suporte especializado em todo o Brasil.</p></div>
  </div>
</div></section>
<section class="section purpose-sec">${hexes('solar', 'right')}<div class="wrap">
  <div class="sec-head">${eyebrow('Propósito')}<h2 class="h2">Missão, visão <strong>e valores</strong></h2></div>
  <div class="purpose">
    <article class="reveal"><span>01</span><h3>Missão</h3><p>Atender as necessidades do mercado e oferecer a mais alta tecnologia disponível, com inovação e transparência em preço, prazo e atendimento.</p></article>
    <article class="reveal" style="--d:80ms"><span>02</span><h3>Visão</h3><p>Ser a melhor empresa de rastreabilidade, impressão e peças técnicas, atendendo às mais diversas demandas do setor da saúde e de qualquer mercado que precise de produtos técnicos específicos.</p></article>
    <article class="reveal" style="--d:160ms"><span>03</span><h3>Valores</h3><p>Ética, qualidade e compromisso com a segurança do paciente, com uma equipe dedicada a desenvolver tecnologia para cada mercado.</p></article>
  </div>
</div></section>
${clientsBlock(r)}
${ctaBand('Vamos mapear a rastreabilidade <strong>da sua operação?</strong>', 'Fale com um especialista e conte como funciona o seu processo hoje.', 'Olá! Quero mapear a rastreabilidade da minha operação.')}
`,
});

// CANAL PARCEIRO
layout({
  path: 'canal-parceiro.html',
  title: 'Canal Parceiro | Programa Original grafMED',
  desc: 'Exigir o original protege o paciente. Conheça os selos Original grafMED, os parceiros credenciados e como se tornar um distribuidor.',
  active: 'canal-parceiro',
  body: (r) => `
${pageHero(r, 'canal-parceiro', { crumbs: [['Canal Parceiro']], selo: 'Programa Original grafMED', title: 'Exigir o original <strong>protege o paciente.</strong>', text: 'Cada produto grafMED e grafDENTAL é desenvolvido, testado e fabricado para que a equipe confie no que lê. O selo Original garante essa origem.' })}
<section class="section"><div class="wrap">
  <div class="sec-head">${eyebrow('Por que exigir o original')}<h2 class="h2">O que está em jogo <strong>na esterilização.</strong></h2></div>
  <div class="benefits three">
    ${[['flag', 'Rastreabilidade', 'Lote e origem conhecidos, do fabricante até o prontuário.'], ['shield', 'Conformidade regulatória', 'Produto desenvolvido para apoiar as exigências da RDC-15.'], ['check', 'Segurança do paciente', 'Indicador em que a equipe pode confiar na liberação do material.']]
      .map(([i, t, d], n) => `<div class="benefit reveal" style="--d:${n * 80}ms">${ico(i, 30)}<h3>${t}</h3><p>${d}</p></div>`).join('')}
  </div>
</div></section>
<section class="section section-orange">${deco()}<div class="wrap">
  <div class="sec-head">${eyebrow('Selos')}<h2 class="h2">Selos <strong>Original grafMED</strong></h2><p>Arte final dos selos em desenvolvimento. Exibição ilustrativa.</p></div>
  <div class="seals">
    ${[['ORIGINAL', 'Original grafMED', 'Produto fabricado pela grafMED.'], ['DENTAL', 'Original grafDENTAL', 'Linha odontológica original.'], ['PARCEIRO', 'Parceiro credenciado', 'Distribuidor autorizado pela grafMED.']]
      .map(([s, t, d], n) => `<div class="seal-card reveal" style="--d:${n * 80}ms">${sealImg(r, 110, s)}<h3>${t}</h3><p>${d}</p></div>`).join('')}
  </div>
</div></section>
<section class="section"><div class="wrap">
  <div class="sec-head split-head"><div>${eyebrow('Onde comprar')}<h2 class="h2">Parceiros <strong>credenciados</strong></h2></div><input type="search" class="search" placeholder="Buscar por nome ou estado" aria-label="Buscar parceiro" data-partner-search></div>
  <div class="partners" data-partners></div>
</div></section>
<section class="section section-soft"><div class="wrap two">
  <div class="panel reveal">
    <h2 class="h4">Canal de denúncia</h2>
    <p class="muted">Viu um anúncio ou produto suspeito? Conte para a gente.</p>
    <form class="form" data-form="denuncia" novalidate>
      <label class="field"><span>Link ou local do anúncio</span><input name="link" required></label>
      <label class="field"><span>O que chamou sua atenção?</span><textarea name="descricao" rows="3" required></textarea></label>
      <label class="field"><span>Seu e-mail (opcional)</span><input name="email" type="email"></label>
      <p class="qf-error" data-error role="alert"></p>
      <button class="btn btn-dark" type="submit">Enviar denúncia</button>
    </form>
  </div>
  <div class="panel reveal">
    <h2 class="h4">Quero ser parceiro</h2>
    <p class="muted">Distribuidores podem solicitar o credenciamento.</p>
    <form class="form" data-form="adesao" novalidate>
      <label class="field"><span>Empresa</span><input name="empresa" required></label>
      <label class="field"><span>CNPJ</span><input name="cnpj" required inputmode="numeric" data-mask-cnpj></label>
      <label class="field"><span>Cidade / UF</span><input name="cidade" required></label>
      <label class="field"><span>E-mail</span><input name="email" type="email" required></label>
      <p class="qf-error" data-error role="alert"></p>
      <button class="btn btn-dark" type="submit">Solicitar credenciamento</button>
    </form>
  </div>
</div></section>
<script src="data/parceiros.js"></script>
`,
});

// TRABALHE CONOSCO
layout({
  path: 'trabalhe-conosco.html',
  title: 'Trabalhe conosco | grafMED',
  desc: 'Quer participar do time grafMED? Envie seu currículo para o nosso banco de talentos.',
  active: 'trabalhe-conosco',
  body: (r) => `
<section class="section page-top"><div class="wrap narrow">
  ${breadcrumb([['Trabalhe conosco']], r)}
  <h1 class="h1">Trabalhe <strong>conosco</strong></h1>
  <p class="lead dark">Quer participar do nosso time? Preencha o formulário e envie o link do seu currículo para o nosso banco de talentos.</p>
  <form class="form panel" data-form="trabalhe" novalidate>
    <div class="form-grid">
      <label class="field"><span>Nome</span><input name="nome" required autocomplete="name"></label>
      <label class="field"><span>E-mail</span><input name="email" type="email" required autocomplete="email"></label>
      <label class="field"><span>Telefone</span><input name="telefone" type="tel" data-mask-phone autocomplete="tel"></label>
      <label class="field"><span>Oportunidade</span><select name="area"><option>Produção</option><option>Qualidade</option><option>Comercial</option><option>Administrativo</option><option>Outra</option></select></label>
      <label class="field field-full"><span>Link do currículo ou LinkedIn</span><input name="curriculo" type="url" placeholder="https://"></label>
    </div>
    <label class="check"><input type="checkbox" name="lgpd" required> <span>Li e aceito a <a href="${r('privacidade.html')}">Política de privacidade</a>.</span></label>
    <p class="qf-error" data-error role="alert"></p>
    <button class="btn btn-dark" type="submit">Enviar</button>
  </form>
</div></section>
`,
});

// FAQ
const allFaq = Object.entries({ 'CME Hospitalar': faqs['cme-hospitalar'], grafDENTAL: faqs.grafdental, 'Rótulos e Etiquetas': faqs['rotulos-etiquetas'], Pulseiras: faqs.pulseiras, 'Conversão de Matéria-Prima': faqs.conversao, Geral: faqs.geral });
layout({
  path: 'faq.html',
  title: 'Perguntas frequentes | grafMED',
  desc: 'Respostas sobre etiquetas para autoclave e VPPH, grafDENTAL, rótulos, pulseiras e conversão de matéria-prima.',
  active: 'faq',
  schema: [faqSchema(allFaq.flatMap(([, v]) => v))],
  body: (r) => `
<section class="section page-top"><div class="wrap">
  ${breadcrumb([['Perguntas frequentes']], r)}
  <h1 class="h1">Perguntas <strong>frequentes</strong></h1>
  <div class="filters">${allFaq.map(([k], i) => `<a href="#faq-${i}">${k}</a>`).join('')}</div>
  <div class="faq-all">
    ${allFaq.map(([k, v], i) => `<div class="faq-group" id="faq-${i}"><h2 class="h4">${k}</h2>${accordion(v)}</div>`).join('')}
    <div class="custom-note">${ico('chat', 30)}<div><strong>Não encontrou a resposta?</strong><p>Um especialista responde pelo WhatsApp.</p></div>${wa('Olá! Tenho uma dúvida que não encontrei no FAQ.', `Perguntar agora ${arrow}`, 'btn btn-outline')}</div>
  </div>
</div></section>
`,
});

// QUALIDADE
layout({
  path: 'qualidade.html',
  title: 'Qualidade e certificações | grafMED',
  desc: 'Política de qualidade grafMED, RDC-15 ANVISA e ABNT NBR ISO 26825:2021.',
  active: 'qualidade',
  body: (r) => `
<section class="section page-top"><div class="wrap narrow prose">
  ${breadcrumb([['Qualidade e certificações']], r)}
  <h1 class="h1">Qualidade e <strong>certificações</strong></h1>
  <p class="lead dark">Qualidade e conformidade fazem parte do nosso DNA.</p>
  <h2>Política de qualidade</h2>
  <p>Texto da política de qualidade a ser entregue pela SPiCOM8.</p>
  <h2>RDC-15 (ANVISA)</h2>
  <p>Nossas etiquetas e indicadores apoiam os registros de rastreabilidade previstos para o processamento de produtos para saúde.</p>
  <h2>ABNT NBR ISO 26825:2021</h2>
  <p>As etiquetas adesivas para seringas seguem a norma, com cores padronizadas para a administração segura de medicamentos.</p>
</div></section>
`,
});

// PRIVACIDADE
layout({
  path: 'privacidade.html',
  title: 'Política de privacidade e LGPD | grafMED',
  desc: 'Como a grafMED trata os dados pessoais enviados pelo site, conforme a LGPD.',
  active: 'privacidade',
  body: (r) => `
<section class="section page-top"><div class="wrap narrow prose">
  ${breadcrumb([['Privacidade']], r)}
  <h1 class="h1">Política de <strong>privacidade</strong></h1>
  <p><em>Texto-base para revisão jurídica.</em></p>
  <h2>Dados que coletamos</h2><p>Nome, e-mail, telefone, empresa, cidade e segmento, quando você os envia por formulário ou WhatsApp.</p>
  <h2>Para que usamos</h2><p>Responder solicitações de orçamento e contato, e medir o desempenho do site e das campanhas (com o seu consentimento para cookies de medição).</p>
  <h2>Cookies</h2><p>Usamos cookies essenciais e, com o seu consentimento, cookies de medição do Google. Você pode mudar sua escolha em “Preferências de cookies”, no rodapé.</p>
  <h2>Seus direitos</h2><p>Você pode pedir acesso, correção ou exclusão dos seus dados pelo e-mail <a href="mailto:${config.email}">${config.email}</a>.</p>
</div></section>
`,
});

// 404
layout({
  path: '404.html',
  title: 'Página não encontrada | grafMED',
  desc: 'A página que você procura mudou de endereço.',
  active: '404',
  head: '<meta name="robots" content="noindex">',
  body: (r) => `
<section class="hero hero-page hero--orange">${deco()}<div class="wrap narrow center">
  <h1 class="display">Essa página <strong>mudou de endereço.</strong></h1>
  <p class="lead">O site da grafMED foi renovado. Encontre o que procura pelas linhas de produto ou fale com um especialista.</p>
  <div class="hero-cta center"><a class="btn btn-ghost-white" href="${r('produtos/index.html')}">Ver produtos</a>${ctaSpecialist('Olá! Quero falar com um especialista grafMED.', 'btn-white')}</div>
</div></section>
`,
});

// ---------- arquivos de apoio ----------
writeFileSync(join(ROOT, 'assets/js/config.js'), `// Gerado a partir de src/config.mjs\nwindow.GM_CONFIG = ${JSON.stringify(config, null, 2)};\n`);
// só cria o arquivo se ele não existir, para não apagar as edições da equipe
if (!existsSync(join(ROOT, 'data/destaques.js'))) writeFileSync(
  join(ROOT, 'data/destaques.js'),
  `// MAIS VENDIDO DA SEMANA: rotação automática.
// O site calcula a semana do ano (ISO) e mostra o próximo item desta lista, em rodízio.
// A equipe só mantém a lista (ordem = ordem do rodízio). Para fixar um produto numa semana: fixo: { "2026-W48": "id-do-produto" }.
// Na versão Wix: Coleção do CMS (produto, ordem, ativo) e o mesmo cálculo em Velo.
window.GM_DESTAQUES = ${JSON.stringify({ rodizio: weekProducts.map((p) => ({ id: p.id, name: p.name, line: lineBy(p.line).name, desc: p.short, img: p.img, url: productUrl(p), pontos: (hotspots[p.id] || []).map(([x, y, titulo, texto]) => ({ x, y, titulo, texto })) })), fixo: {} }, null, 2)};
`
);
const today = new Date().toISOString().slice(0, 10);
const indexable = pages.filter((p) => !['orcamento.html', 'obrigado.html', '404.html'].includes(p));
writeFileSync(join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexable.map((p) => `  <url><loc>${site.url}/${p === 'index.html' ? '' : p}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
writeFileSync(join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /orcamento.html\nDisallow: /obrigado.html\nSitemap: ${site.url}/sitemap.xml\n`);
const allRedirects = [...redirects];
for (const p of products) if (p.source) allRedirects.push([decodeURI(new URL(p.source).pathname), '/' + productUrl(p)]);
for (const a of articles) if (a.source) allRedirects.push([decodeURI(new URL(a.source).pathname), `/noticias/${a.slug}.html`]);
writeFileSync(join(ROOT, '_redirects'), allRedirects.map(([a, b]) => `${encodeURI(a)}  ${b}  301`).join('\n') + '\n');
writeFileSync(join(ROOT, 'vercel.json'), JSON.stringify({ redirects: allRedirects.map(([source, destination]) => ({ source: encodeURI(source), destination, permanent: true })) }, null, 2) + '\n');

console.log(`Geradas ${pages.length} páginas em site/ · ${products.length} produtos · ${articles.length} artigos · ${allRedirects.length} redirecionamentos`);
