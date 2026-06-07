(function () {
  'use strict';

  function reducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function hasAnime() {
    return typeof window.anime === 'function';
  }

  function initTilt() {
    if (reducedMotion()) return;
    var nodes = document.querySelectorAll('[data-tilt]');
    var max = 8;

    nodes.forEach(function (el) {
      var raf = 0;
      var rect;

      function onMove(e) {
        if (!rect) return;
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var mx = rect.width / 2;
        var my = rect.height / 2;
        var rx = ((y - my) / my) * -max;
        var ry = ((x - mx) / mx) * max;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          el.style.transform =
            'perspective(1100px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateZ(0)';
        });
      }

      function refreshRect() {
        rect = el.getBoundingClientRect();
      }

      function onEnter() {
        refreshRect();
      }

      function onLeave() {
        cancelAnimationFrame(raf);
        el.style.transform = '';
      }

      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', onLeave);
    });
  }

  function initOrbParallax() {
    if (reducedMotion()) return;
    var wrap = document.querySelector('.bg-orbs');
    if (!wrap) return;
    var tick = null;
    window.addEventListener(
      'mousemove',
      function (e) {
        if (tick) return;
        tick = requestAnimationFrame(function () {
          tick = null;
          var px = e.clientX / window.innerWidth - 0.5;
          var py = e.clientY / window.innerHeight - 0.5;
          wrap.style.transform =
            'translate3d(' + px * 28 + 'px,' + py * 22 + 'px, 0) scale(1.02)';
        });
      },
      { passive: true }
    );
  }

  function runHeroIntro() {
    if (!hasAnime() || reducedMotion()) return;
    window.anime({
      targets: '.hero-bento .bento',
      translateY: [36, 0],
      translateZ: [-40, 0],
      rotateX: [12, 0],
      opacity: [0, 1],
      delay: window.anime.stagger(100, { start: 240 }),
      duration: 920,
      easing: 'easeOutExpo'
    });
  }

  function onLoaded() {
    runHeroIntro();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initTilt();
    initOrbParallax();
  });

  window.addEventListener('portfolioV2:loaded', onLoaded);
})();



(function () {
  'use strict';

  var STORAGE_THEME = 'portfolio-v2-theme';
  var STORAGE_LANG = 'portfolio-v2-lang';
  var copyEmailTimer = null;
  var heroRotateTimer = null;
  var NAV_DROPDOWN_SECTIONS = ['skills', 'services', 'experience', 'process', 'projects', 'testimonials', 'faq'];

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function normalizeLangCode(s) {
    if (s === undefined || s === null || s === '') return 'en';
    var x = String(s).trim().toLowerCase();
    if (x === 'ar' || x.indexOf('ar-') === 0) return 'ar';
    return 'en';
  }

  function getLang() {
    return normalizeLangCode(document.body.getAttribute('data-lang'));
  }

  function syncChromeI18n() {
    var isAr = getLang() === 'ar';
    var brand = qs('#brandHome');
    if (brand) brand.setAttribute('aria-label', isAr ? 'الرئيسية' : 'Home');

    var navDesk = qs('.nav-desktop');
    if (navDesk) navDesk.setAttribute('aria-label', isAr ? 'التنقل الرئيسي' : 'Primary');
    var navMobInner = qs('.nav-mobile-inner');
    if (navMobInner) navMobInner.setAttribute('aria-label', isAr ? 'قائمة الجوال' : 'Mobile');

    var langBtn = qs('#langToggle');
    if (langBtn) {
      var tEn = langBtn.getAttribute('data-title-en');
      var tAr = langBtn.getAttribute('data-title-ar');
      var aEn = langBtn.getAttribute('data-aria-en');
      var aAr = langBtn.getAttribute('data-aria-ar');
      if (tEn) langBtn.title = isAr ? (tAr || tEn) : tEn;
      if (aEn) langBtn.setAttribute('aria-label', isAr ? (aAr || aEn) : aEn);
    }

    var menuBtn = qs('#menuToggle');
    if (menuBtn) {
      var open = menuBtn.getAttribute('aria-expanded') === 'true';
      var dOpenEn = menuBtn.getAttribute('data-open-en');
      var dOpenAr = menuBtn.getAttribute('data-open-ar');
      var dCloseEn = menuBtn.getAttribute('data-close-en');
      var dCloseAr = menuBtn.getAttribute('data-close-ar');
      if (dOpenEn && dCloseEn) {
        menuBtn.setAttribute('aria-label', open ? (isAr ? (dCloseAr || dCloseEn) : dCloseEn) : (isAr ? (dOpenAr || dOpenEn) : dOpenEn));
      }
    }

    var themeBtn = qs('#themeToggle');
    if (themeBtn) {
      var dark = document.body.getAttribute('data-theme') === 'dark';
      if (dark) {
        themeBtn.title = isAr ? 'مظهر فاتح' : 'Light mode';
        themeBtn.setAttribute('aria-label', isAr ? 'التبديل إلى المظهر الفاتح' : 'Switch to light theme');
      } else {
        themeBtn.title = isAr ? 'مظهر داكن' : 'Dark mode';
        themeBtn.setAttribute('aria-label', isAr ? 'التبديل إلى المظهر الداكن' : 'Switch to dark theme');
      }
    }

    document.title = isAr
      ? 'Kan3an — ملف مطور تفاعلي V2 (عربي/إنجليزي)'
      : 'Kan3an — Developer Portfolio V2 · Bilingual Interactive CV';

    var scrollCue = qs('.hero-scroll-cue');
    if (scrollCue) {
      var sEn = scrollCue.getAttribute('data-aria-en');
      var sAr = scrollCue.getAttribute('data-aria-ar');
      if (sEn) scrollCue.setAttribute('aria-label', isAr ? (sAr || sEn) : sEn);
    }

    var copyBtn = qs('#copyEmailBtn');
    if (copyBtn) {
      var cEn = copyBtn.getAttribute('data-title-en');
      var cAr = copyBtn.getAttribute('data-title-ar');
      if (cEn) {
        copyBtn.title = isAr ? (cAr || cEn) : cEn;
        copyBtn.setAttribute('aria-label', isAr ? (cAr || cEn) : cEn);
      }
    }

    var promoBanner = qs('#heroPromoBanner');
    if (promoBanner) {
      var pEn = promoBanner.getAttribute('data-aria-en');
      var pAr = promoBanner.getAttribute('data-aria-ar');
      if (pEn) promoBanner.setAttribute('aria-label', isAr ? (pAr || pEn) : pEn);
    }

    var exploreBtn = qs('#navExploreTrigger');
    if (exploreBtn) {
      var exEn = exploreBtn.getAttribute('data-aria-en');
      var exAr = exploreBtn.getAttribute('data-aria-ar');
      var exCloseEn = exploreBtn.getAttribute('data-aria-close-en');
      var exCloseAr = exploreBtn.getAttribute('data-aria-close-ar');
      var exOpen = exploreBtn.getAttribute('aria-expanded') === 'true';
      if (exEn) {
        if (exOpen && exCloseEn) {
          exploreBtn.setAttribute('aria-label', isAr ? (exCloseAr || exCloseEn) : exCloseEn);
        } else {
          exploreBtn.setAttribute('aria-label', isAr ? (exAr || exEn) : exEn);
        }
      }
    }

    var footerPromo = qs('.footer-promo');
    if (footerPromo) {
      var fpEn = footerPromo.getAttribute('data-aria-en');
      var fpAr = footerPromo.getAttribute('data-aria-ar');
      if (fpEn) footerPromo.setAttribute('aria-label', isAr ? (fpAr || fpEn) : fpEn);
    }

    var footerSocial = qs('.footer-social');
    if (footerSocial) {
      var fsEn = footerSocial.getAttribute('data-aria-en');
      var fsAr = footerSocial.getAttribute('data-aria-ar');
      if (fsEn) footerSocial.setAttribute('aria-label', isAr ? (fsAr || fsEn) : fsEn);
    }
  }

  function setLang(lang) {
    var code = normalizeLangCode(lang);
    var isAr = code === 'ar';
    document.documentElement.setAttribute('lang', isAr ? 'ar' : 'en');
    document.documentElement.setAttribute('dir', isAr ? 'rtl' : 'ltr');
    document.body.setAttribute('data-lang', isAr ? 'ar' : 'en');
    document.body.setAttribute('data-dir', isAr ? 'rtl' : 'ltr');
    try {
      localStorage.setItem(STORAGE_LANG, isAr ? 'ar' : 'en');
    } catch (e) {}

    qsa('[data-text-en]').forEach(function (el) {
      var en = el.getAttribute('data-text-en');
      var arAttr = el.getAttribute('data-text-ar');
      if (isAr) {
        if (arAttr !== null && arAttr !== '') el.textContent = arAttr;
      } else {
        if (en !== null && en !== '') el.textContent = en;
      }
    });

    qsa('.input[data-placeholder-en]').forEach(function (input) {
      var pen = input.getAttribute('data-placeholder-en');
      var par = input.getAttribute('data-placeholder-ar');
      input.setAttribute('placeholder', isAr && par ? par : pen || '');
    });

    var label = qs('#langLabel');
    if (label) label.textContent = isAr ? 'EN' : 'AR';

    var fs = qs('#formStatus');
    if (fs) {
      fs.textContent = '';
      fs.classList.remove('is-ok', 'is-err');
    }

    var copyHint = qs('#copyEmailHint');
    if (copyHint) {
      copyHint.textContent = '';
      copyHint.hidden = true;
    }

    syncChromeI18n();
    restartHeroRotate();
  }

  function motionReduced() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function getHeroPhrases() {
    var el = qs('#heroRotateText');
    if (!el) return [];
    var ar = getLang() === 'ar';
    var raw = el.getAttribute(ar ? 'data-phrases-ar' : 'data-phrases-en') || '';
    return raw
      .split('|')
      .map(function (s) {
        return s.trim();
      })
      .filter(Boolean);
  }

  function restartHeroRotate() {
    var el = qs('#heroRotateText');
    if (!el) return;
    if (heroRotateTimer) {
      window.clearInterval(heroRotateTimer);
      heroRotateTimer = null;
    }
    var phrases = getHeroPhrases();
    if (!phrases.length) return;
    var idx = 0;
    el.textContent = phrases[0];
    el.classList.remove('is-rotate-tick');
    if (motionReduced()) return;
    heroRotateTimer = window.setInterval(function () {
      idx = (idx + 1) % phrases.length;
      el.classList.add('is-rotate-tick');
      window.setTimeout(function () {
        el.textContent = phrases[idx];
        el.classList.remove('is-rotate-tick');
      }, 180);
    }, 3200);
  }

  function initHeroPromoBanner() {
    var banner = qs('#heroPromoBanner');
    if (!banner) return;

    function setPointer(clientX, clientY) {
      var r = banner.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return;
      var x = ((clientX - r.left) / r.width) * 100;
      var y = ((clientY - r.top) / r.height) * 100;
      banner.style.setProperty('--mx', Math.max(0, Math.min(100, x)) + '%');
      banner.style.setProperty('--my', Math.max(0, Math.min(100, y)) + '%');
    }

    banner.addEventListener(
      'mousemove',
      function (e) {
        setPointer(e.clientX, e.clientY);
      },
      { passive: true }
    );

    banner.addEventListener(
      'touchmove',
      function (e) {
        if (e.touches && e.touches[0]) setPointer(e.touches[0].clientX, e.touches[0].clientY);
      },
      { passive: true }
    );

    banner.addEventListener('mouseleave', function () {
      banner.style.setProperty('--mx', '50%');
      banner.style.setProperty('--my', '42%');
    });

    restartHeroRotate();
  }

  function setTheme(theme) {
    var t = theme === 'light' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', t);
    try {
      localStorage.setItem(STORAGE_THEME, t);
    } catch (e) {}
    var meta = qs('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'dark' ? '#080806' : '#faf6ef');
    syncChromeI18n();
  }

  function toggleTheme() {
    var cur = document.body.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    setTheme(cur === 'dark' ? 'light' : 'dark');
  }

  function initYear() {
    var y = qs('#year');
    if (y) y.textContent = String(new Date().getFullYear());
  }

  function initLoader() {
    var loader = qs('#loader');
    var bar = qs('#loaderBar');
    var pctEl = qs('#loaderPct');
    if (!loader || !bar || !pctEl) return;

    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var p = 0;
    var step = reduced ? 50 : 8;

    function tick() {
      p = Math.min(100, p + step);
      bar.style.width = p + '%';
      pctEl.textContent = p + '%';
      if (p < 100) {
        window.requestAnimationFrame(function () {
          setTimeout(tick, reduced ? 0 : 28);
        });
      } else {
        window.setTimeout(function () {
          loader.classList.add('is-hidden');
          loader.setAttribute('aria-hidden', 'true');
          document.body.classList.remove('is-loading');
          window.dispatchEvent(new CustomEvent('portfolioV2:loaded'));
        }, reduced ? 120 : 320);
      }
    }

    document.body.classList.add('is-loading');
    tick();
  }

  function initNav() {
    var header = qs('#header');
    var menuToggle = qs('#menuToggle');
    var navMobile = qs('#navMobile');
    var navLinks = qsa('.nav-link[href^="#"]');
    var sections = qsa('main section[id]');

    function setActive(id) {
      navLinks.forEach(function (a) {
        var sec = a.getAttribute('data-section');
        var on = sec === id;
        a.classList.toggle('active', on);
      });
      var dd = qs('#navDesktopDropdown');
      if (dd) {
        dd.classList.toggle('has-active-child', NAV_DROPDOWN_SECTIONS.indexOf(id) !== -1);
      }
    }

    function closeMobile() {
      if (!navMobile || !menuToggle) return;
      navMobile.hidden = true;
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.classList.remove('is-open');
      document.body.classList.remove('nav-open');
      syncChromeI18n();
    }

    function openMobile() {
      if (!navMobile || !menuToggle) return;
      navMobile.hidden = false;
      menuToggle.setAttribute('aria-expanded', 'true');
      menuToggle.classList.add('is-open');
      document.body.classList.add('nav-open');
      syncChromeI18n();
    }

    if (menuToggle && navMobile) {
      menuToggle.addEventListener('click', function () {
        var open = menuToggle.getAttribute('aria-expanded') === 'true';
        if (open) closeMobile();
        else openMobile();
      });
    }

    navLinks.forEach(function (a) {
      a.addEventListener('click', function () {
        closeMobile();
      });
    });

    navLinks.forEach(function (a) {
      a.addEventListener('click', function (e) {
        var href = a.getAttribute('href');
        if (!href || href.charAt(0) !== '#') return;
        var el = document.getElementById(href.slice(1));
        if (!el) return;
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActive(a.getAttribute('data-section') || '');
      });
    });

    function updateScrollSpy() {
      if (!sections.length) return;
      var y = window.scrollY;
      var hint = y + Math.min(160, window.innerHeight * 0.22);
      var current = sections[0].id || 'home';
      for (var i = 0; i < sections.length; i++) {
        var sec = sections[i];
        var top = sec.getBoundingClientRect().top + window.scrollY;
        if (top <= hint) current = sec.id;
      }
      setActive(current);
    }

    var scrollTicking = false;
    window.addEventListener(
      'scroll',
      function () {
        if (scrollTicking) return;
        scrollTicking = true;
        window.requestAnimationFrame(function () {
          updateScrollSpy();
          if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
          scrollTicking = false;
        });
      },
      { passive: true }
    );
    updateScrollSpy();
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);

    function initDesktopDropdown() {
      var wrap = qs('#navDesktopDropdown');
      var trigger = qs('#navExploreTrigger');
      var panel = qs('#navExploreMenu');
      if (!wrap || !trigger || !panel) return;

      function closeDd() {
        trigger.setAttribute('aria-expanded', 'false');
        panel.hidden = true;
        wrap.classList.remove('is-open');
        syncChromeI18n();
      }

      function openDd() {
        trigger.setAttribute('aria-expanded', 'true');
        panel.hidden = false;
        wrap.classList.add('is-open');
        syncChromeI18n();
      }

      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var open = trigger.getAttribute('aria-expanded') === 'true';
        if (open) closeDd();
        else openDd();
      });

      wrap.addEventListener('click', function (e) {
        e.stopPropagation();
      });

      document.addEventListener('click', function () {
        closeDd();
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeDd();
      });

      window.addEventListener(
        'resize',
        function () {
          if (window.innerWidth < 1024) closeDd();
        },
        { passive: true }
      );

      qsa('a.nav-dropdown__link[href^="#"]', panel).forEach(function (a) {
        a.addEventListener('click', function () {
          window.setTimeout(closeDd, 0);
        });
      });
    }

    initDesktopDropdown();
  }

  function initReveal() {
    var els = qsa('[data-reveal]');
    if (!els.length) return;
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      els.forEach(function (el) {
        el.classList.add('is-inview');
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-inview');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    els.forEach(function (el) {
      io.observe(el);
    });
  }

  function animateStatNumber(el, target) {
    var start = 0;
    var dur = 900;
    var t0 = null;
    function frame(ts) {
      if (t0 === null) t0 = ts;
      var k = Math.min(1, (ts - t0) / dur);
      var eased = 1 - Math.pow(1 - k, 3);
      var val = Math.round(start + (target - start) * eased);
      el.textContent = String(val);
      if (k < 1) window.requestAnimationFrame(frame);
    }
    window.requestAnimationFrame(frame);
  }

  function initStats() {
    var items = qsa('.stat-num[data-count]');
    if (!items.length) return;
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var n = parseInt(el.getAttribute('data-count'), 10);
          if (!isNaN(n)) {
            if (reduced) el.textContent = String(n);
            else animateStatNumber(el, n);
          }
          io.unobserve(el);
        });
      },
      { threshold: 0.35 }
    );
    items.forEach(function (el) {
      io.observe(el);
    });
  }

  function initSkills() {
    var pills = qsa('.skill-pill[data-percent]');
    if (!pills.length) return;
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var pill = entry.target;
          var p = parseInt(pill.getAttribute('data-percent'), 10);
          if (isNaN(p)) p = 0;
          pill.style.setProperty('--fill-pct', p + '%');
          pill.classList.add('is-inview');

          var valEl = pill.querySelector('.skill-val');
          if (valEl) {
            if (reduced) valEl.textContent = p + '%';
            else {
              var start = 0;
              var t0 = null;
              var dur = 1100;
              function frame(ts) {
                if (t0 === null) t0 = ts;
                var k = Math.min(1, (ts - t0) / dur);
                var eased = 1 - Math.pow(1 - k, 3);
                var v = Math.round(start + (p - start) * eased);
                valEl.textContent = v + '%';
                if (k < 1) window.requestAnimationFrame(frame);
              }
              window.requestAnimationFrame(frame);
            }
          }
          io.unobserve(pill);
        });
      },
      { threshold: 0.35 }
    );

    pills.forEach(function (pill) {
      io.observe(pill);
    });
  }

  function initCopyEmail() {
    var btn = qs('#copyEmailBtn');
    var link = qs('#contactEmailLink');
    var hint = qs('#copyEmailHint');
    if (!btn || !link || !hint) return;

    btn.addEventListener('click', function () {
      var href = link.getAttribute('href') || '';
      var addr = href.replace(/^mailto:/i, '').trim();
      if (!addr) return;
      var ar = getLang() === 'ar';
      var okEn = btn.getAttribute('data-ok-en') || 'Copied!';
      var okAr = btn.getAttribute('data-ok-ar') || okEn;

      function showOk() {
        hint.hidden = false;
        hint.textContent = ar ? okAr : okEn;
        if (copyEmailTimer) window.clearTimeout(copyEmailTimer);
        copyEmailTimer = window.setTimeout(function () {
          hint.textContent = '';
          hint.hidden = true;
          copyEmailTimer = null;
        }, 2400);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(addr).then(showOk).catch(function () {
          hint.hidden = false;
          hint.textContent = ar ? 'انسخ العنوان يدوياً.' : 'Could not copy — select the email manually.';
        });
      } else {
        hint.hidden = false;
        hint.textContent = ar ? 'انسخ العنوان يدوياً.' : 'Please copy the address manually.';
      }
    });
  }

  function initForm() {
    var form = qs('#contactForm');
    var status = qs('#formStatus');
    if (!form || !status) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      var name = (fd.get('name') || '').toString().trim();
      var email = (fd.get('email') || '').toString().trim();
      var subject = (fd.get('subject') || '').toString().trim();
      var message = (fd.get('message') || '').toString().trim();
      var ar = getLang() === 'ar';

      if (!name || !email || !subject || !message) {
        status.textContent = ar ? 'يرجى تعبئة جميع الحقول.' : 'Please fill in all fields.';
        status.classList.remove('is-ok');
        status.classList.add('is-err');
        return;
      }

      status.classList.remove('is-err');
      status.classList.add('is-ok');
      status.textContent = ar
        ? 'تم استلام رسالتك (عرض توضيحي — لا يوجد إرسال فعلي).'
        : 'Message received (demo — no backend configured).';
      form.reset();
    });
  }

  function initControls() {
    var langBtn = qs('#langToggle');
    var themeBtn = qs('#themeToggle');

    if (langBtn) {
      langBtn.addEventListener('click', function () {
        setLang(getLang() === 'ar' ? 'en' : 'ar');
      });
    }
    if (themeBtn) {
      themeBtn.addEventListener('click', toggleTheme);
    }
  }

  function hydrateFromStorage() {
    try {
      var t = localStorage.getItem(STORAGE_THEME);
      if (t === 'light' || t === 'dark') setTheme(t);
    } catch (e) {}
    try {
      var l = localStorage.getItem(STORAGE_LANG);
      if (l) setLang(normalizeLangCode(l));
    } catch (e) {}
  }

  document.addEventListener('DOMContentLoaded', function () {
    hydrateFromStorage();
    syncChromeI18n();
    initYear();
    initControls();
    initLoader();
    initNav();
    initReveal();
    initStats();
    initSkills();
    initForm();
    initCopyEmail();
    initHeroPromoBanner();
  });
})();
