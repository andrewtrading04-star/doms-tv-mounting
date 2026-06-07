class BookingDemo extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.state = { step: 1, zip: '', service: 'tv', date: '', selectedFeatures: [] };
    this.denverZips = new Set(['80001','80002','80003','80004','80005','80006','80007','80010','80011','80012','80013','80014','80015','80016','80017','80018','80019','80020','80021','80022','80023','80024','80025','80026','80027','80030','80031','80033','80034','80035','80036','80037','80038','80040','80041','80042','80044','80045','80046','80047','80101','80102','80103','80104','80105','80106','80107','80108','80109','80110','80111','80112','80113','80116','80117','80118','80120','80121','80122','80123','80124','80125','80126','80127','80128','80129','80130','80134','80135','80136','80137','80138','80150','80151','80155','80160','80161','80162','80163','80165','80166','80201','80202','80203','80204','80205','80206','80207','80208','80209','80210','80211','80212','80214','80215','80216','80217','80218','80219','80220','80221','80222','80223','80224','80225','80226','80227','80228','80229','80230','80231','80232','80233','80234','80235','80236','80237','80238','80239','80240','80241','80242','80243','80244','80246','80247','80248','80249','80250','80251','80252','80256','80257','80259','80260','80261','80262','80263','80264','80265','80266','80270','80271','80273','80274','80275','80279','80280','80281','80282','80290','80291','80293','80294','80295','80299','80301','80302','80303','80304','80305','80310','80314','80401','80402','80403','80419','80465','80516','80601','80602','80603','80614','80640','80642','80643','80654']);
  }

  connectedCallback() {
    this.render();
    this.attachEventListeners();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        :host {
          --blue: #0047AB;
          --blue-dk: #003580;
          --blue-light: #5199E4;
          --tint: #EEF5FB;
          --ink: #334455;
          --mute: #777777;
          --line: #D6DEE7;
          --radius: 16px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 60px 24px;
        }

        .header {
          text-align: center;
          margin-bottom: 60px;
        }

        .header h2 {
          font-size: 42px;
          font-weight: 800;
          color: var(--ink);
          margin-bottom: 16px;
          letter-spacing: -0.5px;
        }

        .header p {
          font-size: 18px;
          color: var(--mute);
          max-width: 500px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .demo-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: center;
          margin-bottom: 40px;
        }

        .steps-sidebar {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .step-card {
          padding: 32px;
          border-radius: var(--radius);
          background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(239,245,251,0.6) 100%);
          border: 1px solid rgba(214,222,231,0.4);
          backdrop-filter: blur(10px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .step-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent 0%, rgba(0,71,171,0.05) 100%);
          pointer-events: none;
        }

        .step-card.active {
          background: linear-gradient(135deg, rgba(0,71,171,0.08) 0%, rgba(81,153,228,0.04) 100%);
          border: 1.5px solid var(--blue-light);
          box-shadow: 0 20px 40px rgba(0,71,171,0.12);
          transform: translateY(-4px);
        }

        .step-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--blue) 0%, var(--blue-light) 100%);
          color: white;
          font-size: 20px;
          font-weight: 800;
          margin-bottom: 16px;
          transition: all 0.3s ease;
        }

        .step-card.active .step-number {
          box-shadow: 0 12px 28px rgba(0,71,171,0.25);
          transform: scale(1.1);
        }

        .step-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--ink);
          margin-bottom: 8px;
        }

        .step-desc {
          font-size: 14px;
          color: var(--mute);
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .step-features {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .feature {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: var(--ink);
        }

        .feature-icon {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--tint);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--blue);
          font-weight: 700;
          flex-shrink: 0;
        }

        .demo-window {
          background: linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(239,245,251,0.4) 100%);
          border: 1px solid rgba(214,222,231,0.5);
          border-radius: var(--radius);
          backdrop-filter: blur(12px);
          overflow: hidden;
          box-shadow: 0 40px 80px rgba(0,0,0,0.12);
          display: flex;
          flex-direction: column;
          min-height: 600px;
          position: relative;
        }

        .demo-header {
          padding: 24px;
          background: linear-gradient(135deg, var(--blue) 0%, var(--blue-light) 100%);
          color: white;
          text-align: center;
          border-bottom: 1px solid rgba(0,0,0,0.08);
        }

        .demo-header h3 {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .demo-header p {
          font-size: 13px;
          opacity: 0.9;
        }

        .demo-content {
          padding: 48px 32px;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 24px;
          animation: fadeIn 0.4s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .demo-step {
          display: none;
        }

        .demo-step.active {
          display: block;
        }

        .input-group {
          display: flex;
          gap: 12px;
        }

        .input-field {
          flex: 1;
          padding: 14px 16px;
          border: 1.5px solid var(--line);
          border-radius: 10px;
          background: rgba(247,250,252,0.6);
          font-size: 15px;
          color: var(--ink);
          transition: all 0.3s ease;
        }

        .input-field:focus {
          outline: none;
          border-color: var(--blue);
          background: white;
          box-shadow: 0 4px 12px rgba(0,71,171,0.1);
        }

        .input-field::placeholder {
          color: var(--mute);
        }

        .btn-submit {
          padding: 12px 24px;
          background: linear-gradient(135deg, var(--blue) 0%, var(--blue-light) 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 16px rgba(0,71,171,0.2);
          width: fit-content;
        }

        .btn-submit:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(0,71,171,0.3);
        }

        .btn-submit:active {
          transform: translateY(0);
        }

        .question {
          background: rgba(239,245,251,0.4);
          padding: 16px;
          border-radius: 10px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1.5px solid transparent;
        }

        .question:hover {
          background: rgba(81,153,228,0.08);
          border-color: var(--blue-light);
        }

        .question.selected {
          background: rgba(0,71,171,0.08);
          border-color: var(--blue);
        }

        .checkbox {
          width: 20px;
          height: 20px;
          border: 2px solid var(--line);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .question.selected .checkbox {
          background: var(--blue);
          border-color: var(--blue);
          color: white;
        }

        .question-text {
          font-size: 14px;
          color: var(--ink);
          font-weight: 500;
        }

        .date-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
          gap: 12px;
          margin-bottom: 16px;
        }

        .date-btn {
          padding: 12px;
          background: white;
          border: 1.5px solid var(--line);
          border-radius: 10px;
          cursor: pointer;
          text-align: center;
          transition: all 0.2s ease;
          font-size: 13px;
          color: var(--ink);
          font-weight: 600;
        }

        .date-btn:hover {
          border-color: var(--blue);
          background: var(--tint);
        }

        .date-btn.selected {
          background: var(--blue);
          color: white;
          border-color: var(--blue);
          box-shadow: 0 8px 16px rgba(0,71,171,0.2);
        }

        .time-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .time-btn {
          padding: 10px;
          background: white;
          border: 1.5px solid var(--line);
          border-radius: 8px;
          cursor: pointer;
          text-align: center;
          transition: all 0.2s ease;
          font-size: 12px;
          color: var(--mute);
          font-weight: 500;
        }

        .time-btn:hover {
          border-color: var(--blue-light);
          background: var(--tint);
        }

        .time-btn.selected {
          background: var(--blue);
          color: white;
          border-color: var(--blue);
        }

        .error-msg {
          padding: 12px 16px;
          background: #FFE5E5;
          border: 1px solid #FF9999;
          border-radius: 8px;
          color: #C53030;
          font-size: 13px;
          margin-top: 12px;
        }

        .success-msg {
          padding: 16px;
          background: linear-gradient(135deg, rgba(0,71,171,0.08) 0%, rgba(81,153,228,0.04) 100%);
          border: 1px solid var(--blue-light);
          border-radius: 10px;
          color: var(--blue);
          font-size: 14px;
          font-weight: 600;
          text-align: center;
        }

        @media (max-width: 900px) {
          .demo-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .header h2 {
            font-size: 32px;
          }

          .demo-window {
            min-height: auto;
          }
        }
      </style>

      <div class="container">
        <div class="header">
          <h2>Book in 3 Simple Steps</h2>
          <p>See how fast and easy it is to schedule your TV mounting service online. No calls, no waiting—just a smooth, seamless experience.</p>
        </div>

        <div class="demo-grid">
          <div class="steps-sidebar">
            <div class="step-card active" data-step="1">
              <div class="step-number">1</div>
              <div class="step-title">Enter Your ZIP Code</div>
              <div class="step-desc">We'll check if we service your area instantly.</div>
              <div class="step-features">
                <div class="feature">
                  <div class="feature-icon">✓</div>
                  <span>Real-time availability check</span>
                </div>
                <div class="feature">
                  <div class="feature-icon">✓</div>
                  <span>Denver metro coverage</span>
                </div>
              </div>
            </div>

            <div class="step-card" data-step="2">
              <div class="step-number">2</div>
              <div class="step-title">Answer Quick Questions</div>
              <div class="step-desc">Just a few details about your TV and space.</div>
              <div class="step-features">
                <div class="feature">
                  <div class="feature-icon">✓</div>
                  <span>Takes less than 2 minutes</span>
                </div>
                <div class="feature">
                  <div class="feature-icon">✓</div>
                  <span>Instant pricing</span>
                </div>
              </div>
            </div>

            <div class="step-card" data-step="3">
              <div class="step-number">3</div>
              <div class="step-title">Pick Your Date & Time</div>
              <div class="step-desc">Choose what works best for your schedule.</div>
              <div class="step-features">
                <div class="feature">
                  <div class="feature-icon">✓</div>
                  <span>Same-day appointments available</span>
                </div>
                <div class="feature">
                  <div class="feature-icon">✓</div>
                  <span>Instant confirmation</span>
                </div>
              </div>
            </div>
          </div>

          <div class="demo-window">
            <div class="demo-header">
              <h3>Live Demo</h3>
              <p>Step ${this.state.step} of 3</p>
            </div>

            <div class="demo-content">
              <!-- Step 1: ZIP Code -->
              <div class="demo-step ${this.state.step === 1 ? 'active' : ''}">
                <h3 style="font-size: 22px; color: var(--ink); margin-bottom: 8px;">Check to see if we service your zip code</h3>
                <p style="color: var(--mute); margin-bottom: 20px; font-size: 14px;">Enter your zip code to confirm coverage</p>
                <div class="input-group">
                  <input type="text" class="input-field" id="zipInput" placeholder="ZIP Code" maxlength="5" inputmode="numeric" />
                  <button class="btn-submit" id="zipBtn">Check</button>
                </div>
                <div id="zipMsg"></div>
              </div>

              <!-- Step 2: Questions -->
              <div class="demo-step ${this.state.step === 2 ? 'active' : ''}">
                <h3 style="font-size: 22px; color: var(--ink); margin-bottom: 8px;">Tell us about your TV</h3>
                <p style="color: var(--mute); margin-bottom: 20px; font-size: 14px;">Just a few quick details</p>
                <div>
                  <div class="question ${this.state.selectedFeatures.includes('size') ? 'selected' : ''}" id="q1">
                    <div class="checkbox">✓</div>
                    <div class="question-text">TV size is 55" or larger</div>
                  </div>
                  <div class="question ${this.state.selectedFeatures.includes('wire') ? 'selected' : ''}" id="q2">
                    <div class="checkbox">✓</div>
                    <div class="question-text">Hide wires behind the wall</div>
                  </div>
                  <div class="question ${this.state.selectedFeatures.includes('mount') ? 'selected' : ''}" id="q3">
                    <div class="checkbox">✓</div>
                    <div class="question-text">Need to remove old mount</div>
                  </div>
                </div>
                <button class="btn-submit" style="margin-top: 20px;" id="nextBtn">Continue to Dates</button>
              </div>

              <!-- Step 3: Date & Time -->
              <div class="demo-step ${this.state.step === 3 ? 'active' : ''}">
                <h3 style="font-size: 22px; color: var(--ink); margin-bottom: 8px;">Pick your date and time</h3>
                <p style="color: var(--mute); margin-bottom: 20px; font-size: 14px;">Choose what works for you</p>
                <div>
                  <div style="margin-bottom: 16px; font-weight: 600; color: var(--ink); font-size: 13px;">Select a date:</div>
                  <div class="date-grid">
                    <button class="date-btn ${this.state.date === 'tomorrow' ? 'selected' : ''}" id="dateBtn1">Tomorrow</button>
                    <button class="date-btn ${this.state.date === 'thu' ? 'selected' : ''}" id="dateBtn2">Thursday</button>
                    <button class="date-btn ${this.state.date === 'fri' ? 'selected' : ''}" id="dateBtn3">Friday</button>
                    <button class="date-btn ${this.state.date === 'sat' ? 'selected' : ''}" id="dateBtn4">Saturday</button>
                  </div>
                </div>
                <div style="margin-top: 20px;">
                  <div style="margin-bottom: 12px; font-weight: 600; color: var(--ink); font-size: 13px;">Select a time:</div>
                  <div class="time-grid">
                    <button class="time-btn">8:00 AM</button>
                    <button class="time-btn">10:00 AM</button>
                    <button class="time-btn">2:00 PM</button>
                    <button class="time-btn">4:00 PM</button>
                  </div>
                </div>
                <button class="btn-submit" style="margin-top: 24px; width: 100%; background: linear-gradient(135deg, var(--blue) 0%, var(--blue-light) 100%);" id="completeBtn">Complete Booking</button>
              </div>

              <div id="completionMsg"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    const zipInput = this.shadowRoot.getElementById('zipInput');
    const zipBtn = this.shadowRoot.getElementById('zipBtn');
    const nextBtn = this.shadowRoot.getElementById('nextBtn');
    const completeBtn = this.shadowRoot.getElementById('completeBtn');
    const stepCards = this.shadowRoot.querySelectorAll('.step-card');
    const questions = this.shadowRoot.querySelectorAll('.question');
    const dateBtns = this.shadowRoot.querySelectorAll('.date-btn');

    zipBtn?.addEventListener('click', () => this.validateZip());
    zipInput?.addEventListener('keypress', (e) => e.key === 'Enter' && this.validateZip());

    nextBtn?.addEventListener('click', () => this.goToStep(3));

    completeBtn?.addEventListener('click', () => {
      this.shadowRoot.getElementById('completionMsg').innerHTML = `
        <div class="success-msg" style="margin-top: 24px;">
          ✓ Booking confirmed! Check your email for details.
        </div>
      `;
      setTimeout(() => this.goToStep(1), 3000);
    });

    stepCards.forEach(card => {
      card.addEventListener('click', () => {
        const step = parseInt(card.dataset.step);
        if (step <= this.state.step) this.goToStep(step);
      });
    });

    questions.forEach(q => {
      q.addEventListener('click', () => {
        const id = q.id;
        const feature = id === 'q1' ? 'size' : id === 'q2' ? 'wire' : 'mount';
        if (this.state.selectedFeatures.includes(feature)) {
          this.state.selectedFeatures = this.state.selectedFeatures.filter(f => f !== feature);
        } else {
          this.state.selectedFeatures.push(feature);
        }
        this.render();
        this.attachEventListeners();
      });
    });

    dateBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.state.date = btn.textContent.toLowerCase();
        this.render();
        this.attachEventListeners();
      });
    });
  }

  validateZip() {
    const input = this.shadowRoot.getElementById('zipInput');
    const msg = this.shadowRoot.getElementById('zipMsg');
    const zip = input.value.trim();

    if (!/^\d{5}$/.test(zip)) {
      msg.innerHTML = '<div class="error-msg">Please enter a valid 5-digit ZIP code</div>';
      return;
    }

    if (this.denverZips.has(zip)) {
      msg.innerHTML = '<div class="success-msg" style="margin-top: 12px;">✓ Great! We service your area.</div>';
      setTimeout(() => this.goToStep(2), 800);
    } else {
      msg.innerHTML = '<div class="error-msg">We don\'t currently service that ZIP code, but we\'re expanding soon!</div>';
    }
  }

  goToStep(step) {
    this.state.step = step;
    this.render();
    this.attachEventListeners();
  }
}

customElements.define('booking-demo', BookingDemo);
