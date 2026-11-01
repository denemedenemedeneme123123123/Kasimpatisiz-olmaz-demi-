(function () {
  const Ask = (window.Ask = window.Ask || {});

  // Dokunma: en yakın çiçek sallanıp parlar, dokunulan yerden kalpler saçılır.
  // Not: çiçek başının `scale` özelliğini idle nefesi kullanıyor; bu yüzden darbe rotation + halo ile yapılır.
  Ask.enableTap = function (parts, hearts) {
    const svg = document.getElementById('bouquet');
    const stage = document.getElementById('stage');

    stage.addEventListener('pointerdown', function (e) {
      hearts.burst(e.clientX, e.clientY);

      const ctm = svg.getScreenCTM();
      if (!ctm) return;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const p = pt.matrixTransform(ctm.inverse());

      let best = null, bd = 60;
      parts.flowers.forEach(function (f) {
        const d = Math.hypot(f.cx - p.x, f.cy - p.y);
        if (d < bd) { bd = d; best = f; }
      });
      if (!best) return;

      const halo = best.el.querySelector('.halo');
      gsap.fromTo(best.el, { rotation: -9 }, { rotation: 0, duration: 1.1, ease: 'elastic.out(1.2, 0.35)', overwrite: 'auto' });
      if (halo) {
        gsap.fromTo(halo, { scale: 1.9, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.9, ease: 'power2.out', overwrite: 'auto' });
      }
    });
  };

  // Eğim: telefonu eğince katmanlar kayar. İzin yok/sensör yoksa fare veya parmakla sürükleme.
  Ask.enableTilt = function (layers) {
    if (Ask.reducedMotion) return;
    const setters = layers.map(function (l) {
      return {
        x: gsap.quickTo(l.el, 'x', { duration: 0.7, ease: 'power2.out' }),
        y: gsap.quickTo(l.el, 'y', { duration: 0.7, ease: 'power2.out' }),
        depth: l.depth
      };
    });
    function apply(nx, ny) {
      setters.forEach(function (s) { s.x(nx * s.depth); s.y(ny * s.depth * 0.6); });
    }
    const clamp = function (v) { return Math.max(-1, Math.min(1, v)); };

    function listenSensor() {
      window.addEventListener('deviceorientation', function (e) {
        if (e.gamma == null || e.beta == null) return;
        apply(clamp(e.gamma / 30), clamp((e.beta - 45) / 30));
      });
    }

    let pressed = false;
    window.addEventListener('pointerdown', function () { pressed = true; });
    window.addEventListener('pointerup', function () { pressed = false; apply(0, 0); });
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse' && !pressed) return;
      apply(clamp((e.clientX / window.innerWidth - 0.5) * 2), clamp((e.clientY / window.innerHeight - 0.5) * 2));
    });

    const DOE = window.DeviceOrientationEvent;
    if (DOE && typeof DOE.requestPermission === 'function') {
      try {
        DOE.requestPermission().then(function (r) { if (r === 'granted') listenSensor(); }).catch(function () {});
      } catch (err) { /* izin yok: sürükleme yedeği zaten açık */ }
    } else if (DOE) {
      listenSensor();
    }
  };

  // Yazı makinesi: lines birleştirilip harf harf yazılır. Azaltılmış harekette metin anında görünür.
  Ask.typeLetter = function (el, lines, opts) {
    const text = lines.join('\n');
    const cps = (opts && opts.cps) || 28;
    let i = 0, timer = 0;
    el.textContent = '';
    if (Ask.reducedMotion) {
      el.textContent = text;
      return { skip: function () {} };
    }
    function step() {
      if (i >= text.length) return;
      i++;
      el.textContent = text.slice(0, i);
      timer = setTimeout(step, 1000 / cps + (text[i - 1] === '\n' ? 250 : 0));
    }
    step();
    return {
      skip: function () { clearTimeout(timer); i = text.length; el.textContent = text; }
    };
  };

  // Mektup düğmesi ve paneli. Metin her zaman window.ASK_CONTENT.letter'dan okunur.
  Ask.initLetter = function () {
    const panel = document.getElementById('letter');
    const textEl = document.getElementById('letter-text');
    let typer = null;

    function close() {
      if (typer) typer.skip();
      panel.hidden = true;
    }
    function open() {
      panel.hidden = false;
      typer = Ask.typeLetter(textEl, (window.ASK_CONTENT && window.ASK_CONTENT.letter) || []);
    }
    document.getElementById('letter-close').addEventListener('click', close);
    panel.addEventListener('pointerdown', function (e) { if (e.target === panel) close(); });
    panel.querySelector('.paper').addEventListener('click', function () { if (typer) typer.skip(); });
    return open;
  };

  // Not kağıdına dokunma/Enter mektubu açar; bastırılan olay kalp patlatmaz.
  Ask.bindNote = function (parts, open) {
    const n = parts.note;
    n.addEventListener('pointerdown', function (e) { e.stopPropagation(); open(); });
    n.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
  };
})();
