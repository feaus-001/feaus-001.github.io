/* 开场动画：红黑立绘 + 深红标题（切片错位）+ 黄色语录 */
(function () {
  'use strict';

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 每次打开浏览器只播一次：同一标签页/新标签页跳转都不再重复
  var SEEN_KEY = 'dsh-intro-shown';
  try {
    if (window.sessionStorage.getItem(SEEN_KEY) === '1') {
      document.documentElement.classList.add('intro-done');
      return;
    }
    window.sessionStorage.setItem(SEEN_KEY, '1');
  } catch (error) { /* 隐私模式下 sessionStorage 不可用，就每次都播 */ }

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
