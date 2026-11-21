/* grafMED — interações do site */
(() => {
  'use strict';
  const C = window.GM_CONFIG || {};
  const ROOT = document.body.dataset.root || '';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sem storage */ } },
  };
  const waUrl = (msg) => `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(msg)}`;
  const track = (ev, data) => window.gmTrack && window.gmTrack(ev, data);

  /* ---------- WhatsApp: todo botão abre o WhatsApp ---------- */
  function bindWa(el) {
    if (el.dataset.wa !== undefined && C.whatsapp) el.href = waUrl(el.dataset.wa);
  }
  $$('[data-wa]').forEach(bindWa);
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-wa], a[href*="wa.me"]');
    if (a) track('whatsapp', { href: a.href });
  });

  /* ---------- Header ---------- */
  const hdr = $('[data-hdr]');
  const onScroll = () => hdr && hdr.classList.toggle('is-scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const desktop = matchMedia('(min-width: 921px)');
  $$('.has-sub').forEach((item) => {
    const btn = $('[data-sub]', item);
    let t;
    const open = (v) => {
      item.classList.toggle('is-open', v);
      btn.setAttribute('aria-expanded', String(v));
    };
    btn.addEventListener('click', () => {
      const v = !item.classList.contains('is-open');
      $$('.has-sub.is-open').forEach((o) => o !== item && (o.classList.remove('is-open'), $('[data-sub]', o).setAttribute('aria-expanded', 'false')));
      open(v);
    });
    item.addEventListener('mouseenter', () => { if (desktop.matches) { clearTimeout(t); open(true); } });
    item.addEventListener('mouseleave', () => { if (desktop.matches) t = setTimeout(() => open(false), 160); });
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.has-sub')) $$('.has-sub.is-open').forEach((o) => { o.classList.remove('is-open'); $('[data-sub]', o).setAttribute('aria-expanded', 'false'); });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') $$('.has-sub.is-open').forEach((o) => { o.classList.remove('is-open'); $('[data-sub]', o).setAttribute('aria-expanded', 'false'); });
  });
  const burger = $('[data-burger]');
  const nav = $('[data-nav]');
  burger && burger.addEventListener('click', () => {
    const v = burger.getAttribute('aria-expanded') !== 'true';
    burger.setAttribute('aria-expanded', String(v));
    burger.setAttribute('aria-label', v ? 'Fechar menu' : 'Abrir menu');
    nav.classList.toggle('is-open', v);
    document.body.style.overflow = v ? 'hidden' : '';
  });

  /* ---------- Revelação ao rolar ---------- */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    $$('.reveal').forEach((el) => io.observe(el));
  } else $$('.reveal').forEach((el) => el.classList.add('in'));

  /* ---------- Tilt 3D nos mockups ---------- */
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (fine) {
    $$('.tilt').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- Toast ---------- */
  const toastEl = $('[data-toast]');
  let toastT;
  function toast(html) {
    if (!toastEl) return;
    toastEl.innerHTML = html;
    toastEl.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('show'), 4200);
  }

  /* ---------- Orçamento (carrinho sem preço) ---------- */
  const CART = 'gm_orcamento';
  const cart = () => store.get(CART, []);
  const saveCart = (c) => { store.set(CART, c); renderCount(true); };
  function renderCount(bump) {
    const n = cart().reduce((s, i) => s + (i.qty || 1), 0);
    const items = cart().length;
    $$('[data-cart-count]').forEach((el) => {
      el.textContent = items;
      el.classList.toggle('has', items > 0);
      if (bump) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
    });
    $$('[data-cart-link]').forEach((el) => el.setAttribute('aria-label', `Orçamento: ${items} ${items === 1 ? 'item' : 'itens'} (${n} unidades)`));
  }
  renderCount(false);

  function addToCart(item) {
    const c = cart();
    const key = (i) => `${i.id}|${i.medida || ''}|${i.cor || ''}`;
    const found = c.find((i) => key(i) === key(item));
    if (found) found.qty += item.qty; else c.push(item);
    saveCart(c);
    toast(`<span>“${item.name}” no orçamento</span><a href="${ROOT}orcamento.html">Ver orçamento</a>`);
    track('add_to_quote', { id: item.id });
  }

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-add]');
    if (!b) return;
    const base = JSON.parse(b.dataset.add);
    const item = { ...base, qty: 1 };
    if (b.hasAttribute('data-add-detail')) {
      const q = $('[data-qty-input]');
      item.qty = Math.max(1, parseInt(q && q.value, 10) || 1);
      const m = $('input[name="medida"]:checked');
      if (m) item.medida = m.value;
      const cor = $('[data-colors] [aria-pressed="true"]');
      if (cor && cor !== $('[data-colors] button')) item.cor = cor.getAttribute('aria-label');
    }
    addToCart(item);
    const old = b.textContent;
    b.classList.add('is-added');
    b.textContent = '✓ Adicionado';
    setTimeout(() => { b.classList.remove('is-added'); b.textContent = old; }, 1600);
  });

  // stepper de quantidade
  $$('[data-qty]').forEach((q) => {
    const input = $('input', q);
    $('[data-dec]', q).addEventListener('click', () => { input.value = Math.max(1, (+input.value || 1) - 1); input.dispatchEvent(new Event('change', { bubbles: true })); });
    $('[data-inc]', q).addEventListener('click', () => { input.value = (+input.value || 1) + 1; input.dispatchEvent(new Event('change', { bubbles: true })); });
  });

  // Página de revisão
  const list = $('[data-cart-list]');
  const thumb = (url = '') => {
    const t = /pulseira/.test(url) ? 'band' : /fita/.test(url) ? 'tape' : /rotulo|validade/.test(url) ? 'label' : 'roll';
    const svg = {
      roll: '<circle cx="20" cy="22" r="15" fill="#fff" stroke="#E2DCD2"/><circle cx="20" cy="22" r="6" fill="#F4E3C6"/><rect x="26" y="30" width="20" height="10" rx="2" fill="#fff" stroke="#E2DCD2"/><rect x="28" y="32" width="8" height="3" fill="#C9B98F"/>',
      tape: '<circle cx="24" cy="22" r="15" fill="#EFE6D3"/><circle cx="24" cy="22" r="9" fill="#fff" stroke="#E6CFA5"/>',
      band: '<path d="M8 26 Q8 8 24 8 Q40 8 40 26 Q40 40 24 40 Q8 40 8 26" fill="none" stroke="#7AA7E0" stroke-width="6"/>',
      label: '<rect x="14" y="6" width="20" height="36" rx="5" fill="#fff" stroke="#E2DCD2"/><rect x="14" y="18" width="20" height="14" fill="#FFF4E4"/>',
    }[t];
    return `<svg viewBox="0 0 48 48" width="56" height="56" aria-hidden="true">${svg}</svg>`;
  };
  function renderList() {
    if (!list) return;
    const c = cart();
    $('[data-cart-empty]').hidden = c.length > 0;
    list.innerHTML = c
      .map(
        (i, idx) => `<div class="qitem" data-idx="${idx}">
        <div class="qitem-media">${thumb(i.url)}</div>
        <div><h3><a href="${ROOT}${i.url}">${i.name}</a></h3><small>${i.line}${i.medida ? ' · ' + i.medida : ''}${i.cor ? ' · ' + i.cor : ''}</small></div>
        <div class="qty"><button type="button" aria-label="Diminuir" data-q="-1">−</button><input type="number" min="1" value="${i.qty}" aria-label="Quantidade de ${i.name}" data-qi><button type="button" aria-label="Aumentar" data-q="1">+</button></div>
        <button class="qitem-rm" type="button" aria-label="Remover ${i.name}" data-rm>×</button>
      </div>`
      )
      .join('');
  }
  if (list) {
    renderList();
    list.addEventListener('click', (e) => {
      const row = e.target.closest('.qitem');
      if (!row) return;
      const idx = +row.dataset.idx;
      const c = cart();
      if (e.target.closest('[data-rm]')) {
        row.classList.add('out');
        setTimeout(() => { c.splice(idx, 1); saveCart(c); renderList(); }, 280);
      }
      const q = e.target.closest('[data-q]');
      if (q) { c[idx].qty = Math.max(1, c[idx].qty + +q.dataset.q); saveCart(c); $('[data-qi]', row).value = c[idx].qty; }
    });
    list.addEventListener('change', (e) => {
      if (!e.target.matches('[data-qi]')) return;
      const idx = +e.target.closest('.qitem').dataset.idx;
      const c = cart();
      c[idx].qty = Math.max(1, parseInt(e.target.value, 10) || 1);
      e.target.value = c[idx].qty;
      saveCart(c);
    });
  }

  /* ---------- Máscaras ---------- */
  const maskPhone = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 2) return d.length ? `(${d}` : '';
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  };
  const maskCnpj = (v) => v.replace(/\D/g, '').slice(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2');
  document.addEventListener('input', (e) => {
    if (e.target.matches('[data-mask-phone]')) e.target.value = maskPhone(e.target.value);
    if (e.target.matches('[data-mask-cnpj]')) e.target.value = maskCnpj(e.target.value);
    if (e.target.classList.contains('invalid')) e.target.classList.remove('invalid');
  });

  /* ---------- Validação ---------- */
  const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  function validate(field) {
    const v = (field.type === 'checkbox' ? field.checked : field.value.trim());
    let msg = '';
    if (field.required && !v) msg = field.type === 'checkbox' ? 'Confirme a autorização de uso dos dados.' : 'Preencha este campo para continuar.';
    else if (field.type === 'email' && v && !emailOk(v)) msg = 'Confira o e-mail: parece incompleto.';
    else if (field.matches('[data-mask-phone]') && v && v.replace(/\D/g, '').length < 10) msg = 'Informe o telefone com DDD.';
    field.classList.toggle('invalid', !!msg);
    return msg;
  }

  /* ---------- Envio ---------- */
  async function send(kind, data, text) {
    const payload = { tipo: kind, pagina: location.pathname, data: new Date().toISOString(), ...data };
    const log = store.get('gm_envios', []);
    log.push(payload);
    store.set('gm_envios', log.slice(-20));
    if (C.formEndpoint) {
      try {
        await fetch(C.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        return 'endpoint';
      } catch { /* cai para e-mail */ }
    }
    const subject = `[Site grafMED] ${kind}`;
    const a = document.createElement('a');
    a.href = `mailto:${C.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    a.click();
    return 'mailto';
  }
  const asText = (obj) => Object.entries(obj).filter(([, v]) => v).map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`).join('\n');

  /* ---------- Formulário rápido: Nome → E-mail → Telefone ---------- */
  $$('[data-quick-form]').forEach((form) => {
    const steps = $$('[data-step]', form);
    const err = $('[data-error]', form);
    const btn = $('[data-next]', form);
    let i = 0;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = $('input', steps[i]);
      const msg = validate(input);
      err.textContent = msg;
      if (msg) { input.focus(); return; }
      if (i < steps.length - 1) {
        steps[i].classList.remove('is-on');
        i++;
        steps[i].classList.add('is-on');
        $('input', steps[i]).focus();
        if (i === steps.length - 1) btn.textContent = 'Enviar';
        return;
      }
      const data = Object.fromEntries(new FormData(form));
      btn.disabled = true;
      await send('Contato rápido', data, `Novo contato pelo site\n\n${asText(data)}\nPágina: ${location.pathname}`);
      form.hidden = true;
      const done = form.parentElement.querySelector('[data-done]');
      if (done) done.hidden = false;
      track('lead', { form: 'contato-rapido' });
    });
  });

  // modal do formulário rápido
  const modal = $('[data-form-modal]');
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-open-form]') && modal) {
      modal.showModal ? modal.showModal() : modal.setAttribute('open', '');
      setTimeout(() => { const f = $('.qf-step.is-on input', modal); f && f.focus(); }, 50);
    }
    if (e.target.closest('[data-close]') && modal) modal.close();
  });
  modal && modal.addEventListener('click', (e) => { if (e.target === modal) modal.close(); });

  /* ---------- Formulários completos ---------- */
  const formNames = { orcamento: 'Pedido de orçamento', projeto: 'Solicitação de projeto', denuncia: 'Denúncia Canal Parceiro', adesao: 'Credenciamento de parceiro', trabalhe: 'Trabalhe conosco' };
  $$('form[data-form]').forEach((form) => {
    const kind = form.dataset.form;
    const err = $('[data-error]', form);
    let via = 'email';
    $$('[data-via]', form).forEach((b) => b.addEventListener('click', () => { via = b.dataset.via; }));
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fields = $$('input, select, textarea', form);
      const msgs = fields.map(validate).filter(Boolean);
      if (kind === 'orcamento' && !cart().length) msgs.unshift('Adicione pelo menos um produto ao orçamento.');
      err.textContent = msgs[0] || '';
      if (msgs.length) { const bad = $('.invalid', form); bad && bad.focus(); return; }
      const data = Object.fromEntries(new FormData(form));
      delete data.lgpd;
      let text;
      if (kind === 'orcamento') {
        const items = cart();
        data.itens = items.map((i) => `${i.qty}x ${i.name}${i.medida ? ' (' + i.medida + ')' : ''}${i.cor ? ' [' + i.cor + ']' : ''}`).join('; ');
        text = `*Pedido de orçamento — site grafMED*\n\n*Produtos*\n${items.map((i) => `• ${i.qty}x ${i.name}${i.medida ? ' · ' + i.medida : ''}${i.cor ? ' · ' + i.cor : ''} (${i.line})`).join('\n')}\n\n*Solicitante*\nNome: ${data.nome}\nEmpresa: ${data.empresa}\nTelefone: ${data.telefone}\nE-mail: ${data.email}\nCidade/UF: ${data.cidade}/${data.uf}\nSegmento: ${data.segmento}${data.obs ? '\nObservações: ' + data.obs : ''}`;
        try { sessionStorage.setItem('gm_ultimo', JSON.stringify(items)); } catch { /* */ }
      } else {
        text = `*${formNames[kind]} — site grafMED*\n\n${asText(data)}`;
      }
      if (via === 'whatsapp') {
        store.set('gm_envios', [...store.get('gm_envios', []), { tipo: formNames[kind], via: 'whatsapp', ...data }].slice(-20));
        window.open(waUrl(text), '_blank', 'noopener');
        track('whatsapp', { form: kind });
      } else {
        await send(formNames[kind], data, text.replace(/\*/g, ''));
      }
      if (kind === 'orcamento') store.set(CART, []);
      if (kind === 'orcamento' || kind === 'projeto') {
        location.href = `${ROOT}obrigado.html`;
      } else {
        form.innerHTML = `<div class="qf-done"><h3>Recebido. Obrigado!</h3><p>A equipe grafMED vai analisar e retornar.</p></div>`;
      }
    });
  });

  /* ---------- Obrigado ---------- */
  const sum = $('[data-thanks-summary]');
  if (sum) {
    try {
      const items = JSON.parse(sessionStorage.getItem('gm_ultimo') || '[]');
      if (items.length) sum.innerHTML = `<p class="lbl">Resumo do pedido</p><ul>${items.map((i) => `<li><span>${i.name}${i.medida ? ' · ' + i.medida : ''}</span><b>${i.qty}</b></li>`).join('')}</ul>`;
    } catch { /* */ }
  }

  /* ---------- Simulador do indicador (Home) ---------- */
  const sim = $('[data-sim]');
  if (sim) {
    const range = $('[data-sim-range]', sim);
    const ind = $('[data-sim-ind]', sim);
    const ind2 = $('[data-sim-ind2]', sim);
    const temp = $('[data-sim-temp]', sim);
    const status = $('[data-sim-status]', sim);
    const card = $('.sim-card', sim);
    const steps = $$('.sim-steps span', sim);
    const dateEl = $('[data-sim-date]', sim);
    const now = new Date();
    dateEl.textContent = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}`;
    const from = [237, 227, 200];
    const to = [74, 52, 40];
    const mix = (t) => `rgb(${from.map((f, i) => Math.round(f + (to[i] - f) * t)).join(',')})`;
    const msgs = ['Arraste para iniciar o ciclo.', 'Carga posicionada na autoclave.', 'Aquecendo a câmara…', 'Esterilizando: o indicador está reagindo.', 'Secagem em andamento.', 'Ciclo concluído. Material liberado e rastreado.'];
    const update = () => {
      const p = +range.value;
      range.style.setProperty('--p', p + '%');
      const t = Math.max(0, Math.min(1, (p - 35) / 45));
      const c = mix(t);
      ind.style.setProperty('--ind', c);
      ind2.style.setProperty('--ind', c);
      ind.classList.toggle('done', t > 0.6);
      const deg = p < 25 ? 25 + p * 2 : p < 80 ? Math.min(134, 75 + (p - 25) * 2.2) : 134 - (p - 80) * 3;
      temp.textContent = `${Math.round(deg)} °C`;
      const si = p === 0 ? 0 : p < 25 ? 1 : p < 40 ? 2 : p < 80 ? 3 : p < 100 ? 4 : 5;
      status.textContent = msgs[si];
      status.classList.toggle('ok', si === 5);
      card.classList.toggle('done', si === 5);
      steps.forEach((s, k) => s.classList.toggle('on', p > 0 && k === Math.min(3, Math.max(0, si - 1))));
    };
    range.addEventListener('input', update);
    update();
    // demonstração automática uma vez, quando o simulador aparece
    let played = false;
    const demo = () => {
      if (played || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      played = true;
      let v = 0;
      const tick = () => {
        if (range.dataset.touched) return;
        v += 1.2;
        range.value = Math.min(100, v);
        update();
        if (v < 100) requestAnimationFrame(tick);
        else setTimeout(() => { if (!range.dataset.touched) { range.value = 0; update(); } }, 2600);
      };
      setTimeout(tick, 900);
    };
    range.addEventListener('pointerdown', () => { range.dataset.touched = '1'; });
    range.addEventListener('keydown', () => { range.dataset.touched = '1'; });
    if ('IntersectionObserver' in window) new IntersectionObserver((es, o) => es.forEach((e) => { if (e.isIntersecting) { demo(); o.disconnect(); } }), { threshold: 0.5 }).observe(sim);
  }

  /* ---------- Mais vendido da semana: rotação automática por semana ISO ---------- */
  const week = $('[data-week]');
  if (week && window.GM_DESTAQUES) {
    const d = new Date();
    const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const day = t.getUTCDay() || 7;
    t.setUTCDate(t.getUTCDate() + 4 - day);
    const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
    const wk = Math.ceil(((t - y0) / 864e5 + 1) / 7);
    const key = `${t.getUTCFullYear()}-W${String(wk).padStart(2, '0')}`;
    const { rodizio = [], fixo = {} } = window.GM_DESTAQUES;
    const p = (fixo[key] && rodizio.find((r) => r.id === fixo[key])) || rodizio[(t.getUTCFullYear() * 53 + wk) % rodizio.length];
    if (p) {
      const tpl = $(`[data-mock-tpl="${p.mock}"]`) || $('[data-mock-tpl="roll"]');
      $('[data-week-media]', week).innerHTML = tpl.innerHTML;
      $('[data-week-label]', week).textContent = `semana ${wk}`;
      $('[data-week-name]', week).textContent = p.name;
      $('[data-week-desc]', week).textContent = p.desc;
      const payload = JSON.stringify({ id: p.id, name: p.name, line: p.line, url: p.url }).replace(/'/g, '&#39;');
      $('[data-week-actions]', week).innerHTML = `
        <a class="btn btn-ink" href="${ROOT}${p.url}">Ver produto</a>
        <button class="btn btn-line" type="button" data-add='${payload}'>+ Orçamento</button>
        <a class="btn btn-ghost" data-wa="Olá! Quero saber mais sobre o destaque da semana: ${p.name}." target="_blank" rel="noopener">Perguntar no WhatsApp</a>`;
      bindWa($('[data-week-actions] [data-wa]', week));
    }
  }

  /* ---------- Galeria do produto ---------- */
  const gal = $('[data-gallery]');
  if (gal) {
    $$('[data-show]', gal).forEach((b) => b.addEventListener('click', () => {
      $$('[data-show]', gal).forEach((x) => x.setAttribute('aria-selected', String(x === b)));
      $$('[data-view]', gal).forEach((v) => v.classList.toggle('is-on', v.dataset.view === b.dataset.show));
    }));
    $$('[data-color]', gal).forEach((b) => b.addEventListener('click', () => {
      $$('[data-color]', gal).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      $$('.lab', gal).forEach((r) => r.setAttribute('fill', b.dataset.color));
      $$('.band-front, .band-back', gal).forEach((r) => r.setAttribute('stroke', b.dataset.color));
      $$('.band-text', gal).forEach((tx) => tx.setAttribute('fill', b.dataset.color.toUpperCase() === '#1E212E' ? '#FFFFFF' : '#1E212E'));
    }));
  }

  /* ---------- Prévia da pulseira ---------- */
  const bb = $('[data-band-builder]');
  if (bb) {
    const pv = $('[data-band-preview]', bb);
    const txt = $('[data-band-text]', bb);
    const use = $('[data-band-use]', bb);
    const btn = $('[data-band-wa]', bb);
    const upd = () => {
      const color = $('input[name="bcolor"]:checked', bb).value;
      $$('.band-front, .band-back', pv).forEach((p) => p.setAttribute('stroke', color));
      const tp = $('.band-text textPath', pv);
      tp.textContent = (txt.value || ' ').toUpperCase();
      $('.band-text', pv).setAttribute('fill', color.toUpperCase() === '#1E212E' ? '#FFFFFF' : '#1E212E');
      const label = $(`input[name="bcolor"]:checked + span + b`, bb).textContent;
      btn.dataset.wa = `Olá! Quero orçar pulseiras para ${use.value.toLowerCase()}.\nCor: ${label}\nTexto: ${txt.value}`;
      bindWa(btn);
    };
    bb.addEventListener('input', upd);
    bb.addEventListener('change', upd);
    upd();
  }

  /* ---------- Prévia do rótulo ---------- */
  const lb = $('[data-label-builder]');
  if (lb) {
    const pv = $('[data-label-preview]', lb);
    const txt = $('[data-label-text]', lb);
    const mat = $('[data-label-mat]', lb);
    const btn = $('[data-label-wa]', lb);
    const upd = () => {
      const color = $('input[name="lcolor"]:checked', lb).value;
      const dark = mat.value === '#1E212E';
      $('.lbl-bg', pv).setAttribute('fill', mat.value);
      $('.lbl-text', pv).textContent = (txt.value || ' ').toUpperCase();
      $('.lbl-text', pv).setAttribute('fill', dark ? '#FFFFFF' : '#1E212E');
      $('.lbl-accent', pv).setAttribute('stroke', color);
      btn.dataset.wa = `Olá! Quero orçar rótulos personalizados.\nMarca: ${txt.value}\nMaterial: ${mat.options[mat.selectedIndex].text}`;
      bindWa(btn);
    };
    lb.addEventListener('input', upd);
    lb.addEventListener('change', upd);
    upd();
  }

  /* ---------- Fluxo da conversão ---------- */
  const flow = $('[data-flow]');
  if (flow) {
    const steps = $$('[data-flow-step]', flow);
    let k = -1;
    let timer;
    const go = () => {
      k = (k + 1) % (steps.length + 1);
      steps.forEach((s, j) => s.classList.toggle('on', j < k));
      flow.style.setProperty('--fp', Math.max(0, k - 1) / (steps.length - 1));
    };
    const start = () => { if (!timer) { go(); timer = setInterval(go, 1400); } };
    if ('IntersectionObserver' in window) new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? start() : (clearInterval(timer), (timer = null)))), { threshold: 0.4 }).observe(flow);
    else steps.forEach((s) => s.classList.add('on'));
  }

  /* ---------- Notícias: filtro ---------- */
  const filters = $('[data-filters]');
  if (filters) {
    const apply = (f) => {
      $$('[role="tab"]', filters).forEach((b) => b.setAttribute('aria-selected', String(b.dataset.filter === f)));
      $$('[data-articles] .acard').forEach((a) => { a.hidden = f !== 'all' && a.dataset.cat !== f; if (!a.hidden) a.classList.add('in'); });
    };
    filters.addEventListener('click', (e) => { const b = e.target.closest('[data-filter]'); if (b) { apply(b.dataset.filter); history.replaceState(null, '', b.dataset.filter === 'all' ? location.pathname : '#' + b.dataset.filter); } });
    const h = location.hash.slice(1);
    if (h) apply(h);
  }

  /* ---------- Parceiros credenciados ---------- */
  const pl = $('[data-partners]');
  if (pl) {
    const all = window.GM_PARCEIROS || [];
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const render = (q = '') => {
      const n = q.toLowerCase();
      const res = all.filter((p) => !n || `${p.nome} ${p.cidade} ${p.uf}`.toLowerCase().includes(n));
      pl.innerHTML = res.length
        ? res.map((p) => {
            const inner = `<span class="partner-mono">${esc(p.nome.split(' ').map((w) => w[0]).slice(0, 2).join(''))}</span><div><strong>${esc(p.nome)}</strong><small>${esc(p.cidade)}/${esc(p.uf)} · ${esc((p.linhas || []).join(', '))}</small></div>`;
            return p.site ? `<a class="partner" href="${esc(p.site)}" target="_blank" rel="noopener">${inner}</a>` : `<div class="partner">${inner}</div>`;
          }).join('')
        : '<p class="muted">Nenhum parceiro encontrado para essa busca.</p>';
    };
    render();
    const s = $('[data-partner-search]');
    s && s.addEventListener('input', () => render(s.value));
  }

  /* ---------- Cookies (LGPD) ---------- */
  const ck = $('[data-cookie]');
  const consent = store.get('gm_cookies', null);
  if (ck && consent === null) ck.hidden = false;
  const setConsent = (v) => { store.set('gm_cookies', v); ck.hidden = true; if (v && window.gmLoadTracking) window.gmLoadTracking(); };
  $('[data-cookie-ok]') && $('[data-cookie-ok]').addEventListener('click', () => setConsent(true));
  $('[data-cookie-deny]') && $('[data-cookie-deny]').addEventListener('click', () => setConsent(false));
  $$('[data-cookie-open]').forEach((b) => b.addEventListener('click', () => { ck.hidden = false; }));

  /* ---------- Rodapé ---------- */
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
  if (C.mapEmbed) {
    const m = $('[data-map]');
    if (m) { m.hidden = false; m.innerHTML = `<iframe src="${C.mapEmbed}" loading="lazy" title="Localização da grafMED" referrerpolicy="no-referrer-when-downgrade"></iframe>`; }
  }
})();
