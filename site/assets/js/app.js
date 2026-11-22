/* grafMED · interações do site */
(() => {
  'use strict';
  const C = window.GM_CONFIG || {};
  const ROOT = document.body.dataset.root || '';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches && !reduce;
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sem storage */ } },
  };
  const waUrl = (msg) => `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(msg)}`;
  const track = (ev, data) => window.gmTrack && window.gmTrack(ev, data);
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  /* ---------- WhatsApp: todo botão abre o WhatsApp ---------- */
  const bindWa = (el) => { if (el && el.dataset.wa !== undefined && C.whatsapp) el.href = waUrl(el.dataset.wa); };
  $$('[data-wa]').forEach(bindWa);
  document.addEventListener('click', (e) => { const a = e.target.closest('a[href*="wa.me"]'); if (a) track('whatsapp', { href: a.href }); });

  /* ---------- Banners editáveis (data/banners.js) ---------- */
  const B = window.GM_BANNERS || {};
  const stageHTML = (b) => {
    const layers = (b.camadas || []).map((c, i) => `<img class="layer" src="${ROOT + c.img}" alt="" style="--x:${c.x}%;--y:${c.y}%;--w:${c.w}%;--z:${c.z || 3};--rot:${c.rot || 0}deg;--i:${i}" data-depth="${c.z || 3}">`).join('');
    const pins = (b.selos || []).map((x, i) => `<span class="pin" style="--x:${x.x}%;--y:${x.y}%;--i:${i}" data-depth="6"><i aria-hidden="true"></i>${x.texto}</span>`).join('');
    return `<div class="stage-floor" aria-hidden="true"></div>${layers}${pins}`;
  };
  const applyBanner = (sec, b) => {
    if (!b) return;
    if (b.tema) { sec.classList.toggle('hero--light', b.tema === 'claro'); sec.classList.toggle('hero--orange', b.tema !== 'claro'); }
    const st = $('[data-stage]', sec);
    if (st && b.camadas) { const html = stageHTML(b); if (st.dataset.sig !== html) { st.innerHTML = html; st.dataset.sig = html; } }
  };
  $$('[data-banner]').forEach((sec) => applyBanner(sec, B[sec.dataset.banner]));

  /* profundidade 3D das camadas: mouse e rolagem */
  if (!reduce) {
    $$('.hero').forEach((hero) => {
      let mx = 0, my = 0, raf = 0;
      const move = () => {
        raf = 0;
        const sy = Math.min(1, Math.max(0, scrollY / (hero.offsetHeight || 1)));
        $$('[data-stage]', hero).forEach((st) => {
          st.style.setProperty('--ry', `${mx * 10}deg`);
          st.style.setProperty('--rx', `${-my * 8}deg`);
          $$('[data-depth]', st).forEach((el) => {
            const d = +el.dataset.depth;
            el.style.setProperty('--px', `${mx * d * 7}px`);
            el.style.setProperty('--py', `${my * d * 6 - sy * d * 14}px`);
          });
        });
      };
      if (fine) hero.addEventListener('pointermove', (e) => { const r = hero.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width - 0.5; my = (e.clientY - r.top) / r.height - 0.5; if (!raf) raf = requestAnimationFrame(move); });
      if (fine) hero.addEventListener('pointerleave', () => { mx = 0; my = 0; if (!raf) raf = requestAnimationFrame(move); });
      addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(move); }, { passive: true });
    });
  }

  /* ---------- Header, progresso de leitura ---------- */
  const hdr = $('[data-hdr]');
  const bar = $('[data-progress]');
  const onScroll = () => {
    hdr && hdr.classList.toggle('is-scrolled', scrollY > 8);
    if (bar) { const h = document.documentElement.scrollHeight - innerHeight; bar.style.setProperty('--p', h > 0 ? scrollY / h : 0); }
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const desktop = matchMedia('(min-width: 941px)');
  const closeSubs = (except) => $$('.has-sub.is-open').forEach((o) => { if (o !== except) { o.classList.remove('is-open'); $('[data-sub]', o).setAttribute('aria-expanded', 'false'); } });
  $$('.has-sub').forEach((item) => {
    const btn = $('[data-sub]', item);
    let t;
    const open = (v) => { item.classList.toggle('is-open', v); btn.setAttribute('aria-expanded', String(v)); };
    btn.addEventListener('click', () => { closeSubs(item); open(!item.classList.contains('is-open')); });
    item.addEventListener('mouseenter', () => { if (desktop.matches) { clearTimeout(t); closeSubs(item); open(true); } });
    item.addEventListener('mouseleave', () => { if (desktop.matches) t = setTimeout(() => open(false), 180); });
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('.has-sub')) closeSubs(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSubs(); });
  const burger = $('[data-burger]');
  const nav = $('[data-nav]');
  burger && burger.addEventListener('click', () => {
    const v = burger.getAttribute('aria-expanded') !== 'true';
    burger.setAttribute('aria-expanded', String(v));
    burger.setAttribute('aria-label', v ? 'Fechar menu' : 'Abrir menu');
    nav.classList.toggle('is-open', v);
    document.body.style.overflow = v ? 'hidden' : '';
  });

  /* ---------- Revelação ao rolar + contadores ---------- */
  const countUp = (el) => {
    const end = +el.dataset.count;
    const pre = el.dataset.prefix || '';
    const suf = el.dataset.suffix || '';
    if (reduce) { el.textContent = pre + end.toLocaleString('pt-BR') + suf; return; }
    const t0 = performance.now();
    const step = (t) => {
      const k = clamp((t - t0) / 1600);
      const v = Math.round(end * (1 - Math.pow(1 - k, 3)));
      el.textContent = pre + v.toLocaleString('pt-BR') + suf;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      $$('[data-count]', e.target).forEach(countUp);
      if (e.target.matches('[data-count]')) countUp(e.target);
      io.unobserve(e.target);
    }), { rootMargin: '0px 0px -8% 0px' });
    $$('.reveal, .stats').forEach((el) => io.observe(el));
  } else $$('.reveal').forEach((el) => el.classList.add('in'));

  /* ---------- 3D: inclinação com o mouse ---------- */
  if (fine) {
    $$('.lab, .benefit, .seal-card').forEach((el) => {
      const target = el.matches('[data-parallax]') ? $('.hero-frame', el) : el;
      if (!target) return;
      const base = getComputedStyle(target).transform;
      const strength = el.matches('[data-parallax]') ? 12 : 5;
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        target.style.transform = `perspective(1000px) rotateY(${x * strength}deg) rotateX(${-y * strength}deg) translateY(${el.matches('[data-parallax]') ? 0 : -6}px)`;
      });
      el.addEventListener('pointerleave', () => { target.style.transform = base === 'none' ? '' : ''; });
    });
  }

  /* ---------- Carrossel da Home ---------- */
  const car = $('[data-carousel]');
  if (car) {
    // banners editados sem rebuild: aplica imagens e textos do arquivo data/banners.js
    const slides = $$('.slide', car);
    (B.home || []).forEach((b, i) => {
      const s = slides[i];
      if (!s) return;
      applyBanner(s, b);
      const h = $('.display', s); if (h && b.titulo) h.innerHTML = b.titulo;
      const p = $('.lead', s); if (p && b.texto) p.textContent = b.texto;
      const sel = $('.selo', s); if (sel) sel.textContent = b.selo || '';
      const link = $('.btn-outline', s); if (link && b.link) { link.href = ROOT + b.link; link.firstChild.textContent = (b.botao || 'Saiba mais') + ' '; }
    });
    const dots = $$('[data-dot]', car);
    let i = 0, timer;
    const DUR = 6500;
    car.style.setProperty('--dur', DUR + 'ms');
    const go = (n) => {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => { s.classList.toggle('is-on', k === i); s.setAttribute('aria-hidden', String(k !== i)); });
      dots.forEach((d, k) => d.setAttribute('aria-selected', String(k === i)));
      car.classList.toggle('light-on', slides[i].classList.contains('hero--light'));
      car.style.background = slides[i].classList.contains('hero--light') ? 'var(--grad-soft)' : '';
      restart();
    };
    const restart = () => { clearTimeout(timer); if (!reduce && !car.classList.contains('paused')) timer = setTimeout(() => go(i + 1), DUR); };
    dots.forEach((d) => d.addEventListener('click', () => go(+d.dataset.dot)));
    $('[data-next]', car).addEventListener('click', () => go(i + 1));
    $('[data-prev]', car).addEventListener('click', () => go(i - 1));
    car.addEventListener('mouseenter', () => { car.classList.add('paused'); clearTimeout(timer); });
    car.addEventListener('mouseleave', () => { car.classList.remove('paused'); restart(); });
    let x0 = null;
    car.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    car.addEventListener('touchend', (e) => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) go(i + (dx < 0 ? 1 : -1)); x0 = null; });
    go(0);
  }

  /* ---------- Toast + animação de "voar para o orçamento" ---------- */
  const toastEl = $('[data-toast]');
  let toastT;
  const toast = (html) => {
    if (!toastEl) return;
    toastEl.innerHTML = html;
    toastEl.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('show'), 4200);
  };
  const flyToCart = (fromEl, src) => {
    const cart = $('[data-cart-link]');
    if (!cart || !src || reduce || !fromEl) return;
    const a = fromEl.getBoundingClientRect();
    const b = cart.getBoundingClientRect();
    const img = document.createElement('img');
    img.src = src; img.className = 'fly'; img.alt = '';
    img.style.left = a.left + a.width / 2 - 32 + 'px';
    img.style.top = a.top + a.height / 2 - 32 + 'px';
    document.body.appendChild(img);
    requestAnimationFrame(() => {
      img.style.transform = `translate(${b.left + b.width / 2 - (a.left + a.width / 2)}px, ${b.top + b.height / 2 - (a.top + a.height / 2)}px) scale(.25) rotate(20deg)`;
      img.style.opacity = '.4';
    });
    setTimeout(() => img.remove(), 800);
  };

  /* ---------- Orçamento (carrinho sem preço) ---------- */
  const CART = 'gm_orcamento';
  const cart = () => store.get(CART, []);
  const renderCount = (bump) => {
    const items = cart().length;
    const n = cart().reduce((s, x) => s + (x.qty || 1), 0);
    $$('[data-cart-count]').forEach((el) => {
      el.textContent = items;
      el.classList.toggle('has', items > 0);
      if (bump) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
    });
    $$('[data-cart-link]').forEach((el) => el.setAttribute('aria-label', `Orçamento: ${items} ${items === 1 ? 'item' : 'itens'} (${n} unidades)`));
  };
  const saveCart = (c) => { store.set(CART, c); renderCount(true); };
  renderCount(false);

  document.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-add]');
    if (!b) return;
    const item = { ...JSON.parse(b.dataset.add), qty: 1 };
    if (b.hasAttribute('data-add-detail')) {
      const q = $('[data-qty-input]');
      item.qty = Math.max(1, parseInt(q && q.value, 10) || 1);
      const m = $('input[name="medida"]:checked');
      if (m) item.medida = m.value;
    }
    const c = cart();
    const key = (x) => `${x.id}|${x.medida || ''}`;
    const found = c.find((x) => key(x) === key(item));
    if (found) found.qty += item.qty; else c.push(item);
    const media = b.closest('.lab, .product');
    flyToCart(media ? $('img', media) : b, item.img ? ROOT + item.img : null);
    setTimeout(() => saveCart(c), reduce ? 0 : 650);
    toast(`${item.img ? `<img src="${ROOT + item.img}" alt="">` : ''}<span>Adicionado ao orçamento</span><a href="${ROOT}orcamento.html">Ver orçamento</a>`);
    track('add_to_quote', { id: item.id });
    const old = b.textContent;
    b.classList.add('is-added');
    b.textContent = '✓ Adicionado';
    setTimeout(() => { b.classList.remove('is-added'); b.textContent = old; }, 1600);
  });

  $$('[data-qty]').forEach((q) => {
    const input = $('input', q);
    $('[data-dec]', q).addEventListener('click', () => { input.value = Math.max(1, (+input.value || 1) - 1); });
    $('[data-inc]', q).addEventListener('click', () => { input.value = (+input.value || 1) + 1; });
  });

  const list = $('[data-cart-list]');
  const renderList = () => {
    if (!list) return;
    const c = cart();
    $('[data-cart-empty]').hidden = c.length > 0;
    list.innerHTML = c.map((x, idx) => `<div class="qitem" data-idx="${idx}">
        <div class="qitem-media">${x.img ? `<img src="${ROOT + x.img}" alt="">` : ''}</div>
        <div><h3><a href="${ROOT}${x.url}">${x.name}</a></h3><small>${x.line}${x.medida ? ' · ' + x.medida : ''}</small></div>
        <div class="qty"><button type="button" aria-label="Diminuir" data-q="-1">−</button><input type="number" min="1" value="${x.qty}" aria-label="Quantidade de ${x.name}" data-qi><button type="button" aria-label="Aumentar" data-q="1">+</button></div>
        <button class="qitem-rm" type="button" aria-label="Remover ${x.name}" data-rm>×</button>
      </div>`).join('');
  };
  if (list) {
    renderList();
    list.addEventListener('click', (e) => {
      const row = e.target.closest('.qitem');
      if (!row) return;
      const idx = +row.dataset.idx;
      const c = cart();
      if (e.target.closest('[data-rm]')) { row.classList.add('out'); setTimeout(() => { c.splice(idx, 1); saveCart(c); renderList(); }, 280); }
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

  /* ---------- Máscaras e validação ---------- */
  const maskPhone = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 2) return d.length ? `(${d}` : '';
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  };
  const maskCnpj = (v) => v.replace(/\D/g, '').slice(0, 14).replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2');
  document.addEventListener('input', (e) => {
    if (e.target.matches('[data-mask-phone]')) e.target.value = maskPhone(e.target.value);
    if (e.target.matches('[data-mask-cnpj]')) e.target.value = maskCnpj(e.target.value);
    e.target.classList && e.target.classList.remove('invalid');
  });
  const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  const validate = (f) => {
    const v = f.type === 'checkbox' ? f.checked : f.value.trim();
    let msg = '';
    if (f.required && !v) msg = f.type === 'checkbox' ? 'Confirme a autorização de uso dos dados.' : 'Preencha este campo para continuar.';
    else if (f.type === 'email' && v && !emailOk(v)) msg = 'Confira o e-mail: parece incompleto.';
    else if (f.matches('[data-mask-phone]') && v && v.replace(/\D/g, '').length < 10) msg = 'Informe o telefone com DDD.';
    f.classList.toggle('invalid', !!msg);
    return msg;
  };

  const send = async (kind, data, text) => {
    const payload = { tipo: kind, pagina: location.pathname, data: new Date().toISOString(), ...data };
    store.set('gm_envios', [...store.get('gm_envios', []), payload].slice(-20));
    if (C.formEndpoint) {
      try { await fetch(C.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); return; } catch { /* cai para e-mail */ }
    }
    const a = document.createElement('a');
    a.href = `mailto:${C.email}?subject=${encodeURIComponent('[Site grafMED] ' + kind)}&body=${encodeURIComponent(text)}`;
    a.click();
  };
  const asText = (o) => Object.entries(o).filter(([, v]) => v).map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`).join('\n');

  /* formulário rápido: Nome, E-mail, Telefone, um por vez */
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
        steps[++i].classList.add('is-on');
        $('input', steps[i]).focus();
        if (i === steps.length - 1) btn.firstChild.textContent = 'Enviar ';
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
  const modal = $('[data-form-modal]');
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-open-form]') && modal) { modal.showModal ? modal.showModal() : modal.setAttribute('open', ''); setTimeout(() => { const f = $('.qf-step.is-on input', modal); f && f.focus(); }, 50); }
    if (e.target.closest('[data-close]') && modal) modal.close();
  });
  modal && modal.addEventListener('click', (e) => { if (e.target === modal) modal.close(); });

  const formNames = { orcamento: 'Pedido de orçamento', projeto: 'Solicitação de projeto', denuncia: 'Denúncia Canal Parceiro', adesao: 'Credenciamento de parceiro', trabalhe: 'Trabalhe conosco' };
  $$('form[data-form]').forEach((form) => {
    const kind = form.dataset.form;
    const err = $('[data-error]', form);
    let via = 'email';
    $$('[data-via]', form).forEach((b) => b.addEventListener('click', () => { via = b.dataset.via; }));
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const msgs = $$('input, select, textarea', form).map(validate).filter(Boolean);
      if (kind === 'orcamento' && !cart().length) msgs.unshift('Adicione pelo menos um produto ao orçamento.');
      err.textContent = msgs[0] || '';
      if (msgs.length) { const bad = $('.invalid', form); bad && bad.focus(); return; }
      const data = Object.fromEntries(new FormData(form));
      delete data.lgpd;
      let text;
      if (kind === 'orcamento') {
        const items = cart();
        data.itens = items.map((x) => `${x.qty}x ${x.name}${x.medida ? ' (' + x.medida + ')' : ''}`).join('; ');
        text = `*Pedido de orçamento, site grafMED*\n\n*Produtos*\n${items.map((x) => `• ${x.qty}x ${x.name}${x.medida ? ' · ' + x.medida : ''} (${x.line})`).join('\n')}\n\n*Solicitante*\nNome: ${data.nome}\nEmpresa: ${data.empresa}\nTelefone: ${data.telefone}\nE-mail: ${data.email}\nCidade/UF: ${data.cidade}/${data.uf}\nSegmento: ${data.segmento}${data.obs ? '\nObservações: ' + data.obs : ''}`;
        try { sessionStorage.setItem('gm_ultimo', JSON.stringify(items)); } catch { /* */ }
      } else text = `*${formNames[kind]}, site grafMED*\n\n${asText(data)}`;
      if (via === 'whatsapp') {
        store.set('gm_envios', [...store.get('gm_envios', []), { tipo: formNames[kind], via: 'whatsapp', ...data }].slice(-20));
        window.open(waUrl(text), '_blank', 'noopener');
        track('whatsapp', { form: kind });
      } else await send(formNames[kind], data, text.replace(/\*/g, ''));
      if (kind === 'orcamento') store.set(CART, []);
      if (kind === 'orcamento' || kind === 'projeto') location.href = `${ROOT}obrigado.html`;
      else form.innerHTML = '<div class="qf-done"><h3>Recebido. Obrigado!</h3><p>A equipe grafMED vai analisar e retornar.</p></div>';
    });
  });

  const sum = $('[data-thanks-summary]');
  if (sum) {
    try {
      const items = JSON.parse(sessionStorage.getItem('gm_ultimo') || '[]');
      if (items.length) sum.innerHTML = `<p class="lbl">Resumo do pedido</p><ul>${items.map((x) => `<li><span>${x.name}${x.medida ? ' · ' + x.medida : ''}</span><b>${x.qty}</b></li>`).join('')}</ul>`;
    } catch { /* */ }
  }

  /* ---------- Simulador do indicador (foto real antes/depois), ligado à rolagem ---------- */
  $$('[data-sim]').forEach((sim) => {
    const range = $('[data-sim-range]', sim);
    const lens = $('[data-sim-lens]', sim);
    const temp = $('[data-sim-temp]', sim);
    const status = $('[data-sim-status]', sim);
    const steps = $$('.sim-steps span', sim);
    const caps = $$('[data-cap]', sim);
    const msgs = ['Arraste ou role a página para simular.', 'Carga posicionada na autoclave.', 'Aquecendo a câmara.', 'Esterilizando: o indicador está reagindo.', 'Secagem em andamento.', 'Ciclo concluído: a faixa ficou marrom. Material liberado e rastreado.'];
    let manual = false;
    const update = () => {
      const p = +range.value;
      const t = clamp((p - 40) / 40);
      lens.style.setProperty('--t', t);
      range.style.setProperty('--p', p + '%');
      range.style.setProperty('--p0', Math.max(0, p - 30) + '%');
      const deg = p < 25 ? 25 + p * 2 : p < 80 ? Math.min(134, 75 + (p - 25) * 2.2) : 134 - (p - 80) * 3;
      temp.textContent = `${Math.round(deg)} °C`;
      const si = p === 0 ? 0 : p < 25 ? 1 : p < 40 ? 2 : p < 80 ? 3 : p < 100 ? 4 : 5;
      status.textContent = msgs[si];
      status.classList.toggle('ok', si === 5);
      steps.forEach((s, k) => s.classList.toggle('on', p > 0 && k === Math.min(3, Math.max(0, si - 1))));
      caps.forEach((c) => c.classList.toggle('on', (c.dataset.cap === 'b') === (t > 0.5)));
    };
    range.addEventListener('input', () => { manual = true; update(); });
    const onS = () => {
      if (manual) return;
      const r = sim.getBoundingClientRect();
      const k = clamp((innerHeight * 0.85 - r.top) / (r.height * 0.9));
      range.value = Math.round(k * 100);
      update();
    };
    if (!reduce) addEventListener('scroll', onS, { passive: true });
    onS();
    update();
  });

  /* ---------- Ciclo completo, fixo na tela durante a rolagem ---------- */
  const cyc = $('[data-cycle]');
  if (cyc) {
    const steps = $$('[data-cycle-step]', cyc);
    const imgs = $$('[data-cycle-img]', cyc);
    const barI = $('[data-cycle-bar]', cyc);
    let cur = -1;
    const set = (n) => {
      if (n === cur) return;
      imgs.forEach((im, k) => {
        im.classList.toggle('prev', k === cur); im.classList.toggle('on', k === n);
        const v = $('video', im);
        if (v) { if (k === n) { v.play().catch(() => {}); } else v.pause(); }
      });
      steps.forEach((s, k) => s.classList.toggle('on', k === n));
      cur = n;
    };
    const onC = () => {
      const r = cyc.getBoundingClientRect();
      const total = r.height - innerHeight;
      const k = total > 0 ? clamp(-r.top / total) : 0;
      barI.style.setProperty('--cp', k);
      set(Math.min(steps.length - 1, Math.floor(k * steps.length * 0.999)));
    };
    addEventListener('scroll', onC, { passive: true });
    onC();
    steps.forEach((s, k) => s.addEventListener('click', () => {
      const r = cyc.getBoundingClientRect();
      const total = r.height - innerHeight;
      scrollTo({ top: scrollY + r.top + total * ((k + 0.5) / steps.length), behavior: 'smooth' });
    }));
  }

  /* ---------- Mais vendido da semana: rotação automática, foto sem fundo em 3D e pontos interativos ---------- */
  const week = $('[data-week]');
  if (week && window.GM_DESTAQUES) {
    const d = new Date();
    const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
    const wk = Math.ceil(((t - new Date(Date.UTC(t.getUTCFullYear(), 0, 1))) / 864e5 + 1) / 7);
    const key = `${t.getUTCFullYear()}-W${String(wk).padStart(2, '0')}`;
    const { rodizio = [], fixo = {} } = window.GM_DESTAQUES;
    const weekP = (fixo[key] && rodizio.find((x) => x.id === fixo[key])) || rodizio[(t.getUTCFullYear() * 53 + wk) % rodizio.length];
    const media = $('[data-week-media]', week);
    const label = $('[data-week-label]', week);
    let auto;
    const show = (p) => {
      const isWeek = p === weekP;
      label.textContent = isWeek ? `semana ${wk}` : 'também em destaque';
      media.innerHTML = `<div class="w3d" data-w3d><div class="w3d-floor" aria-hidden="true"></div><img src="${ROOT + p.img}" alt="${p.name}">${(p.pontos || []).map((h, i) => `<button class="hot" type="button" style="--x:${h.x}%;--y:${h.y}%" data-hot="${i}" aria-label="${h.titulo}"><span>${i + 1}</span></button>`).join('')}<div class="hot-tip" data-tip hidden></div></div>`;
      $('[data-week-name]', week).textContent = p.name;
      $('[data-week-desc]', week).textContent = p.desc;
      $('[data-week-points]', week).innerHTML = (p.pontos || []).map((h, i) => `<li data-hotli="${i}"><b>${i + 1}</b><div><strong>${h.titulo}</strong><span>${h.texto}</span></div></li>`).join('');
      const payload = JSON.stringify({ id: p.id, name: p.name, line: p.line, url: p.url, img: p.img }).replace(/'/g, '&#39;');
      $('[data-week-actions]', week).innerHTML = `<a class="btn btn-white" href="${ROOT}${p.url}">Ver produto</a><button class="btn btn-ghost-white" type="button" data-add='${payload}'>+ Adicionar ao orçamento</button>`;
      $$('[data-thumb]', week).forEach((b) => b.setAttribute('aria-selected', String(b.dataset.thumb === p.id)));
      const box = $('[data-w3d]', media);
      const tip = $('[data-tip]', media);
      const focusHot = (i) => {
        const h = (p.pontos || [])[i]; if (!h) return;
        $$('.hot', box).forEach((b) => b.classList.toggle('on', +b.dataset.hot === i));
        $$('[data-hotli]', week).forEach((li) => li.classList.toggle('on', +li.dataset.hotli === i));
        tip.hidden = false; tip.innerHTML = `<strong>${h.titulo}</strong><span>${h.texto}</span>`;
        tip.style.left = `${h.x}%`; tip.style.top = `${h.y}%`;
        tip.classList.toggle('left', h.x > 55);
      };
      let k = 0;
      clearInterval(auto);
      if ((p.pontos || []).length && !reduce) auto = setInterval(() => focusHot(k++ % p.pontos.length), 2600);
      if ((p.pontos || []).length) focusHot(0);
      const stop = () => clearInterval(auto);
      $$('.hot', box).forEach((b) => { b.addEventListener('click', () => { stop(); focusHot(+b.dataset.hot); }); b.addEventListener('mouseenter', () => { stop(); focusHot(+b.dataset.hot); }); });
      $$('[data-hotli]', week).forEach((li) => li.addEventListener('mouseenter', () => { stop(); focusHot(+li.dataset.hotli); }));
      if (fine) {
        box.addEventListener('pointermove', (e) => { const r = box.getBoundingClientRect(); box.style.setProperty('--tx', `${((e.clientX - r.left) / r.width - 0.5) * 16}deg`); box.style.setProperty('--ty', `${-((e.clientY - r.top) / r.height - 0.5) * 12}deg`); });
        box.addEventListener('pointerleave', () => { box.style.setProperty('--tx', '0deg'); box.style.setProperty('--ty', '0deg'); });
      }
    };
    if (weekP) {
      const others = [weekP, ...rodizio.filter((x) => x !== weekP)];
      $('[data-week-thumbs]', week).innerHTML = others.map((p) => `<button type="button" role="tab" data-thumb="${p.id}" aria-label="${p.name}"><img src="${ROOT + p.img}" alt=""></button>`).join('');
      $$('[data-thumb]', week).forEach((b) => b.addEventListener('click', () => show(others.find((x) => x.id === b.dataset.thumb))));
      show(weekP);
      if (!reduce) addEventListener('scroll', () => {
        const r = week.getBoundingClientRect();
        const kk = clamp((innerHeight - r.top) / (innerHeight + r.height));
        week.style.setProperty('--wr', `${-14 + kk * 28}deg`);
      }, { passive: true });
    }
  }

  /* ---------- Zoom na foto do produto ---------- */
  const zoom = $('[data-zoom]');
  if (zoom && fine && $('img', zoom)) {
    zoom.addEventListener('pointerenter', () => zoom.classList.add('zoom'));
    zoom.addEventListener('pointerleave', () => zoom.classList.remove('zoom'));
    zoom.addEventListener('pointermove', (e) => {
      const r = zoom.getBoundingClientRect();
      zoom.style.setProperty('--zx', ((e.clientX - r.left) / r.width) * 100 + '%');
      zoom.style.setProperty('--zy', ((e.clientY - r.top) / r.height) * 100 + '%');
    });
  }

  /* ---------- Fluxo da conversão ---------- */
  const flow = $('[data-flow]');
  if (flow) {
    const steps = $$('[data-flow-step]', flow);
    let k = 0, timer;
    const go = () => {
      k = (k + 1) % (steps.length + 1);
      steps.forEach((s, j) => s.classList.toggle('on', j < k));
      flow.style.setProperty('--fp', Math.max(0, k - 1) / (steps.length - 1));
    };
    if ('IntersectionObserver' in window) new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { if (!timer) { go(); timer = setInterval(go, 1300); } } else { clearInterval(timer); timer = null; } }), { threshold: 0.4 }).observe(flow);
    else steps.forEach((s) => s.classList.add('on'));
  }

  /* ---------- Filtro de produtos por tipo ---------- */
  const pf = $('[data-pfilter]');
  if (pf) {
    pf.addEventListener('click', (e) => {
      const b = e.target.closest('[data-f]');
      if (!b) return;
      $$('[data-f]', pf).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      $$('.pgrid .lab').forEach((c) => {
        const show = b.dataset.f === 'all' || (c.dataset.tags || '').split('|').includes(b.dataset.f);
        c.hidden = !show;
        if (show) c.classList.add('in');
      });
    });
  }

  /* ---------- Notícias: filtro ---------- */
  const filters = $('[data-filters]');
  if (filters) {
    const empty = $('[data-empty]');
    const apply = (f) => {
      $$('[role="tab"]', filters).forEach((b) => b.setAttribute('aria-selected', String(b.dataset.filter === f)));
      let n = 0;
      $$('[data-articles] .acard').forEach((a) => { a.hidden = f !== 'all' && a.dataset.cat !== f; if (!a.hidden) { n++; a.classList.add('in'); } });
      if (empty) empty.hidden = n > 0;
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
      pl.innerHTML = res.length ? res.map((p) => {
        const inner = `<span class="partner-mono">${esc(p.nome.split(' ').map((w) => w[0]).slice(0, 2).join(''))}</span><div><strong>${esc(p.nome)}</strong><small>${esc(p.cidade)}/${esc(p.uf)} · ${esc((p.linhas || []).join(', '))}</small></div>`;
        return p.site ? `<a class="partner" href="${esc(p.site)}" target="_blank" rel="noopener">${inner}</a>` : `<div class="partner">${inner}</div>`;
      }).join('') : '<p class="muted">Nenhum parceiro encontrado para essa busca.</p>';
    };
    render();
    const s = $('[data-partner-search]');
    s && s.addEventListener('input', () => render(s.value));
  }

  /* ---------- Cookies (LGPD) ---------- */
  const ck = $('[data-cookie]');
  if (ck && store.get('gm_cookies', null) === null) ck.hidden = false;
  const setConsent = (v) => { store.set('gm_cookies', v); ck.hidden = true; if (v && window.gmLoadTracking) window.gmLoadTracking(); };
  $('[data-cookie-ok]') && $('[data-cookie-ok]').addEventListener('click', () => setConsent(true));
  $('[data-cookie-deny]') && $('[data-cookie-deny]').addEventListener('click', () => setConsent(false));
  $$('[data-cookie-open]').forEach((b) => b.addEventListener('click', () => { ck.hidden = false; }));

  /* ---------- Rodapé ---------- */
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
  if (C.mapEmbed) { const m = $('[data-map]'); if (m) { m.hidden = false; m.innerHTML = `<iframe src="${C.mapEmbed}" loading="lazy" title="Localização da grafMED" referrerpolicy="no-referrer-when-downgrade"></iframe>`; } }
})();
