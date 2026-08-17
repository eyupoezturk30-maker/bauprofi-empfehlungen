(() => {
  const ep='https://fgcbnjdqgiobpyroizkc.supabase.co/functions/v1/track-affiliate-click';
  const params=new URLSearchParams(location.search);
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
  if(source==='test'){
    const b=document.createElement('div');
    b.className='test';
    b.textContent='🧪 Kontrollmodus aktiv – Testklicks werden getrennt ausgewertet.';
    document.body.prepend(b);
  }
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
