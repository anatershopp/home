/**
 * Anatter Shop — Main JS
 * Performance-first, no dependencies
 */
'use strict';

/* ============================================================
   LAZY LOADING IMAGES
   ============================================================ */
function initLazyImages() {
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.dataset.src;
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            img.classList.add('loaded');
            img.parentElement && img.parentElement.classList.remove('lazy-img');
          }
          io.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });

    document.querySelectorAll('img[data-src]').forEach(img => io.observe(img));
  } else {
    // Fallback
    document.querySelectorAll('img[data-src]').forEach(img => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  }
}

/* ============================================================
   CAROUSEL
   ============================================================ */
function initCarousel() {
  const carousel = document.querySelector('.carousel');
  if (!carousel) return;

  const slides = carousel.querySelectorAll('.carousel-slide');
  const dots = document.querySelectorAll('.carousel-dot');
  const prevBtn = document.querySelector('.carousel-arrow.prev');
  const nextBtn = document.querySelector('.carousel-arrow.next');
  let current = 0;
  let timer = null;

  function goTo(index) {
    slides[current].style.marginLeft = '';
    current = (index + slides.length) % slides.length;
    carousel.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  // Wrap slides in a track
  const track = document.createElement('div');
  track.style.cssText = 'display:flex;width:100%;height:100%;transition:transform .4s ease';
  slides.forEach(s => track.appendChild(s));
  carousel.appendChild(track);
  carousel.style.overflow = 'hidden';

  function go(index) {
    current = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function startAuto() {
    timer = setInterval(() => go(current + 1), 5000);
  }
  function stopAuto() { clearInterval(timer); }

  if (prevBtn) prevBtn.addEventListener('click', () => { stopAuto(); go(current - 1); startAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { stopAuto(); go(current + 1); startAuto(); });
  dots.forEach((d, i) => d.addEventListener('click', () => { stopAuto(); go(i); startAuto(); }));

  // Touch support
  let touchStartX = 0;
  carousel.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
  carousel.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) { stopAuto(); go(current + (dx < 0 ? 1 : -1)); startAuto(); }
  }, { passive: true });

  startAuto();
  if (dots[0]) dots[0].classList.add('active');
}

/* ============================================================
   COUNTDOWN TIMER
   ============================================================ */
function initCountdown() {
  const els = {
    h: document.querySelector('[data-countdown="hours"]'),
    m: document.querySelector('[data-countdown="minutes"]'),
    s: document.querySelector('[data-countdown="seconds"]'),
  };
  if (!els.h) return;

  // End of today
  const end = new Date();
  end.setHours(23, 59, 59, 0);

  function tick() {
    const diff = end - Date.now();
    if (diff <= 0) { return; }
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    els.h.textContent = String(h).padStart(2, '0');
    els.m.textContent = String(m).padStart(2, '0');
    els.s.textContent = String(s).padStart(2, '0');
  }
  tick();
  setInterval(tick, 1000);
}

/* ============================================================
   COOKIE BANNER
   ============================================================ */
function initCookieBanner() {
  if (localStorage.getItem('as_cookies')) return;
  const banner = document.querySelector('.cookie-banner');
  if (!banner) return;
  setTimeout(() => banner.classList.add('show'), 1200);

  banner.querySelector('.btn-cookie-accept')?.addEventListener('click', () => {
    localStorage.setItem('as_cookies', 'accepted');
    banner.classList.remove('show');
    // Fire GTM consent
    if (window.dataLayer) window.dataLayer.push({ event: 'cookie_accept' });
  });
  banner.querySelector('.btn-cookie-decline')?.addEventListener('click', () => {
    localStorage.setItem('as_cookies', 'declined');
    banner.classList.remove('show');
  });
}

/* ============================================================
   BACK TO TOP
   ============================================================ */
function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;
  const onScroll = () => btn.classList.toggle('visible', window.scrollY > 400);
  window.addEventListener('scroll', onScroll, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ============================================================
   WISHLIST (local)
   ============================================================ */
function initWishlist() {
  document.querySelectorAll('.product-card-wish').forEach(btn => {
    const id = btn.closest('[data-product-id]')?.dataset.productId;
    if (!id) return;
    const saved = JSON.parse(localStorage.getItem('as_wish') || '[]');
    if (saved.includes(id)) btn.classList.add('active');
    btn.addEventListener('click', () => {
      const list = JSON.parse(localStorage.getItem('as_wish') || '[]');
      const idx = list.indexOf(id);
      if (idx === -1) { list.push(id); btn.classList.add('active'); }
      else { list.splice(idx, 1); btn.classList.remove('active'); }
      localStorage.setItem('as_wish', JSON.stringify(list));
    });
  });
}

/* ============================================================
   MINI CART COUNT
   ============================================================ */
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('as_cart') || '[]');
  const count = cart.reduce((a, b) => a + (b.qty || 1), 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = count;
    el.style.display = count ? 'flex' : 'none';
  });
}

/* ============================================================
   SEARCH AUTOCOMPLETE (stub)
   ============================================================ */
function initSearch() {
  const input = document.querySelector('.search-input');
  if (!input) return;
  const form = input.closest('form');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    if (window.dataLayer) window.dataLayer.push({ event: 'search', search_term: q });
    window.location.href = `/busca?q=${encodeURIComponent(q)}`;
  });
}

/* ============================================================
   NAV ACTIVE STATE
   ============================================================ */
function initNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-item[data-path]').forEach(item => {
    if (path.startsWith(item.dataset.path)) item.classList.add('active');
  });
}

/* ============================================================
   PERFORMANCE: Defer non-critical CSS
   ============================================================ */
function loadDeferredStyles() {
  document.querySelectorAll('link[data-deferred]').forEach(link => {
    link.rel = 'stylesheet';
    link.removeAttribute('data-deferred');
  });
}

/* ============================================================
   NEWSLETTER
   ============================================================ */
function initNewsletter() {
  const form = document.querySelector('.newsletter-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = form.querySelector('.newsletter-input')?.value.trim();
    if (!email || !email.includes('@')) return;
    if (window.dataLayer) window.dataLayer.push({ event: 'newsletter_signup', email });
    form.innerHTML = '<p style="font-weight:800;color:var(--secondary);padding:12px 0">✅ Inscrição realizada! Obrigado.</p>';
  });
}

/* ============================================================
   INIT
   ============================================================ */
function init() {
  initLazyImages();
  initCarousel();
  initCountdown();
  initCookieBanner();
  initBackToTop();
  initWishlist();
  updateCartCount();
  initSearch();
  initNav();
  initNewsletter();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Deferred styles after load
window.addEventListener('load', loadDeferredStyles);
