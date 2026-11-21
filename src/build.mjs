// Gerador estático do site grafMED. Uso: node src/build.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site, lines, extras, products, faqs, homeFaq, testimonials, articles, materials, redirects } from './data.mjs';
import { config } from './config.mjs';
import { mockFor, roll, band, label, ico, logo, seal } from './mock.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'site');
const pages = [];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = (s) => String(s).replace(/<[^>]+>/g, '');
const lineBy = (slug) => lines.find((l) => l.slug === slug);
const productUrl = (p) => `produtos/${p.line}/${p.id}.html`;
const fmtDate = (d) => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

// ---------- componentes ----------
const wa = (msg, label, cls = 'btn btn-wa', attrs = '') =>
  `<a class="${cls}" data-wa="${esc(msg)}" href="https://wa.me/${config.whatsapp}?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener" ${attrs}>${label}</a>`;

const waIcon = `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z"/></svg>`;

const ctaSpecialist = (msg = 'Olá! Quero falar com um especialista grafMED.', extra = '') =>
  wa(msg, `<span class="pulse" aria-hidden="true"></span>${waIcon}<span>Fale com um especialista</span>`, `btn btn-primary ${extra}`, 'data-track="whatsapp"');

const eyebrow = (t) => `<p class="eyebrow">${t}</p>`;

const accordion = (items, { schema = false, group = 'faq' } = {}) => `
<div class="acc" data-acc>
  ${items
    .map(
      ([q, a], i) => `<details class="acc-item"${schema ? ' itemscope itemprop="mainEntity" itemtype="https://schema.org/Question"' : ''}>
    <summary><span${schema ? ' itemprop="name"' : ''}>${q}</span><i aria-hidden="true"></i></summary>
    <div class="acc-body"${schema ? ' itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer"' : ''}><p${schema ? ' itemprop="text"' : ''}>${a}</p></div>
  </details>`
    )
    .join('')}
</div>`;

const faqSchema = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
});

const productCard = (p, r) => `
<article class="pcard reveal">
  <a class="pcard-media tilt" href="${r(productUrl(p))}" aria-label="${esc(p.name)}">${mockFor(p.mock, { variant: p.variant, color: p.mock === 'band' ? p.colors.find((c) => c !== '#FFFFFF') || '#FFFFFF' : undefined, text: p.mock === 'band' ? (p.variant === 'hosp' ? 'NOME DO PACIENTE' : p.variant === 'water' ? 'PARQUE · DIA 12' : 'EVENTO 2026') : undefined })}</a>
  <div class="pcard-body">
    <p class="pcard-line">${lineBy(p.line).name}</p>
    <h3><a href="${r(productUrl(p))}">${p.name}</a></h3>
    <p>${p.short}</p>
    <div class="pcard-actions">
      <a class="btn btn-ghost btn-sm" href="${r(productUrl(p))}">Ver produto</a>
      <button class="btn btn-line btn-sm" type="button" data-add='${esc(JSON.stringify({ id: p.id, name: p.name, line: lineBy(p.line).name, url: productUrl(p) }))}'>+ Orçamento</button>
    </div>
  </div>
</article>`;

const lineCard = (l, r, i) => `
<a class="lcard reveal" href="${r(`produtos/${l.slug}.html`)}" style="--d:${i * 60}ms">
  <div class="lcard-media">${mockFor(l.mock, { variant: l.slug === 'rotulos-etiquetas' ? undefined : 'vapor' })}</div>
  <div class="lcard-body">
    <span class="code">${l.code} · 0${i + 1}</span>
    <h3>${l.name}</h3>
    <p>${l.short}</p>
  </div>
  <span class="arrow" aria-hidden="true">→</span>
</a>`;

const originalCallout = (r, txt = 'Produtos grafMED e grafDENTAL saem da fábrica com o selo Original. Exigir o original protege o paciente.') => `
<aside class="original reveal">
  ${seal({ size: 84 })}
  <div><strong>Original grafMED</strong><p>${txt}</p></div>
  <a class="link" href="${r('canal-parceiro.html')}">Conheça o Canal Parceiro →</a>
</aside>`;

const proof = (r) => `
<section class="section proof">
  <div class="wrap">
    <div class="proof-head">${eyebrow('Quem confia')}<h2 class="h3">A confiança de quem é referência no mercado.</h2></div>
    <div class="marquee" aria-label="Logos de clientes">
      <div class="marquee-track">
        ${Array.from({ length: 16 }, (_, i) => `<span class="logo-slot">Cliente ${String((i % 8) + 1).padStart(2, '0')}</span>`).join('')}
      </div>
    </div>
    <div class="testis">
      ${testimonials
        .map(
          ([who, where, quote]) => `<figure class="testi reveal"><blockquote>“${quote}”</blockquote><figcaption><strong>${who}</strong><span>${where}</span></figcaption></figure>`
        )
        .join('')}
    </div>
  </div>
</section>`;

const faqBlock = (items, r, title = 'Perguntas frequentes') => `
<section class="section">
  <div class="wrap faq-wrap">
    <div>${eyebrow('FAQ')}<h2 class="h3">${title}</h2><p class="muted">Não achou a sua dúvida?</p>${wa('Olá! Tenho uma dúvida sobre os produtos grafMED.', 'Pergunte no WhatsApp →', 'link')}<p><a class="link" href="${r('faq.html')}">Ver todas as perguntas →</a></p></div>
    ${accordion(items)}
  </div>
</section>`;

const ctaBand = (title, text, msg) => `
<section class="section">
  <div class="wrap">
    <div class="cta-band reveal">
      <div><h2 class="h3">${title}</h2><p>${text}</p></div>
      <div class="cta-actions">${ctaSpecialist(msg)}<button class="btn btn-ghost" type="button" data-open-form>Prefiro deixar meus dados</button></div>
    </div>
  </div>
</section>`;

const breadcrumb = (items, r) => `
<nav class="crumbs" aria-label="Você está em"><a href="${r('index.html')}">Home</a>${items
  .map(([t, u]) => ` <span aria-hidden="true">›</span> ${u ? `<a href="${r(u)}">${t}</a>` : `<span aria-current="page">${t}</span>`}`)
  .join('')}</nav>`;

// ---------- layout ----------
function layout({ path, title, desc, body, schema = [], active = '', head = '' }) {
  const depth = path.split('/').length - 1;
  const pre = '../'.repeat(depth);
  const r = (u) => pre + u;
  const canonical = `${site.url}/${path === 'index.html' ? '' : path}`;
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'grafMED',
    url: site.url,
    logo: `${site.url}/assets/img/logo.svg`,
    sameAs: [config.instagram, config.linkedin],
    contactPoint: { '@type': 'ContactPoint', contactType: 'sales', areaServed: 'BR', availableLanguage: 'Portuguese' },
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
<meta property="og:locale" content="pt_BR">
<meta name="theme-color" content="#FBFAF8">
<link rel="icon" href="${r('assets/img/favicon.svg')}" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${r('assets/css/style.css')}">
<script src="${r('assets/js/config.js')}"></script>
<script src="${r('assets/js/tracking.js')}"></script>
${head}
${[orgSchema, ...schema].map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n')}
</head>
<body data-root="${pre}" data-page="${esc(active)}">
<a class="skip" href="#main">Pular para o conteúdo</a>
<header class="hdr" data-hdr>
  <div class="wrap hdr-in">
    <a class="brand" href="${r('index.html')}" aria-label="grafMED, ir para a Home">${logo()}</a>
    <nav class="nav" data-nav aria-label="Menu principal">
      <div class="nav-item has-sub">
        <button class="nav-link${active.startsWith('produtos') ? ' is-active' : ''}" type="button" aria-expanded="false" data-sub>Produtos <i aria-hidden="true"></i></button>
        <div class="sub sub-mega">
          <div class="sub-grid">
            ${navProd
              .map(
                (l) => `<a class="sub-card" href="${r(`produtos/${l.slug}.html`)}"><span class="code">${l.code}</span><strong>${l.name}</strong><small>${l.short}</small></a>`
              )
              .join('')}
          </div>
          <a class="sub-all" href="${r('produtos/index.html')}">Ver todas as linhas →</a>
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
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9h18l-2 11H5z"/><path d="M8 9l4-6 4 6"/></svg>
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
  <div class="wrap">
    <div class="ftr-top">
      <div class="ftr-brand">
        <a href="${r('index.html')}" aria-label="grafMED">${logo()}</a>
        <p>Indústria brasileira de etiquetas, fitas indicadoras, rótulos e pulseiras de identificação. Conversão de matéria-prima sob medida.</p>
        <div class="social">
          <a href="${config.instagram}" target="_blank" rel="noopener" aria-label="Instagram @grafmed.oficial"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg></a>
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
        ${wa('Olá! Vim pelo site da grafMED.', `${waIcon} WhatsApp`, 'ftr-wa')}
        <a href="mailto:${config.email}" data-email>${config.email}</a>
        <span data-address>${config.address}</span>
      </div>
    </div>
    <div class="ftr-map" data-map hidden></div>
    <div class="ftr-bottom">
      <span>© <span data-year>2026</span> grafMED® · Todos os direitos reservados</span>
      <span>CNPJ a confirmar · <a href="${r('privacidade.html')}">Política de privacidade</a> · <button type="button" class="linklike" data-cookie-open>Preferências de cookies</button></span>
    </div>
  </div>
</footer>

${wa('Olá! Vim pelo site da grafMED e quero falar com um especialista.', `${waIcon}<span class="sr">Falar no WhatsApp</span>`, 'wa-float', 'data-track="whatsapp" aria-label="Falar no WhatsApp"')}

<div class="toast" role="status" aria-live="polite" data-toast></div>

<dialog class="modal" data-form-modal aria-labelledby="qf-title">
  <button class="modal-x" type="button" data-close aria-label="Fechar">×</button>
  <p class="eyebrow">Leva dois minutos</p>
  <h2 id="qf-title" class="h3">Deixe seus dados e um especialista chama você.</h2>
  <form class="quick-form" data-quick-form novalidate>
    <div class="qf-step is-on" data-step><label for="qf-nome">Seu nome</label><input id="qf-nome" name="nome" autocomplete="name" required placeholder="Como podemos te chamar?"></div>
    <div class="qf-step" data-step><label for="qf-email">Seu e-mail</label><input id="qf-email" name="email" type="email" autocomplete="email" required placeholder="nome@empresa.com.br"></div>
    <div class="qf-step" data-step><label for="qf-tel">Seu telefone</label><input id="qf-tel" name="telefone" type="tel" autocomplete="tel" inputmode="tel" required placeholder="(11) 90000-0000" data-mask-phone></div>
    <p class="qf-error" data-error role="alert"></p>
    <button class="btn btn-ink" type="submit" data-next>Continuar →</button>
    <p class="qf-alt">Prefere conversar agora? ${wa('Olá! Quero falar com um especialista grafMED.', 'Abrir o WhatsApp', 'link', 'data-track="whatsapp"')}</p>
  </form>
  <div class="qf-done" data-done hidden>${ico('check', 48)}<h3>Recebemos seus dados.</h3><p>Um especialista grafMED vai falar com você em breve.</p></div>
</dialog>

<div class="cookie" data-cookie hidden>
  <p>Usamos cookies para medir o desempenho do site e das campanhas. Veja a <a href="${r('privacidade.html')}">Política de privacidade</a>.</p>
  <div><button class="btn btn-ghost btn-sm" type="button" data-cookie-deny>Somente essenciais</button><button class="btn btn-ink btn-sm" type="button" data-cookie-ok>Aceitar</button></div>
</div>

<script src="${r('data/destaques.js')}"></script>
<script src="${r('assets/js/app.js')}"></script>
</body>
</html>
`;
  const out = join(ROOT, path);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  pages.push(path);
}

// ---------- páginas ----------

// HOME — até três dobras
layout({
  path: 'index.html',
  title: 'grafMED | Etiquetas, fitas indicadoras e identificação para saúde e indústria',
  desc: site.description,
  active: 'home',
  schema: [faqSchema(homeFaq)],
  body: (r) => `
<section class="hero">
  <div class="wrap hero-in">
    <div class="hero-copy">
      ${eyebrow('Identificação e rastreabilidade · Indústria nacional')}
      <h1 class="display">Cada instrumental tem um histórico. <em>Nós o tornamos visível.</em></h1>
      <p class="lead">Etiquetas, fitas indicadoras, rótulos e pulseiras de identificação para CME, odontologia e indústria. Do desenvolvimento à entrega.</p>
      <div class="hero-cta">
        ${ctaSpecialist('Olá! Vim pela página inicial e quero falar com um especialista grafMED.', 'btn-lg')}
        <button class="btn btn-ghost btn-lg" type="button" data-open-form>Prefiro deixar meus dados</button>
      </div>
      <ul class="hero-trust"><li>RDC-15</li><li>ABNT NBR ISO 26825</li><li>Atendimento em todo o Brasil</li></ul>
    </div>
    <div class="hero-sim reveal" data-sim>
      <div class="sim-card">
        <div class="sim-top"><span class="dot"></span>Simule um ciclo de esterilização a vapor<span class="sim-temp" data-sim-temp>25 °C</span></div>
        <div class="sim-label">
          <div class="sim-label-main">
            <div class="sim-brand">${logo()}</div>
            <dl><div><dt>Lote</dt><dd>0427</dd></div><div><dt>Data</dt><dd data-sim-date>--/--</dd></div><div><dt>Ciclo</dt><dd>12</dd></div><div><dt>Resp.</dt><dd>A.S.</dd></div></dl>
            <div class="sim-ind" data-sim-ind><span>INDICADOR</span></div>
          </div>
          <div class="sim-label-stub"><div class="sim-ind sm" data-sim-ind2></div><span>Prontuário</span></div>
        </div>
        <label class="sim-range"><span class="sr">Progresso do ciclo</span>
          <input type="range" min="0" max="100" value="0" data-sim-range aria-label="Progresso do ciclo de esterilização">
        </label>
        <div class="sim-steps"><span>Carga</span><span>Aquecimento</span><span>Esterilização</span><span>Secagem</span></div>
        <p class="sim-status" data-sim-status aria-live="polite">Arraste para iniciar o ciclo.</p>
      </div>
      <p class="sim-note">Ilustração interativa. A cor real do indicador segue a especificação de cada produto.</p>
    </div>
  </div>
</section>

<section class="section section-tight">
  <div class="wrap">
    <div class="sec-head">${eyebrow('Linhas de produto')}<h2 class="h2">Encontre a <em>linha certa</em> para o seu processo.</h2></div>
    <div class="lgrid">${[...lines, ...extras].map((l, i) => lineCard(l, r, i)).join('')}</div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="week reveal" data-week>
      <div class="week-media tilt" data-week-media></div>
      <template data-mock-tpl="roll">${roll({ variant: 'vapor' })}</template>
      <template data-mock-tpl="tape">${mockFor('tape', { variant: 'vapor' })}</template>
      <template data-mock-tpl="band">${band({ color: '#FFFFFF', text: 'NOME DO PACIENTE' })}</template>
      <template data-mock-tpl="label">${label()}</template>
      <div class="week-body">
        <p class="eyebrow"><span class="pulse pulse-static" aria-hidden="true"></span> Mais vendido da semana · <span data-week-label>semana</span></p>
        <h2 class="h3" data-week-name>Carregando destaque…</h2>
        <p data-week-desc></p>
        <div class="week-actions" data-week-actions></div>
      </div>
    </div>
  </div>
</section>

${proof(r)}
${faqBlock(homeFaq, r)}
`,
});

// PRODUTOS — índice
layout({
  path: 'produtos/index.html',
  title: 'Produtos grafMED | Linhas CME, grafDENTAL, rótulos, pulseiras e conversão',
  desc: 'Conheça as linhas de produto grafMED: CME Hospitalar, grafDENTAL, Rótulos e Etiquetas, Pulseiras de Identificação, Conversão de Matéria-Prima e Projetos.',
  active: 'produtos',
  body: (r) => `
<section class="page-hero"><div class="wrap">
  ${breadcrumb([['Produtos']], r)}
  <h1 class="display-sm">Soluções por aplicação, <em>não por catálogo.</em></h1>
  <p class="lead">Escolha a linha do seu processo. Se não encontrar o que precisa, a grafMED desenvolve.</p>
</div></section>
<section class="section section-tight"><div class="wrap"><div class="lgrid">${[...lines, ...extras].map((l, i) => lineCard(l, r, i)).join('')}</div></div></section>
${proof(r)}
${faqBlock(faqs.geral, r)}
`,
});

// LINHAS
for (const l of lines) {
  const items = products.filter((p) => p.line === l.slug);
  const lf = faqs[l.slug];
  let interactive = '';
  if (l.slug === 'pulseiras') {
    interactive = `
<section class="section"><div class="wrap">
  <div class="builder reveal" data-band-builder>
    <div class="builder-media" data-band-preview>${band({ color: '#F29727', text: 'SEU EVENTO 2026', variant: 'event' })}</div>
    <div class="builder-body">
      ${eyebrow('Monte uma prévia')}
      <h2 class="h3">Como fica a pulseira do seu evento?</h2>
      <p class="muted">Escolha a cor e o texto. A prévia vai junto na mensagem para o especialista.</p>
      <fieldset class="swatches" aria-label="Cor da pulseira">${['#F29727', '#1E212E', '#7AA7E0', '#7BC4A4', '#E58FA8', '#FFFFFF']
        .map((c, i) => `<label><input type="radio" name="bcolor" value="${c}"${i === 0 ? ' checked' : ''}><span style="--c:${c}"></span><b class="sr">${c}</b></label>`)
        .join('')}</fieldset>
      <label class="field"><span>Texto impresso</span><input maxlength="22" value="SEU EVENTO 2026" data-band-text></label>
      <label class="field"><span>Uso</span><select data-band-use><option>Evento</option><option>Hospital</option><option>Parque aquático</option></select></label>
      ${wa('Olá! Quero orçar pulseiras.', `${waIcon} Pedir esta pulseira no WhatsApp`, 'btn btn-primary', 'data-band-wa data-track="whatsapp"')}
    </div>
  </div>
</div></section>`;
  }
  if (l.slug === 'rotulos-etiquetas') {
    interactive = `
<section class="section"><div class="wrap">
  <div class="builder reveal" data-label-builder>
    <div class="builder-media" data-label-preview>${label()}</div>
    <div class="builder-body">
      ${eyebrow('Monte uma prévia')}
      <h2 class="h3">Veja o seu rótulo antes de pedir.</h2>
      <p class="muted">Uma prévia simples para orientar a conversa com o especialista.</p>
      <label class="field"><span>Nome da marca</span><input maxlength="16" value="SUA MARCA" data-label-text></label>
      <label class="field"><span>Material</span><select data-label-mat><option value="#ffffff">Papel couché branco</option><option value="#F7F3EA">BOPP perolado</option><option value="rgba(255,255,255,.35)">BOPP transparente</option><option value="#1E212E">Papel preto</option></select></label>
      <fieldset class="swatches" aria-label="Cor de destaque">${['#F29727', '#BF5E26', '#7BC4A4', '#7AA7E0', '#E58FA8']
        .map((c, i) => `<label><input type="radio" name="lcolor" value="${c}"${i === 0 ? ' checked' : ''}><span style="--c:${c}"></span><b class="sr">${c}</b></label>`)
        .join('')}</fieldset>
      ${wa('Olá! Quero orçar rótulos personalizados.', `${waIcon} Pedir este rótulo no WhatsApp`, 'btn btn-primary', 'data-label-wa data-track="whatsapp"')}
    </div>
  </div>
</div></section>`;
  }
  layout({
    path: `produtos/${l.slug}.html`,
    title: `${l.name} | grafMED`,
    desc: `${l.short} ${l.heroText}`.slice(0, 158),
    active: `produtos-${l.slug}`,
    schema: lf ? [faqSchema(lf)] : [],
    body: (r) => `
<section class="page-hero page-hero-split"><div class="wrap split">
  <div>
    ${breadcrumb([['Produtos', 'produtos/index.html'], [l.name]], r)}
    <p class="code">${l.code} · ${l.audience}</p>
    <h1 class="display-sm">${l.heroTitle}</h1>
    <p class="lead">${l.heroText}</p>
    <div class="hero-cta">${ctaSpecialist(`Olá! Quero falar com um especialista sobre a linha ${l.name}.`)}<a class="btn btn-ghost" href="#produtos">Ver produtos</a></div>
  </div>
  <div class="page-hero-media tilt">${mockFor(l.mock, { variant: 'vapor' })}</div>
</div></section>
${l.original ? `<div class="wrap">${originalCallout(r)}</div>` : ''}
<section class="section" id="produtos"><div class="wrap">
  <div class="sec-head">${eyebrow('Produtos de linha')}<h2 class="h2">${l.name}</h2></div>
  <div class="pgrid">${items.map((p) => productCard(p, r)).join('')}</div>
  <div class="custom-note reveal">${ico('chat', 32)}<div><strong>Precisa de outra medida ou formato?</strong><p>Mostramos aqui só o que tem em estoque. Para medida personalizada, fale com o especialista.</p></div>${wa(`Olá! Preciso de uma medida personalizada na linha ${l.name}.`, 'Falar com o especialista →', 'link', 'data-track="whatsapp"')}</div>
</div></section>
${interactive}
${l.norms.length ? `<section class="section section-tight"><div class="wrap"><div class="norms reveal">${ico('shield', 36)}<div><h2 class="h4">Conformidade</h2><p>Produtos desenvolvidos para apoiar a rastreabilidade e a conformidade do seu processo.</p></div><ul>${l.norms.map((n) => `<li>${n}</li>`).join('')}</ul><a class="link" href="${r('qualidade.html')}">Qualidade e certificações →</a></div></div></section>` : ''}
${proof(r)}
${lf ? faqBlock(lf, r, `Dúvidas sobre ${l.name}`) : ''}
`,
  });
}

// PRODUTOS — páginas individuais
for (const p of products) {
  const l = lineBy(p.line);
  const tabs = [
    ['Uso', p.tabs.uso],
    ['Características', p.tabs.caracteristicas],
    ['Diferenciais', p.tabs.diferenciais],
  ];
  if (p.colors.length && p.mock !== 'band') tabs.push(['Etiquetas coloridas', `Disponível nas cores abaixo. Selecione uma cor para ver na prévia.`]);
  const related = products.filter((x) => x.line === p.line && x.id !== p.id).slice(0, 3);
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.short,
    brand: { '@type': 'Brand', name: p.line === 'grafdental' ? 'grafDENTAL' : 'grafMED' },
    manufacturer: { '@type': 'Organization', name: 'grafMED' },
    category: l.name,
    url: `${site.url}/${productUrl(p)}`,
  };
  const payload = esc(JSON.stringify({ id: p.id, name: p.name, line: l.name, url: productUrl(p) }));
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
    <div class="gallery" data-gallery>
      <div class="gallery-stage tilt" data-stage>
        <div class="gallery-view is-on" data-view="impressa">${mockFor(p.mock, { variant: p.variant, printed: true, color: p.colors[0] || '#FFFFFF', text: p.mock === 'band' ? 'NOME DO PACIENTE' : undefined })}</div>
        ${p.printedBlank ? `<div class="gallery-view" data-view="branco">${mockFor(p.mock, { variant: p.variant, printed: false })}</div>` : ''}
        <span class="ph-note">Ilustração · foto real do catálogo na publicação</span>
      </div>
      ${p.printedBlank ? `<div class="seg" role="tablist" aria-label="Versão da etiqueta"><button role="tab" aria-selected="true" data-show="impressa">Impressa</button><button role="tab" aria-selected="false" data-show="branco">Em branco</button></div>` : ''}
      ${p.colors.length ? `<div class="swatches swatches-lg" data-colors aria-label="Cores disponíveis">${p.colors.map((c, i) => `<button type="button" style="--c:${c}" aria-label="Cor ${i + 1}" data-color="${c}"${i === 0 ? ' aria-pressed="true"' : ''}></button>`).join('')}</div>` : ''}
    </div>
    <div class="pinfo">
      <p class="code">${l.name}</p>
      <h1 class="h2">${p.name}</h1>
      <p class="lead">${p.short}</p>
      ${p.measures.length ? `<div class="measures"><span class="lbl">Medidas em estoque</span><div class="chips" role="radiogroup" aria-label="Medida">${p.measures.map((m, i) => `<label class="chip"><input type="radio" name="medida" value="${esc(m)}"${i === 0 ? ' checked' : ''}><span>${m}</span></label>`).join('')}</div></div>` : `<div class="measures"><span class="lbl">Sob medida</span><p class="muted">Produzido conforme o seu projeto: formato, cor e personalização.</p></div>`}
      <div class="buy">
        <div class="qty" data-qty><button type="button" aria-label="Diminuir quantidade" data-dec>−</button><input type="number" min="1" value="1" aria-label="Quantidade" data-qty-input><button type="button" aria-label="Aumentar quantidade" data-inc>+</button></div>
        <button class="btn btn-ink" type="button" data-add='${payload}' data-add-detail>Adicionar ao orçamento</button>
      </div>
      ${ctaSpecialist(`Olá! Tenho interesse no produto: ${p.name}.`, 'btn-block')}
      <p class="custom-inline">${ico('chat', 20)} Precisa de outra medida? ${wa(`Olá! Preciso de uma medida personalizada de ${p.name}.`, 'Fale com o especialista', 'link', 'data-track="whatsapp"')}</p>
      ${accordion(tabs)}
      ${p.copied ? originalCallout(r, `Este é um dos produtos mais copiados do mercado. Confira o selo Original grafMED na embalagem e compre de parceiros credenciados.`) : ''}
    </div>
  </div>
</div></section>
${related.length ? `<section class="section"><div class="wrap"><div class="sec-head">${eyebrow('Da mesma linha')}<h2 class="h3">Veja também</h2></div><div class="pgrid">${related.map((x) => productCard(x, r)).join('')}</div></div></section>` : ''}
${faqs[p.line] ? faqBlock(faqs[p.line].slice(0, 3), r) : ''}
`,
  });
}

// CONVERSÃO
layout({
  path: 'produtos/conversao-materia-prima.html',
  title: 'Conversão de Matéria-Prima | Corte de bobinas e montagem de kits | grafMED',
  desc: 'Você envia a bobina, a grafMED corta, monta, embala e entrega pronto para uso ou revenda. Conversão de velcro, feltro, micropore, fita de bordo e mais.',
  active: 'produtos-conversao',
  schema: [faqSchema(faqs.conversao)],
  body: (r) => `
<section class="page-hero page-hero-split"><div class="wrap split">
  <div>
    ${breadcrumb([['Produtos', 'produtos/index.html'], ['Conversão de Matéria-Prima']], r)}
    <p class="code">CONV · Diretores industriais e gerentes de operações</p>
    <h1 class="display-sm">Precisamos apenas do seu material <em>para a conversão.</em></h1>
    <p class="lead">Você envia a bobina. A grafMED corta, monta, embala e entrega pronto para uso ou revenda, sem você precisar de máquinas ou equipe de acabamento.</p>
    <div class="hero-cta">${ctaSpecialist('Olá! Quero um orçamento de conversão de matéria-prima.')}</div>
  </div>
  <div class="conv-anim" aria-hidden="true">
    <div class="conv-belt"><span></span><span></span><span></span><span></span><span></span><span></span></div>
    <div class="conv-in">${roll({ variant: 'blank' })}</div>
    <div class="conv-out">${ico('box', 90)}</div>
  </div>
</div></section>

<section class="section"><div class="wrap">
  <div class="sec-head">${eyebrow('Como funciona · 4 etapas')}<h2 class="h2">Do rolo ao kit, <em>sem passar pela sua linha.</em></h2></div>
  <ol class="flow" data-flow>
    ${[
      ['roll', 'Você envia', 'Bobina ou rolo de matéria-prima.'],
      ['cut', 'grafMED processa', 'Corte, montagem e acabamento.'],
      ['box', 'Kit embalado', 'Unitário ou em lote.'],
      ['truck', 'Entrega', 'Pronto para uso ou revenda.'],
    ]
      .map(([i, t, d], n) => `<li class="flow-step" data-flow-step><span class="flow-ico">${ico(i, 34)}</span><span class="flow-n">0${n + 1}</span><h3>${t}</h3><p>${d}</p></li>`)
      .join('')}
  </ol>
</div></section>

<section class="section section-soft"><div class="wrap">
  <div class="sec-head">${eyebrow('Por que terceirizar')}<h2 class="h2">Menos etapas na sua planta.</h2></div>
  <div class="benefits">
    ${[
      ['clock', 'Tempo', 'Elimina etapas do seu processo produtivo interno.'],
      ['space', 'Espaço', 'Sem máquinas de corte e acabamento na sua planta.'],
      ['coin', 'Custo', 'Sem mão-de-obra especializada de acabamento.'],
      ['check', 'Qualidade', 'Corte preciso e embalagem padronizada.'],
    ]
      .map(([i, t, d]) => `<div class="benefit reveal">${ico(i, 30)}<h3>${t}</h3><p>${d}</p></div>`)
      .join('')}
  </div>
</div></section>

<section class="section"><div class="wrap">
  <div class="sec-head">${eyebrow('Quem usa')}<h2 class="h2">Cases por segmento</h2></div>
  <div class="cases">
    ${[
      ['Automotivo', 'Peças em velcro', 'Bobinas de velcro convertidas em moedas e pastilhas para montagem de câmbio e peças de silicone.'],
      ['Moveleiro', 'Fita de bordo', 'Lâminas de madeira em rolo convertidas em peças cortadas prontas para aplicação no MDF.'],
      ['Farmacêutico', 'Kits de micropore', 'Bobinas de micropore e feltro montadas em kits individuais prontos para o processo do cliente.'],
    ]
      .map(([tag, t, d]) => `<article class="case reveal"><span class="tag">${tag}</span><h3>${t}</h3><p>${d}</p></article>`)
      .join('')}
  </div>
  <div class="materials">
    <h2 class="h4">Materiais que a grafMED converte</h2>
    <div class="chips">${materials.map((m) => wa(`Olá! Quero converter: ${m}.`, m, 'chip chip-link')).join('')}${wa('Olá! Quero saber se vocês convertem o meu material.', '+ consulte o seu material', 'chip chip-link chip-dashed')}</div>
  </div>
</div></section>

${ctaBand('Mande seu material. <em>A gente converte.</em>', 'Descreva o que precisa e receba o orçamento pelo WhatsApp.', 'Olá! Quero um orçamento de conversão de matéria-prima.')}
${faqBlock(faqs.conversao, r)}
`,
});

// PROJETOS — uma chamada só
layout({
  path: 'produtos/projetos.html',
  title: 'Projetos sob medida | grafMED desenvolve para você',
  desc: 'Não encontrou no nosso site? Fale com um especialista em projetos da grafMED e descreva a sua necessidade.',
  active: 'produtos-projetos',
  body: (r) => `
<section class="page-hero"><div class="wrap narrow center">
  ${breadcrumb([['Produtos', 'produtos/index.html'], ['Projetos']], r)}
  <h1 class="display-sm">Não encontrou no nosso site? <em>Fale com um especialista em projetos.</em></h1>
  <p class="lead">Conte o que você precisa. A grafMED avalia e desenvolve a solução para o seu processo.</p>
</div></section>
<section class="section section-tight"><div class="wrap">
  <div class="project-box reveal">
    <form class="form" data-form="projeto" novalidate>
      <div class="form-grid">
        <label class="field"><span>Nome</span><input name="nome" required autocomplete="name"></label>
        <label class="field"><span>Empresa</span><input name="empresa" autocomplete="organization"></label>
        <label class="field"><span>Telefone / WhatsApp</span><input name="telefone" type="tel" required data-mask-phone autocomplete="tel"></label>
        <label class="field"><span>E-mail</span><input name="email" type="email" required autocomplete="email"></label>
        <label class="field field-full"><span>Descreva a sua necessidade</span><textarea name="descricao" rows="5" required placeholder="Material, aplicação, medidas, volume… quanto mais detalhes, melhor."></textarea></label>
      </div>
      <p class="qf-error" data-error role="alert"></p>
      <button class="btn btn-ink" type="submit">Enviar para o especialista</button>
    </form>
    <div class="project-side">
      ${ico('chat', 40)}
      <h2 class="h4">Prefere explicar por mensagem?</h2>
      <p class="muted">Fotos, desenhos e amostras ajudam. Mande tudo pelo WhatsApp.</p>
      ${ctaSpecialist('Olá! Tenho um projeto sob medida e quero falar com um especialista em projetos.')}
    </div>
  </div>
</div></section>
`,
});

// NOTÍCIAS
layout({
  path: 'noticias.html',
  title: 'Notícias grafMED | Artigos técnicos, eventos e feiras',
  desc: 'Artigos técnicos sobre esterilização, rastreabilidade e identificação, e a agenda de eventos e feiras da grafMED.',
  active: 'noticias',
  body: (r) => `
<section class="page-hero"><div class="wrap">
  ${breadcrumb([['Notícias']], r)}
  <h1 class="display-sm">Notícias</h1>
  <p class="lead">Artigos técnicos, eventos e feiras.</p>
  <div class="filters" role="tablist" data-filters>
    <button role="tab" aria-selected="true" data-filter="all">Todos</button>
    <button role="tab" aria-selected="false" data-filter="artigos-tecnicos" id="artigos-tecnicos">Artigos técnicos</button>
    <button role="tab" aria-selected="false" data-filter="eventos-e-feiras" id="eventos-e-feiras">Eventos e feiras</button>
  </div>
</div></section>
<section class="section section-tight"><div class="wrap"><div class="agrid" data-articles>
  ${articles
    .map(
      (a) => `<article class="acard reveal" data-cat="${a.cat === 'Artigos técnicos' ? 'artigos-tecnicos' : 'eventos-e-feiras'}">
    <a href="${r(`noticias/${a.slug}.html`)}" class="acard-media">${a.cat === 'Artigos técnicos' ? roll({ variant: 'vapor' }) : ico('flag', 80)}</a>
    <div><span class="tag">${a.cat}</span><time datetime="${a.date}">${fmtDate(a.date)}</time></div>
    <h2 class="h4"><a href="${r(`noticias/${a.slug}.html`)}">${a.title}</a></h2>
    <p>${a.excerpt}</p>
  </article>`
    )
    .join('')}
</div></div></section>
`,
});

for (const a of articles) {
  const rel = articles.filter((x) => x.slug !== a.slug).slice(0, 2);
  layout({
    path: `noticias/${a.slug}.html`,
    title: `${a.title} | grafMED`,
    desc: a.excerpt,
    active: 'noticias',
    schema: [{ '@context': 'https://schema.org', '@type': 'Article', headline: a.title, datePublished: a.date, author: { '@type': 'Organization', name: 'grafMED' }, publisher: { '@type': 'Organization', name: 'grafMED' } }],
    body: (r) => `
<article class="post"><div class="wrap narrow">
  ${breadcrumb([['Notícias', 'noticias.html'], [a.cat]], r)}
  <span class="tag">${a.cat}</span>
  <h1 class="display-sm">${a.title}</h1>
  <p class="lead">${a.excerpt}</p>
  <time datetime="${a.date}" class="muted">${fmtDate(a.date)}</time>
  <div class="post-body">${a.body.map(([t, c]) => `<${t}>${c}</${t}>`).join('')}</div>
  <div class="post-cta">${ctaSpecialist(`Olá! Li o artigo "${a.title}" e quero falar com um especialista.`)}</div>
</div></article>
<section class="section"><div class="wrap narrow"><h2 class="h4">Artigos relacionados</h2><ul class="rel">${rel.map((x) => `<li><a href="${r(`noticias/${x.slug}.html`)}">${x.title} →</a></li>`).join('')}</ul></div></section>
`,
  });
}

// CONTATO
layout({
  path: 'contato.html',
  title: 'Contato | grafMED',
  desc: 'Fale com um especialista grafMED pelo WhatsApp, e-mail ou telefone. Trabalhe conosco.',
  active: 'contato',
  body: (r) => `
<section class="page-hero"><div class="wrap">
  ${breadcrumb([['Contato']], r)}
  <h1 class="display-sm">Fale com a grafMED.</h1>
  <p class="lead">O jeito mais rápido é pelo WhatsApp. Se preferir, deixe seus dados e a gente chama você.</p>
</div></section>
<section class="section section-tight"><div class="wrap contact">
  <div class="contact-main reveal">
    ${ico('chat', 40)}
    <h2 class="h3">WhatsApp comercial</h2>
    <p class="muted">Atendimento em horário comercial, direto com um especialista.</p>
    ${ctaSpecialist('Olá! Vim pela página de contato da grafMED.', 'btn-lg')}
    <hr>
    <h3 class="h4">Ou deixe seus dados</h3>
    <form class="quick-form inline" data-quick-form novalidate>
      <div class="qf-step is-on" data-step><label for="c-nome">Seu nome</label><input id="c-nome" name="nome" required autocomplete="name"></div>
      <div class="qf-step" data-step><label for="c-email">Seu e-mail</label><input id="c-email" name="email" type="email" required autocomplete="email"></div>
      <div class="qf-step" data-step><label for="c-tel">Seu telefone</label><input id="c-tel" name="telefone" type="tel" required data-mask-phone autocomplete="tel"></div>
      <p class="qf-error" data-error role="alert"></p>
      <button class="btn btn-ink" type="submit" data-next>Continuar →</button>
    </form>
    <div class="qf-done" data-done hidden>${ico('check', 40)}<h3>Recebemos seus dados.</h3><p>Um especialista vai falar com você em breve.</p></div>
  </div>
  <div class="contact-side">
    <div class="ch">${ico('mail', 26)}<div><strong>E-mail</strong><a href="mailto:${config.email}" data-email>${config.email}</a></div></div>
    <div class="ch">${ico('phone', 26)}<div><strong>Telefone</strong><span data-phone>${config.phone}</span></div></div>
    <div class="ch">${ico('pin', 26)}<div><strong>Fábrica</strong><span data-address>${config.address}</span><small class="muted">Endereço do galpão novo em breve.</small></div></div>
    <div class="ch ch-highlight">${ico('people', 26)}<div><strong>Trabalhe conosco</strong><span>Quer fazer parte da grafMED?</span><a class="link" href="${r('trabalhe-conosco.html')}">Envie seu currículo →</a></div></div>
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
<section class="page-hero"><div class="wrap">
  ${breadcrumb([['Orçamento']], r)}
  <h1 class="display-sm">Meu orçamento</h1>
  <p class="lead">Confira a lista, ajuste as quantidades e envie. Sem preço e sem checkout: um especialista retorna com a proposta.</p>
</div></section>
<section class="section section-tight"><div class="wrap quote">
  <div class="quote-list">
    <div data-cart-list></div>
    <div class="empty" data-cart-empty hidden>
      ${ico('box', 48)}
      <h2 class="h4">Seu orçamento está vazio.</h2>
      <p class="muted">Navegue pelas linhas e use “+ Orçamento” nos produtos.</p>
      <a class="btn btn-ink" href="${r('produtos/index.html')}">Ver produtos</a>
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
    <button class="btn btn-ghost btn-block" type="submit" data-via="email">Enviar por e-mail</button>
  </form>
</div></section>
`,
});

// OBRIGADO — dispara a conversão do Google Ads
layout({
  path: 'obrigado.html',
  title: 'Obrigado | grafMED',
  desc: 'Recebemos sua solicitação. Um especialista grafMED vai falar com você em breve.',
  active: 'obrigado',
  head: '<meta name="robots" content="noindex"><script>window.GM_CONVERSION_PAGE = true;</script>',
  body: (r) => `
<section class="page-hero thanks"><div class="wrap narrow center">
  <div class="thanks-ico">${ico('check', 64)}</div>
  <h1 class="display-sm">Obrigado! <em>Recebemos sua solicitação.</em></h1>
  <p class="lead">Um especialista grafMED vai falar com você em breve. Se quiser adiantar, chame no WhatsApp.</p>
  <div class="hero-cta center">${ctaSpecialist('Olá! Acabei de enviar uma solicitação pelo site.')}<a class="btn btn-ghost" href="${r('index.html')}">Voltar para a Home</a></div>
  <div class="thanks-summary" data-thanks-summary></div>
</div></section>
`,
});

// QUEM SOMOS — texto curto, sem foto da diretoria, sem animação no banner
layout({
  path: 'quem-somos.html',
  title: 'Quem somos | grafMED',
  desc: 'A grafMED é uma indústria brasileira de identificação e rastreabilidade, parceira da saúde há mais de 20 anos.',
  active: 'quem-somos',
  body: (r) => `
<section class="page-hero"><div class="wrap narrow">
  ${breadcrumb([['Quem somos']], r)}
  <h1 class="display-sm">Indústria de verdade <em>por trás de cada etiqueta.</em></h1>
  <p class="lead">Há mais de 20 anos a grafMED desenvolve e fabrica soluções de identificação para hospitais, consultórios e indústrias de todo o Brasil.</p>
</div></section>
<section class="section section-tight"><div class="wrap">
  <div class="stats">
    <div class="stat reveal"><b data-count="20">+20</b><span>anos de mercado</span></div>
    <div class="stat reveal"><b>100%</b><span>produção nacional</span></div>
    <div class="stat reveal"><b>RDC-15</b><span>apoio à rastreabilidade</span></div>
    <div class="stat reveal"><b>ISO</b><span>ABNT NBR ISO 26825:2021</span></div>
  </div>
</div></section>
<section class="section"><div class="wrap benefits">
  ${[
    ['factory', 'Tecnologia nacional', 'Agilidade e estabilidade de fornecimento.'],
    ['shield', 'Conformidade', 'RDC-15 e ABNT NBR ISO 26825:2021.'],
    ['star', 'Customização', 'Soluções sob medida para cada cliente.'],
    ['pin', 'Atendimento nacional', 'Rede de distribuição em todo o Brasil.'],
  ]
    .map(([i, t, d]) => `<div class="benefit reveal">${ico(i, 30)}<h3>${t}</h3><p>${d}</p></div>`)
    .join('')}
</div></section>
${ctaBand('Vamos mapear a rastreabilidade <em>da sua operação?</em>', 'Fale com um especialista e conte como funciona o seu processo hoje.', 'Olá! Quero mapear a rastreabilidade da minha operação.')}
`,
});

// CANAL PARCEIRO — "falamos de nós, nunca deles"
layout({
  path: 'canal-parceiro.html',
  title: 'Canal Parceiro | Programa Original grafMED',
  desc: 'Exigir o original protege o paciente. Conheça os selos Original grafMED, os parceiros credenciados e como se tornar um distribuidor.',
  active: 'canal-parceiro',
  body: (r) => `
<section class="page-hero page-hero-split"><div class="wrap split">
  <div>
    ${breadcrumb([['Canal Parceiro']], r)}
    <p class="code">Programa Original grafMED</p>
    <h1 class="display-sm">Exigir o original <em>protege o paciente.</em></h1>
    <p class="lead">Cada produto grafMED e grafDENTAL é desenvolvido, testado e fabricado para que a equipe confie no que lê. O selo Original garante essa origem.</p>
  </div>
  <div class="seal-hero">${seal({ size: 260 })}</div>
</div></section>
<section class="section"><div class="wrap">
  <div class="sec-head">${eyebrow('Por que exigir o original')}<h2 class="h2">O que está em jogo na esterilização.</h2></div>
  <div class="benefits three">
    ${[
      ['flag', 'Rastreabilidade', 'Lote e origem conhecidos, do fabricante até o prontuário.'],
      ['shield', 'Conformidade regulatória', 'Produto desenvolvido para apoiar as exigências da RDC-15.'],
      ['check', 'Segurança do paciente', 'Indicador que a equipe pode confiar na liberação do material.'],
    ]
      .map(([i, t, d]) => `<div class="benefit reveal">${ico(i, 30)}<h3>${t}</h3><p>${d}</p></div>`)
      .join('')}
  </div>
</div></section>
<section class="section section-soft"><div class="wrap">
  <div class="sec-head">${eyebrow('Selos')}<h2 class="h2">Selos Original grafMED</h2><p class="muted">Arte final dos selos em desenvolvimento. Exibição ilustrativa.</p></div>
  <div class="seals">
    <div class="seal-card reveal">${seal({ size: 110 })}<h3>Original grafMED</h3><p>Produto fabricado pela grafMED.</p></div>
    <div class="seal-card reveal">${seal({ size: 110, label: 'DENTAL' })}<h3>Original grafDENTAL</h3><p>Linha odontológica original.</p></div>
    <div class="seal-card reveal">${seal({ size: 110, label: 'PARCEIRO' })}<h3>Parceiro credenciado</h3><p>Distribuidor autorizado pela grafMED.</p></div>
  </div>
</div></section>
<section class="section"><div class="wrap">
  <div class="sec-head">${eyebrow('Onde comprar')}<h2 class="h2">Parceiros credenciados</h2></div>
  <div class="partner-tools"><input type="search" placeholder="Buscar por nome ou estado" aria-label="Buscar parceiro" data-partner-search></div>
  <div class="partners" data-partners></div>
</div></section>
<section class="section"><div class="wrap two">
  <div class="panel reveal">
    <h2 class="h4">Canal de denúncia</h2>
    <p class="muted">Viu um anúncio ou produto suspeito? Conte para a gente.</p>
    <form class="form" data-form="denuncia" novalidate>
      <label class="field"><span>Link ou local do anúncio</span><input name="link" required></label>
      <label class="field"><span>O que chamou sua atenção?</span><textarea name="descricao" rows="3" required></textarea></label>
      <label class="field"><span>Seu e-mail (opcional)</span><input name="email" type="email"></label>
      <p class="qf-error" data-error role="alert"></p>
      <button class="btn btn-ink" type="submit">Enviar denúncia</button>
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
      <button class="btn btn-ink" type="submit">Solicitar credenciamento</button>
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
  desc: 'Faça parte da grafMED. Envie seu currículo.',
  active: 'trabalhe-conosco',
  body: (r) => `
<section class="page-hero"><div class="wrap narrow">
  ${breadcrumb([['Trabalhe conosco']], r)}
  <h1 class="display-sm">Trabalhe <em>conosco.</em></h1>
  <p class="lead">Produção, qualidade, comercial e administrativo. Deixe seus dados e o link do seu currículo.</p>
</div></section>
<section class="section section-tight"><div class="wrap narrow">
  <form class="form panel" data-form="trabalhe" novalidate>
    <div class="form-grid">
      <label class="field"><span>Nome</span><input name="nome" required autocomplete="name"></label>
      <label class="field"><span>E-mail</span><input name="email" type="email" required autocomplete="email"></label>
      <label class="field"><span>Telefone</span><input name="telefone" type="tel" data-mask-phone autocomplete="tel"></label>
      <label class="field"><span>Área de interesse</span><select name="area"><option>Produção</option><option>Qualidade</option><option>Comercial</option><option>Administrativo</option><option>Outra</option></select></label>
      <label class="field field-full"><span>Link do currículo ou LinkedIn</span><input name="curriculo" type="url" placeholder="https://"></label>
    </div>
    <p class="qf-error" data-error role="alert"></p>
    <button class="btn btn-ink" type="submit">Enviar</button>
  </form>
</div></section>
`,
});

// FAQ
const allFaq = Object.entries({
  'CME Hospitalar': faqs['cme-hospitalar'],
  grafDENTAL: faqs.grafdental,
  'Rótulos e Etiquetas': faqs['rotulos-etiquetas'],
  Pulseiras: faqs.pulseiras,
  'Conversão de Matéria-Prima': faqs.conversao,
  Geral: faqs.geral,
});
layout({
  path: 'faq.html',
  title: 'Perguntas frequentes | grafMED',
  desc: 'Respostas sobre etiquetas para autoclave, grafDENTAL, rótulos, pulseiras e conversão de matéria-prima.',
  active: 'faq',
  schema: [faqSchema(allFaq.flatMap(([, v]) => v))],
  body: (r) => `
<section class="page-hero"><div class="wrap">
  ${breadcrumb([['Perguntas frequentes']], r)}
  <h1 class="display-sm">Perguntas frequentes</h1>
  <div class="filters" data-faq-nav>${allFaq.map(([k], i) => `<a href="#faq-${i}">${k}</a>`).join('')}</div>
</div></section>
<section class="section section-tight"><div class="wrap faq-all">
  ${allFaq.map(([k, v], i) => `<div class="faq-group" id="faq-${i}"><h2 class="h4">${k}</h2>${accordion(v)}</div>`).join('')}
  <div class="custom-note">${ico('chat', 32)}<div><strong>Não encontrou a resposta?</strong><p>Um especialista responde pelo WhatsApp.</p></div>${wa('Olá! Tenho uma dúvida que não encontrei no FAQ.', 'Perguntar agora →', 'link')}</div>
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
<section class="page-hero"><div class="wrap narrow">
  ${breadcrumb([['Qualidade e certificações']], r)}
  <h1 class="display-sm">Qualidade e <em>certificações.</em></h1>
  <p class="lead">Rigor de indústria hospitalar em todas as linhas.</p>
</div></section>
<section class="section section-tight"><div class="wrap narrow prose">
  <h2>Política de qualidade</h2>
  <p>Texto da política de qualidade a ser entregue pela SPiCOM8.</p>
  <h2>RDC-15 (ANVISA)</h2>
  <p>Nossas etiquetas e fitas indicadoras apoiam os registros de rastreabilidade previstos para o processamento de produtos para saúde.</p>
  <h2>ABNT NBR ISO 26825:2021</h2>
  <p>Referência normativa aplicada ao desenvolvimento das linhas de identificação.</p>
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
<section class="page-hero"><div class="wrap narrow">
  ${breadcrumb([['Privacidade']], r)}
  <h1 class="display-sm">Política de privacidade</h1>
</div></section>
<section class="section section-tight"><div class="wrap narrow prose">
  <p><em>Texto-base para revisão jurídica.</em></p>
  <h2>Dados que coletamos</h2><p>Nome, e-mail, telefone, empresa, cidade e segmento, quando você os envia por formulário ou WhatsApp.</p>
  <h2>Para que usamos</h2><p>Responder solicitações de orçamento e contato, e medir o desempenho do site e das campanhas (com o seu consentimento para cookies de medição).</p>
  <h2>Cookies</h2><p>Usamos cookies essenciais e, com o seu consentimento, cookies de medição do Google. Você pode mudar sua escolha a qualquer momento em “Preferências de cookies”, no rodapé.</p>
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
<section class="page-hero"><div class="wrap narrow center">
  <h1 class="display-sm">Essa página <em>mudou de endereço.</em></h1>
  <p class="lead">O site da grafMED foi renovado. Encontre o que procura pelas linhas de produto ou fale com um especialista.</p>
  <div class="hero-cta center"><a class="btn btn-ink" href="${r('produtos/index.html')}">Ver produtos</a>${ctaSpecialist()}</div>
</div></section>
`,
});

// ---------- arquivos de apoio ----------
writeFileSync(join(ROOT, 'assets/js/config.js'), `// Gerado a partir de src/config.mjs\nwindow.GM_CONFIG = ${JSON.stringify(config, null, 2)};\n`);
const today = new Date().toISOString().slice(0, 10);
const indexable = pages.filter((p) => !['orcamento.html', 'obrigado.html', '404.html'].includes(p));
writeFileSync(
  join(ROOT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexable
    .map((p) => `  <url><loc>${site.url}/${p === 'index.html' ? '' : p}</loc><lastmod>${today}</lastmod></url>`)
    .join('\n')}\n</urlset>\n`
);
writeFileSync(join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /orcamento.html\nDisallow: /obrigado.html\nSitemap: ${site.url}/sitemap.xml\n`);
writeFileSync(join(ROOT, '_redirects'), redirects.map(([a, b]) => `${a}  ${b}  301`).join('\n') + '\n');
writeFileSync(
  join(ROOT, 'vercel.json'),
  JSON.stringify({ redirects: redirects.map(([source, destination]) => ({ source, destination, permanent: true })) }, null, 2) + '\n'
);
writeFileSync(join(ROOT, 'assets/img/logo.svg'), logo().replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ').replace('var(--logo-hole, #fff)', '#fff'));
writeFileSync(
  join(ROOT, 'assets/img/favicon.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F0AA23"/><stop offset="1" stop-color="#FAD623"/></linearGradient></defs><path d="M6 20C14 6 36 2 54 12 42 7 24 9 13 20Z" fill="#F2BF27"/><circle cx="30" cy="38" r="22" fill="url(#a)"/><circle cx="26" cy="40" r="6" fill="#fff"/></svg>`
);

console.log(`Geradas ${pages.length} páginas em site/`);
