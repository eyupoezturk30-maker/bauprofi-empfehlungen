(() => {
  try {
    const params = new URLSearchParams(location.search);
    if ((params.get('src') || '').toLowerCase().trim() === 'test') {
      try { localStorage.setItem('bauprofi_owner_mode', '1'); } catch (_) {}
    }

    let ownerMode = false;
    try { ownerMode = localStorage.getItem('bauprofi_owner_mode') === '1'; } catch (_) {}

    const sessionKey = 'bauprofi_visit_tracked_v6';
    const visitEndpoint = 'https://fgcbnjdqgiobpyroizkc.supabase.co/functions/v1/track-affiliate-visit';
    const clickEndpoint = 'https://fgcbnjdqgiobpyroizkc.supabase.co/functions/v1/track-affiliate-click';

    const getSource = () => {
      let source = (params.get('src') || '').toLowerCase().trim();
      if (!source) {
        const ref = (document.referrer || '').toLowerCase();
        if (ref.includes('google.')) source = 'google';
        else if (ref.includes('bing.')) source = 'bing';
        else if (ref.includes('eyupoezturk30-maker.github.io/bauprofi-empfehlungen')) source = 'seo';
        else if (ref.includes('linkedin.')) source = 'linkedin';
        else if (ref.includes('facebook.') || ref.includes('fb.')) source = 'facebook';
        else source = 'direct';
      }
      const allowed = new Set(['direct','google','bing','seo','whatsapp','linkedin','facebook','email','other']);
      return allowed.has(source) ? source : 'other';
    };

    const source = getSource();

    // Betreiber-Aufrufe bleiben vollständig aus der echten Statistik heraus.
    if (ownerMode) {
      try { if (typeof s !== 'undefined') s = 'owner'; } catch (_) {}
      try { sessionStorage.setItem(sessionKey, '1'); } catch (_) {}
    } else if (!sessionStorage.getItem(sessionKey)) {
      fetch(visitEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: location.pathname, source }),
        keepalive: true,
        mode: 'cors'
      }).then(async response => {
        const data = await response.json().catch(() => null);
        if (!response.ok || !data || data.ok !== true) throw new Error('visit tracking failed');
        sessionStorage.setItem(sessionKey, '1');
      }).catch(() => {});
    }

    const detectCountry = () => {
      try {
        const fromQuery = (params.get('country') || '').toUpperCase();
        if (['DE','CH','AT'].includes(fromQuery)) return fromQuery;
        const saved = localStorage.getItem('bauprofi_country');
        if (['DE','CH','AT'].includes(saved)) return saved;
      } catch (_) {}
      const lang = (navigator.language || '').toUpperCase();
      if (lang.includes('-CH')) return 'CH';
      if (lang.includes('-AT')) return 'AT';
      return 'DE';
    };

    const countryCopy = {
      DE: {
        flag: '🇩🇪', label: 'Deutschland',
        note: 'Amazon.de · Preis, Lieferbarkeit und Variante vor dem Kauf prüfen.',
        button: 'Preis & Verfügbarkeit bei Amazon prüfen →'
      },
      CH: {
        flag: '🇨🇭', label: 'Schweiz',
        note: 'Für die Schweiz: Amazon.de öffnen und Lieferbarkeit, Versand sowie mögliche Einfuhrkosten vor dem Kauf prüfen.',
        button: 'Bei Amazon.de für die Schweiz prüfen →'
      },
      AT: {
        flag: '🇦🇹', label: 'Österreich',
        note: 'Für Österreich: Amazon.de öffnen und Lieferbarkeit sowie Variante vor dem Kauf prüfen.',
        button: 'Bei Amazon.de für Österreich prüfen →'
      }
    };

    const trackTopClick = (product) => {
      if (ownerMode) return;
      const payload = JSON.stringify({ product, source });
      let sent = false;
      try {
        if (navigator.sendBeacon) sent = navigator.sendBeacon(clickEndpoint, payload);
      } catch (_) {}
      if (!sent) {
        try {
          fetch(clickEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            keepalive: true,
            mode: 'cors'
          }).catch(() => {});
        } catch (_) {}
      }
    };

    const enhance = () => {
      let country = detectCountry();

      // Browser-/Crawler-Signale präziser auf die eigentliche Kaufhilfe ausrichten.
      document.title = 'BauProfi Empfehlungen 2026 | Werkzeug, Baustelle & Kaufhilfe';
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute('content', 'BauProfi Kaufhilfe 2026 für Werkzeug, Messtechnik, Baustelle und Auto: 5 Schnell-Empfehlungen, 15 Direktprodukte, 85 Kauf-Suchen und praktische Ratgeber.');

      const style = document.createElement('style');
      style.textContent = `
        .dach-shop{background:#fff;border-bottom:1px solid #ddd;padding:11px 16px;font:14px/1.35 -apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;position:relative;z-index:28}
        .dach-shop-inner{max-width:1160px;margin:auto;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
        .dach-shop strong{font-weight:900}.dach-countries{display:flex;gap:6px;flex-wrap:wrap}.dach-country{border:1px solid #ccc;background:#fff;border-radius:999px;padding:7px 10px;font-weight:800;cursor:pointer;color:#111}.dach-country.active{background:#111;color:#fff;border-color:#111}.dach-note{width:100%;color:#555;font-size:12px}
        .buy-confidence{background:#eef7f1;border:1px solid #cce4d4;border-radius:14px;padding:13px 15px;margin:0 0 18px;font-size:13px;color:#174d35}.buy-confidence b{font-weight:900}
        .affiliate.cta,.affiliate.buy,.affiliate.big,.affiliate[class*="button"],.top5-buy{box-shadow:0 5px 16px rgba(0,0,0,.08)}
        .affiliate[data-product]{position:relative}
        .top5-zone{margin:24px 0 40px;background:#111;color:#fff;border-radius:24px;padding:22px;overflow:hidden}
        .top5-head{text-align:center;max-width:820px;margin:0 auto 18px}.top5-kicker{display:inline-block;color:#f5bd32;font-size:12px;font-weight:950;text-transform:uppercase;letter-spacing:.06em}.top5-head h2{font-size:clamp(30px,5vw,46px);line-height:1.03;margin:7px 0 10px;letter-spacing:-.035em}.top5-head p{color:#ccc;margin:0}
        .top5-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}.top5-card{background:#fff;color:#111;border-radius:16px;padding:15px;display:flex;flex-direction:column;min-height:270px}.top5-rank{font-size:11px;font-weight:950;color:#7d5b00;text-transform:uppercase;letter-spacing:.05em}.top5-card h3{font-size:18px;line-height:1.15;margin:7px 0}.top5-card p{font-size:13px;color:#606060;margin:0 0 9px}.top5-fit{font-size:12px;background:#f6f6f2;border-radius:9px;padding:9px;margin-bottom:10px}.top5-buy{display:block;margin-top:auto;background:#f5bd32;color:#111;text-decoration:none;text-align:center;border-radius:10px;padding:11px;font-weight:950;font-size:13px}.top5-guide{display:block;margin-top:8px;text-align:center;color:#555;font-size:11px;font-weight:800;text-decoration:none}.top5-guide:hover{text-decoration:underline}.top5-disclosure{font-size:11px;color:#aaa;text-align:center;margin:12px 0 0}
        .expert-box{margin:0 0 28px;background:#fff;border:1px solid #ddd;border-radius:18px;padding:17px;display:grid;grid-template-columns:auto 1fr;gap:13px;align-items:center}.expert-badge{width:48px;height:48px;border-radius:50%;background:#f5bd32;display:grid;place-items:center;font-weight:950}.expert-box b{display:block;font-size:16px}.expert-box span{display:block;color:#666;font-size:13px;margin-top:3px}
        @media(max-width:980px){.top5-grid{grid-template-columns:repeat(2,1fr)}.top5-card:last-child{grid-column:1/-1}}
        @media(max-width:820px){.dach-shop{padding:9px 12px}.dach-shop-inner{gap:8px}.dach-country{padding:7px 9px;font-size:12px}.top5-zone{padding:16px}.top5-grid{grid-template-columns:1fr}.top5-card:last-child{grid-column:auto}.top5-card{min-height:0}.expert-box{grid-template-columns:auto 1fr}}
      `;
      document.head.appendChild(style);

      const bar = document.createElement('div');
      bar.className = 'dach-shop';
      bar.innerHTML = `<div class="dach-shop-inner"><strong>🛒 Einkaufen für <span id="dach-current"></span></strong><div class="dach-countries"><button class="dach-country" data-country="DE">🇩🇪 Deutschland</button><button class="dach-country" data-country="CH">🇨🇭 Schweiz</button><button class="dach-country" data-country="AT">🇦🇹 Österreich</button></div><div class="dach-note" id="dach-note"></div></div>`;
      const top = document.querySelector('.top, header');
      if (top && top.parentNode) top.parentNode.insertBefore(bar, top.nextSibling); else document.body.prepend(bar);

      const top5 = document.createElement('section');
      top5.className = 'top5-zone';
      top5.id = 'top5';
      top5.innerHTML = `
        <div class="top5-head">
          <span class="top5-kicker">Schnell kaufen statt lange suchen</span>
          <h2>5 starke Empfehlungen für Alltag, Baustelle & Auto</h2>
          <p>Bewusst zuerst Produkte mit klarem Einsatzzweck und kurzer Kaufentscheidung. Keine erfundenen Testsieger oder Rabattversprechen.</p>
        </div>
        <div class="top5-grid">
          <article class="top5-card"><div class="top5-rank">01 · Montage</div><h3>KNIPEX Cobra 250</h3><p>Vielseitige Wasserpumpenzange für Montage, Sanitär und Werkstatt.</p><div class="top5-fit"><b>Gut passend:</b> wenn eine robuste Allround-Zange gesucht wird.</div><a class="top5-buy affiliate" data-product="top5_knipex" href="https://www.amazon.de/dp/B0001D9JAI/ref=nosim?tag=bauprofitipps-21" target="_blank" rel="nofollow sponsored noopener">Bei Amazon ansehen →</a></article>
          <article class="top5-card"><div class="top5-rank">02 · Aufmass</div><h3>Bosch Professional GLM 40-31</h3><p>Laser-Entfernungsmesser für schnelle Distanzmessungen auf der Baustelle.</p><div class="top5-fit"><b>Gut passend:</b> wenn regelmässig Längen und Distanzen erfasst werden.</div><a class="top5-buy affiliate" data-product="top5_bosch_glm" href="https://www.amazon.de/dp/B0FTLZX22W/ref=nosim?tag=bauprofitipps-21" target="_blank" rel="nofollow sponsored noopener">Bei Amazon ansehen →</a><a class="top5-guide" href="ratgeber/laser-entfernungsmesser-baustelle.html">Kaufhilfe lesen</a></article>
          <article class="top5-card"><div class="top5-rank">03 · Akku-Werkzeug</div><h3>Bosch GBH 18V-22</h3><p>18-V-SDS-plus-Bohrhammer für mobile Montage- und Bohrarbeiten.</p><div class="top5-fit"><b>Gut passend:</b> wenn kabelloses Arbeiten wichtiger ist als Dauerbetrieb am Netz.</div><a class="top5-buy affiliate" data-product="top5_bosch_gbh18v22" href="https://www.amazon.de/dp/B0CGX9L9CL/ref=nosim?tag=bauprofitipps-21" target="_blank" rel="nofollow sponsored noopener">Bei Amazon ansehen →</a><a class="top5-guide" href="ratgeber/akku-bohrhammer-kaufen.html">Kaufhilfe lesen</a></article>
          <article class="top5-card"><div class="top5-rank">04 · Pannenhilfe</div><h3>NOCO Boost GB40</h3><p>Kompakter 12-V-Starthilfe-Booster fürs Fahrzeug.</p><div class="top5-fit"><b>Gut passend:</b> wenn Starthilfe griffbereit im Auto liegen soll.</div><a class="top5-buy affiliate" data-product="top5_noco_gb40" href="https://www.amazon.de/dp/B015TKUPIC/ref=nosim?tag=bauprofitipps-21" target="_blank" rel="nofollow sponsored noopener">Bei Amazon ansehen →</a><a class="top5-guide" href="ratgeber/starthilfe-powerbank-auto.html">Kaufhilfe lesen</a></article>
          <article class="top5-card"><div class="top5-rank">05 · Reifenpflege</div><h3>Bosch EasyPump</h3><p>Akku-Luftpumpe für Reifen und unterwegs.</p><div class="top5-fit"><b>Gut passend:</b> wenn Reifendruck ohne grossen Kompressor nachgefüllt werden soll.</div><a class="top5-buy affiliate" data-product="top5_bosch_easypump" href="https://www.amazon.de/dp/B08HQHW4LS/ref=nosim?tag=bauprofitipps-21" target="_blank" rel="nofollow sponsored noopener">Bei Amazon ansehen →</a><a class="top5-guide" href="ratgeber/reifenkompressor-auto.html">Kaufhilfe lesen</a></article>
        </div>
        <p class="top5-disclosure">Anzeige / Affiliate-Links · Als Amazon-Partner verdiene ich an qualifizierten Verkäufen. Preis und Lieferbarkeit bitte bei Amazon prüfen.</p>`;

      const mainWrap = document.querySelector('main .w');
      const quickStart = document.querySelector('#schnellstart');
      if (mainWrap && quickStart) mainWrap.insertBefore(top5, quickStart);
      else if (mainWrap) mainWrap.prepend(top5);

      const expert = document.createElement('div');
      expert.className = 'expert-box';
      expert.innerHTML = '<div class="expert-badge">EO</div><div><b>Ausgewählt mit Praxisblick aus Bau- und Projektleitung</b><span>Eyüp Oeztürk · technisches Anlagen- und Rohrleitungsumfeld. Die Seite ordnet Produkte nach Einsatzzweck und Kaufkriterien; eigene Labor- oder Vergleichstests werden nicht behauptet.</span></div>';
      if (top5.parentNode) top5.insertAdjacentElement('afterend', expert);

      top5.querySelectorAll('a.affiliate[data-product]').forEach(a => {
        a.addEventListener('click', () => trackTopClick(a.dataset.product), { passive: true });
      });

      const applyCountry = (next) => {
        country = next;
        try { localStorage.setItem('bauprofi_country', country); } catch (_) {}
        const c = countryCopy[country];
        document.documentElement.lang = country === 'CH' ? 'de-CH' : country === 'AT' ? 'de-AT' : 'de-DE';
        const cur = document.getElementById('dach-current');
        const note = document.getElementById('dach-note');
        if (cur) cur.textContent = `${c.flag} ${c.label}`;
        if (note) note.textContent = c.note;
        document.querySelectorAll('.dach-country').forEach(b => b.classList.toggle('active', b.dataset.country === country));

        document.querySelectorAll('a.affiliate[href*="amazon.de"]').forEach(a => {
          if (!a.dataset.originalText) a.dataset.originalText = a.textContent.trim();
          if (a.classList.contains('cta') || a.classList.contains('top5-buy') || /amazon/i.test(a.textContent)) a.textContent = c.button;
          a.dataset.market = country;
          a.setAttribute('aria-label', `${a.dataset.product || 'Produkt'} – ${c.button}`);
          a.setAttribute('rel', 'nofollow sponsored noopener');
          a.setAttribute('target', '_blank');
        });

        const footer = document.querySelector('footer');
        if (footer) footer.dataset.country = country;
      };

      bar.querySelectorAll('.dach-country').forEach(btn => btn.addEventListener('click', () => applyCountry(btn.dataset.country)));
      applyCountry(country);

      const productHeading = document.querySelector('#produkte .head, .products .head');
      if (productHeading && !document.querySelector('.buy-confidence')) {
        const confidence = document.createElement('div');
        confidence.className = 'buy-confidence';
        confidence.innerHTML = '<b>So kaufst du sicherer:</b> Einsatz auswählen → Kompatibilität/Grösse prüfen → aktuellen Preis und Lieferbarkeit bei Amazon kontrollieren → erst dann bestellen.';
        productHeading.insertAdjacentElement('afterend', confidence);
      }

      // Interne Links behalten Quelle und Land, damit wir Traffic-Quellen besser vergleichen können.
      document.querySelectorAll('a[href]').forEach(a => {
        const href = a.getAttribute('href') || '';
        if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
        try {
          const u = new URL(href, location.href);
          if (u.origin !== location.origin) return;
          const src = (params.get('src') || '').trim();
          if (src && !u.searchParams.get('src')) u.searchParams.set('src', src);
          u.searchParams.set('country', country);
          a.href = u.href;
        } catch (_) {}
      });
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', enhance, { once: true });
    else enhance();
  } catch (_) {}
})();
