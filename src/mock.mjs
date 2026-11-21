// Mockups ilustrativos em SVG (vetor, sem IA). Servem de placeholder até as fotos reais do catálogo.
// Regra de imagem: o produto grafMED é sempre o elemento dominante.

const IND = { vapor: '#C9B98F', pph: '#E7A7B7', blank: '#FFFFFF' };

let uid = 0;
const id = (p) => `${p}${++uid}`;

export function roll({ variant = 'vapor', color = '#FFFFFF', brand = 'grafMED', printed = true } = {}) {
  const g = id('g');
  const ind = IND[variant] || IND.vapor;
  const labels = [0, 1, 2]
    .map((i) => {
      const x = 200 + i * 66;
      return `<g transform="translate(${x},214)">
        <rect width="58" height="66" rx="5" fill="${color}" stroke="#E2DCD2" class="lab"/>
        ${variant === 'blank' ? '' : `<rect x="6" y="8" width="46" height="9" rx="2" fill="${ind}" class="ind"/>`}
        ${printed && variant !== 'blank' ? `<rect x="6" y="24" width="30" height="3" rx="1.5" fill="#BFB6A8"/><rect x="6" y="32" width="40" height="3" rx="1.5" fill="#D6CFC3"/><rect x="6" y="40" width="22" height="3" rx="1.5" fill="#D6CFC3"/>
        <text x="6" y="58" font-size="7" font-style="italic" font-weight="700" fill="#BF5E26" font-family="Trebuchet MS, sans-serif">${brand}</text>` : ''}
        <line x1="0" y1="50" x2="58" y2="50" stroke="#CFC7BA" stroke-dasharray="2 2" opacity="${variant === 'blank' ? 0 : 1}"/>
      </g>`;
    })
    .join('');
  return `<svg viewBox="0 0 420 320" class="mock mock-roll" role="img" aria-label="Ilustração de bobina de etiquetas">
  <defs>
    <radialGradient id="${g}" cx="45%" cy="40%" r="60%"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#EEE9E1"/></radialGradient>
  </defs>
  <ellipse cx="210" cy="296" rx="170" ry="12" fill="#1E212E" opacity=".06"/>
  <circle cx="148" cy="150" r="112" fill="#E7E1D7"/>
  <path d="M148 262 C 170 262 186 250 200 214 L 200 280 L 148 280 Z" fill="#EAE4DA"/>
  <rect x="160" y="214" width="250" height="66" rx="4" fill="#FBF9F6" stroke="#E2DCD2"/>
  ${labels}
  <circle cx="138" cy="150" r="112" fill="url(#${g})" stroke="#E2DCD2"/>
  ${[96, 82, 68, 54].map((r) => `<circle cx="138" cy="150" r="${r}" fill="none" stroke="#ECE6DC"/>`).join('')}
  <circle cx="138" cy="150" r="40" fill="#F4E3C6" stroke="#E6CFA5"/>
  <circle cx="138" cy="150" r="30" fill="#FBFAF8" stroke="#E6CFA5"/>
</svg>`;
}

export function tape({ variant = 'vapor', brand = 'grafMED' } = {}) {
  const p = id('p');
  return `<svg viewBox="0 0 420 320" class="mock mock-tape" role="img" aria-label="Ilustração de fita indicadora">
  <defs><pattern id="${p}" width="18" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="18" height="40" fill="#F7F1E4"/><rect width="5" height="40" fill="${IND[variant]}" class="ind"/></pattern></defs>
  <ellipse cx="210" cy="296" rx="170" ry="12" fill="#1E212E" opacity=".06"/>
  <path d="M150 248 L 400 248 L 400 288 L 150 288 Z" fill="url(#${p})" stroke="#E6DCC8"/>
  <text x="300" y="273" font-size="11" font-style="italic" font-weight="700" fill="#BF5E26" opacity=".8" font-family="Trebuchet MS, sans-serif">${brand}</text>
  <circle cx="150" cy="160" r="112" fill="#EFE6D3"/>
  <circle cx="150" cy="160" r="112" fill="none" stroke="#E2D5BB" stroke-width="2"/>
  ${[100, 88, 76].map((r) => `<circle cx="150" cy="160" r="${r}" fill="none" stroke="#E6DAC2"/>`).join('')}
  <circle cx="150" cy="160" r="64" fill="#F4E3C6" stroke="#E6CFA5"/>
  <circle cx="150" cy="160" r="54" fill="#FBFAF8" stroke="#E6CFA5"/>
</svg>`;
}

export function dental() {
  return roll({ variant: 'vapor', color: '#FFFFFF', brand: 'grafDENTAL' });
}

export function label({ variant } = {}) {
  if (variant === 'colors') {
    const cols = ['#F2BF27', '#7BC4A4', '#7AA7E0', '#E58FA8', '#BFA6E0'];
    const days = ['SEG', 'TER', 'QUA', 'QUI', 'SEX'];
    return `<svg viewBox="0 0 420 320" class="mock mock-label" role="img" aria-label="Ilustração de etiquetas coloridas de validade">
    <ellipse cx="210" cy="296" rx="170" ry="12" fill="#1E212E" opacity=".06"/>
    ${cols
      .map(
        (c, i) => `<g transform="translate(${46 + i * 66},${70 + (i % 2) * 26}) rotate(${-6 + i * 3})">
      <rect width="60" height="150" rx="8" fill="#fff" stroke="#E2DCD2"/>
      <rect width="60" height="34" rx="8" fill="${c}"/><rect y="26" width="60" height="8" fill="${c}"/>
      <text x="30" y="23" text-anchor="middle" font-size="12" font-weight="600" fill="#fff" font-family="sans-serif">${days[i]}</text>
      <rect x="8" y="48" width="44" height="3" rx="1.5" fill="#CFC7BA"/><rect x="8" y="62" width="34" height="3" rx="1.5" fill="#DDD6CA"/>
      <rect x="8" y="76" width="44" height="3" rx="1.5" fill="#CFC7BA"/><rect x="8" y="90" width="28" height="3" rx="1.5" fill="#DDD6CA"/>
    </g>`
      )
      .join('')}
  </svg>`;
  }
  return `<svg viewBox="0 0 420 320" class="mock mock-label" role="img" aria-label="Ilustração de frasco com rótulo personalizado">
  <ellipse cx="210" cy="296" rx="150" ry="12" fill="#1E212E" opacity=".06"/>
  <rect x="176" y="22" width="68" height="34" rx="6" fill="#2A2E3D"/>
  <path d="M164 60 h92 q14 0 18 14 l10 30 q6 18 6 34 v128 q0 20 -20 20 h-120 q-20 0 -20 -20 v-128 q0 -16 6 -34 l10 -30 q4 -14 18 -14z" fill="#FBFAF8" stroke="#E2DCD2"/>
  <g class="lbl">
    <rect x="132" y="128" width="156" height="120" rx="6" fill="#fff" stroke="#E2DCD2" class="lbl-bg"/>
    <circle cx="210" cy="160" r="16" fill="none" stroke="#F29727" stroke-width="1.5" class="lbl-accent"/>
    <text x="210" y="198" text-anchor="middle" font-size="15" font-weight="300" letter-spacing="2" fill="#1E212E" font-family="sans-serif" class="lbl-text">SUA MARCA</text>
    <text x="210" y="216" text-anchor="middle" font-size="8" letter-spacing="1.5" fill="#8A8678" font-family="sans-serif">PRODUTO · 250 ml</text>
    <rect x="178" y="228" width="64" height="8" fill="none" stroke="#CFC7BA" stroke-dasharray="1 2"/>
  </g>
</svg>`;
}

export function band({ color = '#FFFFFF', text = 'NOME DO PACIENTE', variant = 'hosp' } = {}) {
  const pid = id('bp');
  const tc = color.toUpperCase() === '#1E212E' ? '#FFFFFF' : '#1E212E';
  return `<svg viewBox="0 0 420 320" class="mock mock-band" role="img" aria-label="Ilustração de pulseira de identificação">
  <defs><path id="${pid}" d="M 86 182 Q 210 262 334 182"/></defs>
  <ellipse cx="210" cy="296" rx="160" ry="12" fill="#1E212E" opacity=".06"/>
  <path d="M 70 170 Q 70 70 210 70 Q 350 70 350 170" fill="none" stroke="#000" stroke-opacity=".06" stroke-width="44"/>
  <path d="M 70 168 Q 70 64 210 64 Q 350 64 350 168" fill="none" stroke="${color}" stroke-width="40" class="band-back" filter="brightness(.9)"/>
  <path d="M 70 168 Q 70 64 210 64 Q 350 64 350 168" fill="none" stroke="#000" stroke-opacity=".08" stroke-width="40"/>
  <path d="M 70 166 Q 80 262 210 262 Q 340 262 350 166" fill="none" stroke="#E2DCD2" stroke-width="44"/>
  <path d="M 70 166 Q 80 262 210 262 Q 340 262 350 166" fill="none" stroke="${color}" stroke-width="40" class="band-front"/>
  <rect x="318" y="160" width="34" height="34" rx="6" fill="#FBFAF8" stroke="#D9D2C6"/>
  <circle cx="335" cy="177" r="5" fill="#D9D2C6"/>
  <text font-size="15" letter-spacing="2" font-weight="500" fill="${tc}" class="band-text" font-family="sans-serif" dy="5"><textPath href="#${pid}" startOffset="50%" text-anchor="middle">${text}</textPath></text>
</svg>`;
}

const icon = {
  roll: '<circle cx="24" cy="24" r="14"/><circle cx="24" cy="24" r="5"/><path d="M24 38h18"/>',
  cut: '<circle cx="14" cy="34" r="5"/><circle cx="14" cy="14" r="5"/><path d="M18 17l22 17M18 31l22-17"/>',
  box: '<path d="M8 16l16-8 16 8v18l-16 8-16-8z"/><path d="M8 16l16 8 16-8M24 24v18"/>',
  truck: '<path d="M4 14h24v18H4zM28 20h9l6 7v5H28z"/><circle cx="12" cy="35" r="4"/><circle cx="35" cy="35" r="4"/>',
  idea: '<path d="M24 6a12 12 0 0 0-7 22v6h14v-6a12 12 0 0 0-7-22z"/><path d="M19 40h10"/>',
  shield: '<path d="M24 4l16 6v12c0 10-7 17-16 20C15 39 8 32 8 22V10z"/><path d="M17 23l5 5 9-10"/>',
  flag: '<path d="M10 42V6M10 8h24l-5 8 5 8H10"/>',
  chat: '<path d="M6 10h36v22H20l-8 8v-8H6z"/>',
  clock: '<circle cx="24" cy="24" r="18"/><path d="M24 14v10l7 5"/>',
  space: '<path d="M6 6h36v36H6z"/><path d="M6 18h36M18 18v24"/>',
  coin: '<ellipse cx="24" cy="14" rx="14" ry="6"/><path d="M10 14v20c0 3 6 6 14 6s14-3 14-6V14M10 24c0 3 6 6 14 6s14-3 14-6"/>',
  check: '<circle cx="24" cy="24" r="18"/><path d="M16 24l6 6 11-12"/>',
  pin: '<path d="M24 44s14-14 14-24a14 14 0 0 0-28 0c0 10 14 24 14 24z"/><circle cx="24" cy="20" r="5"/>',
  mail: '<path d="M6 10h36v28H6z"/><path d="M6 10l18 15 18-15"/>',
  phone: '<path d="M14 6l6 10-4 4c2 5 6 9 12 12l4-4 10 6-4 8C22 42 6 26 6 10z"/>',
  people: '<circle cx="17" cy="16" r="6"/><circle cx="33" cy="18" r="5"/><path d="M5 40c0-8 5-13 12-13s12 5 12 13M29 40c0-6 3-10 8-10s7 4 7 10"/>',
  factory: '<path d="M4 42V22l10 6v-6l10 6v-6l10 6V8h8v34z"/>',
  star: '<path d="M24 5l6 12 13 2-9 9 2 13-12-6-12 6 2-13-9-9 13-2z"/>',
};

export function ico(name, size = 28) {
  return `<svg viewBox="0 0 48 48" width="${size}" height="${size}" class="ico" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icon[name] || ''}</svg>`;
}

export function flowMock() {
  return `<div class="mock mock-flow" aria-hidden="true">
    <span>${ico('roll', 40)}</span><i></i><span>${ico('cut', 40)}</span><i></i><span>${ico('box', 40)}</span><i></i><span>${ico('truck', 40)}</span>
  </div>`;
}

export function projectMock() {
  return `<div class="mock mock-project" aria-hidden="true"><span>${ico('idea', 64)}</span></div>`;
}

export function mockFor(kind, opts = {}) {
  switch (kind) {
    case 'roll': return roll(opts);
    case 'tape': return tape(opts);
    case 'dental': return dental(opts);
    case 'label': return label(opts);
    case 'band': return band(opts);
    case 'flow': return flowMock();
    case 'project': return projectMock();
    default: return roll(opts);
  }
}

// Logo grafMED (reconstrução vetorial para o protótipo — substituir pelo arquivo oficial do manual de marca)
export function logo({ mono = false, cls = '' } = {}) {
  const a = id('la');
  const b = id('lb');
  const fill = mono ? 'currentColor' : `url(#${a})`;
  const swoosh = mono ? 'currentColor' : `url(#${b})`;
  const word = mono ? 'currentColor' : '#D9741F';
  return `<svg class="logo ${cls}" viewBox="0 0 250 64" role="img" aria-label="grafMED">
  <defs>
    <linearGradient id="${a}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F0AA23"/><stop offset=".6" stop-color="#F5C223"/><stop offset="1" stop-color="#FAD623"/></linearGradient>
    <linearGradient id="${b}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F5B75A"/><stop offset=".55" stop-color="#FAD623"/><stop offset="1" stop-color="#BB6323"/></linearGradient>
  </defs>
  <path d="M10 22 C 18 8 40 4 58 14 C 46 9 28 11 17 22 Z" fill="${swoosh}"/>
  <path d="M46 14 C 54 16 60 20 64 24 C 58 23 52 23 48 26 Z" fill="${mono ? 'currentColor' : '#BB6323'}"/>
  <circle cx="30" cy="38" r="21" fill="${fill}"/>
  <circle cx="26" cy="40" r="5.5" fill="var(--logo-hole, #fff)"/>
  <text x="68" y="47" font-family="'Trebuchet MS', 'Segoe UI', sans-serif" font-style="italic" font-weight="700" font-size="34" letter-spacing="-.5" fill="${word}">grafMED</text>
  <text x="231" y="26" font-family="sans-serif" font-size="8" fill="${word}">®</text>
</svg>`;
}

export function seal({ size = 120, label = 'ORIGINAL' } = {}) {
  const p = id('sp');
  return `<svg viewBox="0 0 120 120" width="${size}" height="${size}" class="seal" role="img" aria-label="Selo Original grafMED">
  <defs><path id="${p}" d="M60 60 m-44 0 a44 44 0 1 1 88 0 a44 44 0 1 1 -88 0"/></defs>
  <circle cx="60" cy="60" r="57" fill="#fff" stroke="#F29727" stroke-width="1.2"/>
  <circle cx="60" cy="60" r="36" fill="none" stroke="#F29727" stroke-width=".8" stroke-dasharray="2 3"/>
  <text font-size="9.5" letter-spacing="3.2" fill="#BF5E26" font-family="sans-serif"><textPath href="#${p}">${label} · grafMED · ${label} · grafMED ·</textPath></text>
  <circle cx="60" cy="56" r="13" fill="#F2AB27"/><circle cx="57" cy="57" r="3.4" fill="#fff"/>
  <path d="M46 50 C 50 42 62 40 72 45 C 64 43 54 44 49 50Z" fill="#F2BF27"/>
  <text x="60" y="84" text-anchor="middle" font-size="8" font-weight="600" letter-spacing="1.5" fill="#1E212E" font-family="sans-serif">${label}</text>
</svg>`;
}
