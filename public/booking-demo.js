/**
 * Dom's TV Mounting — "Book in 3 Simple Steps" with Interactive Preview, Pricing & Social Proof
 * Self-contained Web Component. Drop in with:
 *   <script src="https://doms-tv-mounting.vercel.app/booking-demo.js"></script>
 *   <booking-demo></booking-demo>
 *
 * Optional attribute:
 *   booking-target="#doms-widget"   // element to smooth-scroll to on "Book Now"
 */
class BookingDemo extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.state = {
      expandedStep: null,
      selectedTV: 0,
      selectedBracket: 0,
      estPrice: 0,
      bookingsCount: 3847,
      completionRate: 95,
    };
  }

  connectedCallback() {
    this.calculatePrice();
    this.render();
    this.init();
    this.fetchLiveCount();
    // The widget is transparent; the colored band around it is the host
    // page's wrapper section. Collapse its oversized vertical padding so
    // there's no dead space above/below the widget. Runs now + retries in
    // case the page builder applies its styles after we mount.
    this.trimHost();
    setTimeout(() => this.trimHost(), 350);
    setTimeout(() => this.trimHost(), 1200);
    window.addEventListener('load', () => this.trimHost());
  }

  trimHost() {
    try {
      let node = this.parentElement;
      let hops = 0;
      // Walk up a few ancestors and cap any section-sized vertical padding.
      while (node && node !== document.body && hops < 4) {
        const cs = getComputedStyle(node);
        const pt = parseFloat(cs.paddingTop) || 0;
        const pb = parseFloat(cs.paddingBottom) || 0;
        if (pt > 28) node.style.paddingTop = '16px';
        if (pb > 28) node.style.paddingBottom = '16px';
        node = node.parentElement;
        hops++;
      }
    } catch (e) { /* never let layout-trim break the widget */ }
  }

  calculatePrice() {
    // Base pricing
    const tvSizes = [95, 115, 125, 145, 180, 240];
    const brackets = [0, 50, 60, 110];
    const basePrice = tvSizes[this.state.selectedTV] + brackets[this.state.selectedBracket];
    this.state.estPrice = basePrice;
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        :host{
          --blue:#0047AB; --blue-dk:#003580; --blue-light:#5199E4; --blue-bright:#2D7FF0;
          --tint:#EEF5FB; --ink:#1B2733; --slate:#334455; --mute:#6B7785; --line:#E3E8EF;
          display:block; width:100%;
          font-family:'Inter',-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
        }

        /* ---------- Transparent section ---------- */
        .sec{
          position:relative; width:100%;
          padding:10px 24px 22px;
          background:transparent;
        }
        .wrap{position:relative;max-width:1180px;margin:0 auto;z-index:2}

        /* ---------- Social Proof Bar ---------- */
        .proof-bar{
          display:flex;align-items:center;justify-content:center;gap:84px;margin-bottom:48px;padding:0;
          flex-wrap:wrap;
        }
        .proof-item{display:flex;align-items:center;gap:16px;font-size:18px;color:#fff;font-weight:600}
        .proof-icon{display:inline-flex;align-items:center;justify-content:center;width:42px;height:42px;background:var(--blue);border-radius:50%;color:#fff;font-weight:900;font-size:20px}
        .proof-stat{color:#fff;font-weight:900;font-size:44px}

        /* ---------- Header ---------- */
        .head{text-align:center;margin-bottom:50px}
        .badge{
          display:inline-flex;align-items:center;gap:8px;
          padding:8px 16px;border-radius:999px;margin-bottom:22px;
          background:var(--tint);border:1px solid var(--blue-light);
          color:var(--blue);font-size:12.5px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;
        }
        .badge svg{width:15px;height:15px}
        .head h2{
          color:#fff;font-size:48px;line-height:1.08;font-weight:900;letter-spacing:-1px;
          margin:0 auto 18px;max-width:760px;
        }
        .head h2 .grad{color:#FFD700}
        .head p{color:#E8ECEF;font-size:18px;line-height:1.6;max-width:560px;margin:0 auto;font-weight:400}

        /* ---------- Steps row ---------- */
        .steps{display:flex;align-items:stretch;justify-content:center;gap:0;padding-top:24px;position:relative}
        .step{position:relative;flex:1 1 0;max-width:360px;display:flex}
        .bignum{
          position:absolute;top:-58px;left:50%;transform:translateX(-50%);
          font-size:150px;font-weight:900;line-height:1;color:rgba(0,71,171,0.08);
          z-index:0;pointer-events:none;user-select:none;letter-spacing:-4px;
        }

        .card{
          position:relative;z-index:1;width:100%;display:flex;flex-direction:column;
          background:#fff;border-radius:22px;padding:30px 26px 26px;
          box-shadow:0 12px 28px rgba(0,0,0,0.08);
          border:1px solid var(--line);
          transition:all .35s cubic-bezier(.4,0,.2,1);
          cursor:pointer;
        }
        .card:hover{transform:translateY(-8px);box-shadow:0 24px 48px rgba(0,0,0,0.14);border-color:var(--blue-light)}
        .card.expanded{
          box-shadow:0 40px 80px rgba(0,71,171,0.2);border-color:var(--blue);
          background:linear-gradient(180deg,#fff 0%,var(--tint) 100%);
        }

        .ico{
          width:54px;height:54px;border-radius:15px;display:flex;align-items:center;justify-content:center;
          background:linear-gradient(135deg,var(--blue) 0%,var(--blue-light) 100%);
          box-shadow:0 12px 24px rgba(0,71,171,0.32);margin-bottom:18px;
          transition:transform .25s ease;
        }
        .card:hover .ico{transform:scale(1.08)}
        .ico svg{width:27px;height:27px;color:#fff}
        .slabel{font-size:12px;font-weight:800;letter-spacing:1.4px;text-transform:uppercase;color:var(--blue);margin-bottom:7px}
        .card h3{font-size:21px;font-weight:800;color:var(--ink);margin-bottom:8px;line-height:1.25}
        .card>p{font-size:14.5px;color:var(--mute);line-height:1.55;margin-bottom:18px}

        .benefits{list-style:none;display:flex;flex-direction:column;gap:11px;margin-bottom:22px}
        .benefits li{display:flex;align-items:center;gap:10px;font-size:13.5px;color:var(--slate);font-weight:500}
        .tick{
          width:20px;height:20px;border-radius:50%;flex-shrink:0;
          background:linear-gradient(135deg,var(--blue) 0%,var(--blue-light) 100%);
          display:flex;align-items:center;justify-content:center;box-shadow:0 4px 8px rgba(0,71,171,0.25)
        }
        .tick svg{width:11px;height:11px;color:#fff}

        /* ---------- Mini preview ---------- */
        .mini{
          margin-top:auto;background:linear-gradient(180deg,#F7FAFD 0%,#EEF5FB 100%);
          border:1px solid var(--line);border-radius:14px;padding:14px;
          transition:all .25s ease;opacity:0.8;
        }
        .card:hover .mini{opacity:1;border-color:var(--blue-light)}
        .m-h{font-size:13px;font-weight:800;color:var(--ink);margin-bottom:11px;text-align:center}
        .m-zip{display:flex;align-items:stretch;background:#fff;border:1.6px solid var(--blue);border-radius:10px;overflow:hidden}
        .m-pin{display:flex;align-items:center;padding:0 4px 0 10px}
        .m-pin svg{width:15px;height:15px;color:var(--blue)}
        .m-input{flex:1;display:flex;align-items:center;padding:9px 6px;font-size:13px;color:#9AA7B4}
        .m-go{width:34px;background:var(--blue);display:flex;align-items:center;justify-content:center;cursor:pointer}
        .m-go svg{width:15px;height:15px;color:#fff}
        .m-ok{
          margin-top:9px;display:flex;align-items:center;justify-content:center;gap:6px;
          background:#E2F0FB;border:1px solid var(--blue-light);border-radius:8px;padding:7px;
          font-size:12px;font-weight:700;color:var(--blue-dk)
        }
        .m-ok svg{width:12px;height:12px}
        .m-row{display:flex;align-items:center;justify-content:space-between;background:#fff;border:1.5px solid var(--line);border-radius:9px;padding:9px 11px;margin-bottom:8px;font-size:12.5px;color:var(--slate);font-weight:600}
        .m-row:last-child{margin-bottom:0}
        .m-row.sel{background:var(--tint);border-color:var(--blue)}
        .m-qty{display:inline-flex;align-items:center;gap:8px;color:var(--blue);font-weight:800}
        .m-qty b{display:inline-flex;width:20px;height:20px;border-radius:5px;background:var(--tint);align-items:center;justify-content:center;font-size:13px;border:1px solid var(--line)}
        .m-dates{display:flex;gap:7px;margin-bottom:10px}
        .m-d{flex:1;text-align:center;background:#fff;border:1.5px solid var(--line);border-radius:8px;padding:7px 0;font-size:12px;font-weight:700;color:var(--slate)}
        .m-d.sel{background:var(--blue);border-color:var(--blue);color:#fff;box-shadow:0 6px 12px rgba(0,71,171,0.25)}
        .m-times{display:flex;gap:7px}
        .m-t{flex:1;text-align:center;background:#fff;border:1.5px solid var(--line);border-radius:8px;padding:7px 0;font-size:11.5px;font-weight:600;color:var(--mute)}
        .m-t.sel{background:var(--blue);border-color:var(--blue);color:#fff}

        /* ---------- Arrows ---------- */
        .arrow{flex:0 0 auto;align-self:center;display:flex;align-items:center;justify-content:center;padding:0 6px;color:#7DB4FF;z-index:3}
        .arrow svg{width:30px;height:30px;animation:slide 1.6s ease-in-out infinite;filter:drop-shadow(0 2px 6px rgba(125,180,255,0.5))}
        .arrow svg:nth-child(2){animation-delay:.2s;opacity:.55;margin-left:-14px}
        @keyframes slide{0%,100%{transform:translateX(-3px)}50%{transform:translateX(4px)}}

        /* ---------- CTA ---------- */
        .cta-wrap{text-align:center;margin-top:56px}
        .cta{
          display:inline-flex;align-items:center;gap:10px;cursor:pointer;border:none;
          padding:17px 38px;border-radius:14px;font-family:inherit;font-size:17px;font-weight:800;color:#fff;
          background:linear-gradient(135deg,var(--blue-bright) 0%,var(--blue-light) 100%);
          box-shadow:0 16px 34px rgba(45,127,240,0.45);
          transition:transform .25s ease,box-shadow .25s ease;
        }
        .cta:hover{transform:translateY(-3px) scale(1.015);box-shadow:0 22px 46px rgba(45,127,240,0.6)}
        .cta:active{transform:translateY(0)}
        .cta svg{width:19px;height:19px;transition:transform .25s ease}
        .cta:hover svg{transform:translateX(4px)}
        .cta-sub{margin-top:16px;color:#fff;font-size:13.5px;font-weight:500}

        /* ---------- Reveal ---------- */
        .reveal{opacity:0;transform:translateY(26px);transition:opacity .7s ease,transform .7s cubic-bezier(.2,.7,.2,1)}
        .reveal.in{opacity:1;transform:none}

        /* ---------- Responsive ---------- */
        @media(max-width:920px){
          .sec{padding:8px 18px 18px}
          .price-badge{position:static;margin-bottom:24px;text-align:center}
          .head h2{font-size:34px}
          .head p{font-size:16px}
          .steps{flex-direction:column;align-items:center;gap:0;padding-top:48px}
          .step{max-width:460px;width:100%}
          .bignum{font-size:120px;top:-46px}
          .arrow{padding:10px 0}
          .arrow svg{transform:rotate(90deg);animation:slidev 1.6s ease-in-out infinite}
          .arrow svg:nth-child(2){margin-left:0;margin-top:-14px}
          @keyframes slidev{0%,100%{transform:rotate(90deg) translateX(-3px)}50%{transform:rotate(90deg) translateX(4px)}}
        }
        @media(max-width:420px){ .head h2{font-size:28px} }
      </style>

      <div class="sec">

        <div class="wrap">

          <div class="proof-bar reveal">
            <div class="proof-item">
              <span class="proof-icon">✓</span>
              <span><span class="proof-stat" id="bookingCount">${this.state.bookingsCount}</span> Real customer bookings</span>
            </div>
          </div>

          <div class="head reveal">
            <span class="badge">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12z"/></svg>
              Easy Booking Process
            </span>
            <h2>Book Your TV Mounting in <span class="grad">3 Simple Steps</span></h2>
            <p>No phone tag. No waiting. Get your TV mounted on your schedule, booked online in under two minutes.</p>
          </div>

          <div class="steps">

            <!-- STEP 1 -->
            <div class="step reveal">
              <div class="bignum">1</div>
              <div class="card" data-step="1">
                <div class="ico">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>
                </div>
                <div class="slabel">Step 1</div>
                <h3>Enter Your ZIP Code</h3>
                <p>Confirm we serve your area — instantly, before anything else.</p>
                <ul class="benefits">
                  <li><span class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>Real-time coverage check</li>
                  <li><span class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>All of the Denver metro</li>
                </ul>
                <div class="mini">
                  <div class="m-h">Do we service your area?</div>
                  <div class="m-zip">
                    <span class="m-pin"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg></span>
                    <span class="m-input">ZIP Code</span>
                    <span class="m-go"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></span>
                  </div>
                  <div class="m-ok"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>We service your area!</div>
                </div>
              </div>
            </div>

            <div class="arrow reveal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </div>

            <!-- STEP 2 -->
            <div class="step reveal">
              <div class="bignum">2</div>
              <div class="card" data-step="2">
                <div class="ico">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12l2 2 4-4"/></svg>
                </div>
                <div class="slabel">Step 2</div>
                <h3>Answer a Few Questions</h3>
                <p>Tell us about your TV and wall — pricing updates as you go.</p>
                <ul class="benefits">
                  <li><span class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>Takes less than 2 minutes</li>
                  <li><span class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>Live pricing updates</li>
                </ul>
                <div class="mini">
                  <div class="m-h">What size is your TV?</div>
                  <div class="m-row"><span>33"–59"</span><span class="m-qty">− <b>0</b> +</span></div>
                  <div class="m-row sel"><span>60"–69"</span><span class="m-qty">− <b>1</b> +</span></div>
                </div>
              </div>
            </div>

            <div class="arrow reveal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </div>

            <!-- STEP 3 -->
            <div class="step reveal">
              <div class="bignum">3</div>
              <div class="card" data-step="3">
                <div class="ico">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="m9 16 2 2 4-4"/></svg>
                </div>
                <div class="slabel">Step 3</div>
                <h3>Pick a Date &amp; Time</h3>
                <p>Choose a slot that works for you and lock it in instantly.</p>
                <ul class="benefits">
                  <li><span class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>Same-day slots available</li>
                  <li><span class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>Instant confirmation</li>
                </ul>
                <div class="mini">
                  <div class="m-h">Pick a date &amp; time</div>
                  <div class="m-dates"><span class="m-d">Fri</span><span class="m-d sel">Sat</span><span class="m-d">Mon</span></div>
                  <div class="m-times"><span class="m-t sel">8–10 AM</span><span class="m-t">11–1 PM</span></div>
                </div>
              </div>
            </div>

          </div>

          <div class="cta-wrap reveal">
            <button class="cta" id="ctaBtn">
              Book Your TV Mounting Now
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
            <div class="cta-sub">Takes under 2 minutes &nbsp;•&nbsp; No obligation &nbsp;•&nbsp; Instant confirmation</div>
          </div>

        </div>
      </div>
    `;
  }

  init() {
    // Staggered scroll-reveal
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    this.shadowRoot.querySelectorAll('.reveal').forEach((el, i) => {
      el.style.transitionDelay = (i * 0.09) + 's';
      io.observe(el);
    });

    // Interactive card previews
    this.shadowRoot.querySelectorAll('.card').forEach((card) => {
      card.addEventListener('click', (e) => {
        e.stopPropagation();
        const step = card.dataset.step;
        const wasExpanded = this.state.expandedStep === step;
        this.state.expandedStep = wasExpanded ? null : step;
        this.updateCardStates();
      });
    });

    // "Book Now" CTA
    const cta = this.shadowRoot.getElementById('ctaBtn');
    cta && cta.addEventListener('click', () => this.book());
  }

  updateCardStates() {
    this.shadowRoot.querySelectorAll('.card').forEach((card) => {
      if (card.dataset.step === String(this.state.expandedStep)) {
        card.classList.add('expanded');
      } else {
        card.classList.remove('expanded');
      }
    });
  }

  updatePrice() {
    const priceEl = this.shadowRoot.getElementById('priceNum');
    if (priceEl) priceEl.textContent = this.state.estPrice;
  }

  fetchLiveCount() {
    try {
      fetch('https://doms-tv-mounting.vercel.app/api/stats', { cache: 'no-store' })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d && typeof d.count === 'number' && d.count > 0) {
            const el = this.shadowRoot.getElementById('bookingCount');
            if (el) el.textContent = String(d.count);
          }
        })
        .catch(() => {});
    } catch (e) { /* keep static seed */ }
  }

  book() {
    window.location.href = '/book';
  }
}

customElements.define('booking-demo', BookingDemo);
