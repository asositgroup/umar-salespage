/* ═══════════ CONFIG — dasturchi shu yerni sozlaydi ═══════════ */
var CONFIG = {
  BOT_USERNAME : 'umar_creates_minikurs_tolov_bot',
  // Klientni bot bazasiga qo'shadi va shaxsiy start-link qaytaradi: bot odamni shu link
  // orqali taniydi va to'lov xabarini yuboradi. Ai Umar creates saytidagi bilan bir xil.
  LEAD_ENDPOINT: 'https://app.webinar-payment.uz/tilda/add-client',
  LEAD_TARIF   : '45',
  LEAD_SECRET  : 'WC2Ow3dPNtNfh92',
  LEAD_TIMEOUT : 4000,          // shundan keyin oddiy bot linki bilan davom etiladi
  // Lidlar Google Sheet'ga ham yoziladi ("Lead" varag'i)
  SHEET_URL    : 'https://script.google.com/macros/s/AKfycbwDuinfVChlNUHr2aybPaSHfsJIJq4ZPh-3yyQe2nkYmppGCjx9O6qQmXCE5ctJovs/exec',
  TIMER_HOURS  : 9,
  TIMER_MINUTES: 59
};

/* ═══════════ TIMER ═══════════ */
(function(){
  var KEY='uc_deadline', DUR=(CONFIG.TIMER_HOURS*3600)+(CONFIG.TIMER_MINUTES*60);
  var end=0;
  try{ end=parseInt(localStorage.getItem(KEY)||'0',10); }catch(e){}
  if(!end||end<Date.now()){ end=Date.now()+DUR*1000; try{localStorage.setItem(KEY,end)}catch(e){} }
  var els=['barTimer','mainTimer','finalTimer'].map(function(i){return document.getElementById(i)});
  function pad(n){return n<10?'0'+n:''+n}
  function tick(){
    var s=Math.max(0,Math.floor((end-Date.now())/1000));
    var t=pad(Math.floor(s/3600))+':'+pad(Math.floor(s%3600/60))+':'+pad(s%60);
    els.forEach(function(e){if(e)e.textContent=t});
  }
  tick(); setInterval(tick,1000);
})();

/* ═══════════ MODAL ═══════════ */
var lastSrc='';
function openModal(src){
  lastSrc=src||'';
  document.getElementById('ovl').classList.add('on');
  document.body.style.overflow='hidden';
  setTimeout(function(){var n=document.getElementById('nm'); if(n&&window.innerWidth>760)n.focus();},60);
  if(window.fbq) fbq('track','InitiateCheckout');
}
function closeModal(){
  document.getElementById('ovl').classList.remove('on');
  document.body.style.overflow='';
}
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeModal()});

/* ═══════════ PHONE MASK ═══════════ */
(function(){
  var ph=document.getElementById('ph');
  ph.addEventListener('input',function(){
    var d=this.value.replace(/\D/g,'').slice(0,9), o='';
    if(d.length>0)o=d.slice(0,2);
    if(d.length>2)o+=' '+d.slice(2,5);
    if(d.length>5)o+=' '+d.slice(5,7);
    if(d.length>7)o+=' '+d.slice(7,9);
    this.value=o;
    document.getElementById('fPhone').classList.remove('bad');
  });
  document.getElementById('nm').addEventListener('input',function(){
    document.getElementById('fName').classList.remove('bad');
  });
})();

/* ═══════════ SUBMIT ═══════════ */
function submitLead(e){
  e.preventDefault();
  var nm=document.getElementById('nm').value.trim();
  var raw=document.getElementById('ph').value.replace(/\D/g,'');
  var ok=true;
  if(nm.length<2){document.getElementById('fName').classList.add('bad');ok=false}
  if(raw.length!==9){document.getElementById('fPhone').classList.add('bad');ok=false}
  if(!ok)return false;

  var btn=document.getElementById('subBtn');
  btn.disabled=true; btn.innerHTML='YUKLANMOQDA...';

  var phone='+998'+raw;
  sendToSheet(nm, phone);

  // Shaxsiy bot linkini so'raymiz. Har qanday nosozlik yoki LEAD_TIMEOUT dan keyin oddiy
  // bot linki qoladi: odam hech qachon boshi berk ko'chada qolmasligi kerak.
  var ctrl=window.AbortController?new AbortController():null;
  var timer=setTimeout(function(){ if(ctrl)ctrl.abort(); },CONFIG.LEAD_TIMEOUT);

  fetch(CONFIG.LEAD_ENDPOINT,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      name      : nm,
      phone     : phone,
      TARIF     : CONFIG.LEAD_TARIF,
      secret_key: CONFIG.LEAD_SECRET
    }),
    signal:ctrl?ctrl.signal:undefined,
    keepalive:true
  })
  .then(function(r){ return r.json(); })
  .then(function(d){
    var bot=d&&d.bot;
    if(d && d.status && bot && bot.available && bot.telegram_url) setBotLink(bot.telegram_url);
  })
  .catch(function(){})
  .then(function(){ clearTimeout(timer); showDone(); });

  return false;
}

function setBotLink(url){
  document.getElementById('tgBtn').href=url;
  document.getElementById('tgLink').textContent=url.replace(/^https?:\/\//,'');
}

function sendToSheet(name, phone){
  try{
    var d=new Date(), p=function(n){return n<10?'0'+n:''+n};
    var body=new FormData();
    body.append('sheetName','Lead');
    body.append('Ism',name);
    body.append('Telefon raqam',phone);
    body.append("Royhatdan o'tgan vaqti",
      p(d.getDate())+'.'+p(d.getMonth()+1)+'.'+d.getFullYear()+' '+p(d.getHours())+':'+p(d.getMinutes()));
    fetch(CONFIG.SHEET_URL,{method:'POST',body:body,mode:'no-cors',keepalive:true});
  }catch(e){}
}

function showDone(){
  document.getElementById('formView').style.display='none';
  document.getElementById('doneView').classList.add('on');
  if(window.fbq) fbq('track','CompleteRegistration');
}

function getCookie(n){
  var m=document.cookie.match('(^|;)\\s*'+n+'\\s*=\\s*([^;]+)');
  return m?m.pop():'';
}
function fbcFromUrl(){
  var p=new URLSearchParams(location.search).get('fbclid');
  return p?('fb.1.'+Date.now()+'.'+p):'';
}

/* ═══════════ CAROUSELS (works videos, review screenshots) ═══════════ */
(function(){
  var roots=document.querySelectorAll('.carousel');
  for(var r=0;r<roots.length;r++) wire(roots[r]);

  function wire(root){
    var track=root.querySelector('.slides');
    var prev=root.querySelector('.slides_nav--prev');
    var next=root.querySelector('.slides_nav--next');
    var slides=track.querySelectorAll('.slide');

    function centeredIndex(){
      var mid=track.getBoundingClientRect().left+track.clientWidth/2, best=0, bestD=Infinity;
      for(var i=0;i<slides.length;i++){
        var r=slides[i].getBoundingClientRect(), d=Math.abs(r.left+r.width/2-mid);
        if(d<bestD){bestD=d;best=i}
      }
      return best;
    }
    function offsetTo(i){
      var t=track.getBoundingClientRect(), s=slides[i].getBoundingClientRect();
      return s.left+s.width/2-(t.left+t.width/2);
    }
    function goTo(i){
      i=Math.max(0,Math.min(slides.length-1,i));
      track.scrollBy({left:offsetTo(i),behavior:'smooth'});
    }
    var lastActive=-1;
    function markActive(){
      var a=centeredIndex();
      if(a===lastActive)return;
      // the card that just left the centre stops playing. Only that one: a side card tapped
      // to play is still off-centre while it scrolls in and must not be paused on the way.
      if(lastActive>=0){
        var v=slides[lastActive].querySelector('video');
        if(v&&!v.paused)v.pause();
      }
      for(var i=0;i<slides.length;i++) slides[i].classList.toggle('is-active',i===a);
      lastActive=a;
    }
    // Runway: half the free space before the first card and after the last, so both can sit
    // dead centre like any other. Cards differ in width, so it is measured rather than CSS.
    // offsetWidth ignores the .88 scale on inactive cards; the track's own width never
    // changes with its padding, so the ResizeObserver below cannot loop on this.
    function runway(){
      var w=track.clientWidth;
      track.style.paddingLeft=Math.max(20,(w-slides[0].offsetWidth)/2)+'px';
      track.style.paddingRight=Math.max(20,(w-slides[slides.length-1].offsetWidth)/2)+'px';
    }
    function sync(){
      // 1px of slack: fractional scroll positions at some zoom levels never compare equal
      var max=track.scrollWidth-track.clientWidth;
      prev.disabled=track.scrollLeft<=1;
      next.disabled=track.scrollLeft>=max-1;
    }
    prev.addEventListener('click',function(){goTo(centeredIndex()-1)});
    next.addEventListener('click',function(){goTo(centeredIndex()+1)});

    // Land on the 2nd card so the first glance already shows there is more either way.
    // Wait until the track actually overflows, or there is nowhere to scroll yet.
    var booted=false;
    function boot(){
      if(booted||slides.length<2||track.scrollWidth<=track.clientWidth+1)return;
      track.scrollLeft+=offsetTo(1);
      booted=true; sync(); markActive();
    }

    // Mouse drag. Touch already pans natively; snap is off while dragging or it fights the pointer.
    var dragging=false, moved=false, startX=0, startScroll=0;
    track.addEventListener('pointerdown',function(e){
      if(e.pointerType!=='mouse'||e.button!==0)return;
      dragging=true; moved=false; startX=e.clientX; startScroll=track.scrollLeft;
    });
    track.addEventListener('pointermove',function(e){
      if(!dragging)return;
      var dx=e.clientX-startX;
      if(!moved){
        if(Math.abs(dx)<=3)return;
        // capture only once it is really a drag: capturing on pointerdown retargets the
        // click to the track, and a plain click on a play button would never reach it
        moved=true;
        track.classList.add('is-dragging'); track.setPointerCapture(e.pointerId);
      }
      track.scrollLeft=startScroll-dx;
    });
    function release(e){
      if(!dragging)return;
      dragging=false; track.classList.remove('is-dragging');
      if(track.hasPointerCapture(e.pointerId))track.releasePointerCapture(e.pointerId);
    }
    track.addEventListener('pointerup',release);
    track.addEventListener('pointercancel',release);
    // a drag that happens to end on a play button is not a click on it
    track.addEventListener('click',function(e){
      if(!moved)return;
      moved=false; e.preventDefault(); e.stopPropagation();
    },true);
    track.addEventListener('dragstart',function(e){e.preventDefault()});

    track.addEventListener('scroll',function(){sync();markActive()},{passive:true});
    window.addEventListener('resize',function(){runway();sync()});
    if(window.ResizeObserver) new ResizeObserver(function(){runway();boot();sync()}).observe(track);
    runway(); boot(); sync(); markActive();
  }
})();

/* ═══════════ VIDEOS (works carousel + course video) ═══════════ */
// Click-to-play, and only one video on the page plays at a time. Streams over HLS so a
// phone gets 360–540p instead of the 70–100 MB originals: iPhone plays HLS natively,
// elsewhere hls.js is fetched once a video nears the viewport. If HLS can't run, the
// original download.mp4 is the fallback.
(function(){
  var GUMLET='https://video.gumlet.io/';
  var COLLECTION='6a9c52e5800014611e29414b'; // default; a video can name its own in data-col
  // the full build, not hls.light: Gumlet ships audio as a separate rendition
  // (EXT-X-MEDIA TYPE=AUDIO), which light drops — the videos played silent
  var HLS_JS='https://cdnjs.cloudflare.com/ajax/libs/hls.js/1.5.20/hls.min.js';
  var videos=document.querySelectorAll('video[data-id]');
  if(!videos.length)return;
  // Native HLS only where MediaSource is missing (iPhone). Desktop Chrome answers "maybe"
  // for HLS yet fails with MEDIA_ERR_SRC_NOT_SUPPORTED (measured on Chrome 151), so
  // anything with MediaSource goes through hls.js.
  var native=!!videos[0].canPlayType('application/vnd.apple.mpegurl')&&!window.MediaSource;
  var hlsLib=null;

  function base(v){
    return GUMLET+(v.getAttribute('data-col')||COLLECTION)+'/'+v.getAttribute('data-id');
  }

  function loadHls(){
    if(!hlsLib) hlsLib=new Promise(function(res,rej){
      if(window.Hls)return res(window.Hls);
      var s=document.createElement('script');
      s.src=HLS_JS; s.async=true;
      s.onload=function(){window.Hls?res(window.Hls):rej()};
      s.onerror=rej;
      document.head.appendChild(s);
    });
    return hlsLib;
  }

  // Gives the video a source. Synchronous whenever it can be (native HLS, or hls.js already
  // loaded) so play() still runs inside the tap; returns a promise for the one slow case.
  function attach(v){
    if(v._ready)return v._ready;
    var m3u8=base(v)+'/main.m3u8';
    var t=0, resume=false;
    function fallback(){
      t=v.currentTime||0; resume=!v.paused||resume;
      if(v._hls){v._hls.destroy();v._hls=null}
      v.src=base(v)+'/download.mp4';
      v.addEventListener('loadedmetadata',function(){try{if(t)v.currentTime=t}catch(_){}},{once:true});
      if(resume)v.play().catch(function(){});
    }
    function useHls(Hls){
      if(!Hls.isSupported())return fallback();
      var h=new Hls({capLevelToPlayerSize:true});
      v._hls=h;
      h.on(Hls.Events.ERROR,function(ev,d){if(d.fatal){resume=true;fallback()}});
      h.loadSource(m3u8);
      h.attachMedia(v);
    }
    // native HLS that turns out not to work drops to the original file
    v.addEventListener('error',function(){
      if(v.currentSrc.indexOf('.m3u8')>0){resume=true;fallback()}
    });
    if(native) v.src=m3u8;
    else if(window.Hls) useHls(window.Hls);
    else { v._ready=loadHls().then(useHls,fallback); return v._ready; }
    v._ready=Promise.resolve();
    return v._ready;
  }

  function pauseOthers(v){
    var all=document.querySelectorAll('video');
    for(var j=0;j<all.length;j++) if(all[j]!==v&&!all[j].paused) all[j].pause();
  }

  function wire(v){
    var box=v.parentNode;
    var btn=box.querySelector('.slide_play,.vsl_play');
    function run(){
      var p=v.play();
      if(p&&p.catch)p.catch(function(){btn.hidden=false});
    }
    function start(){
      pauseOthers(v);
      btn.hidden=true;
      var ready=attach(v);
      // play() inside the tap whenever the source is already set, as iOS requires
      if(v._hls||v.getAttribute('src'))run();
      else ready.then(run);
    }
    btn.addEventListener('click',function(e){
      e.stopPropagation();
      var slide=v.closest('.slide'), track=v.closest('.slides');
      if(slide&&track&&!slide.classList.contains('is-active')){
        // tapping a side card brings it to the centre first
        var tb=track.getBoundingClientRect(), sb=slide.getBoundingClientRect();
        track.scrollBy({left:sb.left+sb.width/2-(tb.left+tb.width/2),behavior:'smooth'});
      }
      start();
    });
    v.addEventListener('click',function(){
      if(v.controls)return; // native controls handle their own clicks
      if(v.paused)start(); else v.pause();
    });
    // however playback starts (our button, native controls, lock screen), the rest stop
    v.addEventListener('play',function(){
      pauseOthers(v);
      v.controls=true; btn.hidden=true; box.classList.add('is-started');
    });
    v.addEventListener('pause',function(){if(!v.seeking)btn.hidden=false});
    v.addEventListener('ended',function(){v.controls=false;btn.hidden=false});
  }
  for(var i=0;i<videos.length;i++) wire(videos[i]);

  // Posters: 22 of them would cost ~450 KB before anyone scrolls there. Each group (a
  // carousel track, or a standalone video) arms once it nears the viewport; inside a track
  // only the cards within a screen of the visible ones get theirs.
  function reveal(v){
    if(v.poster)return;
    var w=v.getAttribute('data-poster-w')||(v.closest('.slide--wide')?720:480);
    v.poster=base(v)+'/thumbnail-1-0.png?w='+w+'&format=webp';
  }
  if(!window.IntersectionObserver){for(var k=0;k<videos.length;k++)reveal(videos[k]);return}

  function watch(group){
    var vids=group.tagName==='VIDEO'?[group]:group.querySelectorAll('video[data-id]');
    var near=new IntersectionObserver(function(entries){
      if(!entries[0].isIntersecting)return;
      near.disconnect();
      // fetch hls.js ahead of the first tap, so play() is not delayed past the gesture
      if(!native)loadHls().catch(function(){});
      if(group.tagName==='VIDEO'){reveal(group);return}
      var cards=new IntersectionObserver(function(es){
        es.forEach(function(en){if(en.isIntersecting){reveal(en.target);cards.unobserve(en.target)}});
      },{root:group,rootMargin:'0px 100%'});
      for(var k=0;k<vids.length;k++)cards.observe(vids[k]);
    },{rootMargin:'800px 0px'});
    near.observe(group);
    // scrolling away from the works carousel pauses it. The course video keeps talking:
    // people listen to it while they read the price.
    if(group.tagName==='VIDEO')return;
    new IntersectionObserver(function(entries){
      if(entries[0].isIntersecting)return;
      for(var k=0;k<vids.length;k++) if(!vids[k].paused) vids[k].pause();
    }).observe(group);
  }
  var tracks=document.querySelectorAll('.slides');
  for(var g=0;g<tracks.length;g++) if(tracks[g].querySelector('video[data-id]')) watch(tracks[g]);
  for(var s=0;s<videos.length;s++) if(!videos[s].closest('.slides')) watch(videos[s]);
})();

/* ═══════════ LIGHTBOX (review screenshots) ═══════════ */
(function(){
  var lb=document.getElementById('lb'); if(!lb)return;
  var big=lb.querySelector('img');
  var opens=document.querySelectorAll('.rev_open');
  function open(img){
    big.src=img.currentSrc||img.src; big.alt=img.alt;
    lb.classList.add('on'); lb.scrollTop=0;
    document.body.style.overflow='hidden';
  }
  function close(){
    lb.classList.remove('on'); big.removeAttribute('src');
    document.body.style.overflow='';
  }
  for(var i=0;i<opens.length;i++) opens[i].addEventListener('click',function(){open(this.querySelector('img'))});
  lb.addEventListener('click',close);
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&lb.classList.contains('on'))close()});
})();
