/**
 * Doms TV Mounting — Google Reviews Carousel
 * Drop-in: <div id="doms-reviews-carousel"></div>
 *          <script src="https://doms-tv-mounting.vercel.app/reviews-carousel.js"></script>
 */
(function () {
  'use strict';

  const TARGET_ID = 'doms-reviews-carousel';
  const API_URL   = 'https://doms-tv-mounting.vercel.app/api/reviews';

  const BLUE    = '#0047AB';
  const BLUE_DK = '#003580';
  const TINT    = '#EEF5FB';
  const INK     = '#334455';
  const MUTE    = '#777777';
  const LINE    = '#D6DEE7';

  let reviews    = [];
  let currentIdx = 0;
  let autoTimer  = null;

  // ── Fetch ────────────────────────────────────────────────────────────────
  async function fetchReviews() {
    try {
      const res  = await fetch(API_URL);
      const data = await res.json();
      reviews = data.fiveStarReviews || [];
      render();
      startAuto();
    } catch (e) {
      const root = document.getElementById(TARGET_ID);
      if (root) root.innerHTML = '';
    }
  }

  // ── Auto-advance every 6 s ───────────────────────────────────────────────
  function startAuto() {
    clearInterval(autoTimer);
    if (reviews.length < 2) return;
    autoTimer = setInterval(() => {
      currentIdx = (currentIdx + 1) % reviews.length;
      render();
    }, 6000);
  }

  function resetAuto() { startAuto(); }

  // ── Render ───────────────────────────────────────────────────────────────
  function render() {
    const root = document.getElementById(TARGET_ID);
    if (!root || !reviews.length) return;

    const r       = reviews[currentIdx];
    const initials = r.author.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    const avatar = r.profilePhotoUrl
      ? `<img src="${r.profilePhotoUrl}" alt="${esc(r.author)}"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"
             style="width:44px;height:44px;border-radius:50%;object-fit:cover;display:block;flex-shrink:0;" /><div style="display:none;width:44px;height:44px;border-radius:50%;background:${TINT};color:${BLUE};font-weight:700;font-size:15px;align-items:center;justify-content:center;flex-shrink:0;">${initials}</div>`
      : `<div style="width:44px;height:44px;border-radius:50%;background:${TINT};color:${BLUE};font-weight:700;font-size:15px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${initials}</div>`;

    const dots = reviews.map((_, i) => `
      <button data-i="${i}" aria-label="Review ${i+1}" style="
        width:${i === currentIdx ? '22px' : '8px'};height:8px;border-radius:4px;
        background:${i === currentIdx ? BLUE : LINE};border:none;cursor:pointer;
        padding:0;transition:all .35s;"></button>`).join('');

    root.innerHTML = `
      <div style="
        background:#fff;
        border:1px solid ${LINE};
        border-radius:16px;
        padding:36px 32px 28px;
        max-width:680px;
        margin:0 auto;
        box-shadow:0 4px 20px rgba(0,71,171,0.08);
        font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
        box-sizing:border-box;
        position:relative;
      ">

        <!-- Google badge -->
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:22px;">
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#4285F4" d="M43.6 20H24v8h11.3C33.6 33.6 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.9 6.5 29.2 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/>
            <path fill="#34A853" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.9 6.5 29.2 4 24 4c-7.7 0-14.4 4.4-17.7 10.7z"/>
            <path fill="#FBBC05" d="M24 44c5.2 0 9.9-1.8 13.5-4.7l-6.2-5.2C29.5 35.6 26.9 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.6 5.1C9.5 39.5 16.3 44 24 44z"/>
            <path fill="#EA4335" d="M43.6 20H24v8h11.3c-.8 2.5-2.4 4.6-4.6 6.1l6.2 5.2C40.9 35.7 44 30.3 44 24c0-1.3-.1-2.7-.4-4z"/>
          </svg>
          <span style="font-size:12px;font-weight:700;color:${MUTE};letter-spacing:.6px;text-transform:uppercase;">Google Review</span>
          <span style="margin-left:auto;font-size:12px;color:${MUTE};">${currentIdx + 1} / ${reviews.length}</span>
        </div>

        <!-- Author row -->
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px;">
          ${avatar}
          <div>
            <div style="font-weight:700;color:${INK};font-size:15px;margin-bottom:3px;">${esc(r.author)}</div>
            <div style="display:flex;gap:2px;margin-bottom:3px;">
              ${'<span style="color:#FBBC05;font-size:16px;">★</span>'.repeat(5)}
            </div>
            <div style="font-size:12px;color:${MUTE};">${esc(r.relativeTime)}</div>
          </div>
        </div>

        <!-- Review text -->
        <p style="font-size:15px;line-height:1.65;color:${INK};margin:0 0 26px;font-weight:400;">&ldquo;${esc(r.text)}&rdquo;</p>

        <!-- Dots -->
        <div style="display:flex;justify-content:center;align-items:center;gap:6px;margin-bottom:20px;">
          ${dots}
        </div>

        <!-- Prev / Next -->
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <button id="rev-prev" style="
            background:#fff;border:1.5px solid ${LINE};color:${BLUE};
            width:38px;height:38px;border-radius:50%;font-size:18px;
            cursor:${currentIdx > 0 ? 'pointer' : 'default'};
            opacity:${currentIdx > 0 ? '1' : '0.35'};
            display:flex;align-items:center;justify-content:center;
          ">&#8592;</button>

          <button id="rev-next" style="
            background:${BLUE};border:none;color:#fff;
            width:38px;height:38px;border-radius:50%;font-size:18px;
            cursor:${currentIdx < reviews.length - 1 ? 'pointer' : 'default'};
            opacity:${currentIdx < reviews.length - 1 ? '1' : '0.35'};
            display:flex;align-items:center;justify-content:center;
          ">&#8594;</button>
        </div>

        <!-- Footer -->
        <div style="text-align:center;margin-top:18px;padding-top:14px;border-top:1px solid ${LINE};font-size:11px;color:${MUTE};">
          Verified Google reviews — 5&#9733; only, newest first
        </div>
      </div>`;

    // Wire buttons & dots
    document.getElementById('rev-prev')?.addEventListener('click', () => {
      if (currentIdx > 0) { currentIdx--; resetAuto(); render(); }
    });
    document.getElementById('rev-next')?.addEventListener('click', () => {
      if (currentIdx < reviews.length - 1) { currentIdx++; resetAuto(); render(); }
    });
    root.querySelectorAll('[data-i]').forEach(btn => {
      btn.addEventListener('click', () => {
        currentIdx = parseInt(btn.dataset.i);
        resetAuto();
        render();
      });
    });
  }

  function esc(str) {
    return String(str || '').replace(/[&<>"']/g, m =>
      ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' }[m]));
  }

  // ── Boot ─────────────────────────────────────────────────────────────────
  function boot() {
    if (!document.getElementById(TARGET_ID)) return;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fetchReviews);
    } else {
      fetchReviews();
    }
  }

  boot();
})();
