(function () {
  const Ask = (window.Ask = window.Ask || {});
  const NS = 'http://www.w3.org/2000/svg';

  function el(name, attrs, parent) {
    const n = document.createElementNS(NS, name);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  // Sabit tohumlu rastgele: her açılışta aynı dizilim.
  let seed = 7;
  function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }

  // Tabanı (0,0), ucu yukarı bakan simetrik yaprak/taç yaprağı yolu.
  function petalPath(L, W, round) {
    const t = round ? 1.0 : 0.85;
    return 'M0 0C' + -W + ' ' + -L * 0.15 + ' ' + -W * 1.05 + ' ' + -L * t + ' 0 ' + -L +
           'C' + W * 1.05 + ' ' + -L * t + ' ' + W + ' ' + -L * 0.15 + ' 0 0Z';
  }

  // n adet taç yaprağını merkez etrafında halka olarak ekler, yaprak elemanlarını döndürür.
  function ring(parent, n, L, W, fill, offset, stroke, round) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const a = offset + (360 / n) * i + (rnd() - 0.5) * 6;
      const w = el('g', { transform: 'rotate(' + a.toFixed(1) + ')' }, parent);
      const p = el('path', { d: petalPath(L, W, round), fill: fill, stroke: stroke || 'none', 'stroke-width': 0.8, class: 'petal' }, w);
      out.push(p);
    }
    return out;
  }

  function halo(parent, r, fill) {
    return el('circle', { r: r, fill: fill || 'url(#halo)', class: 'halo' }, parent);
  }

  // 5 tonlu paletler: en açık -> en koyu. Her halka için ayrı radyal gradyan üretilir.
  const ROSE = {
    main: ['#ff8ab8', '#ff5c9a', '#e82a76', '#b4125a', '#730a3a'],
    soft: ['#ffe0ec', '#ffbfd8', '#ff98bf', '#e8689c', '#b03d74'],
    lilac: ['#f1d9ff', '#d9a8ff', '#bb7aef', '#8f4cc7', '#5a2a8f']
  };

  // Geniş, üstü hafif çukur gül yaprağı (taban 0,0; simetrik).
  function rosePath(L, W) {
    return 'M0 0C' + -W * 0.55 + ' ' + -L * 0.1 + ' ' + -W * 1.05 + ' ' + -L * 0.45 + ' ' + -W * 0.9 + ' ' + -L * 0.8 +
           'C' + -W * 0.8 + ' ' + -L * 1.02 + ' ' + -W * 0.3 + ' ' + -L * 1.05 + ' 0 ' + -L * 0.93 +
           'C' + W * 0.3 + ' ' + -L * 1.05 + ' ' + W * 0.8 + ' ' + -L * 1.02 + ' ' + W * 0.9 + ' ' + -L * 0.8 +
           'C' + W * 1.05 + ' ' + -L * 0.45 + ' ' + W * 0.55 + ' ' + -L * 0.1 + ' 0 0Z';
  }
  function roseRim(L, W) {
    return 'M' + -W * 0.9 + ' ' + -L * 0.8 + 'C' + -W * 0.8 + ' ' + -L * 1.02 + ' ' + -W * 0.3 + ' ' + -L * 1.05 + ' 0 ' + -L * 0.93 +
           'C' + W * 0.3 + ' ' + -L * 1.05 + ' ' + W * 0.8 + ' ' + -L * 1.02 + ' ' + W * 0.9 + ' ' + -L * 0.8;
  }

  function rosePetal(parent, L, W, fill, angle) {
    const w = el('g', { transform: 'rotate(' + angle.toFixed(1) + ')' }, parent);
    const p = el('g', { class: 'petal' }, w);
    el('path', { d: rosePath(L, W), fill: fill, stroke: 'rgba(70,0,35,.4)', 'stroke-width': 0.7 }, p);
    el('path', { d: 'M0 ' + -L * 0.2 + 'C' + -W * 0.12 + ' ' + -L * 0.5 + ' ' + -W * 0.1 + ' ' + -L * 0.75 + ' 0 ' + -L * 0.88, fill: 'none', stroke: 'rgba(60,0,30,.28)', 'stroke-width': 0.8 }, p);
    el('path', { d: roseRim(L, W), fill: 'none', stroke: 'rgba(255,255,255,.42)', 'stroke-width': 1.1, 'stroke-linecap': 'round' }, p);
    return p;
  }

  function sparkle(parent, x, y, k) {
    const w = el('g', { transform: 'translate(' + x + ' ' + y + ') scale(' + k + ')' }, parent);
    el('path', { d: 'M0 -6L1.4 -1.4L6 0L1.4 1.4L0 6L-1.4 1.4L-6 0L-1.4 -1.4Z', fill: '#fff', class: 'glint', opacity: 0 }, w);
  }

  function drawRose(g, R, key) {
    halo(g, R * 1.8);
    el('circle', { r: R * 1.02, fill: 'rgba(40,0,25,.38)' }, g); // derinlik gölgesi
    const petals = [];
    // [adet, uzunluk, genişlik, başlangıç açısı]
    [[8, 1.0, 0.52, 0], [7, 0.8, 0.46, 22], [6, 0.6, 0.4, 11], [5, 0.42, 0.32, 30], [3, 0.24, 0.2, 50]].forEach(function (c, r) {
      for (let i = 0; i < c[0]; i++) {
        const a = c[3] + (360 / c[0]) * i + (rnd() - 0.5) * 8;
        petals.push(rosePetal(g, R * c[1], R * c[2], 'url(#rg-' + key + '-' + r + ')', a));
      }
    });
    // merkezdeki sarmal
    el('path', {
      d: 'M0 0c' + R * 0.06 + ' ' + -R * 0.08 + ' ' + R * 0.14 + ' ' + -R * 0.02 + ' ' + R * 0.1 + ' ' + R * 0.08 +
         's' + -R * 0.2 + ' ' + R * 0.1 + ' ' + -R * 0.24 + ' ' + -R * 0.06,
      fill: 'none', stroke: 'rgba(255,220,235,.6)', 'stroke-width': 1.2, 'stroke-linecap': 'round'
    }, g);
    // çiy damlası ve parıltılar
    el('circle', { cx: R * 0.22, cy: -R * 0.55, r: R * 0.075, fill: 'rgba(255,255,255,.28)', stroke: 'rgba(255,255,255,.75)', 'stroke-width': 0.8 }, g);
    el('circle', { cx: R * 0.2, cy: -R * 0.58, r: R * 0.025, fill: '#fff' }, g);
    sparkle(g, -R * 0.38, -R * 0.52, R / 40);
    sparkle(g, R * 0.5, -R * 0.2, R / 50);
    sparkle(g, R * 0.05, -R * 0.82, R / 55);
    return petals;
  }

  function drawTulip(g, S, pal) {
    halo(g, S * 1.5);
    g.setAttribute('data-shift', 1);
    const base = el('g', { transform: 'translate(0 ' + S * 0.55 + ')' }, g);
    const petals = [];
    [[-16, pal[0]], [16, pal[0]], [0, pal[1]]].forEach(function (d, i) {
      const w = el('g', { transform: 'rotate(' + d[0] + ')' }, base);
      petals.push(el('path', {
        d: 'M0 0C' + -S * 0.45 + ' ' + -S * 0.2 + ' ' + -S * 0.5 + ' ' + -S * 0.85 + ' 0 ' + -S * 1.15 +
           'C' + S * 0.5 + ' ' + -S * 0.85 + ' ' + S * 0.45 + ' ' + -S * 0.2 + ' 0 0Z',
        fill: i < 2 ? d[1] : pal[2], stroke: 'rgba(90,0,60,.35)', 'stroke-width': 0.8, class: 'petal'
      }, w));
    });
    return petals;
  }

  function drawDaisy(g, R) {
    halo(g, R * 1.6, 'url(#haloWhite)');
    const petals = ring(g, 14, R, R * 0.2, '#fff6fb', 0, 'rgba(255,170,210,.6)', false);
    el('circle', { r: R * 0.3, fill: '#ffd24d', stroke: '#ff9f2e', 'stroke-width': 1 }, g);
    return petals;
  }

  function drawLavender(g) {
    halo(g, 40, 'url(#haloViolet)');
    const petals = [];
    for (let i = 0; i < 11; i++) {
      const y = -i * 6.4;
      const s = 1 - i * 0.045;
      [-1, 1].forEach(function (side) {
        petals.push(el('ellipse', {
          cx: side * 4.5 * s, cy: y - (side > 0 ? 3 : 0), rx: 3.6 * s, ry: 6 * s,
          transform: 'rotate(' + side * 22 + ' ' + side * 4.5 * s + ' ' + y + ')',
          fill: i % 2 ? '#b79bff' : '#9f7cf5', class: 'petal'
        }, g));
      });
    }
    petals.push(el('ellipse', { cx: 0, cy: -72, rx: 3, ry: 6, fill: '#c8b0ff', class: 'petal' }, g));
    return petals;
  }

  function drawBaby(g) {
    halo(g, 30, 'url(#haloWhite)');
    const petals = [];
    for (let i = 0; i < 16; i++) {
      const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * 24;
      const x = Math.cos(a) * d, y = Math.sin(a) * d * 0.85;
      el('line', { x1: 0, y1: 0, x2: x, y2: y, stroke: 'rgba(120,200,150,.55)', 'stroke-width': 0.8 }, g);
      petals.push(el('circle', { cx: x, cy: y, r: 2 + rnd() * 2.2, fill: '#fff', class: 'petal' }, g));
    }
    return petals;
  }

  function leaf(parent, x, y, angle, L, W) {
    const outer = el('g', { transform: 'translate(' + x + ' ' + y + ') rotate(' + angle + ')' }, parent);
    const inner = el('g', { class: 'leaf' }, outer);
    el('path', { d: petalPath(L, W, false), fill: '#2f9d6b', stroke: 'rgba(10,70,40,.5)', 'stroke-width': 0.8 }, inner);
    el('path', { d: 'M0 0L0 ' + -L * 0.9, stroke: 'rgba(190,255,215,.55)', 'stroke-width': 1, fill: 'none' }, inner);
    return inner;
  }

  const FLOWERS = [
    { kind: 'baby', x: 92, y: 150 }, { kind: 'baby', x: 310, y: 140 }, { kind: 'baby', x: 200, y: 72 },
    { kind: 'baby', x: 150, y: 96 }, { kind: 'baby', x: 252, y: 92 },
    { kind: 'lavender', x: 52, y: 262 }, { kind: 'lavender', x: 350, y: 258 },
    { kind: 'lavender', x: 100, y: 232 }, { kind: 'lavender', x: 300, y: 228 },
    { kind: 'tulip', x: 142, y: 160, S: 46, pal: ['#ffd1e6', '#ff9fc9', '#e8579b'] },
    { kind: 'tulip', x: 262, y: 142, S: 48, pal: ['#ffe9a8', '#ffc46b', '#ff9a4a'] },
    { kind: 'daisy', x: 76, y: 344, R: 27 }, { kind: 'daisy', x: 326, y: 338, R: 27 }, { kind: 'daisy', x: 200, y: 352, R: 23 },
    // sap bölgesini dolduranlar
    { kind: 'baby', x: 96, y: 414 }, { kind: 'baby', x: 306, y: 410 },
    { kind: 'rose', x: 146, y: 384, R: 38, pal: 'main' },
    { kind: 'rose', x: 256, y: 390, R: 40, pal: 'soft' },
    { kind: 'rose', x: 118, y: 330, R: 30, pal: 'lilac' },
    { kind: 'rose', x: 286, y: 334, R: 32, pal: 'main' },
    { kind: 'rose', x: 200, y: 128, R: 30, pal: 'soft' },
    { kind: 'rose', x: 125, y: 256, R: 40, pal: 'soft' },
    { kind: 'rose', x: 282, y: 264, R: 42, pal: 'lilac' },
    { kind: 'rose', x: 200, y: 214, R: 68, pal: 'main' }
  ];

  const HUB = { x: 200, y: 505 };
  const HEART_D = 'M16 28S3 20.5 3 11.5C3 7 6.3 4 10 4c2.4 0 4.6 1.3 6 3.6C17.4 5.3 19.6 4 22 4c3.7 0 7 3 7 7.5C29 20.5 16 28 16 28z';

  Ask.buildBouquet = function (svg) {
    svg.innerHTML = '';
    seed = 7;

    const defs = el('defs', {}, svg);
    [['halo', '#ff7ab8'], ['haloWhite', '#ffffff'], ['haloViolet', '#a47cff']].forEach(function (h) {
      const g = el('radialGradient', { id: h[0] }, defs);
      el('stop', { offset: '0%', 'stop-color': h[1], 'stop-opacity': 0.5 }, g);
      el('stop', { offset: '100%', 'stop-color': h[1], 'stop-opacity': 0 }, g);
    });
    Object.keys(ROSE).forEach(function (key) {
      for (let r = 0; r < 5; r++) {
        const pal = ROSE[key];
        const gr = el('radialGradient', { id: 'rg-' + key + '-' + r, cx: 0.5, cy: 1, r: 1, fx: 0.5, fy: 1 }, defs);
        el('stop', { offset: '0%', 'stop-color': pal[Math.min(r + 2, 4)] }, gr);
        el('stop', { offset: '55%', 'stop-color': pal[Math.min(r + 1, 4)] }, gr);
        el('stop', { offset: '100%', 'stop-color': pal[Math.min(r, 4)] }, gr);
      }
    });
    [['paperA', '#fff3f8', '#f6b5d3'], ['paperB', '#ecdcff', '#b394ee'], ['paperC', '#ffe3ef', '#ff9cc6']].forEach(function (p) {
      const lg = el('linearGradient', { id: p[0], x1: 0, y1: 0, x2: 0.4, y2: 1 }, defs);
      el('stop', { offset: '0%', 'stop-color': p[1] }, lg);
      el('stop', { offset: '100%', 'stop-color': p[2] }, lg);
    });
    const rg = el('linearGradient', { id: 'ribbonGrad', x1: 0, y1: 0, x2: 1, y2: 1 }, defs);
    el('stop', { offset: '0%', 'stop-color': '#ff9cc8' }, rg);
    el('stop', { offset: '100%', 'stop-color': '#e0206c' }, rg);
    const ng = el('linearGradient', { id: 'noteGrad', x1: 0, y1: 0, x2: 1, y2: 1 }, defs);
    el('stop', { offset: '0%', 'stop-color': '#fffaf0' }, ng);
    el('stop', { offset: '100%', 'stop-color': '#f1dcc8' }, ng);

    const sway = el('g', { id: 'sway' }, svg);
    const backG = el('g', { id: 'back-leaves' }, sway);
    const stemsG = el('g', { id: 'stems' }, sway);
    const leavesG = el('g', { id: 'leaves' }, sway);
    const headsG = el('g', { id: 'heads' }, sway);

    const parts = { stems: [], leaves: [], flowers: [], ribbon: null, root: sway };

    // sapları çiz
    FLOWERS.forEach(function (f) {
      const endY = f.kind === 'lavender' ? f.y : f.kind === 'tulip' ? f.y + f.S * 0.55 : f.y + (f.R || 12) * 0.35;
      const d = 'M' + HUB.x + ' ' + HUB.y +
        'C' + HUB.x + ' ' + (HUB.y - (HUB.y - endY) * 0.5) + ' ' + f.x + ' ' + (endY + (HUB.y - endY) * 0.4) + ' ' + f.x + ' ' + endY;
      const w = f.kind === 'rose' ? 3.4 : f.kind === 'baby' ? 1.6 : 2.6;
      parts.stems.push(el('path', {
        d: d, fill: 'none', stroke: '#3aa675', 'stroke-width': w, 'stroke-linecap': 'round'
      }, stemsG));
    });

    // yapraklar: dipte yelpaze, aralarda küçükler
    [[-62, 82, 24], [-44, 90, 26], [-26, 76, 22], [26, 78, 22], [44, 92, 26], [62, 84, 24],
     [-80, 64, 20], [80, 66, 20]].forEach(function (l) { parts.leaves.push(leaf(leavesG, HUB.x, HUB.y - 6, l[0], l[1], l[2])); });
    [[120, 330, -38, 54, 15], [284, 322, 40, 56, 15], [160, 400, -22, 58, 16], [242, 396, 24, 58, 16],
     [100, 300, -52, 44, 13], [304, 292, 52, 46, 13]].forEach(function (l) { parts.leaves.push(leaf(leavesG, l[0], l[1], l[2], l[3], l[4])); });

    // çiçeklerin arkası: büyük yapraklar buketi dolu gösterir
    [[110, 205, -40, 64, 18], [290, 200, 40, 64, 18], [150, 128, -24, 56, 16], [250, 122, 24, 56, 16],
     [68, 236, -62, 58, 17], [332, 232, 62, 58, 17], [200, 112, 0, 54, 15], [95, 300, -50, 60, 17], [306, 296, 50, 60, 17]]
      .forEach(function (l) { parts.leaves.push(leaf(backG, l[0], l[1], l[2], l[3], l[4])); });
    // sap bölgesinde, gülün önünde yaprak uçları
    [[168, 432, -30, 50, 14], [234, 434, 30, 50, 14], [120, 410, -48, 44, 13], [282, 408, 48, 44, 13]]
      .forEach(function (l) { parts.leaves.push(leaf(leavesG, l[0], l[1], l[2], l[3], l[4])); });

    // çiçek başları
    FLOWERS.forEach(function (f) {
      const outer = el('g', { transform: 'translate(' + f.x + ' ' + f.y + ')' }, headsG);
      const head = el('g', { class: 'head ' + f.kind }, outer);
      let petals;
      if (f.kind === 'rose') petals = drawRose(head, f.R, f.pal);
      else if (f.kind === 'tulip') petals = drawTulip(head, f.S, f.pal);
      else if (f.kind === 'daisy') petals = drawDaisy(head, f.R);
      else if (f.kind === 'lavender') petals = drawLavender(head);
      else petals = drawBaby(head);
      parts.flowers.push({ el: head, petals: petals, kind: f.kind, cx: f.x, cy: f.y });
    });

    // kağıt sargı + saten kurdele
    const rib = el('g', { id: 'ribbon' }, sway);
    const edge = { stroke: 'rgba(255,255,255,.6)', 'stroke-width': 1, 'stroke-linejoin': 'round' };
    function paper(d, fill) { el('path', Object.assign({ d: d, fill: fill }, edge), rib); }
    paper('M96 452L142 482L174 462L200 486L226 462L258 482L304 452L232 598Q200 612 168 598Z', 'url(#paperA)');
    paper('M114 466L206 512L186 604Q174 606 166 598Z', 'url(#paperB)');
    paper('M286 466L194 512L214 604Q226 606 234 598Z', 'url(#paperC)');
    // katlanma çizgileri
    ['M146 482L186 556', 'M254 482L214 556', 'M206 510L190 598', 'M194 510L210 598'].forEach(function (d) {
      el('path', { d: d, fill: 'none', stroke: 'rgba(110,40,100,.22)', 'stroke-width': 1 }, rib);
    });
    // kağıt üstünde küçük kalpler
    [[134, 500], [262, 504], [166, 552], [232, 556], [198, 580], [150, 584]].forEach(function (h, i) {
      el('path', { d: HEART_D, transform: 'translate(' + (h[0] - 5) + ' ' + (h[1] - 5) + ') scale(' + (i % 2 ? 0.3 : 0.38) + ')', fill: 'rgba(255,255,255,.7)' }, rib);
    });
    // kurdele kuyrukları
    [['M197 506C170 536 208 556 176 598', '#ff4d94'], ['M203 506C230 536 192 556 224 598', '#ff7ab8']].forEach(function (t) {
      el('path', { d: t[0], fill: 'none', stroke: t[1], 'stroke-width': 11, 'stroke-linecap': 'butt' }, rib);
      el('path', { d: t[0], fill: 'none', stroke: 'rgba(255,255,255,.3)', 'stroke-width': 2.4, transform: 'translate(-2 0)' }, rib);
    });
    // fiyonk
    el('path', { d: 'M200 498C148 446 96 472 136 508C160 526 190 510 200 502Z', fill: 'url(#ribbonGrad)', stroke: 'rgba(120,0,50,.45)', 'stroke-width': 1 }, rib);
    el('path', { d: 'M200 498C252 446 304 472 264 508C240 526 210 510 200 502Z', fill: 'url(#ribbonGrad)', stroke: 'rgba(120,0,50,.45)', 'stroke-width': 1 }, rib);
    el('path', { d: 'M192 497C158 466 124 480 146 502', fill: 'none', stroke: 'rgba(255,255,255,.45)', 'stroke-width': 2.2, 'stroke-linecap': 'round' }, rib);
    el('path', { d: 'M208 497C242 466 276 480 254 502', fill: 'none', stroke: 'rgba(255,255,255,.45)', 'stroke-width': 2.2, 'stroke-linecap': 'round' }, rib);
    el('ellipse', { cx: 200, cy: 501, rx: 12, ry: 10, fill: '#ff3f86', stroke: 'rgba(120,0,50,.5)' }, rib);
    el('ellipse', { cx: 197, cy: 497, rx: 5, ry: 3, fill: 'rgba(255,255,255,.4)' }, rib);
    parts.ribbon = rib;

    // not kağıdı: kurdeleye iple bağlı, en son belirir; dokununca mektubu açar
    const noteG = el('g', { class: 'note-body', role: 'button', tabindex: 0, 'aria-label': 'Notu aç', style: 'cursor:pointer' }, sway);
    el('circle', { cx: 246, cy: 458, r: 46, fill: 'url(#halo)', class: 'note-halo' }, noteG);
    el('path', { d: 'M228 440C214 452 190 470 203 497', fill: 'none', stroke: '#ff7ab8', 'stroke-width': 1.5, 'stroke-linecap': 'round' }, noteG);
    const card = el('g', { transform: 'translate(245.6 458.1) rotate(12)' }, noteG);
    el('rect', { x: -27, y: -17, width: 56, height: 40, rx: 4, fill: 'rgba(0,0,0,.28)' }, card);
    el('rect', { x: -28, y: -20, width: 56, height: 40, rx: 4, fill: 'url(#noteGrad)', stroke: 'rgba(255,255,255,.8)', 'stroke-width': 1 }, card);
    el('rect', { x: -24, y: -16, width: 48, height: 32, rx: 2.5, fill: 'none', stroke: 'rgba(255,122,184,.7)', 'stroke-width': 0.8, 'stroke-dasharray': '2.5 2' }, card);
    el('path', { d: HEART_D, transform: 'translate(-8 -9) scale(.5)', fill: '#ff4d94' }, card);
    el('path', { d: 'M-17 9H17M-12 13H12', stroke: 'rgba(140,80,110,.45)', 'stroke-width': 1, 'stroke-linecap': 'round' }, card);
    el('circle', { cx: -21, cy: -14, r: 2.2, fill: '#3a1a40', stroke: 'rgba(255,255,255,.7)', 'stroke-width': 0.6 }, card);
    el('path', { d: 'M28 20L16 20L28 8Z', fill: 'rgba(200,150,170,.5)' }, card);
    el('rect', { x: -34, y: -26, width: 68, height: 52, fill: 'rgba(0,0,0,0)' }, card); // dokunma alanı
    parts.note = noteG;

    return parts;
  };

  // Sapların çizilmesi → tomurcuk → açılma → kurdele. Süre ~6.8 sn; azaltılmış harekette 8x hızlı.
  Ask.playBloom = function (parts, onDone) {
    const rm = Ask.reducedMotion;

    parts.stems.forEach(function (s) {
      const L = s.getTotalLength();
      s.style.strokeDasharray = L;
      s.style.strokeDashoffset = L;
    });
    gsap.set(parts.leaves, { scale: 0, transformOrigin: '50% 100%' });
    parts.flowers.forEach(function (f) {
      gsap.set(f.el, { scale: 0.05, rotation: -50, opacity: 0, transformOrigin: '50% 50%' });
      gsap.set(f.petals, { scale: 0.35, transformOrigin: '50% 100%' });
    });
    gsap.set(parts.ribbon, { y: -40, opacity: 0, transformOrigin: '50% 50%' });
    gsap.set(parts.note, { scale: 0, opacity: 0, svgOrigin: '228 440' });

    const tl = gsap.timeline({ onComplete: onDone });
    const n = parts.flowers.length;
    tl.to(parts.stems, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.out', stagger: { amount: 1.4, from: 'center' } }, 0);
    tl.to(parts.leaves, { scale: 1, duration: 0.9, ease: 'back.out(1.6)', stagger: { amount: 1.3 } }, 0.6);
    tl.to(parts.flowers.map(function (f) { return f.el; }), {
      opacity: 1, scale: 0.28, duration: 0.8, ease: 'power2.out', stagger: { amount: 1.3 }
    }, 1.5);
    parts.flowers.forEach(function (f, i) {
      const at = 2.8 + i * (3.0 / n);
      tl.to(f.el, { scale: 1, rotation: 0, duration: 1.6, ease: 'back.out(1.4)' }, at);
      tl.to(f.petals, { scale: 1, duration: 1.2, ease: 'back.out(1.7)', stagger: 0.03 }, at);
    });
    tl.to(parts.ribbon, { y: 0, opacity: 1, duration: 0.9, ease: 'bounce.out' }, 6.2);
    tl.to(parts.note, { scale: 1, opacity: 1, svgOrigin: '228 440', duration: 0.9, ease: 'elastic.out(1, 0.5)' }, 6.9);
    if (rm) tl.timeScale(8);
    return tl;
  };

  // Sürekli canlı kalma: buket sallanır, çiçekler nefes alır, ara sıra yaprak düşer.
  Ask.startIdle = function (parts) {
    const rm = Ask.reducedMotion;
    const amp = rm ? 0.6 : 2.2;
    const tweens = [];
    gsap.set(parts.root, { rotation: -amp, svgOrigin: '200 505' });
    tweens.push(gsap.to(parts.root, { rotation: amp, svgOrigin: '200 505', duration: 3.4, ease: 'sine.inOut', yoyo: true, repeat: -1 }));

    parts.flowers.forEach(function (f, i) {
      tweens.push(gsap.to(f.el, {
        scale: rm ? 1.01 : 1.05, duration: 2 + (i % 5) * 0.35, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: i * 0.2
      }));
      const h = f.el.querySelector('.halo');
      if (h) tweens.push(gsap.fromTo(h, { opacity: 0.55 }, { opacity: 1, duration: 1.8 + (i % 4) * 0.4, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: i * 0.15 }));
    });

    parts.flowers.forEach(function (f) {
      f.el.querySelectorAll('.glint').forEach(function (gl) {
        tweens.push(gsap.fromTo(gl, { scale: 0, opacity: 0, rotation: 0, transformOrigin: '50% 50%' }, {
          scale: 1, opacity: 1, rotation: 90, duration: 1.1, ease: 'sine.inOut', yoyo: true, repeat: -1,
          repeatDelay: 1.2 + Math.random() * 2.5, delay: Math.random() * 3
        }));
      });
    });

    if (parts.note) {
      tweens.push(gsap.fromTo(parts.note, { rotation: -4 }, { rotation: 5, svgOrigin: '228 440', duration: 2.2, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
      const nh = parts.note.querySelector('.note-halo');
      if (nh) tweens.push(gsap.fromTo(nh, { opacity: 0.4 }, { opacity: 1, duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
    }

    const live = new Set();
    let paused = false;
    const svg = parts.root.parentNode;
    const droppers = parts.flowers.filter(function (f) { return f.kind === 'rose' || f.kind === 'tulip'; });

    function drop() {
      if (paused || live.size >= 6) return;
      const f = droppers[Math.floor(Math.random() * droppers.length)];
      const src = f.petals[Math.floor(Math.random() * f.petals.length)];
      const path = src.querySelector ? src.querySelector('path') : src;
      const p = el('path', { d: petalPath(14, 7, true), fill: (path && path.getAttribute('fill')) || '#ff7ab8', opacity: 0.9 }, svg);
      gsap.set(p, { x: f.cx, y: f.cy, rotation: Math.random() * 360 });
      const tw = gsap.to(p, {
        y: f.cy + 360, x: f.cx + (Math.random() - 0.5) * 120, rotation: '+=' + (180 + Math.random() * 200), opacity: 0,
        duration: 5 + Math.random() * 2, ease: 'sine.in',
        onComplete: function () { p.remove(); live.delete(tw); }
      });
      live.add(tw);
    }
    const timer = setInterval(drop, rm ? 9000 : 3800);

    return {
      pause: function () { paused = true; tweens.forEach(function (t) { t.pause(); }); live.forEach(function (t) { t.pause(); }); },
      resume: function () { paused = false; tweens.forEach(function (t) { t.resume(); }); live.forEach(function (t) { t.resume(); }); },
      stop: function () { clearInterval(timer); tweens.forEach(function (t) { t.kill(); }); live.forEach(function (t) { t.kill(); }); }
    };
  };
})();
