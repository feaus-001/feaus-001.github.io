/* 开场动画：红黑立绘 + 深红标题（切片错位）+ 黄色语录 */
(function () {
  'use strict';

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1) 在 iframe 里（比如编辑器预览、右键“重新加载框架”）永远不播
  try {
    if (window.self !== window.top) {
      document.documentElement.classList.add('intro-done');
      return;
    }
  } catch (error) {
    document.documentElement.classList.add('intro-done');
    return;
  }

  // 2) 同一浏览器会话只播一次；再叠一层 30 分钟冷却，防止右键新标签重播
  var SEEN_KEY = 'dsh-intro-shown';
  var AT_KEY = 'dsh-intro-at';
  var COOLDOWN = 30 * 60 * 1000;
  try {
    var lastAt = Number(window.localStorage.getItem(AT_KEY) || 0);
    if (window.sessionStorage.getItem(SEEN_KEY) === '1' || (lastAt && Date.now() - lastAt < COOLDOWN)) {
      document.documentElement.classList.add('intro-done');
      return;
    }
    window.sessionStorage.setItem(SEEN_KEY, '1');
    window.localStorage.setItem(AT_KEY, String(Date.now()));
  } catch (error) { /* 隐私模式下不可用，就每次都播 */ }

  var overlay = document.createElement('div');
  overlay.className = 'intro';
  overlay.innerHTML =
    '<div class="intro-bg"></div>' +
    '<div class="intro-tint"></div>' +
    '<div class="intro-center">' +
      '<div class="intro-title" data-text="欢迎访问心尘山终端">欢迎访问心尘山终端</div>' +
      '<div class="intro-quote">' +
        '<p class="q1">为人民服务</p>' +
        '<p class="q2">世上无难事，只要肯登攀</p>' +
      '</div>' +
    '</div>' +
    '<div class="intro-hint">点击任意处跳过</div>';

  document.body.appendChild(overlay);
  document.documentElement.classList.add('intro-active');

  var finished = false;
  function finish() {
    if (finished) return;
    finished = true;
    overlay.classList.add('is-out');
    document.documentElement.classList.remove('intro-active');
    document.documentElement.classList.add('intro-done');
    // 这一刻（点击或自动结束）算一次用户手势，顺手信任音乐播放
    try {
      if (window.__DSH_PLAY__) window.__DSH_PLAY__();
      document.dispatchEvent(new Event('dsh:intro-done'));
    } catch (error) { /* ignore */ }
    window.setTimeout(function () {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 1000);
  }

  overlay.addEventListener('click', finish);
  document.addEventListener('keydown', finish);
  window.setTimeout(finish, reduce ? 3000 : 7600);
})();
