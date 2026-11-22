/* grafMED · cenas 3D (Three.js r149, arquivo local em assets/vendor)
   - Etiqueta CME com indicador químico Tipo 1: puxe a linha para ver a mudança de cor, gire e dê zoom.
   - Conversão de matéria-prima: bobina, corte e kit, em animação contínua, com troca de material.
   - Projeto sob medida: configurador de etiqueta em 3D.
   As texturas são desenhadas em canvas (nítidas no zoom e funcionam abrindo o site direto do disco). */
(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FONT = '"Montserrat", Arial, sans-serif';
  const hasGL = (() => { try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl'))); } catch { return false; } })();
  const T = window.THREE;

  /* ---------- Arte da etiqueta CME (fiel à etiqueta duplo uso grafMED) ---------- */
  const LABEL = { W: 2048, H: 1120, stripeX: 150, stripeW: 74 };
  const PINK = '#E06B8B', BROWN = '#4E2A16', BLUE = '#1D4F9E', LINE = '#9DB3DA';
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function drawLabel(cv, stripe = PINK, { brand = 'CME', scale = 1 } = {}) {
    const W = LABEL.W * scale, H = LABEL.H * scale;
    cv.width = W; cv.height = H;
    const c = cv.getContext('2d');
    c.save(); c.scale(scale, scale);
    const w = LABEL.W, h = LABEL.H;
    c.clearRect(0, 0, w, h);
    rr(c, 4, 4, w - 8, h - 8, 46); c.fillStyle = '#FFFFFF'; c.fill();
    c.save(); rr(c, 4, 4, w - 8, h - 8, 46); c.clip();
    const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, 'rgba(240,244,250,.0)'); g.addColorStop(1, 'rgba(225,232,244,.35)'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    // faixa indicadora com textura de tinta
    const sx = LABEL.stripeX, sw = LABEL.stripeW;
    c.fillStyle = stripe; c.fillRect(sx, 0, sw, h);
    for (let i = 0; i < 1400; i++) { c.fillStyle = `rgba(${stripe === PINK ? '255,255,255' : '0,0,0'},${Math.random() * 0.08})`; c.fillRect(sx + Math.random() * sw, Math.random() * h, 2 + Math.random() * 3, 2 + Math.random() * 3); }
    c.restore();
    // textos verticais da coluna do indicador
    c.fillStyle = BLUE;
    c.save(); c.translate(95, h - 60); c.rotate(-Math.PI / 2); c.font = `600 34px ${FONT}`; c.fillText('Rosa/Rose', 0, 0); c.fillText('→', 230, 0); c.fillText('Marrom/Brown', 300, 0); c.restore();
    c.save(); c.translate(275, h - 60); c.rotate(-Math.PI / 2); c.font = `700 32px ${FONT}`; c.fillText('AUTOCLAVE A VAPOR', 0, 0); c.restore();
    // corpo
    c.fillStyle = BLUE; c.font = `800 92px ${FONT}`; c.fillText(brand, 340, 168);
    c.font = `500 46px ${FONT}`;
    const field = (label, x, y, x2) => { c.fillStyle = BLUE; c.fillText(label, x, y); const tw = c.measureText(label).width; c.strokeStyle = LINE; c.lineWidth = 3; c.beginPath(); c.moveTo(x + tw + 12, y + 6); c.lineTo(x2, y + 6); c.stroke(); };
    field('Data da esterilização:', 1000, 120, 1960);
    field('Validade:', 1000, 210, 1960);
    field('Lote:', 1340, 330, 1960);
    field('Equipamento:', 340, 330, 1290);
    field('Descrição/ Caixa:', 340, 430, 1960);
    c.strokeStyle = LINE; c.lineWidth = 3;
    [530, 630, 730].forEach((y) => { c.beginPath(); c.moveTo(340, y); c.lineTo(1960, y); c.stroke(); });
    field('Total de peças:', 1270, 840, 1960);
    field('Preparado por:', 340, 960, 1960);
    // picote do duplo uso
    c.setLineDash([14, 12]); c.strokeStyle = '#C8D3E8'; c.lineWidth = 3; c.beginPath(); c.moveTo(318, 30); c.lineTo(318, h - 30); c.stroke(); c.setLineDash([]);
    // marca
    c.fillStyle = '#E8811A'; c.font = `italic 800 40px ${FONT}`; c.fillText('grafMED', 1770, 1060);
    c.restore();
    return cv;
  }
  window.GM_drawLabel = drawLabel;
  // desenha as etiquetas estáticas (ex.: prontuário)
  const paintStatic = () => $$('canvas[data-label-art]').forEach((cv) => drawLabel(cv, cv.dataset.labelArt === 'brown' ? BROWN : PINK, { scale: +(cv.dataset.scale || 0.5) }));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(paintStatic); else paintStatic();

  const onVisible = (el, cb) => {
    if (!('IntersectionObserver' in window)) { cb(true); return; }
    new IntersectionObserver((es) => es.forEach((e) => cb(e.isIntersecting)), { rootMargin: '120px' }).observe(el);
  };
  const makeRenderer = (el) => {
    const r = new T.WebGLRenderer({ antialias: true, alpha: true });
    r.setPixelRatio(Math.min(devicePixelRatio, 2));
    r.outputEncoding = T.sRGBEncoding;
    r.setSize(el.clientWidth, el.clientHeight);
    el.prepend(r.domElement);
    return r;
  };
  const softShadow = (w = 4, h = 1.2, a = 0.35) => {
    const cv = document.createElement('canvas'); cv.width = 256; cv.height = 128;
    const c = cv.getContext('2d'); const g = c.createRadialGradient(128, 64, 4, 128, 64, 124);
    g.addColorStop(0, `rgba(120,50,0,${a})`); g.addColorStop(1, 'rgba(120,50,0,0)');
    c.fillStyle = g; c.fillRect(0, 0, 256, 128);
    const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ map: new T.CanvasTexture(cv), transparent: true, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; return m;
  };

  /* ---------- 1. Etiqueta 3D com indicador químico ---------- */
  function indicator(root) {
    const stage = $('[data-ind-stage]', root);
    const pull = $('[data-pull]', root);
    const track = $('[data-track]', root);
    const line = $('[data-sweep-line]', root);
    const temp = $('[data-ind-temp]', root);
    const status = $('[data-ind-status]', root);
    const bar = $('[data-ind-bar]', root);
    let p = 0, target = 0;
    // texturas
    const pinkCv = drawLabel(document.createElement('canvas'), PINK);
    const brownCv = drawLabel(document.createElement('canvas'), BROWN);
    const comp = document.createElement('canvas'); comp.width = LABEL.W; comp.height = LABEL.H;
    const cc = comp.getContext('2d');
    const strip = document.createElement('canvas'); strip.width = LABEL.stripeW + 40; strip.height = LABEL.H;
    const sc = strip.getContext('2d');
    const compose = () => {
      cc.clearRect(0, 0, comp.width, comp.height);
      cc.drawImage(pinkCv, 0, 0);
      if (p > 0.001) {
        // a tinta reage de baixo para cima, com borda irregular
        const x0 = LABEL.stripeX - 20, edge = LABEL.H * (1 - p * 1.12);
        sc.globalCompositeOperation = 'source-over';
        sc.clearRect(0, 0, strip.width, strip.height);
        sc.drawImage(brownCv, x0, 0, strip.width, strip.height, 0, 0, strip.width, strip.height);
        sc.globalCompositeOperation = 'destination-in';
        const g = sc.createLinearGradient(0, edge - 120, 0, edge + 60);
        g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,1)');
        sc.fillStyle = g; sc.fillRect(0, 0, strip.width, strip.height);
        cc.drawImage(strip, x0, 0);
      }
    };
    const msgs = ['Arraste a linha para a direita para iniciar o ciclo a vapor.', 'Aquecendo a câmara da autoclave.', 'Esterilizando: o indicador está reagindo.', 'Quase lá: a faixa escurece.', 'Ciclo concluído. Faixa marrom: material processado e rastreado.'];
    const ui = () => {
      const deg = Math.round(p < 0.15 ? 25 + p * 300 : Math.min(134, 70 + p * 80));
      temp.textContent = `${deg} °C`;
      const i = p <= 0.01 ? 0 : p < 0.3 ? 1 : p < 0.7 ? 2 : p < 0.98 ? 3 : 4;
      status.textContent = msgs[i];
      status.classList.toggle('ok', i === 4);
      root.classList.toggle('done', i === 4);
      bar.style.setProperty('--p', p);
      track.style.setProperty('--p', p);
      { const tr = track.getBoundingClientRect(), sr = stage.getBoundingClientRect(); line.style.left = `${tr.left - sr.left + p * tr.width}px`; line.classList.toggle('past', p > 0.5); }
      pull.setAttribute('aria-valuenow', Math.round(p * 100));
    };

    // linha horizontal: arraste da esquerda (antes) para a direita (depois)
    let dragging = false;
    const fromX = (x) => { const r = track.getBoundingClientRect(); return clamp((x - r.left) / r.width); };
    track.addEventListener('pointerdown', (e) => { dragging = true; track.setPointerCapture(e.pointerId); root.classList.add('pulling'); target = fromX(e.clientX); });
    track.addEventListener('pointermove', (e) => { if (dragging) target = fromX(e.clientX); });
    const end = () => { dragging = false; root.classList.remove('pulling'); };
    track.addEventListener('pointerup', end); track.addEventListener('pointercancel', end);
    pull.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); target = clamp(target + 0.1); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); target = clamp(target - 0.1); }
      if (e.key === 'End' || e.key === 'Enter') target = 1;
      if (e.key === 'Home') target = 0;
    });
    $('[data-ind-play]', root).addEventListener('click', () => { target = 0; p = 0; setTimeout(() => { target = 1; }, 250); });
    $('[data-ind-reset]', root).addEventListener('click', () => { target = 0; });

    if (!hasGL || !T) {
      // alternativa 2D com perspectiva em CSS
      stage.appendChild(comp); comp.className = 'ind-flat';
      let zoomed = false;
      $('[data-zoom-in]', root).addEventListener('click', () => { zoomed = true; comp.classList.add('z'); });
      $('[data-zoom-out]', root).addEventListener('click', () => { zoomed = false; comp.classList.remove('z'); });
      $('[data-focus]', root).addEventListener('click', () => { zoomed = !zoomed; comp.classList.toggle('z', zoomed); });
      const loop = () => { p += (target - p) * 0.08; compose(); ui(); requestAnimationFrame(loop); };
      compose(); ui(); loop();
      return;
    }

    const renderer = makeRenderer(stage);
    const scene = new T.Scene();
    const cam = new T.PerspectiveCamera(32, stage.clientWidth / stage.clientHeight, 0.05, 100);
    cam.position.set(0, 0.25, 7);
    scene.add(new T.HemisphereLight(0xffffff, 0xf2c39a, 0.95));
    const key = new T.DirectionalLight(0xffffff, 0.65); key.position.set(-3, 4, 6); scene.add(key);
    const rim = new T.DirectionalLight(0xffd7a8, 0.35); rim.position.set(4, -2, -3); scene.add(rim);

    const tex = new T.CanvasTexture(comp);
    tex.encoding = T.sRGBEncoding; tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const LW = 4.4, LH = LW * LABEL.H / LABEL.W;
    const geo = new T.PlaneGeometry(LW, LH, 80, 10);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) { const x = pos.getX(i); pos.setZ(i, -0.06 * Math.pow(x / (LW / 2), 2) + 0.03 * Math.sin((x / LW) * Math.PI)); }
    geo.computeVertexNormals();
    const front = new T.Mesh(geo, new T.MeshStandardMaterial({ map: tex, roughness: 0.55, metalness: 0, transparent: true, alphaTest: 0.05, side: T.FrontSide }));
    const backGeo = geo.clone();
    const back = new T.Mesh(backGeo, new T.MeshStandardMaterial({ color: 0xf6f1ea, roughness: 0.8, side: T.BackSide }));
    back.position.z = -0.012;
    const label = new T.Group(); label.add(front, back); scene.add(label);
    const shadow = softShadow(5.6, 1.6, 0.32); shadow.position.set(0, -LH / 2 - 0.55, 0.1); scene.add(shadow);

    // vapor saindo da etiqueta durante o ciclo
    const N = 70;
    const sg = new T.BufferGeometry();
    const sp = new Float32Array(N * 3); const life = new Float32Array(N);
    for (let i = 0; i < N; i++) { sp[i * 3] = (Math.random() - 0.5) * LW; sp[i * 3 + 1] = -LH / 2 + Math.random() * LH; sp[i * 3 + 2] = 0.2; life[i] = Math.random(); }
    sg.setAttribute('position', new T.BufferAttribute(sp, 3));
    const dot = document.createElement('canvas'); dot.width = dot.height = 64; const dc = dot.getContext('2d'); const dg = dc.createRadialGradient(32, 32, 0, 32, 32, 32); dg.addColorStop(0, 'rgba(255,255,255,.9)'); dg.addColorStop(1, 'rgba(255,255,255,0)'); dc.fillStyle = dg; dc.fillRect(0, 0, 64, 64);
    const steam = new T.Points(sg, new T.PointsMaterial({ size: 0.42, map: new T.CanvasTexture(dot), transparent: true, depthWrite: false, opacity: 0 }));
    scene.add(steam);

    // rotação por arraste, zoom por botões, roda do mouse e pinça
    const stripeWorldX = -LW / 2 + ((LABEL.stripeX + LABEL.stripeW / 2) / LABEL.W) * LW;
    let rotX = 0.08, rotY = -0.35, tRotX = 0.08, tRotY = -0.35, zoom = 0, tZoom = 0, focus = 0, tFocus = 0, hover = { x: 0, y: 0 };
    let drag = null;
    const cvs = renderer.domElement;
    cvs.style.touchAction = 'pan-y';
    cvs.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, rx: tRotX, ry: tRotY }; cvs.setPointerCapture(e.pointerId); root.classList.add('grabbing'); });
    cvs.addEventListener('pointermove', (e) => {
      const r = cvs.getBoundingClientRect(); hover = { x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 };
      if (!drag) return;
      tRotY = clamp(drag.ry + (e.clientX - drag.x) / 260, -1.2, 1.2); tRotX = clamp(drag.rx + (e.clientY - drag.y) / 400, -0.6, 0.6);
    });
    const stopDrag = () => { drag = null; root.classList.remove('grabbing'); };
    cvs.addEventListener('pointerup', stopDrag); cvs.addEventListener('pointercancel', stopDrag);
    cvs.addEventListener('dblclick', () => { tFocus = tFocus ? 0 : 1; });
    cvs.addEventListener('wheel', (e) => { e.preventDefault(); tZoom = clamp(tZoom - e.deltaY * 0.0015, 0, 1); }, { passive: false });
    let pinch = null;
    cvs.addEventListener('touchstart', (e) => { if (e.touches.length === 2) pinch = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); }, { passive: true });
    cvs.addEventListener('touchmove', (e) => { if (pinch && e.touches.length === 2) { const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); tZoom = clamp(tZoom + (d - pinch) / 300); pinch = d; } }, { passive: true });
    cvs.addEventListener('touchend', () => { pinch = null; });
    $('[data-zoom-in]', root).addEventListener('click', () => { tZoom = clamp(tZoom + 0.34); });
    $('[data-zoom-out]', root).addEventListener('click', () => { tZoom = clamp(tZoom - 0.34); if (tZoom === 0) tFocus = 0; });
    $('[data-focus]', root).addEventListener('click', () => { tFocus = tFocus ? 0 : 1; if (tFocus) { tRotY = 0.15; tRotX = 0; } root.classList.toggle('focused', !!tFocus); });

    const resize = () => { renderer.setSize(stage.clientWidth, stage.clientHeight); cam.aspect = stage.clientWidth / stage.clientHeight; cam.updateProjectionMatrix(); cam.position.z = cam.aspect < 1 ? 10 : 7; };
    addEventListener('resize', resize);
    let running = false, t0 = performance.now(), lastP = -1;
    const frame = (t) => {
      if (!running) return;
      const dt = Math.min(0.05, (t - t0) / 1000); t0 = t;
      p += (target - p) * Math.min(1, dt * (dragging ? 12 : 2.4));
      if (Math.abs(p - lastP) > 0.0005) { compose(); tex.needsUpdate = true; ui(); lastP = p; }
      rotX += (tRotX + (drag ? 0 : hover.y * 0.12) - rotX) * 0.08;
      rotY += (tRotY + (drag ? 0 : hover.x * 0.25) + (reduce || drag || tFocus ? 0 : Math.sin(t / 2600) * 0.05) - rotY) * 0.08;
      zoom += (tZoom - zoom) * 0.08; focus += (tFocus - focus) * 0.07;
      label.rotation.set(rotX, rotY, 0);
      label.position.y = 0.55 + (reduce ? 0 : Math.sin(t / 1400) * 0.05);
      const z = Math.max(cam.aspect < 1 ? 3 : 2, (cam.aspect < 1 ? 10 : 7) - zoom * 3.4 - focus * 4.2);
      cam.position.set(stripeWorldX * focus * Math.cos(rotY), 0.25 * (1 - focus), z);
      cam.lookAt(stripeWorldX * focus * Math.cos(rotY), 0, 0);
      // vapor
      const active = target > p + 0.01 || (p > 0.02 && p < 0.98);
      steam.material.opacity += ((active ? 0.55 : 0) - steam.material.opacity) * 0.05;
      for (let i = 0; i < N; i++) { life[i] += dt * 0.35; if (life[i] > 1) { life[i] = 0; sp[i * 3] = (Math.random() - 0.5) * LW; sp[i * 3 + 1] = -LH / 2 + Math.random() * LH * 0.4; } sp[i * 3 + 1] += dt * 0.9; sp[i * 3 + 2] = 0.2 + life[i] * 0.8; }
      sg.attributes.position.needsUpdate = true;
      steam.rotation.copy(label.rotation);
      renderer.render(scene, cam);
      requestAnimationFrame(frame);
    };
    onVisible(root, (v) => { if (v && !running) { running = true; t0 = performance.now(); requestAnimationFrame(frame); } else if (!v) running = false; });
    const start = () => { compose(); tex.needsUpdate = true; ui(); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { pinkCv && drawLabel(pinkCv, PINK); drawLabel(brownCv, BROWN); lastP = -1; start(); }); else start();
    // demonstração automática uma vez, quando a seção aparece
    let demo = false;
    onVisible(root, (v) => { if (v && !demo && !reduce) { demo = true; setTimeout(() => { if (target === 0) { target = 0.35; setTimeout(() => { if (target === 0.35) target = 0; }, 1600); } }, 900); } });
  }

  /* ---------- 2. Conversão de matéria-prima ---------- */
  const MATERIALS = {
    velcro: { nome: 'Velcro', cor: 0x222222, rough: 0.95, peca: 'disco' },
    micropore: { nome: 'Micropore', cor: 0xf4efe6, rough: 0.9, peca: 'retangulo' },
    feltro: { nome: 'Feltro', cor: 0x8a6a52, rough: 1, peca: 'disco' },
    espuma: { nome: 'Espuma técnica', cor: 0x4f86c6, rough: 0.85, peca: 'quadrado' },
    silicone: { nome: 'Silicone', cor: 0xf29727, rough: 0.35, peca: 'disco' },
  };
  function conversion(root) {
    const stage = $('[data-conv-stage]', root) || root;
    if (!hasGL || !T) { root.classList.add('no-gl'); return; }
    const renderer = makeRenderer(stage);
    const scene = new T.Scene();
    const cam = new T.PerspectiveCamera(30, stage.clientWidth / stage.clientHeight, 0.1, 100);
    const setCam = () => { const a = stage.clientWidth / stage.clientHeight; cam.aspect = a; const d = (a < 1 ? 20 : 14) * Math.max(1, 1.3 / a); cam.position.set(1.3, d * 0.42, d); cam.lookAt(1.3, 0.5, 0); cam.updateProjectionMatrix(); };
    setCam();
    scene.add(new T.HemisphereLight(0xffffff, 0xf5c08a, 0.55));
    const dl = new T.DirectionalLight(0xffffff, 0.95); dl.position.set(-4, 8, 6); scene.add(dl);
    let mat = MATERIALS.velcro;
    const matRoll = new T.MeshStandardMaterial({ color: mat.cor, roughness: mat.rough });
    // bobina
    const roll = new T.Group();
    const outer = new T.Mesh(new T.CylinderGeometry(1.25, 1.25, 1.1, 64, 1, true), matRoll);
    const sideGeo = new T.RingGeometry(0.42, 1.25, 64);
    const sideMat = new T.MeshStandardMaterial({ color: mat.cor, roughness: mat.rough, side: T.DoubleSide });
    const s1 = new T.Mesh(sideGeo, sideMat); s1.position.y = 0.55; s1.rotation.x = -Math.PI / 2;
    const s2 = s1.clone(); s2.position.y = -0.55;
    const core = new T.Mesh(new T.CylinderGeometry(0.42, 0.42, 1.12, 48, 1, true), new T.MeshStandardMaterial({ color: 0xc89a62, roughness: 0.9, side: T.DoubleSide }));
    roll.add(outer, s1, s2, core);
    roll.rotation.x = Math.PI / 2;
    roll.position.set(-2.2, 0.6, 0);
    scene.add(roll);
    // tira de material até a faca
    const stripCv = document.createElement('canvas'); stripCv.width = 256; stripCv.height = 64;
    const stripTex = new T.CanvasTexture(stripCv); stripTex.wrapS = T.RepeatWrapping; stripTex.repeat.set(4, 1);
    const drawStrip = () => { const c = stripCv.getContext('2d'); const col = '#' + mat.cor.toString(16).padStart(6, '0'); c.fillStyle = col; c.fillRect(0, 0, 256, 64); c.fillStyle = 'rgba(255,255,255,.12)'; for (let x = 0; x < 256; x += 32) c.fillRect(x, 0, 2, 64); stripTex.needsUpdate = true; };
    drawStrip();
    const strip = new T.Mesh(new T.PlaneGeometry(4.2, 1.0), new T.MeshStandardMaterial({ map: stripTex, roughness: mat.rough, side: T.DoubleSide }));
    strip.rotation.x = -Math.PI / 2; strip.position.set(-0.2, -0.66, 0); scene.add(strip);
    // esteira
    const belt = new T.Mesh(new T.BoxGeometry(9, 0.18, 1.6), new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 }));
    belt.position.set(1.4, -0.86, 0); scene.add(belt);
    const beltEdge = new T.Mesh(new T.BoxGeometry(9, 0.06, 1.64), new T.MeshStandardMaterial({ color: 0xf29727, roughness: 0.5 }));
    beltEdge.position.set(1.4, -0.97, 0); scene.add(beltEdge);
    // prensa de corte
    const press = new T.Group();
    const head = new T.Mesh(new T.BoxGeometry(1.2, 0.5, 1.5), new T.MeshStandardMaterial({ color: 0x2b2421, roughness: 0.45, metalness: 0.3 }));
    const stripe = new T.Mesh(new T.BoxGeometry(1.22, 0.1, 1.52), new T.MeshStandardMaterial({ color: 0xf29727, roughness: 0.4 })); stripe.position.y = 0.12; press.add(stripe);
    const blade = new T.Mesh(new T.CylinderGeometry(0.34, 0.34, 0.2, 40), new T.MeshStandardMaterial({ color: 0xdedede, metalness: 0.9, roughness: 0.25 }));
    blade.position.y = -0.35; press.add(head, blade);
    const pillarMat = new T.MeshStandardMaterial({ color: 0x3a2e28, roughness: 0.6 });
    const p1 = new T.Mesh(new T.BoxGeometry(0.16, 2.6, 0.16), pillarMat); p1.position.set(1.9, 0.4, -0.9);
    const p2 = p1.clone(); p2.position.z = 0.9;
    
    scene.add(p1, press);
    press.position.set(1.9, 0.6, 0);
    // caixa do kit
    const box = new T.Group();
    const bm = new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7, side: T.DoubleSide });
    const bottom = new T.Mesh(new T.BoxGeometry(2, 0.06, 1.6), bm);
    const wall = (w, h, d, x, z) => { const m = new T.Mesh(new T.BoxGeometry(w, h, d), bm); m.position.set(x, h / 2, z); box.add(m); };
    box.add(bottom); wall(2, 0.7, 0.06, 0, -0.8); wall(2, 0.7, 0.06, 0, 0.8); wall(0.06, 0.7, 1.6, -1, 0); wall(0.06, 0.7, 1.6, 1, 0);
    const lid = new T.Mesh(new T.PlaneGeometry(1.4, 0.4), new T.MeshBasicMaterial({ color: 0xf29727 })); lid.position.set(0, 0.36, 0.84); box.add(lid);
    box.position.set(5.2, -0.9, 0); scene.add(box);
    const shadow = softShadow(14, 3.4, 0.25); shadow.position.set(1.4, -1.02, 0); scene.add(shadow);
    // peças cortadas
    const pieces = [];
    const pieceGeo = () => mat.peca === 'disco' ? new T.CylinderGeometry(0.3, 0.3, 0.06, 32) : mat.peca === 'quadrado' ? new T.BoxGeometry(0.5, 0.12, 0.5) : new T.BoxGeometry(0.62, 0.04, 0.38);
    const pieceMat = new T.MeshStandardMaterial({ color: mat.cor, roughness: mat.rough });
    const spawn = () => { const m = new T.Mesh(pieceGeo(), pieceMat); m.position.set(1.9, -0.68, 0); m.userData = { v: 0, phase: 0 }; scene.add(m); pieces.push(m); };
    const setMaterial = (key) => {
      mat = MATERIALS[key] || mat;
      [matRoll, sideMat, pieceMat].forEach((m) => { m.color.setHex(mat.cor); m.roughness = mat.rough; });
      strip.material.roughness = mat.rough; drawStrip();
      pieces.splice(0).forEach((m) => scene.remove(m));
      const label = $('[data-conv-mat]', root); if (label) label.textContent = mat.nome;
    };
    $$('[data-conv-pick]', root).forEach((b) => b.addEventListener('click', () => { $$('[data-conv-pick]', root).forEach((x) => x.setAttribute('aria-pressed', String(x === b))); setMaterial(b.dataset.convPick); }));
    let running = false, t0 = 0, cycle = 0, count = 0;
    const counter = $('[data-conv-count]', root);
    const frame = (t) => {
      if (!running) return;
      const dt = Math.min(0.05, (t - t0) / 1000); t0 = t;
      roll.rotation.y += dt * 1.2;
      stripTex.offset.x -= dt * 0.6;
      cycle += dt;
      const k = (cycle % 1.1) / 1.1;
      press.position.y = 0.6 - (k > 0.55 && k < 0.75 ? Math.sin(((k - 0.55) / 0.2) * Math.PI) * 0.75 : 0);
      if (cycle > 1.1) { cycle -= 1.1; spawn(); count++; if (counter) counter.textContent = count.toLocaleString('pt-BR'); }
      for (let i = pieces.length - 1; i >= 0; i--) {
        const m = pieces[i];
        if (m.position.x < 4.4) { m.position.x += dt * 1.6; m.rotation.y += dt * 0.5; }
        else { m.userData.v -= dt * 9; m.position.y = Math.max(-0.82 + (i % 6) * 0.07, m.position.y + m.userData.v * dt); m.position.x = Math.min(5.2, m.position.x + dt * 1.4); }
      }
      while (pieces.length > 14) scene.remove(pieces.shift());
      scene.rotation.y = reduce ? 0 : Math.sin(t / 5000) * 0.06;
      renderer.render(scene, cam);
      requestAnimationFrame(frame);
    };
    addEventListener('resize', () => { renderer.setSize(stage.clientWidth, stage.clientHeight); setCam(); });
    onVisible(root, (v) => { if (v && !running) { running = true; t0 = performance.now(); requestAnimationFrame(frame); } else if (!v) running = false; });
  }

  /* ---------- 3. Configurador de etiqueta sob medida ---------- */
  function configurator(root) {
    const stage = $('[data-cfg-stage]', root);
    const f = (n) => $(`[name="${n}"]`, root);
    const out = $('[data-cfg-size]', root);
    const wa = $('[data-cfg-wa]', root);
    const state = () => ({ forma: (root.querySelector('[name="forma"]:checked') || {}).value || 'retangular', w: +f('largura').value, h: +f('altura').value, material: f('material').value, indicador: f('indicador').value, texto: f('texto').value || 'SUA MARCA' });
    const art = document.createElement('canvas'); art.width = 1024; art.height = 1024;
    const paint = (s) => {
      const c = art.getContext('2d');
      c.clearRect(0, 0, 1024, 1024);
      const bg = { papel: '#FFFFFF', bopp: 'rgba(255,255,255,0.25)', prata: '#D9DCE0', kraft: '#C9A57A' }[s.material];
      c.fillStyle = bg; c.fillRect(0, 0, 1024, 1024);
      if (s.indicador !== 'nenhum') { c.fillStyle = s.indicador === 'vpph' ? '#3E7BC4' : PINK; c.fillRect(70, 0, 70, 1024); }
      const ink = s.material === 'prata' ? '#2B2421' : s.material === 'kraft' ? '#3B2414' : '#1D4F9E';
      c.fillStyle = ink; c.textAlign = 'center';
      let size = 120; c.font = `800 ${size}px ${FONT}`;
      while (c.measureText(s.texto).width > 760 && size > 40) { size -= 6; c.font = `800 ${size}px ${FONT}`; }
      c.fillText(s.texto.toUpperCase(), 560, 470);
      c.font = `500 52px ${FONT}`; c.fillStyle = ink; c.globalAlpha = 0.7;
      c.fillText('Lote ______   Validade ______', 560, 600); c.globalAlpha = 1;
      c.fillStyle = '#E8811A'; c.font = `italic 800 44px ${FONT}`; c.fillText('grafMED', 860, 940);
    };
    const msg = (s) => `Olá! Quero desenvolver uma etiqueta sob medida.\nForma: ${s.forma}\nMedida: ${s.w} x ${s.h} mm\nMaterial: ${f('material').selectedOptions[0].text}\nIndicador químico: ${f('indicador').selectedOptions[0].text}\nTexto: ${s.texto}`;
    const sync = () => {
      const s = state();
      out.textContent = `${s.w} × ${s.h} mm`;
      $$('output[data-for]', root).forEach((o) => { o.textContent = `${f(o.dataset.for).value} mm`; });
      if (wa) { wa.dataset.wa = msg(s); wa.href = `https://wa.me/${(window.GM_CONFIG || {}).whatsapp}?text=${encodeURIComponent(msg(s))}`; }
      const ta = document.querySelector('form[data-form="projeto"] textarea');
      if (ta && (!ta.value || ta.dataset.auto)) { ta.value = msg(s).replace('Olá! ', ''); ta.dataset.auto = '1'; }
      return s;
    };
    if (!hasGL || !T) { stage.appendChild(art); art.className = 'cfg-flat'; root.addEventListener('input', () => paint(sync())); paint(sync()); return; }
    const renderer = makeRenderer(stage);
    const scene = new T.Scene();
    const cam = new T.PerspectiveCamera(30, stage.clientWidth / stage.clientHeight, 0.1, 100);
    cam.position.set(0, 0.6, 9); cam.lookAt(0, 0, 0);
    scene.add(new T.HemisphereLight(0xffffff, 0xf2c39a, 0.9));
    const dl = new T.DirectionalLight(0xffffff, 0.8); dl.position.set(-3, 5, 6); scene.add(dl);
    const tex = new T.CanvasTexture(art); tex.encoding = T.sRGBEncoding; tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    let mesh;
    const shadow = softShadow(6, 1.6, 0.28); shadow.position.y = -2.4; scene.add(shadow);
    const build = () => {
      const s = sync();
      paint(s); tex.needsUpdate = true;
      const sc = 3.4 / Math.max(s.w, s.h); const W = s.w * sc, H = s.h * sc;
      const sh = new T.Shape();
      if (s.forma === 'redonda') sh.absarc(0, 0, Math.min(W, H) / 2, 0, Math.PI * 2, false);
      else if (s.forma === 'oval') sh.absellipse(0, 0, W / 2, H / 2, 0, Math.PI * 2, false, 0);
      else { const r = Math.min(W, H) * 0.08, x = -W / 2, y = -H / 2; sh.moveTo(x + r, y); sh.lineTo(x + W - r, y); sh.quadraticCurveTo(x + W, y, x + W, y + r); sh.lineTo(x + W, y + H - r); sh.quadraticCurveTo(x + W, y + H, x + W - r, y + H); sh.lineTo(x + r, y + H); sh.quadraticCurveTo(x, y + H, x, y + H - r); sh.lineTo(x, y + r); sh.quadraticCurveTo(x, y, x + r, y); }
      const g = new T.ExtrudeGeometry(sh, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 2, curveSegments: 48 });
      // UV planar para a arte
      g.computeBoundingBox(); const bb = g.boundingBox; const uv = g.attributes.uv; const pp = g.attributes.position;
      for (let i = 0; i < uv.count; i++) uv.setXY(i, (pp.getX(i) - bb.min.x) / (bb.max.x - bb.min.x), (pp.getY(i) - bb.min.y) / (bb.max.y - bb.min.y));
      const m = s.material === 'prata' ? { metalness: 0.75, roughness: 0.3 } : s.material === 'bopp' ? { metalness: 0, roughness: 0.15, transparent: true, opacity: 0.85 } : { metalness: 0, roughness: 0.7 };
      const faceMat = new T.MeshStandardMaterial({ map: tex, ...m });
      const sideMat = new T.MeshStandardMaterial({ color: 0xf3ede4, roughness: 0.8 });
      if (mesh) { scene.remove(mesh); mesh.geometry.dispose(); }
      mesh = new T.Mesh(g, [faceMat, sideMat]);
      scene.add(mesh);
    };
    let idleUntil = 0;
    const hold = () => { idleUntil = performance.now() + 5000; };
    ['input', 'change', 'pointerdown', 'focusin'].forEach((ev) => root.addEventListener(ev, hold));
    root.addEventListener('input', build);
    root.addEventListener('change', build);
    let rx = 0.15, ry = -0.5, trx = 0.15, try_ = -0.5, drag = null;
    const cvs = renderer.domElement; cvs.style.touchAction = 'pan-y';
    cvs.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, rx: trx, ry: try_ }; cvs.setPointerCapture(e.pointerId); });
    cvs.addEventListener('pointermove', (e) => { if (!drag) return; try_ = drag.ry + (e.clientX - drag.x) / 200; trx = clamp(drag.rx + (e.clientY - drag.y) / 300, -0.8, 0.8); });
    cvs.addEventListener('pointerup', () => { drag = null; });
    addEventListener('resize', () => { renderer.setSize(stage.clientWidth, stage.clientHeight); cam.aspect = stage.clientWidth / stage.clientHeight; cam.updateProjectionMatrix(); });
    let running = false;
    const frame = (t) => {
      if (!running) return;
      if (!drag && !reduce && t > idleUntil) try_ += 0.0012;
      rx += (trx - rx) * 0.1; ry += (try_ - ry) * 0.1;
      if (mesh) { mesh.rotation.set(rx, ry, 0); mesh.position.y = reduce ? 0 : Math.sin(t / 1300) * 0.08; }
      renderer.render(scene, cam);
      requestAnimationFrame(frame);
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(build); else build();
    onVisible(root, (v) => { if (v && !running) { running = true; requestAnimationFrame(frame); } else if (!v) running = false; });
  }

  $$('[data-ind3d]').forEach(indicator);
  $$('[data-conv3d]').forEach(conversion);
  $$('[data-cfg3d]').forEach(configurator);
})();
