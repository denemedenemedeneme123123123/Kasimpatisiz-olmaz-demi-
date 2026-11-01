(function () {
  const Ask = (window.Ask = window.Ask || {});

  Ask.reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Düşük donanımda ve azaltılmış harekette kalp/parçacık sayısı düşer.
  Ask.budget = function () {
    if (Ask.reducedMotion) return { hearts: 8, particles: 6 };
    const low = (navigator.hardwareConcurrency || 4) <= 4;
    return low ? { hearts: 20, particles: 14 } : { hearts: 40, particles: 24 };
  };

  Ask.onStart = function (cb) {
    const intro = document.getElementById('intro');
    let done = false;
    function go() {
      if (done) return;
      done = true;
      intro.classList.add('gone');
      cb(); // aynı dokunuş içinde: iOS izinleri için gerekli
    }
    intro.addEventListener('pointerdown', go);
    intro.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') go(); });
    intro.tabIndex = 0;
  };

  Ask.onVisibility = function (pause, resume) {
    document.addEventListener('visibilitychange', () => (document.hidden ? pause() : resume()));
  };

  function buildStars() {
    const sky = document.getElementById('sky');
    const n = Ask.reducedMotion ? 60 : 90;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < n; i++) {
      const s = document.createElement('i');
      s.className = 'star';
      const size = 1 + Math.random() * 2;
      s.style.cssText =
        'left:' + Math.random() * 100 + '%;top:' + Math.random() * 100 + '%;' +
        'width:' + size + 'px;height:' + size + 'px;' +
        '--dur:' + (2 + Math.random() * 4) + 's;--delay:' + Math.random() * 4 + 's;' +
        '--peak:' + (0.5 + Math.random() * 0.5);
      frag.appendChild(s);
    }
    sky.appendChild(frag);
  }

  const c = window.ASK_CONTENT || {};
  document.getElementById('intro-text').textContent = c.intro || 'dokun';
  buildStars();

  if (!window.gsap) {
    document.body.classList.add('no-gsap');
    return;
  }

  // Tüm scriptler yüklenince çalışır: buket gizli bekler, dokunuşla büyür.
  Ask.boot = function () {
    const svg = document.getElementById('bouquet');
    const parts = Ask.buildBouquet(svg);
    let idle = null, hearts = null;
    svg.style.visibility = 'hidden';
    const openLetter = Ask.initLetter();
    Ask.bindNote(parts, openLetter);

    Ask.onStart(function () {
      svg.style.visibility = 'visible';
      hearts = Ask.startHearts();
      Ask.enableTap(parts, hearts);
      // Eğim izni dokunuşla aynı çağrıda istenmeli (iOS).
      Ask.enableTilt([
        { el: svg, depth: 10 },
        { el: document.getElementById('side-left'), depth: -22 },
        { el: document.getElementById('side-right'), depth: -22 },
        { el: document.getElementById('particles'), depth: -12 }
      ]);
      Ask.playBloom(parts, function () {
        idle = Ask.startIdle(parts);
      });
    });

    Ask.onVisibility(
      function () { if (idle) idle.pause(); if (hearts) hearts.pause(); },
      function () { if (idle) idle.resume(); if (hearts) hearts.resume(); }
    );
  };
  document.addEventListener('DOMContentLoaded', Ask.boot);
})();
