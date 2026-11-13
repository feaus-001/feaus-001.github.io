/* GitHub Pages 旧地址 → Cloudflare Pages 新地址 */
(function () {
  'use strict';
  if (location.hostname === 'feaus-001.github.io') {
    location.replace('https://xinchenshan.pages.dev' + location.pathname + location.search + location.hash);
  }
})();
