(() => {
  const ep='https://fgcbnjdqgiobpyroizkc.supabase.co/functions/v1/track-affiliate-click';
  const params=new URLSearchParams(location.search);
  if((params.get('src')||'').toLowerCase().trim()==='test'){
    try{localStorage.setItem('bauprofi_owner_mode','1')}catch(_){}
  }
  let ownerMode=false;
  try{ownerMode=localStorage.getItem('bauprofi_owner_mode')==='1'}catch(_){}

  // Betreiber-Klicks werden gar nicht gespeichert. Die Amazon-Links selbst
  // funktionieren normal; nur unsere interne Statistik bleibt sauber.
  if(ownerMode) return;

  let source=(params.get('src')||'').toLowerCase().trim();
  if(!source){
    const ref=(document.referrer||'').toLowerCase();
    if(ref.includes('google.')) source='google';
    else if(ref.includes('bing.')) source='bing';
    else if(ref.includes('eyupoezturk30-maker.github.io/bauprofi-empfehlungen')) source='seo';
    else if(ref.includes('linkedin.')) source='linkedin';
    else if(ref.includes('facebook.')||ref.includes('fb.')) source='facebook';
    else source='direct';
  }
  const allowed=new Set(['direct','google','bing','seo','whatsapp','linkedin','facebook','email','other']);
  if(!allowed.has(source)) source='other';

  document.querySelectorAll('.affiliate[data-product]').forEach(a=>{
    a.addEventListener('click',()=>{
      fetch(ep,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({product:a.dataset.product,source}),
        keepalive:true,
        mode:'cors'
      }).catch(()=>{});
    });
  });
})();
