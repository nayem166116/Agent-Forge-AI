(function(){
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Footer year
  document.querySelectorAll('.js-year').forEach(function(el){ el.textContent = new Date().getFullYear(); });

  // Navbar shrink/blur on scroll
  var navEl = document.getElementById('siteNav');
  function onScroll(){
    if(!navEl) return;
    if(window.scrollY > 24){ navEl.classList.add('scrolled'); } else { navEl.classList.remove('scrolled'); }
  }
  document.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  // Mobile menu toggle (simple show/hide of links as a stacked panel)
  var menuToggle = document.querySelector('.menu-toggle');
  var navLinks = document.querySelector('nav.links');
  if(menuToggle && navLinks){
    menuToggle.addEventListener('click', function(){
      var isOpen = navLinks.classList.toggle('mobile-open');
      navLinks.style.display = isOpen ? 'flex' : '';
      navLinks.style.position = 'absolute';
      navLinks.style.top = '100%';
      navLinks.style.left = '0';
      navLinks.style.right = '0';
      navLinks.style.flexDirection = 'column';
      navLinks.style.background = 'rgba(25,25,25,0.98)';
      navLinks.style.padding = '20px 24px';
      navLinks.style.gap = '18px';
      navLinks.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
    });
  }

  // Scroll reveal via IntersectionObserver
  var revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
  if(reduceMotion){
    revealEls.forEach(function(el){ el.classList.add('is-visible'); });
  } else if(revealEls.length){
    var io = new IntersectionObserver(function(entries, obs){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, {threshold:0.2, rootMargin:'-10% 0px'});
    revealEls.forEach(function(el){ io.observe(el); });

    document.querySelectorAll('.reveal-stagger').forEach(function(group){
      Array.prototype.forEach.call(group.children, function(child, i){
        child.style.transitionDelay = (i * 90) + 'ms';
      });
    });
  }

  // Stats count-up
  // AI ambient background — neural network + particle + circuit-grid canvas
  (function initAiBackground(){
    var canvas = document.getElementById('aiCanvas');
    if(!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var W, H, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var nodes = [];
    var NODE_COUNT = 60;
    var LINK_DIST = 150;

    function resize(){
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(dpr,0,0,dpr,0,0);
    }

    function seed(){
      nodes = [];
      for(var i=0;i<NODE_COUNT;i++){
        nodes.push({
          x: Math.random()*W,
          y: Math.random()*H,
          vx: (Math.random()-0.5)*0.18,
          vy: (Math.random()-0.5)*0.18,
          r: Math.random()*1.6+0.8
        });
      }
    }

    function step(){
      ctx.clearRect(0,0,W,H);
      // update + draw links
      for(var i=0;i<nodes.length;i++){
        var n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if(n.x < 0 || n.x > W) n.vx *= -1;
        if(n.y < 0 || n.y > H) n.vy *= -1;
      }
      for(var i=0;i<nodes.length;i++){
        for(var j=i+1;j<nodes.length;j++){
          var a = nodes[i], b = nodes[j];
          var dx = a.x-b.x, dy = a.y-b.y;
          var dist = Math.sqrt(dx*dx+dy*dy);
          if(dist < LINK_DIST){
            var op = (1 - dist/LINK_DIST) * 0.16;
            ctx.strokeStyle = 'rgba(94,159,232,' + op + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      for(var i=0;i<nodes.length;i++){
        var n = nodes[i];
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(148,197,246,0.55)';
        ctx.fill();
      }
      if(!reduceMotion) requestAnimationFrame(step);
    }

    resize();
    seed();
    step();
    if(!reduceMotion){
      window.addEventListener('resize', function(){
        resize(); seed();
      });
    }
  })();

  var statEls = document.querySelectorAll('.stat-value, .sg-value');
  if(statEls.length){
    var statsObserved = false;
    var statsIo = new IntersectionObserver(function(entries, obs){
      entries.forEach(function(entry){
        if(entry.isIntersecting && !statsObserved){
          statsObserved = true;
          statEls.forEach(function(el){ animateCount(el); });
          obs.disconnect();
        }
      });
    }, {threshold:0.4});
    var statsGrid = document.getElementById('statsGrid');
    if(statsGrid) statsIo.observe(statsGrid);
  }

  function animateCount(el){
    var target = parseFloat(el.getAttribute('data-target'));
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var suffix = el.getAttribute('data-suffix') || '';
    if(reduceMotion){
      el.textContent = target.toLocaleString(undefined,{minimumFractionDigits:decimals, maximumFractionDigits:decimals}) + suffix;
      return;
    }
    var duration = 1200;
    var start = null;
    function step(ts){
      if(!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var val = target * eased;
      el.textContent = val.toLocaleString(undefined,{minimumFractionDigits:decimals, maximumFractionDigits:decimals}) + suffix;
      if(progress < 1){
        requestAnimationFrame(step);
      } else {
        el.textContent = target.toLocaleString(undefined,{minimumFractionDigits:decimals, maximumFractionDigits:decimals}) + suffix;
        el.classList.add('pulse');
        setTimeout(function(){ el.classList.remove('pulse'); }, 300);
      }
    }
    requestAnimationFrame(step);
  }

  // Hero parallax (subtle, hero-only)
  var heroMock = document.getElementById('heroMock');
  var ticking = false;
  if(!reduceMotion && heroMock){
    document.addEventListener('scroll', function(){
      if(!ticking){
        requestAnimationFrame(function(){
          var y = window.scrollY;
          var shift = Math.max(-20, Math.min(20, y * -0.06));
          if(y < 700){ heroMock.style.transform = 'translateY(' + shift + 'px)'; }
          ticking = false;
        });
        ticking = true;
      }
    }, {passive:true});
  }

  // Live demo tool
  var demoForm = document.getElementById('demoForm');
  var demoBtn = document.getElementById('demoBtn');
  var demoResultArea = document.getElementById('demoResultArea');
  var demoInput = document.getElementById('demoInput');

  var sampleResults = {
    default: {rows:[
      {label:'Anomaly Score', value:'0.14', tag:'ok', tagText:'Normal range'},
      {label:'Forecast (7d)', value:'+4.2%', tag:'ok', tagText:'Stable trend'},
      {label:'Confidence', value:'92.6%', tag:'ok', tagText:'High confidence'}
    ]},
    spike: {rows:[
      {label:'Anomaly Score', value:'0.81', tag:'warn', tagText:'3 anomalies found'},
      {label:'Forecast (7d)', value:'-6.8%', tag:'warn', tagText:'Downward pressure'},
      {label:'Confidence', value:'88.1%', tag:'ok', tagText:'High confidence'}
    ]}
  };

  function runDemo(query){
    demoBtn.classList.add('is-loading');
    demoBtn.setAttribute('disabled','true');
    demoResultArea.innerHTML = '<div class="skeleton-row w-90"></div><div class="skeleton-row w-60"></div><div class="skeleton-row w-80"></div>';

    var delay = 600 + Math.round(Math.random() * 300);
    setTimeout(function(){
      demoBtn.classList.remove('is-loading');
      demoBtn.removeAttribute('disabled');
      var key = /error|drop|fail/i.test(query) ? 'spike' : 'default';
      var data = sampleResults[key];
      var html = '<div class="result-grid" id="resultGrid">' + data.rows.map(function(r){
        return '<div class="result-kpi"><div class="rk-label">' + r.label + '</div><div class="rk-value">' + r.value + '</div><span class="rk-tag ' + r.tag + '">' + r.tagText + '</span></div>';
      }).join('') + '</div>';
      demoResultArea.innerHTML = html;
      requestAnimationFrame(function(){
        requestAnimationFrame(function(){
          var rg = document.getElementById('resultGrid');
          if(rg) rg.classList.add('show');
        });
      });
    }, delay);
  }

  if(demoForm){
    demoForm.addEventListener('submit', function(e){
      e.preventDefault();
      runDemo(demoInput.value || 'checkout_conversion_rate');
    });
  }

  // Testimonial carousel
  var slides = document.querySelectorAll('.testi-slide');
  var dots = document.querySelectorAll('#testiDots button');
  var current = 0;
  var autoTimer;
  function showSlide(i){
    slides.forEach(function(s, idx){ s.classList.toggle('active', idx === i); });
    dots.forEach(function(d, idx){ d.classList.toggle('active', idx === i); });
    current = i;
  }
  if(slides.length){
    dots.forEach(function(d){
      d.addEventListener('click', function(){
        showSlide(parseInt(d.getAttribute('data-i'), 10));
        resetAutoRotate();
      });
    });
    function resetAutoRotate(){
      clearInterval(autoTimer);
      if(!reduceMotion){
        autoTimer = setInterval(function(){ showSlide((current + 1) % slides.length); }, 5000);
      }
    }
    resetAutoRotate();
  }

  // Use-case tabs (features page)
  var usecaseTabs = document.querySelectorAll('.usecase-tab');
  if(usecaseTabs.length){
    usecaseTabs.forEach(function(tab){
      tab.addEventListener('click', function(){
        usecaseTabs.forEach(function(t){ t.classList.remove('active'); });
        document.querySelectorAll('.usecase-panel').forEach(function(p){ p.classList.remove('active'); });
        tab.classList.add('active');
        var panel = document.getElementById(tab.getAttribute('data-panel'));
        if(panel) panel.classList.add('active');
      });
    });
  }

  // FAQ accordion
  document.querySelectorAll('.faq-item').forEach(function(item){
    var q = item.querySelector('.faq-q');
    if(!q) return;
    q.addEventListener('click', function(){
      var wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function(other){ if(other !== item) other.classList.remove('open'); });
      item.classList.toggle('open', !wasOpen);
    });
  });

  // Cookie consent banner
  var cookieBanner = document.getElementById('cookieBanner');
  if(cookieBanner){
    var cookieAccept = document.getElementById('cookieAccept');
    var cookieReject = document.getElementById('cookieReject');
    var consent = localStorage.getItem('zyvenqa_cookie_consent');
    if(!consent){
      setTimeout(function(){ cookieBanner.classList.add('show'); }, 1500);
    }
    function dismissCookie(value){
      localStorage.setItem('zyvenqa_cookie_consent', value);
      cookieBanner.classList.remove('show');
    }
    if(cookieAccept) cookieAccept.addEventListener('click', function(){ dismissCookie('accepted'); });
    if(cookieReject) cookieReject.addEventListener('click', function(){ dismissCookie('rejected'); });
  }

  // Auth forms (login/signup) with realistic debounced validation + loading redirect
  function wireAuthForm(formId){
    var form = document.getElementById(formId);
    if(!form) return;
    var submitBtn = form.querySelector('button[type="submit"]');
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var valid = true;
      form.querySelectorAll('input[required]').forEach(function(input){
        var field = input.closest('.field');
        if(!input.value || (input.type === 'email' && !/^\S+@\S+\.\S+$/.test(input.value))){
          field.classList.add('error');
          valid = false;
        } else {
          field.classList.remove('error');
        }
      });
      if(!valid) return;
      submitBtn.classList.add('is-loading');
      submitBtn.setAttribute('disabled','true');
      setTimeout(function(){
        window.location.href = 'loading.html';
      }, 450 + Math.round(Math.random()*150));
    });
    form.querySelectorAll('input').forEach(function(input){
      var timer;
      input.addEventListener('input', function(){
        clearTimeout(timer);
        timer = setTimeout(function(){
          var field = input.closest('.field');
          if(input.hasAttribute('required') && input.value && !(input.type==='email' && !/^\S+@\S+\.\S+$/.test(input.value))){
            field.classList.remove('error');
          }
        }, 500);
      });
    });
  }
  wireAuthForm('loginForm');
  wireAuthForm('signupForm');

  // Post-auth loading page auto-redirect
  var loadingShell = document.getElementById('loadingRedirect');
  if(loadingShell){
    setTimeout(function(){ window.location.href = 'index.html'; }, 800);
  }
})();
