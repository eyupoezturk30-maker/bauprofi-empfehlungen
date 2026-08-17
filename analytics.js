(() => {
  try {
    const params = new URLSearchParams(location.search);
    if ((params.get('src') || '').toLowerCase().trim() === 'test') {
      try { localStorage.setItem('bauprofi_owner_mode', '1'); } catch (_) {}
    }
    let ownerMode = false;
    try { ownerMode = localStorage.getItem('bauprofi_owner_mode') === '1'; } catch (_) {}

    const sessionKey = 'bauprofi_visit_tracked_v5';

    // Betreiber-Aufrufe bleiben vollständig aus der echten Statistik heraus.
    if (ownerMode) {
      try { if (typeof s !== 'undefined') s = 'owner'; } catch (_) {}
      try { sessionStorage.setItem(sessionKey, '1'); } catch (_) {}
    } else if (!sessionStorage.getItem(sessionKey)) {
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
      if (!allowed.has(source)) source = 'other';

      fetch('https://fgcbnjdqgiobpyroizkc.supabase.co/functions/v1/track-affiliate-visit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: location.pathname, source }), keepalive: true, mode: 'cors'
      }).then(async response => {
        const data = await response.json().catch(() => null);
        if (!response.ok || !data || data.ok !== true) throw new Error('visit tracking failed');
        sessionStorage.setItem(sessionKey, '1');
      }).catch(() => {});
    }

    // DACH-Kaufoptimierung: Land sichtbar machen und Kaufweg verständlicher machen.
    const detectCountry = () => {
      try {
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

    const enhance = () => {
      let country = detectCountry();
      const style = document.createElement('style');
      style.textContent = `
        .dach-shop{background:#fff;border-bottom:1px solid #ddd;padding:11px 16px;font:14px/1.35 -apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;position:relative;z-index:28}
        .dach-shop-inner{max-width:1160px;margin:auto;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
        .dach-shop strong{font-weight:900}.dach-countries{display:flex;gap:6px;flex-wrap:wrap}.dach-country{border:1px solid #ccc;background:#fff;border-radius:999px;padding:7px 10px;font-weight:800;cursor:pointer;color:#111}.dach-country.active{background:#111;color:#fff;border-color:#111}.dach-note{width:100%;color:#555;font-size:12px}
        .buy-confidence{background:#eef7f1;border:1px solid #cce4d4;border-radius:14px;padding:13px 15px;margin:0 0 18px;font-size:13px;color:#174d35}.buy-confidence b{font-weight:900}
        .affiliate.cta,.affiliate.buy,.affiliate.big,.affiliate[class*="button"]{box-shadow:0 5px 16px rgba(0,0,0,.08)}
        .affiliate[data-product]{position:relative}
        @media(max-width:820px){.dach-shop{padding:9px 12px}.dach-shop-inner{gap:8px}.dach-country{padding:7px 9px;font-size:12px}}
      `;
      document.head.appendChild(style);

      const bar = document.createElement('div');
      bar.className = 'dach-shop';
      bar.innerHTML = `<div class="dach-shop-inner"><strong>🛒 Einkaufen für <span id="dach-current"></span></strong><div class="dach-countries"><button class="dach-country" data-country="DE">🇩🇪 Deutschland</button><button class="dach-country" data-country="CH">🇨🇭 Schweiz</button><button class="dach-country" data-country="AT">🇦🇹 Österreich</button></div><div class="dach-note" id="dach-note"></div></div>`;
      const top = document.querySelector('.top, header');
      if (top && top.parentNode) top.parentNode.insertBefore(bar, top.nextSibling); else document.body.prepend(bar);

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
          if (a.classList.contains('cta') || /amazon/i.test(a.textContent)) a.textContent = c.button;
          a.dataset.market = country;
          a.setAttribute('aria-label', `${a.dataset.product || 'Produkt'} – ${c.button}`);
        });

        const footer = document.querySelector('footer');
        if (footer) footer.dataset.country = country;
      };

      bar.querySelectorAll('.dach-country').forEach(btn => btn.addEventListener('click', () => applyCountry(btn.dataset.country)));
      applyCountry(country);

      // Vertrauenssignal direkt vor der Kaufentscheidung, ohne erfundene Preise/Rabatte.
      const productHeading = document.querySelector('#produkte .head, .products .head');
      if (productHeading && !document.querySelector('.buy-confidence')) {
        const confidence = document.createElement('div');
        confidence.className = 'buy-confidence';
        confidence.innerHTML = '<b>So kaufst du sicherer:</b> Einsatz auswählen → Kompatibilität/Grösse prüfen → aktuellen Preis und Lieferbarkeit bei Amazon kontrollieren → erst dann bestellen.';
        productHeading.insertAdjacentElement('afterend', confidence);
      }

      // Kaufbuttons einheitlich und klarer formulieren; Affiliate-Zuordnung bleibt unverändert.
      document.querySelectorAll('a.affiliate[href*="amazon.de"]').forEach(a => {
        a.setAttribute('rel', 'nofollow sponsored noopener');
        a.setAttribute('target', '_blank');
      });

      // Interne Links behalten Quelle und Land, damit der Kaufweg nicht unnötig Kontext verliert.
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
