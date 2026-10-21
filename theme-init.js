  document.documentElement.classList.add('js');
  /* set the theme before first paint so there is no flash */
  (function(){
    try{
      var t = localStorage.getItem('portfolio-theme');
      if(!t){ t = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light'; }
      document.documentElement.setAttribute('data-theme', t);
    }catch(e){}
  })();
