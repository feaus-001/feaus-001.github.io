/* 开场动画：像素字标题 + 礼花，然后淡出显示主站 */
(function () {
  'use strict';

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var overlay = document.createElement('div');
  overlay.className = 'intro';
  overlay.innerHTML =
    '<canvas class="intro-canvas"></canvas>' +
    '<img class="intro-title" src="assets/splash-title.png" alt="欢迎访问心尘山终端">';
  document.body.appendChild(overlay);
  document.documentElement.classList.add('intro-active');

  var canvas = overlay.querySelector('.intro-canvas');
  var ctx = canvas.getContext('2d');
  var particles = [];
  var active = true;
  var width = 0;
  var height = 0;
  var colors = ['#ff6b6b', '#ffd93d', '#4d96ff', '#6bcb77', '#b06bff', '#ff6bd6'];
  var rafId = 0;
  var burstTimer = 0;

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

  function burst(x, y) {
    var count = 34;
    for (var i = 0; i < count; i++) {
      var angle = (Math.PI * 2 * i) / count + Math.random() * 0.2;
      var speed = 2 + Math.random() * 4.5;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.012 + Math.random() * 0.01,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 1.6 + Math.random() * 2,
      });
    }
  }

  function frame() {
    if (!active) return;
    ctx.clearRect(0, 0, width, height);
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.045;
      p.vx *= 0.992;
      p.life -= p.decay;
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;
    rafId = window.requestAnimationFrame(frame);
  }

  function startBursts() {
    if (reduce) return;
    burst(width * (0.3 + Math.random() * 0.4), height * (0.25 + Math.random() * 0.3));
    burstTimer = window.setInterval(function () {
      burst(width * (0.15 + Math.random() * 0.7), height * (0.15 + Math.random() * 0.4));
    }, 750);
  }

  function finish() {
    if (!active) return;
    active = false;
    window.clearInterval(burstTimer);
    window.cancelAnimationFrame(rafId);
    overlay.classList.add('is-out');
    document.documentElement.classList.remove('intro-active');
    document.documentElement.classList.add('intro-done');
    window.setTimeout(function () {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 900);
  }

  resize();
  startBursts();
  rafId = window.requestAnimationFrame(frame);
  window.addEventListener('resize', resize);
  overlay.addEventListener('click', finish);
  document.addEventListener('keydown', finish);
  window.setTimeout(finish, reduce ? 1400 : 3800);
})();
