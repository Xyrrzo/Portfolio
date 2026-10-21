(function(){
  'use strict';
  var $  = function(s, r){ return (r||document).querySelector(s); };
  var $$ = function(s, r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine   = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var root = document.documentElement;

  /* ---------- theme toggle (remembers choice) ---------- */
  var themeBtn = $('#themeBtn');
  function syncTheme(){
    var dark = root.getAttribute('data-theme') === 'dark';
    themeBtn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  }
  syncTheme();
  themeBtn.addEventListener('click', function(){
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try{ localStorage.setItem('portfolio-theme', next); }catch(e){}
    syncTheme();
  });

  /* ---------- mobile nav ---------- */
  var navToggle = $('#navToggle'), nav = $('#nav');
  function setNav(open){
    nav.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  navToggle.addEventListener('click', function(){ setNav(!nav.classList.contains('open')); });
  $$('a', nav).forEach(function(a){ a.addEventListener('click', function(){ setNav(false); }); });

  /* ---------- scroll progress + header shadow ---------- */
  var progress = $('#progress'), header = $('.site-header'), ticking = false;
  function onScroll(){
    var max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.setProperty('--p', max > 0 ? Math.min(window.scrollY / max, 1) : 0);
    header.classList.toggle('scrolled', window.scrollY > 8);
    ticking = false;
  }
  window.addEventListener('scroll', function(){ if(!ticking){ ticking = true; requestAnimationFrame(onScroll); } }, {passive:true});
  onScroll();

  /* ---------- tech ticker: clone the track so it loops ---------- */
  var track = $('#tickerTrack');
  if(track){ $$('.ticker-item', track).forEach(function(n){ track.appendChild(n.cloneNode(true)); }); }

  /* ---------- scroll reveal with stagger ---------- */
  var groups = ['.section-head','.layer-row','.gh','.gh-stats','.subhead','.repo','.project','.filters',
                '.cert-card','.verify','.prose','.facts','.build-list li','.step','.contact .wrap > *'];
  var revealEls = [];
  groups.forEach(function(sel){ $$(sel).forEach(function(el){ el.setAttribute('data-reveal',''); revealEls.push(el); }); });
  revealEls.forEach(function(el){
    var sibs = $$(':scope > [data-reveal]', el.parentNode);
    el.style.setProperty('--d', Math.min(sibs.indexOf(el), 6) * 80 + 'ms');
  });

  var counters = $$('[data-count]');
  function fmt(n){ return n.toLocaleString('en-US'); }
  function countUp(el){
    var target = parseInt(el.getAttribute('data-count'), 10);
    if(reduce){ el.textContent = fmt(target); return; }
    var t0 = performance.now(), dur = 1500;
    (function step(now){
      var p = Math.min((now - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(target * e));
      if(p < 1) requestAnimationFrame(step);
    })(t0);
  }
  if(!reduce){ counters.forEach(function(el){ el.textContent = '0'; }); }

  function reveal(el){
    el.classList.add('is-in');
    if(el.classList.contains('gh-stats')){ $$('[data-count]', el).forEach(countUp); }
  }
  if(reduce || !('IntersectionObserver' in window)){
    revealEls.forEach(reveal);
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if(e.isIntersecting){ reveal(e.target); io.unobserve(e.target); } });
    }, {threshold:0.14, rootMargin:'0px 0px -6% 0px'});
    revealEls.forEach(function(el){ io.observe(el); });
  }

  /* ---------- nav scroll-spy + active skill layer ---------- */
  if('IntersectionObserver' in window){
    var links = $$('a', nav);
    var spy = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(!e.isIntersecting) return;
        links.forEach(function(a){ a.removeAttribute('aria-current'); });
        var l = $('a[href="#' + e.target.id + '"]', nav);
        if(l) l.setAttribute('aria-current', 'true');
      });
    }, {rootMargin:'-45% 0px -50% 0px'});
    $$('main > section[id]').forEach(function(s){ spy.observe(s); });

    var rowSpy = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ e.target.classList.toggle('is-active', e.isIntersecting); });
    }, {rootMargin:'-42% 0px -42% 0px'});
    $$('.layer-row').forEach(function(r){ rowSpy.observe(r); });
  }

  /* ---------- hero: spotlight follows the pointer, stack tilts ---------- */
  var hero = $('#hero'), stackList = $('.stack-list');
  if(hero && fine && !reduce){
    hero.addEventListener('pointermove', function(e){
      var r = hero.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      hero.style.setProperty('--mx', (x * 100) + '%');
      hero.style.setProperty('--my', (y * 100) + '%');
      stackList.style.setProperty('--ry', ((x - .5) * 10) + 'deg');
      stackList.style.setProperty('--rx', (-(y - .5) * 8) + 'deg');
    });
    hero.addEventListener('pointerleave', function(){
      stackList.style.setProperty('--ry', '0deg');
      stackList.style.setProperty('--rx', '0deg');
    });
  }

  /* ---------- certificate cards: tilt and glare ---------- */
  if(fine && !reduce){
    $$('.cert-thumb').forEach(function(t){
      t.addEventListener('pointermove', function(e){
        var r = t.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        t.style.setProperty('--ry', ((x - .5) * 9) + 'deg');
        t.style.setProperty('--rx', (-(y - .5) * 7) + 'deg');
        t.style.setProperty('--gx', (x * 100) + '%');
        t.style.setProperty('--gy', (y * 100) + '%');
      });
      t.addEventListener('pointerleave', function(){
        t.style.setProperty('--ry', '0deg');
        t.style.setProperty('--rx', '0deg');
      });
    });
  }

  /* ---------- certificate filters ---------- */
  var filterBtns = $$('.filter'), gridItems = $$('#certGrid [data-group]');
  filterBtns.forEach(function(btn){
    btn.addEventListener('click', function(){
      var g = btn.getAttribute('data-filter'), n = 0;
      filterBtns.forEach(function(b){ b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
      gridItems.forEach(function(it){
        var show = g === 'all' || it.getAttribute('data-group') === g;
        it.hidden = !show;
        if(!show) return;
        it.classList.add('is-in');
        it.classList.remove('enter');
        if(!reduce){
          void it.offsetWidth;
          it.style.setProperty('--d', (n++ * 55) + 'ms');
          it.classList.add('enter');
        }
      });
    });
  });

  /* ---------- certificate viewer: next / previous / keys / swipe ---------- */
  var box = $('#lightbox'), img = $('#lightboxImg'), lbTitle = $('#lbTitle'),
      lbMeta = $('#lbMeta'), lbCount = $('#lbCount');
  var list = [], idx = 0, lastFocus = null;

  function visibleThumbs(){ return $$('#certGrid > :not([hidden]) .cert-thumb'); }
  function show(i, dir){
    idx = (i + list.length) % list.length;
    var b = list[idx];
    img.classList.remove('swap');
    img.style.setProperty('--dir', (dir || 0) * 40 + 'px');
    img.src = b.getAttribute('data-full');
    img.alt = 'Certificate: ' + b.getAttribute('data-title');
    lbTitle.textContent = b.getAttribute('data-title');
    lbMeta.textContent  = b.getAttribute('data-meta') || '';
    lbCount.textContent = (idx + 1) + ' of ' + list.length;
    if(!reduce){ void img.offsetWidth; img.classList.add('swap'); }
    [idx + 1, idx - 1].forEach(function(j){
      var n = list[(j + list.length) % list.length];
      if(n){ (new Image()).src = n.getAttribute('data-full'); }
    });
  }
  $$('.cert-thumb[data-full]').forEach(function(b){
    b.addEventListener('click', function(){
      list = visibleThumbs();
      lastFocus = b;
      show(list.indexOf(b), 0);
      box.showModal();
    });
  });
  $('#lbPrev').addEventListener('click', function(){ show(idx - 1, -1); });
  $('#lbNext').addEventListener('click', function(){ show(idx + 1, 1); });
  box.addEventListener('keydown', function(e){
    if(e.key === 'ArrowLeft'){ e.preventDefault(); show(idx - 1, -1); }
    if(e.key === 'ArrowRight'){ e.preventDefault(); show(idx + 1, 1); }
  });
  box.addEventListener('click', function(e){ if(e.target === box) box.close(); });
  box.addEventListener('close', function(){ img.removeAttribute('src'); if(lastFocus) lastFocus.focus(); });
  var sx = null;
  box.addEventListener('touchstart', function(e){ sx = e.touches[0].clientX; }, {passive:true});
  box.addEventListener('touchend', function(e){
    if(sx === null) return;
    var dx = e.changedTouches[0].clientX - sx; sx = null;
    if(Math.abs(dx) > 50){ show(idx + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1); }
  }, {passive:true});
})();

(function(){
  var $=function(s,r){return (r||document).querySelector(s)}, $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches, fine=matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hero=$('#hero');

  /* typewriter role line */
  var typed=$('#typed'), words=['websites that feel good to use.','mobile apps in Flutter.','systems from the server up.','things I wish already existed.'];
  if(reduce){typed.textContent=words[0];}
  else{var w=0,c=0,del=false;(function tick(){var t=words[w];typed.textContent=t.slice(0,c);
    if(!del&&c===t.length){del=true;return setTimeout(tick,1700);}
    if(del&&c===0){del=false;w=(w+1)%words.length;return setTimeout(tick,350);}
    c+=del?-1:1;setTimeout(tick,del?28:60);})();}

  /* particle network in the hero */
  var cv=$('#fx');
  if(cv&&!reduce){var x=cv.getContext('2d'),P=[],W,H,run=true;
    function size(){W=cv.width=hero.clientWidth;H=cv.height=hero.clientHeight;P=[];var n=Math.min(70,Math.floor(W/18));
      for(var i=0;i<n;i++)P.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.35,vy:(Math.random()-.5)*.35});}
    size();addEventListener('resize',size);
    new IntersectionObserver(function(e){run=e[0].isIntersecting;if(run)draw();}).observe(hero);
    function draw(){if(!run)return;x.clearRect(0,0,W,H);
      for(var i=0;i<P.length;i++){var a=P[i];a.x+=a.vx;a.y+=a.vy;if(a.x<0||a.x>W)a.vx*=-1;if(a.y<0||a.y>H)a.vy*=-1;
        x.fillStyle='rgba(255,255,255,.7)';x.beginPath();x.arc(a.x,a.y,1.6,0,6.3);x.fill();
        for(var j=i+1;j<P.length;j++){var b=P[j],d=Math.hypot(a.x-b.x,a.y-b.y);
          if(d<120){x.strokeStyle='rgba(255,255,255,'+(.2*(1-d/120))+')';x.beginPath();x.moveTo(a.x,a.y);x.lineTo(b.x,b.y);x.stroke();}}}
      requestAnimationFrame(draw);}
    draw();}

  /* parallax var, back to top */
  var toTop=$('#toTop');
  addEventListener('scroll',function(){var y=scrollY;hero.style.setProperty('--sy',y);toTop.classList.toggle('show',y>700);},{passive:true});
  toTop.addEventListener('click',function(){scrollTo({top:0,behavior:reduce?'auto':'smooth'});});

  /* side dots */
  var dots=$('#dots'),secs=[['hero','Intro'],['glance','Glance'],['skills','Skills'],['work','Work'],['certs','Certificates'],['story','Story'],['contact','Contact']];
  secs.forEach(function(s){var a=document.createElement('a');a.href='#'+s[0];a.setAttribute('aria-label',s[1]);a.innerHTML='<span>'+s[1]+'</span>';dots.appendChild(a);});
  var so=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){$$('a',dots).forEach(function(a){a.classList.toggle('on',a.getAttribute('href')==='#'+e.target.id);});}});},{rootMargin:'-45% 0px -50% 0px'});
  secs.forEach(function(s){var el=document.getElementById(s[0]);if(el)so.observe(el);});

  /* glance: count up + terminal types in */
  function count(el){var t=+el.dataset.n;if(reduce){el.textContent=t;return;}var t0=performance.now();
    (function f(n){var p=Math.min((n-t0)/1400,1);el.textContent=Math.round(t*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(f);})(t0);}
  var gio=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;
    e.target.classList.add('is-live');$$('[data-n]',e.target).forEach(count);gio.unobserve(e.target);});},{threshold:.25});
  $$('.fx-rise').forEach(function(el){gio.observe(el);});
  if(reduce){$$('.tl').forEach(function(t){t.style.opacity=1;t.style.transform='none';});}

  /* pointer spotlight on cards, magnetic buttons */
  if(fine&&!reduce){
    $$('.project,.repo').forEach(function(c){c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect();
      c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px');});});
    $$('.btn').forEach(function(b){b.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect();
      b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.18)+'px,'+((e.clientY-r.top-r.height/2)*.28)+'px)';});
      b.addEventListener('pointerleave',function(){b.style.transform='';});});
  }
})();
