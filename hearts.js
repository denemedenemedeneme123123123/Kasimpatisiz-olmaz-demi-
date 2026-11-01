(function () {
  const Ask = (window.Ask = window.Ask || {});
  const NS = 'http://www.w3.org/2000/svg';
  const HEART = 'M16 28S3 20.500 3 11.500C3 7 6.300 4 10 4c2.400 0 4.600 1.300 6 3.600C17.400 5.300 19.600 4 22 4c3.700 0 7 3 7 7.500C29 20.500 16 28 16 28z';
  const PALETTE = ['#ff7ab8', '#ff4d94', '#ffb3d6', '#c785ff', '#ffffff'];

  function heartSVG(color, size) {
    const s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', '0 0 32 32');
    s.setAttribute('width', size);
    s.setAttribute('height', size);
    s.style.cssText = 'position:absolute;left:0;top:0;overflow:visible;will-change:transform';
    s.innerHTML =
      '<circle cx="16" cy="16" r="16" fill="' + color + '" opacity=".16"/>' +
      '<circle cx="16" cy="16" r="11" fill="' + color + '" opacity=".16"/>' +
      '<path d="' + HEART + '" fill="' + color + '"/>' +
      '<path d="M9 9c1-2 3-2.500 4.500-1.500" stroke="#fff" stroke-opacity=".6" stroke-width="1.600" fill="none" stroke-linecap="round"/>';
    return s;
  }

  function dataURI(color) {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="' + color +
      '" opacity=".18"/><path d="' + HEART + '" fill="' + color + '"/></svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  Ask.startHearts = function () {
    const budget = Ask.budget();
    const rm = Ask.reducedMotion;
    const items = []; // { el, tw, kind }
    let paused = false;
    let tsContainer = null;

    function count() { return items.length; }

    function remove(it) {
      it.tw && it.tw.kill();
      it.el.remove();
      const i = items.indexOf(it);
      if (i >= 0) items.splice(i, 1);
    }

    // Tavan: yer yoksa en eski geçici kalbi (yan kalpler hariç) kaldırır.
    function makeRoom() {
      while (count() >= budget.hearts) {
        const old = items.find(function (it) { return it.kind !== 'side'; });
        if (!old) return false;
        remove(old);
      }
      return true;
    }

    // (a) tsParticles: yavaş yukarı süzülen küçük kalpler
    if (window.tsParticles && !rm) {
      tsParticles.load({
        id: 'particles',
        options: {
          fullScreen: { enable: false },
          background: { color: 'transparent' },
          fpsLimit: 40,
          detectRetina: true,
          particles: {
            number: { value: budget.particles },
            shape: {
              type: 'image',
              options: { image: ['#ff7ab8', '#c785ff', '#ffb3d6', '#ffffff'].map(function (c) { return { src: dataURI(c), width: 32, height: 32 }; }) }
            },
            opacity: { value: { min: 0.25, max: 0.7 } },
            size: { value: { min: 8, max: 18 } },
            rotate: { value: { min: -25, max: 25 } },
            move: { enable: true, direction: 'top', speed: { min: 0.5, max: 1.4 }, straight: false, outModes: { default: 'out' } },
            wobble: { enable: true, distance: 14, speed: { min: 1, max: 3 } }
          },
          interactivity: { events: {} }
        }
      }).then(function (c) { tsContainer = c; }).catch(function () {});
    }

    // (b) Yan kenarlarda büyük SVG kalpler
    function sideHeart(side, i) {
      const host = document.getElementById(side === 'l' ? 'side-left' : 'side-right');
      const size = 30 + Math.random() * 30;
      const wrap = document.createElement('div');
      const xPct = side === 'l' ? 1 + Math.random() * 9 : 90 - Math.random() * 9;
      wrap.style.cssText = 'position:absolute;left:' + xPct + '%;top:0;width:' + size + 'px;height:' + size + 'px;will-change:transform';
      wrap.appendChild(heartSVG(PALETTE[(i + (side === 'l' ? 0 : 2)) % 4], size));
      host.appendChild(wrap);
      const H = window.innerHeight;
      const it = { el: wrap, kind: 'side' };
      const dur = 9 + Math.random() * 6;
      const tl = gsap.timeline({ repeat: -1, delay: Math.random() * 6 });
      tl.fromTo(wrap, { y: H + 20, opacity: 0, scale: 0.6 }, { y: -size - 20, duration: dur, ease: 'none' }, 0);
      tl.to(wrap, { opacity: 0.95, duration: dur * 0.2 }, 0);
      tl.to(wrap, { opacity: 0, duration: dur * 0.25 }, dur * 0.75);
      tl.to(wrap, { scale: 1, duration: dur * 0.4, ease: 'sine.out' }, 0);
      tl.to(wrap, { x: (side === 'l' ? 1 : -1) * 26, duration: dur / 2, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 0);
      it.tw = tl;
      items.push(it);
    }
    const perSide = rm ? 1 : Math.min(4, Math.floor(budget.hearts / 8));
    for (let i = 0; i < perSide; i++) { sideHeart('l', i); sideHeart('r', i); }

    // (c) Saf CSS minik kalpler
    function miniHeart() {
      if (paused || count() >= budget.hearts * 0.7) return;
      const d = document.createElement('div');
      d.className = 'mini-heart';
      const s = 6 + Math.random() * 7;
      d.style.setProperty('--s', s + 'px');
      d.style.setProperty('--c', PALETTE[Math.floor(Math.random() * PALETTE.length)]);
      d.style.left = Math.random() * 100 + '%';
      d.style.top = '0';
      document.body.appendChild(d);
      const it = { el: d, kind: 'mini' };
      const H = window.innerHeight;
      it.tw = gsap.fromTo(d, { y: H + 20, rotation: -45, opacity: 0 }, {
        y: -30, x: (Math.random() - 0.5) * 60, opacity: 0.85, duration: 8 + Math.random() * 6, ease: 'none',
        onUpdate: function () { /* solma: ilerlemeye göre */ const p = this.progress(); d.style.opacity = p < 0.15 ? p / 0.15 * 0.85 : p > 0.8 ? (1 - p) / 0.2 * 0.85 : 0.85; },
        onComplete: function () { remove(it); }
      });
      items.push(it);
    }
    const miniTimer = setInterval(miniHeart, rm ? 2500 : 700);

    // (d) Dokunma patlaması
    function burst(x, y) {
      const n = rm ? 4 : 10;
      for (let i = 0; i < n; i++) {
        if (!makeRoom()) return;
        const size = 14 + Math.random() * 14;
        const wrap = document.createElement('div');
        wrap.style.cssText = 'position:fixed;z-index:6;pointer-events:none;left:' + (x - size / 2) + 'px;top:' + (y - size / 2) + 'px;width:' + size + 'px;height:' + size + 'px';
        wrap.appendChild(heartSVG(PALETTE[Math.floor(Math.random() * PALETTE.length)], size));
        document.body.appendChild(wrap);
        const it = { el: wrap, kind: 'burst' };
        const a = Math.PI * 2 * (i / n) + Math.random() * 0.5, dist = 60 + Math.random() * 90;
        gsap.set(wrap, { scale: 0.3, opacity: 1 });
        it.tw = gsap.to(wrap, {
          x: Math.cos(a) * dist, y: Math.sin(a) * dist - 40, scale: 1, rotation: (Math.random() - 0.5) * 90, opacity: 0,
          duration: 1.1 + Math.random() * 0.4, ease: 'power2.out', onComplete: function () { remove(it); }
        });
        items.push(it);
      }
    }

    return {
      count: count,
      burst: burst,
      pause: function () {
        paused = true;
        items.forEach(function (it) { it.tw.pause(); });
        if (tsContainer) tsContainer.pause();
      },
      resume: function () {
        paused = false;
        items.forEach(function (it) { it.tw.resume(); });
        if (tsContainer) tsContainer.play();
      },
      stop: function () { clearInterval(miniTimer); items.slice().forEach(remove); }
    };
  };
})();
