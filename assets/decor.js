/* 站点装饰：流星、季节/节日特效、阅读进度、回到顶部、日历、特效开关。 */
(function () {
  'use strict';

  var site = (window.BLOG && window.BLOG.site) || {};
  var config = site.decor || {};
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var features = {
    meteors: config.meteors !== false,
    seasons: config.seasons !== false,
    progress: config.progress !== false,
    backToTop: config.backToTop !== false,
    calendar: config.calendar !== false,
  };

  var FESTIVALS = {
    '01-01': { name: '元旦快乐', effect: 'confetti', colors: ['#ff6b6b', '#ffd93d', '#4d96ff', '#6bcb77'] },
    '02-14': { name: '情人节快乐', effect: 'hearts', colors: ['#ff6b9d', '#ff8fab', '#ffc2d4'] },
    '05-01': { name: '劳动节快乐', effect: 'confetti', colors: ['#ff9f43', '#feca57', '#ff6b6b'] },
    '06-01': { name: '儿童节快乐', effect: 'confetti', colors: ['#4d96ff', '#6bcb77', '#ffd93d', '#ff6b9d'] },
    '10-01': { name: '国庆快乐', effect: 'confetti', colors: ['#ff3b30', '#ffd60a', '#ff9f0a'] },
    '12-24': { name: '平安夜', effect: 'snow', colors: ['#ffffff', '#cfe8ff'] },
    '12-25': { name: '圣诞快乐', effect: 'snow', colors: ['#ffffff', '#ff6b6b', '#6bcb77'] },
    '2026-02-17': { name: '春节快乐', effect: 'confetti', colors: ['#ff3b30', '#ffd60a', '#ff9f0a'] },
    '2027-02-06': { name: '春节快乐', effect: 'confetti', colors: ['#ff3b30', '#ffd60a', '#ff9f0a'] },
    '2028-01-26': { name: '春节快乐', effect: 'confetti', colors: ['#ff3b30', '#ffd60a', '#ff9f0a'] },
    '2026-09-25': { name: '中秋快乐', effect: 'fireflies', colors: ['#fff3c4', '#ffe08a'] },
    '2027-09-15': { name: '中秋快乐', effect: 'fireflies', colors: ['#fff3c4', '#ffe08a'] },
  };

  function pad(value) {
    return value < 10 ? '0' + value : String(value);
  }

  function dayKey(date) {
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
  }

  function seasonFor(month) {
    if (month >= 2 && month <= 4) return 'sakura';
    if (month >= 5 && month <= 7) return 'fireflies';
    if (month >= 8 && month <= 10) return 'leaves';
    return 'snow';
  }

  var now = new Date();
  var festival = FESTIVALS[dayKey(now)] || FESTIVALS[pad(now.getMonth() + 1) + '-' + pad(now.getDate())];
  var effect = festival ? festival.effect : (features.seasons && !reduceMotion ? seasonFor(now.getMonth()) : null);

  var palette = {
    snow: ['#ffffff', '#e6f0ff'],
    sakura: ['#ffb7d5', '#ff8fc0', '#ffd6e8'],
    leaves: ['#e07b39', '#c05a2a', '#f0a55a'],
    fireflies: ['#fff3c4', '#ffe08a'],
    confetti: ['#ff6b6b', '#ffd93d', '#4d96ff', '#6bcb77', '#b06bff'],
    hearts: ['#ff6b9d', '#ff8fab'],
  };

  // ---------------- 画布：流星 + 季节粒子 ----------------
  function startCanvas() {
    var canvas = document.createElement('canvas');
    canvas.className = 'decor-canvas';
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    var width = 0;
    var height = 0;
    var particles = [];
    var meteors = [];
    var running = true;

    function resize() {
      var ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function seed() {
      var count = width < 720 ? 16 : 34;
      particles = [];
      if (!effect) return;
      var colors = (festival && festival.colors) || palette[effect] || ['#ffffff'];
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: 1.5 + Math.random() * 2.5,
          speed: 0.3 + Math.random() * 0.9,
          drift: (Math.random() - 0.5) * 0.6,
          angle: Math.random() * Math.PI * 2,
          spin: (Math.random() - 0.5) * 0.02,
          color: colors[Math.floor(Math.random() * colors.length)],
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    function spawnMeteor() {
      if (meteors.length > 2 || reduceMotion) return;
      meteors.push({
        x: Math.random() * width * 0.8,
        y: Math.random() * height * 0.35,
        len: 90 + Math.random() * 120,
        speed: 4 + Math.random() * 4,
        life: 1,
      });
    }

    function drawParticle(p) {
      if (effect === 'hearts') {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.75;
        ctx.font = p.size * 6 + 'px serif';
        ctx.fillText('♥', p.x, p.y);
        ctx.globalAlpha = 1;
        return;
      }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = effect === 'fireflies' ? 0.55 + 0.35 * Math.sin(p.phase) : 0.8;
      if (effect === 'snow' || effect === 'fireflies') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.size, -p.size * 0.6, p.size * 2, p.size * 1.2);
      }
      ctx.restore();
      ctx.globalAlpha = 1;
    }

    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        if (effect === 'fireflies') {
          p.phase += 0.03;
          p.x += Math.sin(p.phase) * 0.35;
          p.y += Math.cos(p.phase * 0.7) * 0.35;
        } else {
          p.y += p.speed;
          p.x += p.drift + Math.sin(p.phase += 0.01) * 0.3;
          p.angle += p.spin;
          if (p.y > height + 20) { p.y = -20; p.x = Math.random() * width; }
          if (p.x < -20) p.x = width + 20;
          if (p.x > width + 20) p.x = -20;
        }
        drawParticle(p);
      }

      for (var j = meteors.length - 1; j >= 0; j--) {
        var m = meteors[j];
        m.x += m.speed;
        m.y += m.speed * 0.55;
        m.life -= 0.008;
        if (m.life <= 0) {
          meteors.splice(j, 1);
          continue;
        }
        var gradient = ctx.createLinearGradient(m.x, m.y, m.x - m.len, m.y - m.len * 0.55);
        gradient.addColorStop(0, 'rgba(255,255,255,' + (0.9 * m.life) + ')');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - m.len, m.y - m.len * 0.55);
        ctx.stroke();
      }

      if (features.meteors && Math.random() < 0.006) spawnMeteor();
      window.requestAnimationFrame(frame);
    }

    resize();
    seed();
    window.addEventListener('resize', function () {
      resize();
      seed();
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        running = false;
      } else if (!running) {
        running = true;
        window.requestAnimationFrame(frame);
      }
    });
    window.requestAnimationFrame(frame);
  }

  // ---------------- 阅读进度 ----------------
  function setupProgress() {
    var bar = document.createElement('div');
    bar.className = 'decor-progress';
    document.body.appendChild(bar);
    function update() {
      var scrollable = document.documentElement.scrollHeight - window.innerHeight;
      var percent = scrollable > 0 ? Math.min(100, (window.scrollY / scrollable) * 100) : 0;
      bar.style.width = percent + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  // ---------------- 回到顶部 ----------------
  function setupBackToTop() {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'decor-top';
    button.textContent = '↑';
    button.setAttribute('aria-label', '回到顶部');
    document.body.appendChild(button);
    window.addEventListener('scroll', function () {
      button.setAttribute('data-show', window.scrollY > 480 ? '1' : '0');
    }, { passive: true });
    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  // ---------------- 日历 ----------------
  function setupCalendar() {
    var nav = document.querySelector('.site-nav');
    if (!nav) return;
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'nav-link decor-calendar-btn';
    button.setAttribute('aria-label', '日历');
    button.title = '日历';
    button.textContent = '📅';
    nav.insertBefore(button, nav.firstChild);

    var byDate = {};
    (window.BLOG.posts || []).forEach(function (post) {
      if (!post.date) return;
      (byDate[post.date] = byDate[post.date] || []).push(post);
    });

    var panel = document.createElement('div');
    panel.className = 'decor-calendar';
    panel.hidden = true;
    panel.innerHTML =
      '<header><button type="button" class="decor-cal-prev" aria-label="上个月">‹</button>' +
      '<span class="decor-cal-title"></span>' +
      '<button type="button" class="decor-cal-next" aria-label="下个月">›</button>' +
      '<button type="button" class="decor-cal-close" aria-label="关闭">×</button></header>' +
      '<div class="decor-cal-week"><span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span></div>' +
      '<div class="decor-cal-grid"></div>';
    document.body.appendChild(panel);

    var offset = 0;
    var title = panel.querySelector('.decor-cal-title');
    var grid = panel.querySelector('.decor-cal-grid');
    var today = new Date();
    today.setHours(0, 0, 0, 0);

    function render() {
      var base = new Date(today.getFullYear(), today.getMonth() + offset, 1);
      title.textContent = base.getFullYear() + ' 年 ' + (base.getMonth() + 1) + ' 月';
      grid.innerHTML = '';
      var firstWeekday = new Date(base.getFullYear(), base.getMonth(), 1).getDay();
      var days = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
      for (var i = 0; i < firstWeekday; i++) {
        grid.appendChild(document.createElement('span'));
      }
      for (var d = 1; d <= days; d++) {
        var date = new Date(base.getFullYear(), base.getMonth(), d);
        var key = dayKey(date);
        var cell = document.createElement(byDate[key] ? 'button' : 'span');
        cell.className = 'decor-cal-day';
        cell.textContent = String(d);
        if (byDate[key]) cell.classList.add('has-post');
        if (key === dayKey(today)) cell.classList.add('is-today');
        if (cell.tagName === 'BUTTON') {
          cell.type = 'button';
          cell.title = byDate[key].map(function (post) { return post.title; }).join(' / ');
          cell.addEventListener('click', function (slug) {
            return function () {
              location.hash = '#/post/' + encodeURIComponent(slug);
              panel.hidden = true;
            };
          }(byDate[key][0].slug));
        }
        grid.appendChild(cell);
      }
    }

    button.addEventListener('click', function () {
      panel.hidden = !panel.hidden;
      if (!panel.hidden) render();
    });
    panel.querySelector('.decor-cal-prev').addEventListener('click', function () {
      offset -= 1;
      render();
    });
    panel.querySelector('.decor-cal-next').addEventListener('click', function () {
      offset += 1;
      render();
    });
    panel.querySelector('.decor-cal-close').addEventListener('click', function () {
      panel.hidden = true;
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') panel.hidden = true;
    });
  }

  // ---------------- 节日横幅 ----------------
  function setupFestival() {
    if (!festival) return;
    var chip = document.createElement('div');
    chip.className = 'decor-festival';
    chip.textContent = '🎉 ' + festival.name;
    document.body.appendChild(chip);
    setTimeout(function () { chip.classList.add('is-out'); }, 8000);
  }

  // ---------------- 特效开关 ----------------
  function setupToggle() {
    var nav = document.querySelector('.site-nav');
    if (!nav) return;
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'nav-link decor-toggle';
    button.setAttribute('aria-label', '开关背景特效');
    button.title = '开关背景特效';
    button.textContent = '✨';
    nav.appendChild(button);

    var stored = null;
    try { stored = localStorage.getItem('blog-decor-particles'); } catch (error) { /* ignore */ }
    var on = stored !== 'off';
    function apply() {
      document.documentElement.classList.toggle('decor-particles-off', !on);
      button.setAttribute('aria-pressed', String(on));
      try { localStorage.setItem('blog-decor-particles', on ? 'on' : 'off'); } catch (error) { /* ignore */ }
    }
    button.addEventListener('click', function () {
      on = !on;
      apply();
    });
    apply();
  }

  // ---------------- 启动 ----------------
  if ((features.meteors || effect) && !reduceMotion) startCanvas();
  if (features.progress) setupProgress();
  if (features.backToTop) setupBackToTop();
  if (features.calendar) setupCalendar();
  setupToggle();
  setupFestival();
})();
