(function() {
  'use strict';

  /* ==========================================
     CUSTOM CURSOR (desktop uniquement)
     ========================================== */
  function initCursor() {
    return; // Desactive – custom cursor CSS retire (passe-finition 2026-05)
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.style.opacity = '1';
    document.body.appendChild(cursor);

    var x = 0, y = 0, targetX = 0, targetY = 0;
    var rafId = null;

    function updateCursor() {
      x += (targetX - x) * 0.25;
      y += (targetY - y) * 0.25;
      cursor.style.left = x + 'px';
      cursor.style.top = y + 'px';
      rafId = requestAnimationFrame(updateCursor);
    }

    document.addEventListener('mousemove', function(e) {
      targetX = e.clientX - 14; // 14 = moitié de 28px
      targetY = e.clientY - 14;
      if (!rafId) updateCursor();
    });

    var hoverables = document.querySelectorAll('a, button, [data-modal], [data-menu-trigger], .dropdown-toggle, input, textarea, select, .faq-question, .card-link');
    hoverables.forEach(function(el) {
      el.addEventListener('mouseenter', function() { cursor.classList.add('hover'); });
      el.addEventListener('mouseleave', function() { cursor.classList.remove('hover'); });
    });
  }

  /* ==========================================
     GSAP HERO SCROLL
     ========================================== */
  var heroScrollTrigger = null;

  function getActiveRevealWords() {
    var lang = document.body.classList.contains('lang-en') ? 'en' : 'fr';
    return Array.from(document.querySelectorAll('.hero-reveal-text .' + lang + ' .reveal-word'));
  }

  function initHeroScroll() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    var activeWords = getActiveRevealWords();

    gsap.set(".hero-reveal-text", { opacity: 0 });
    gsap.set(activeWords, { x: "100%" });
    gsap.set(".hero-service-labels", { opacity: 0 });

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#hero",
        start: "top top",
        end: "bottom bottom",
        scrub: 1.5,
      }
    });

    tl.to(".hero-split-title", { y: "-120%", opacity: 0, duration: 0.25, ease: "power2.inOut" }, 0);
    tl.to(".hero-panel-left", { x: "-100%", duration: 0.35, ease: "power3.inOut" }, 0.08);
    tl.to(".hero-right-static", { opacity: 0, duration: 0.23, ease: "power2.out" }, 0.05);
    tl.to(".hero-bottom-right-desc", { opacity: 0, duration: 0.22, ease: "power2.out" }, 0.08);
    tl.to(".hero-reveal-text", { opacity: 1, duration: 0.05 }, 0.20);
    tl.to(activeWords, { x: 0, duration: 0.4, ease: "power2.out", stagger: 0.06 }, 0.22);
    tl.to(".hero-scroll-indicator", { opacity: 0, duration: 0.15, ease: "power2.out" }, 0.30);
    tl.to(".hero-service-labels", { opacity: 1, duration: 0.2, ease: "power2.out" }, 0.35);

    heroScrollTrigger = tl.scrollTrigger;
  }

  function refreshHeroScroll() {
    if (typeof gsap === 'undefined') return;
    if (heroScrollTrigger) {
      heroScrollTrigger.kill();
      heroScrollTrigger = null;
    }
    gsap.set('.hero-reveal-text .reveal-word', { clearProps: "all" });
    gsap.set('.hero-reveal-text', { opacity: 0 });
    initHeroScroll();
  }

  /* ==========================================
     HEADER SCROLL - 80px
     ========================================== */
  function initHeaderScroll() {
    var header = document.getElementById('header');
    if (!header) return;
    function update() {
      if (window.scrollY > 80) {
        header.classList.remove('header-transparent');
        header.classList.add('header-scrolled');
      } else {
        header.classList.add('header-transparent');
        header.classList.remove('header-scrolled');
      }
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ==========================================
     DROPDOWNS
     ========================================== */
  function initDropdowns() {
    document.querySelectorAll('.dropdown').forEach(function(dd) {
      var toggle = dd.querySelector('.dropdown-toggle');
      if (!toggle) return;
      toggle.addEventListener('click', function(e) {
        e.stopPropagation();
        var isOpen = dd.classList.contains('open');
        document.querySelectorAll('.dropdown').forEach(function(d) {
          d.classList.remove('open');
          var t = d.querySelector('.dropdown-toggle');
          if (t) t.setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          dd.classList.add('open');
          toggle.setAttribute('aria-expanded', 'true');
        }
      });
    });
    document.addEventListener('click', function() {
      document.querySelectorAll('.dropdown').forEach(function(d) {
        d.classList.remove('open');
        var t = d.querySelector('.dropdown-toggle');
        if (t) t.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ==========================================
     MENU OVERLAY
     ========================================== */
  function initMenu() {
    var overlay = document.getElementById('menuOverlay');
    if (!overlay) return;
    var triggers = document.querySelectorAll('[data-menu-trigger]');
    var closeBtn = document.getElementById('menuClose');
    function open() { overlay.classList.add('open'); document.body.style.overflow = 'hidden'; }
    function close() { overlay.classList.remove('open'); document.body.style.overflow = ''; }
    triggers.forEach(function(t) { t.addEventListener('click', open); });
    if (closeBtn) closeBtn.addEventListener('click', close);
    overlay.querySelectorAll('a').forEach(function(a) {
      a.addEventListener('click', function(e) {
        if (!a.getAttribute('data-modal')) close();
      });
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && overlay.classList.contains('open')) close();
    });
  }

  /* ==========================================
     LANGUAGE
     ========================================== */
  function updateLang(lang) {
    document.documentElement.setAttribute('lang', lang);
    var titleEl = document.querySelector('title');
    if (titleEl) {
      var fr = titleEl.getAttribute('data-title-fr');
      var en = titleEl.getAttribute('data-title-en');
      if (fr && en) document.title = lang === 'en' ? en : fr;
    }
  }

  function initLang() {
    var saved = localStorage.getItem('lf-lang') || 'fr';
    if (saved !== 'fr' && saved !== 'en') saved = 'fr';
    document.body.classList.remove('lang-fr', 'lang-en');
    document.body.classList.add('lang-' + saved);
    updateLang(saved);

    document.querySelectorAll('.lang-btn').forEach(function(btn) {
      btn.classList.toggle('active', btn.dataset.lang === saved);
      btn.addEventListener('click', function() {
        var lang = this.dataset.lang;
        document.body.classList.remove('lang-fr', 'lang-en');
        document.body.classList.add('lang-' + lang);
        updateLang(lang);
        localStorage.setItem('lf-lang', lang);
        document.querySelectorAll('.lang-btn').forEach(function(b) {
          b.classList.toggle('active', b.dataset.lang === lang);
        });
        if (typeof refreshHeroScroll === 'function') refreshHeroScroll();
      });
    });
  }

  /* ==========================================
     MODALS + FORM VALIDATION
     ========================================== */
  var modalData = {
    consultation: {
      fr: { t: "Demande de consultation", b: "<p>Notre &eacute;quipe vous recontactera sous 24h.</p><p>La premi&egrave;re consultation comprend :</p><ul><li>Examen clinique complet</li><li>Radiographie panoramique</li><li>Devis personnalis&eacute; d&eacute;taill&eacute;</li></ul>", c: "<button class='btn-cta' data-modal='formulaire' style='width:100%'>Remplir le formulaire</button>" },
      en: { t: "Consultation request", b: "<p>Our team will contact you within 24h.</p><p>The first consultation includes:</p><ul><li>Complete clinical examination</li><li>Panoramic X-ray</li><li>Detailed personalized quote</li></ul>", c: "<button class='btn-cta' data-modal='formulaire' style='width:100%'>Fill the form</button>" }
    },
    formulaire: {
      fr: { t: "Formulaire de contact", b: "<form class='modal-form' onsubmit='return false;'><div class='form-group'><label class='form-label'>Nom complet *</label><input type='text' class='form-input' name='nom' required placeholder='Jean Dupont'><span class='form-error'>Veuillez entrer votre nom</span></div><div class='form-group'><label class='form-label'>Email *</label><input type='email' class='form-input' name='email' required placeholder='jean@email.com'><span class='form-error'>Veuillez entrer un email valide</span></div><div class='form-group'><label class='form-label'>T&eacute;l&eacute;phone</label><input type='tel' class='form-input' name='telephone' placeholder='06 12 34 56 78'></div><div class='form-group'><label class='form-label'>Motif</label><select class='form-select' name='motif'><option value=''>Choisir...</option><option>Implantologie</option><option>Facettes</option><option>Proth&egrave;ses</option><option>Autre</option></select></div><div class='form-group'><label class='form-label'>Message</label><textarea class='form-input' name='message' rows='4' placeholder='Votre message...'></textarea></div><button type='submit' class='btn-cta' style='width:100%'>Envoyer</button></form>", c: "" },
      en: { t: "Contact form", b: "<form class='modal-form' onsubmit='return false;'><div class='form-group'><label class='form-label'>Full name *</label><input type='text' class='form-input' name='nom' required placeholder='John Doe'><span class='form-error'>Please enter your name</span></div><div class='form-group'><label class='form-label'>Email *</label><input type='email' class='form-input' name='email' required placeholder='john@email.com'><span class='form-error'>Please enter a valid email</span></div><div class='form-group'><label class='form-label'>Phone</label><input type='tel' class='form-input' name='telephone' placeholder='06 12 34 56 78'></div><div class='form-group'><label class='form-label'>Reason</label><select class='form-select' name='motif'><option value=''>Choose...</option><option>Implantology</option><option>Veneers</option><option>Prosthodontics</option><option>Other</option></select></div><div class='form-group'><label class='form-label'>Message</label><textarea class='form-input' name='message' rows='4' placeholder='Your message...'></textarea></div><button type='submit' class='btn-cta' style='width:100%'>Send</button></form>", c: "" }
    },
    blog: {
      fr: { t: "Blog &amp; Actualit&eacute;s", b: "<p>Notre blog sera bient&ocirc;t disponible.</p>", c: "<button class='btn-cta' data-modal='newsletter' style='width:100%'>S'inscrire &agrave; la newsletter</button>" },
      en: { t: "Blog &amp; News", b: "<p>Our blog will be available soon.</p>", c: "<button class='btn-cta' data-modal='newsletter' style='width:100%'>Subscribe to newsletter</button>" }
    },
    newsletter: {
      fr: { t: "Newsletter", b: "<form class='modal-form' onsubmit='return false;'><p>Recevez nos conseils et actualit&eacute;s dentaires.</p><div class='form-group'><label class='form-label'>Votre email *</label><input type='email' class='form-input' name='email' required placeholder='vous@email.com'><span class='form-error'>Veuillez entrer un email valide</span></div><button type='submit' class='btn-cta' style='width:100%'>S'inscrire</button></form>", c: "" },
      en: { t: "Newsletter", b: "<form class='modal-form' onsubmit='return false;'><p>Receive our dental tips and news.</p><div class='form-group'><label class='form-label'>Your email *</label><input type='email' class='form-input' name='email' required placeholder='you@email.com'><span class='form-error'>Please enter a valid email</span></div><button type='submit' class='btn-cta' style='width:100%'>Subscribe</button></form>", c: "" }
    },
    proto: {
      fr: {
        t: "Réservation d'appel",
        b: "<p style='margin-bottom:24px;color:var(--text-secondary);font-size:16px;'>Cette fonctionnalité peut être connectée à votre système de gestion préféré. Nous configurons l'intégration selon vos outils.</p><div class='proto-grid'><div class='proto-badge'><svg width='16' height='16' viewBox='0 0 16 16' fill='none'><path d='M3 8L7 12L13 4' stroke='#3D5A4C' stroke-width='1.5' stroke-linecap='round'/></svg>Doctolib</div><div class='proto-badge'><svg width='16' height='16' viewBox='0 0 16 16' fill='none'><path d='M3 8L7 12L13 4' stroke='#3D5A4C' stroke-width='1.5' stroke-linecap='round'/></svg>Nhale</div><div class='proto-badge'><svg width='16' height='16' viewBox='0 0 16 16' fill='none'><path d='M3 8L7 12L13 4' stroke='#3D5A4C' stroke-width='1.5' stroke-linecap='round'/></svg>Dentally</div><div class='proto-badge'><svg width='16' height='16' viewBox='0 0 16 16' fill='none'><path d='M3 8L7 12L13 4' stroke='#3D5A4C' stroke-width='1.5' stroke-linecap='round'/></svg>Google Agenda</div><div class='proto-badge'><svg width='16' height='16' viewBox='0 0 16 16' fill='none'><path d='M3 8L7 12L13 4' stroke='#3D5A4C' stroke-width='1.5' stroke-linecap='round'/></svg>Outlook</div><div class='proto-badge'><svg width='16' height='16' viewBox='0 0 16 16' fill='none'><path d='M3 8L7 12L13 4' stroke='#3D5A4C' stroke-width='1.5' stroke-linecap='round'/></svg>API métier</div></div><p style='margin-top:24px;font-size:14px;color:var(--gray);font-style:italic;'>En tant que cabinet partenaire, nous assurons la connexion et la synchronisation de vos rendez-vous.</p>",
        c: "<button class='btn-outline' onclick='window.closeModal()' style='width:100%'>Fermer</button>"
      },
      en: {
        t: "Call booking",
        b: "<p style='margin-bottom:24px;color:var(--text-secondary);font-size:16px;'>This feature can be connected to your preferred management system. We configure the integration according to your tools.</p><div class='proto-grid'><div class='proto-badge'><svg width='16' height='16' viewBox='0 0 16 16' fill='none'><path d='M3 8L7 12L13 4' stroke='#3D5A4C' stroke-width='1.5' stroke-linecap='round'/></svg>Doctolib</div><div class='proto-badge'><svg width='16' height='16' viewBox='0 0 16 16' fill='none'><path d='M3 8L7 12L13 4' stroke='#3D5A4C' stroke-width='1.5' stroke-linecap='round'/></svg>Nhale</div><div class='proto-badge'><svg width='16' height='16' viewBox='0 0 16 16' fill='none'><path d='M3 8L7 12L13 4' stroke='#3D5A4C' stroke-width='1.5' stroke-linecap='round'/></svg>Dentally</div><div class='proto-badge'><svg width='16' height='16' viewBox='0 0 16 16' fill='none'><path d='M3 8L7 12L13 4' stroke='#3D5A4C' stroke-width='1.5' stroke-linecap='round'/></svg>Google Calendar</div><div class='proto-badge'><svg width='16' height='16' viewBox='0 0 16 16' fill='none'><path d='M3 8L7 12L13 4' stroke='#3D5A4C' stroke-width='1.5' stroke-linecap='round'/></svg>Outlook</div><div class='proto-badge'><svg width='16' height='16' viewBox='0 0 16 16' fill='none'><path d='M3 8L7 12L13 4' stroke='#3D5A4C' stroke-width='1.5' stroke-linecap='round'/></svg>Custom API</div></div><p style='margin-top:24px;font-size:14px;color:var(--gray);font-style:italic;'>As a partner practice, we ensure the connection and synchronization of your appointments.</p>",
        c: "<button class='btn-outline' onclick='window.closeModal()' style='width:100%'>Close</button>"
      }
    }
  };

  var curModal = null;
  window.closeModal = function() {
    if (!curModal) return;
    var m = curModal;
    m.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(function() { m.remove(); if (curModal === m) curModal = null; }, 300);
  };

  function initModals() {
    document.addEventListener('click', function(e) {
      var el = e.target.closest('[data-modal]');
      if (!el) return;
      e.preventDefault();
      e.stopPropagation();
      var type = el.dataset.modal;
      var lang = document.body.classList.contains('lang-en') ? 'en' : 'fr';
      var d = modalData[type];
      if (!d) return;
      var c = d[lang] || d.fr;
      if (curModal) window.closeModal();
      var ov = document.createElement('div');
      ov.className = 'modal-overlay';
      ov.innerHTML = '<div class="modal-box" role="dialog" aria-modal="true">' +
        '<button class="modal-close" aria-label="Fermer">&times;</button>' +
        '<h3 class="modal-title">' + c.t + '</h3>' +
        '<div class="modal-body">' + c.b + '</div>' +
        (c.c ? '<div class="modal-cta">' + c.c + '</div>' : '') +
      '</div>';
      document.body.appendChild(ov);
      curModal = ov;
      requestAnimationFrame(function() { ov.classList.add('open'); });
      document.body.style.overflow = 'hidden';

      // Form validation
      var form = ov.querySelector('.modal-form');
      if (form) {
        form.addEventListener('submit', function(ev) {
          ev.preventDefault();
          var valid = true;
          var inputs = form.querySelectorAll('input[required], select[required]');
          inputs.forEach(function(inp) {
            var group = inp.closest('.form-group');
            if (!inp.value.trim() || (inp.type === 'email' && !inp.value.includes('@'))) {
              valid = false;
              group.classList.add('has-error');
            } else {
              group.classList.remove('has-error');
            }
          });
          if (valid) {
            var btn = form.querySelector('button[type="submit"]');
            var originalText = btn.textContent;
            btn.textContent = lang === 'en' ? 'Sent!' : 'Envoy&eacute;!';
            btn.style.background = 'var(--sage)';
            btn.style.color = 'var(--white)';
            setTimeout(function() {
              window.closeModal();
            }, 1500);
          }
        });
      }

      ov.querySelector('.modal-close').addEventListener('click', window.closeModal);
      ov.addEventListener('click', function(ev) { if (ev.target === ov) window.closeModal(); });
      document.addEventListener('keydown', function onKey(ev) {
        if (ev.key === 'Escape') { window.closeModal(); document.removeEventListener('keydown', onKey); }
      });
    });
  }

  /* ==========================================
     FAQ
     ========================================== */
  function initFAQ() {
    document.querySelectorAll('.faq-question').forEach(function(q) {
      q.addEventListener('click', function() {
        var item = this.closest('.faq-item');
        var open = item.classList.contains('open');
        item.classList.toggle('open', !open);
        this.setAttribute('aria-expanded', !open);
      });
    });
  }

  /* ==========================================
     SCROLL REVEAL - 15% visibilit&eacute; + fallback
     ========================================== */
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function(el) { obs.observe(el); });
    // Fallback : rendre visibles apr&egrave;s 3s
    setTimeout(function() {
      els.forEach(function(el) {
        if (!el.classList.contains('revealed')) el.classList.add('revealed');
      });
    }, 3000);
  }

  /* ==========================================
     CASCADE - M&Eacute;THODE &Eacute;TAPES
     ========================================== */
  function initCascade() {
    var steps = document.querySelectorAll('.reveal-cascade');
    if (!steps.length) return;
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (!e.isIntersecting) return;
        var delay = parseInt(e.target.dataset.delay || '0', 10);
        setTimeout(function() {
          e.target.classList.add('revealed');
        }, delay);
        obs.unobserve(e.target);
      });
    }, { threshold: 0.15 });
    steps.forEach(function(s) { obs.observe(s); });
  }

  /* ==========================================
     COUNTER ANIMATION
     ========================================== */
  function initCounters() {
    var counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var target = parseInt(el.dataset.count, 10);
        var suffix = '';
        var next = el.nextElementSibling;
        if (next && next.dataset && next.dataset.suffix) suffix = next.dataset.suffix;
        var duration = 2000;
        var start = performance.now();
        function update(now) {
          var elapsed = now - start;
          var progress = Math.min(elapsed / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          var current = Math.round(target * eased);
          el.textContent = current + suffix;
          if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(function(c) { obs.observe(c); });
  }

  /* ==========================================
     IMAGE LOADING STATES
     ========================================== */
  function initImageLoading() {
    document.querySelectorAll('img').forEach(function(img) {
      if (img.complete) {
        img.classList.add('loaded');
      } else {
        img.classList.add('loading');
        img.addEventListener('load', function() {
          img.classList.remove('loading');
          img.classList.add('loaded');
        });
        img.addEventListener('error', function() {
          img.classList.remove('loading');
        });
      }
    });
  }

  /* ==========================================
     PAGE TRANSITIONS
     ========================================== */
  function initPageTransitions() {
    var overlay = document.createElement('div');
    overlay.className = 'page-transition-overlay';
    document.body.appendChild(overlay);

    document.querySelectorAll('a[href]').forEach(function(link) {
      var href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('tel:') || href.startsWith('mailto:')) return;
      if (link.hasAttribute('data-modal')) return;

      link.addEventListener('click', function(e) {
        if (e.ctrlKey || e.metaKey || e.shiftKey) return;
        e.preventDefault();
        overlay.classList.add('active');
        setTimeout(function() {
          window.location.href = href;
        }, 400);
      });
    });
  }

  /* ==========================================
     LOADER
     ========================================== */
  function initLoader() {
    var loader = document.getElementById('pageLoader');
    if (!loader) return;
    window.addEventListener('load', function() {
      setTimeout(function() {
        loader.classList.add('hidden');
        setTimeout(function() { loader.style.display = 'none'; }, 600);
      }, 800);
    });
  }

  /* ==========================================
     PARALLAX SUBTIL
     ========================================== */
  function initParallax() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);
    document.querySelectorAll('.card-img-top img, .case-img img, .tech-img img, .team-portrait img').forEach(function(img) {
      gsap.to(img, {
        yPercent: -6,
        ease: 'none',
        scrollTrigger: {
          trigger: img.closest('.card-img-top, .case-img, .tech-img, .team-portrait'),
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    });
  }

  /* ==========================================
     FORM VALIDATION REALTIME (contact.html)
     ========================================== */
  function initFormValidationRealtime() {
    var form = document.getElementById('contactForm');
    if (!form) return;
    var fields = form.querySelectorAll('input[required], select[required], textarea[required]');
    fields.forEach(function(field) {
      field.addEventListener('blur', function() {
        validateField(field);
      });
      field.addEventListener('input', function() {
        if (field.classList.contains('error')) validateField(field);
      });
    });
    function validateField(field) {
      var valid = true;
      var val = field.value.trim();
      if (!val) valid = false;
      if (field.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) valid = false;
      if (field.type === 'tel' && val && !/^[\d\s\+\-\.\(\)]{8,}$/.test(val)) valid = false;
      field.classList.toggle('error', !valid);
      field.classList.toggle('success', valid && val);
    }
  }

  /* ==========================================
     TEAM SPOTLIGHT
     ========================================== */
  function initTeamSpotlight() {
    var root = document.getElementById('teamSpotlight');
    if (!root) return;

    var team = [
      {
        img: 'images/dr-laroque.webp',
        name: 'Dr Étienne Laroque',
        roleFr: 'Implantologie',
        roleEn: 'Implantology',
        descFr: "Vous le rencontrerez lors du diagnostic. C'est lui qui posera vos implants, et c'est lui que vous reverrez chaque année. Vingt ans d'exercice en chirurgie implantaire, une parole simple, et le temps qu'il faut pour répondre à vos questions.",
        descEn: "You will meet him at the diagnostic stage. He will place your implants, and he is the one you will see again each year. Twenty years of implant surgery experience, plain speech, and the time it takes to answer your questions.",
        miniFr: "Vingt ans en chirurgie implantaire. Du diagnostic au contrôle annuel, c'est lui.",
        miniEn: "Twenty years in implant surgery. From diagnosis to yearly follow-up, he is the one."
      },
      {
        img: 'images/dr-fontenay.webp',
        name: 'Dr Maëlle Fontenay',
        roleFr: 'Restauration esthétique',
        roleEn: 'Aesthetic restoration',
        descFr: "Elle prend le relais une fois les implants intégrés, et c'est elle qui conçoit les couronnes et facettes. Vous la trouverez attentive aux détails, à votre profil, à ce qui rendra le résultat juste, sans jamais imposer un sourire qui ne serait pas le vôtre.",
        descEn: "She takes over once the implants are integrated, and designs the crowns and veneers. You will find her attentive to detail, to your profile, to what makes the result feel right, without ever imposing a smile that isn't yours.",
        miniFr: "Elle prend le relais une fois les implants intégrés, et conçoit les couronnes et facettes.",
        miniEn: "She takes over once the implants are integrated, and designs the crowns and veneers."
      },
      {
        img: 'images/anais-corbin.webp',
        name: 'Anaïs Corbin',
        roleFr: 'Coordination patient',
        roleEn: 'Patient coordination',
        descFr: "Elle est la première voix que vous entendrez au cabinet, et celle qui vous accompagne entre les rendez-vous. Elle connaît votre dossier, anticipe vos questions, et fait en sorte que rien ne vienne ajouter du stress à un traitement qui en demande déjà beaucoup.",
        descEn: "She is the first voice you will hear at the practice, and the one who supports you between appointments. She knows your file, anticipates your questions, and makes sure nothing adds stress to a treatment that already demands enough.",
        miniFr: "Première voix au cabinet, elle vous accompagne entre les rendez-vous.",
        miniEn: "First voice at the practice, she supports you between appointments."
      }
    ];

    var current = 0;
    var timer = null;
    var ROTATION_MS = 8000;

    var mainImg = document.getElementById('team-main-img');
    var mainName = document.getElementById('team-main-name');
    var mainRoleFr = document.getElementById('team-main-role-fr');
    var mainRoleEn = document.getElementById('team-main-role-en');
    var mainDescFr = document.getElementById('team-main-desc-fr');
    var mainDescEn = document.getElementById('team-main-desc-en');
    var dots = root.querySelectorAll('.team-dot');
    var miniCards = root.querySelectorAll('.team-card-mini');

    function render() {
      var p = team[current];
      var otherIdxs = [0, 1, 2].filter(function(i) { return i !== current; });
      var isMobile = !window.matchMedia('(min-width: 768px)').matches;

      mainImg.style.opacity = '0';
      mainName.style.opacity = '0';
      mainDescFr.style.opacity = '0';
      mainDescEn.style.opacity = '0';

      setTimeout(function() {
        mainImg.src = p.img;
        mainImg.alt = p.name;
        mainName.textContent = p.name;
        mainRoleFr.textContent = p.roleFr;
        mainRoleEn.textContent = p.roleEn;
        mainDescFr.textContent = p.descFr;
        mainDescEn.textContent = p.descEn;
        mainImg.style.opacity = '1';
        mainName.style.opacity = '1';
        mainDescFr.style.opacity = '1';
        mainDescEn.style.opacity = '1';
      }, 200);

      miniCards.forEach(function(card, i) {
        var otherIdx = otherIdxs[i];
        var other = team[otherIdx];
        card.dataset.target = otherIdx;
        var img = card.querySelector('img');
        var nameEl = card.querySelector('.team-name-mini');
        var roleFrEl = card.querySelector('.team-role-mini .fr');
        var roleEnEl = card.querySelector('.team-role-mini .en');
        var descFrEl = card.querySelector('.team-desc-mini .fr');
        var descEnEl = card.querySelector('.team-desc-mini .en');
        if (img) { img.src = other.img; img.alt = other.name; }
        if (nameEl) nameEl.textContent = other.name;
        if (roleFrEl) roleFrEl.textContent = other.roleFr;
        if (roleEnEl) roleEnEl.textContent = other.roleEn;
        if (descFrEl) descFrEl.textContent = isMobile ? other.descFr : other.miniFr;
        if (descEnEl) descEnEl.textContent = isMobile ? other.descEn : other.miniEn;
      });

      dots.forEach(function(d, i) {
        d.classList.toggle('active', i === current);
      });
    }

    function next() {
      current = (current + 1) % 3;
      render();
    }

    function start() {
      if (!timer) timer = setInterval(next, ROTATION_MS);
    }

    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
    }

    miniCards.forEach(function(card) {
      card.addEventListener('click', function() {
        current = parseInt(card.dataset.target, 10);
        render(); stop(); start();
      });
    });

    dots.forEach(function(d, i) {
      d.addEventListener('click', function() {
        current = i; render(); stop(); start();
      });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);

    render();

    // Auto-rotation desactivee sur mobile (< 768px)
    if (window.matchMedia('(min-width: 768px)').matches) {
      start();
    }

    window.addEventListener('resize', function() {
      render();
      if (window.matchMedia('(min-width: 768px)').matches) {
        if (!timer) start();
      } else {
        stop();
      }
    });
  }

  /* ==========================================
     INIT
     ========================================== */
  function init() {
    document.body.classList.add('js-enabled');
    initLoader();
    initCursor();
    initHeroScroll();
    initHeaderScroll();
    initDropdowns();
    initMenu();
    initLang();
    initModals();
    initFAQ();
    initReveal();
    initCascade();
    initCounters();
    initImageLoading();
    initPageTransitions();
    initParallax();
    initTeamSpotlight();
    initFormValidationRealtime();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
