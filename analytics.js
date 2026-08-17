(() => {
  try {
    const params = new URLSearchParams(location.search);
    if ((params.get('src') || '').toLowerCase().trim() === 'test') {
      try { localStorage.setItem('bauprofi_owner_mode', '1'); } catch (_) {}
    }
    let ownerMode = false;
    try { ownerMode = localStorage.getItem('bauprofi_owner_mode') === '1'; } catch (_) {}

    const sessionKey = 'bauprofi_visit_tracked_v4';
    if (sessionStorage.getItem(sessionKey)) return;

    let source = (params.get('src') || '').toLowerCase().trim();
    if (ownerMode) source = 'test';
    if (!source) {
      const ref = (document.referrer || '').toLowerCase();
      if (ref.includes('google.')) source = 'google';
      else if (ref.includes('bing.')) source = 'bing';
      else if (ref.includes('eyupoezturk30-maker.github.io/bauprofi-empfehlungen')) source = 'seo';
      else if (ref.includes('linkedin.')) source = 'linkedin';
      else if (ref.includes('facebook.') || ref.includes('fb.')) source = 'facebook';
      else source = 'direct';
    }
    const allowed = new Set(['direct','google','bing','seo','whatsapp','linkedin','facebook','email','test','other']);
    if (!allowed.has(source)) source = 'other';

    // The root page has an inline click tracker using the global variable `s`.
    // Keep that tracker in test mode as well when the owner opens the shop.
    try { if (ownerMode && typeof s !== 'undefined') s = 'test'; } catch (_) {}

    fetch('https://fgcbnjdqgiobpyroizkc.supabase.co/functions/v1/track-affiliate-visit', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: location.pathname, source }), keepalive: true, mode: 'cors'
    }).then(async response => {
      const data = await response.json().catch(() => null);
      if (!response.ok || !data || data.ok !== true) throw new Error('visit tracking failed');
      sessionStorage.setItem(sessionKey, '1');
    }).catch(() => {});
  } catch (_) {}
})();
