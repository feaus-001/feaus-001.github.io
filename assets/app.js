(function () {
  'use strict';

  var site = window.BLOG.site;
  var posts = window.BLOG.posts.slice().sort(function (a, b) {
    return b.date.localeCompare(a.date);
  });

  var app = document.getElementById('app');
  var themeButton = document.getElementById('theme-toggle');

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }

  function inline(text) {
    var codes = [];
    var out = text.replace(/`([^`]+)`/g, function (_, code) {
      codes.push(code);
      return '\u0000' + (codes.length - 1) + '\u0000';
    });
    out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (_, label, href) {
      return '<a href="' + href + '">' + label + '</a>';
    });
    out = out.replace(/\u0000(\d+)\u0000/g, function (_, index) {
      return '<code>' + codes[Number(index)] + '</code>';
    });
    return out;
  }

  function renderMarkdown(source) {
    var lines = String(source).split(/\r?\n/);
    var html = '';
    var paragraph = [];
    var listOpen = false;
    var inCode = false;
    var codeLines = [];

    function flushParagraph() {
      if (paragraph.length) {
        html += '<p>' + inline(paragraph.join(' ')) + '</p>';
        paragraph = [];
      }
    }
    function closeList() {
      if (listOpen) {
        html += '</ul>';
        listOpen = false;
      }
    }
    function flushCode() {
      html += '<pre><code>' + escapeHtml(codeLines.join('\n')) + '</code></pre>';
      codeLines = [];
      inCode = false;
    }

    for (var i = 0; i < lines.length; i++) {
      var raw = lines[i];
      var line = raw.replace(/\s+$/, '');

      if (line.trim().indexOf('```') === 0) {
        if (inCode) flushCode();
        else {
          flushParagraph();
          closeList();
          inCode = true;
        }
        continue;
      }
      if (inCode) {
        codeLines.push(raw);
        continue;
      }
      if (!line.trim()) {
        flushParagraph();
        closeList();
        continue;
      }
      var heading = /^(#{1,3})\s+(.*)$/.exec(line);
      if (heading) {
        flushParagraph();
        closeList();
        var level = heading[1].length;
        html += '<h' + level + '>' + inline(escapeHtml(heading[2])) + '</h' + level + '>';
        continue;
      }
      if (/^\s*[-*]\s+/.test(line)) {
        flushParagraph();
        if (!listOpen) {
          html += '<ul>';
          listOpen = true;
        }
        html += '<li>' + inline(escapeHtml(line.replace(/^\s*[-*]\s+/, ''))) + '</li>';
        continue;
      }
      if (/^\s*>\s?/.test(line)) {
        flushParagraph();
        closeList();
        html += '<blockquote>' + inline(escapeHtml(line.replace(/^\s*>\s?/, ''))) + '</blockquote>';
        continue;
      }
      if (/^\s*---+\s*$/.test(line)) {
        flushParagraph();
        closeList();
        html += '<hr>';
        continue;
      }
      closeList();
      paragraph.push(escapeHtml(line));
    }

    flushParagraph();
    closeList();
    if (inCode) flushCode();
    return html;
  }

  function formatDate(value) {
    var parts = String(value).split('-');
    if (parts.length !== 3) return value;
    return parts[0] + ' 年 ' + Number(parts[1]) + ' 月 ' + Number(parts[2]) + ' 日';
  }

  function tagList(tags) {
    return (tags || []).map(function (tag) {
      return '<span class="tag">' + escapeHtml(tag) + '</span>';
    }).join(' ');
  }

  function renderHero() {
    return (
      '<section class="hero">' +
        (site.avatar ? '<img class="hero-avatar" src="' + escapeHtml(site.avatar) + '" alt="' + escapeHtml(site.name) + ' 的头像">' : '') +
        '<h1 class="hero-title">' + escapeHtml(site.name) + '</h1>' +
        '<p class="hero-tagline">' + escapeHtml(site.tagline) + '</p>' +
        '<p class="hero-bio">' + escapeHtml(site.bio) + '</p>' +
        '<div class="hero-links">' + links() + '</div>' +
      '</section>'
    );
  }

  function links() {
    return (site.links || []).map(function (link) {
      return '<a class="chip" href="' + escapeHtml(link.href) + '" target="_blank" rel="noreferrer">' + escapeHtml(link.label) + '</a>';
    }).join('');
  }

  function renderList() {
    var cards = posts.map(function (post) {
      return (
        '<a class="post-card" href="#/post/' + encodeURIComponent(post.slug) + '">' +
          '<div class="post-meta"><time datetime="' + escapeHtml(post.date) + '">' + escapeHtml(formatDate(post.date)) + '</time>' +
            (post.tags && post.tags.length ? '<span>·</span>' + tagList(post.tags) : '') +
          '</div>' +
          '<h2 class="post-card-title">' + escapeHtml(post.title) + '</h2>' +
          '<p class="post-card-summary">' + escapeHtml(post.summary || '') + '</p>' +
        '</a>'
      );
    }).join('');

    return (
      renderHero() +
      '<h2 class="section-title">文章</h2>' +
      '<div class="post-list">' + (cards || '<p class="empty">还没有文章。</p>') + '</div>'
    );
  }

  function renderPost(slug) {
    var post = null;
    for (var i = 0; i < posts.length; i++) {
      if (posts[i].slug === slug) post = posts[i];
    }
    if (!post) {
      return '<p class="empty">找不到这篇文章。<a href="#/">回到首页</a></p>';
    }
    return (
      '<article class="article">' +
        '<a class="back-link" href="#/">← 返回文章列表</a>' +
        '<div class="post-meta"><time datetime="' + escapeHtml(post.date) + '">' + escapeHtml(formatDate(post.date)) + '</time>' +
          (post.tags && post.tags.length ? '<span>·</span>' + tagList(post.tags) : '') +
        '</div>' +
        '<h1 class="article-title">' + escapeHtml(post.title) + '</h1>' +
        '<div class="article-body">' + renderMarkdown(post.body || '') + '</div>' +
      '</article>'
    );
  }

  function renderAbout() {
    return (
      '<article class="article">' +
        '<a class="back-link" href="#/">← 返回文章列表</a>' +
        '<h1 class="article-title">关于</h1>' +
        '<div class="about-card">' +
          (site.avatar ? '<img class="hero-avatar" src="' + escapeHtml(site.avatar) + '" alt="头像">' : '') +
          '<p class="hero-bio" style="margin-top:16px">' + escapeHtml(site.bio) + '</p>' +
          '<div class="hero-links">' + links() + '</div>' +
        '</div>' +
      '</article>'
    );
  }

  function currentRoute() {
    var hash = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
    if (hash.indexOf('post/') === 0) return { view: 'post', slug: hash.slice(5) };
    if (hash === 'about') return { view: 'about' };
    return { view: 'list' };
  }

  function render() {
    var route = currentRoute();
    if (route.view === 'post') {
      app.innerHTML = renderPost(route.slug);
      var post = posts.filter(function (item) { return item.slug === route.slug; })[0];
      document.title = post ? post.title + ' · ' + site.name : site.name;
    } else if (route.view === 'about') {
      app.innerHTML = renderAbout();
      document.title = '关于 · ' + site.name;
    } else {
      app.innerHTML = renderList();
      document.title = site.name + ' · ' + site.tagline;
    }

    var navLinks = document.querySelectorAll('.nav-link');
    for (var i = 0; i < navLinks.length; i++) {
      var href = navLinks[i].getAttribute('href');
      var active = (href === '#/' && route.view === 'list') || (href === '#/about' && route.view === 'about');
      if (active) navLinks[i].setAttribute('aria-current', 'page');
      else navLinks[i].removeAttribute('aria-current');
    }

    window.scrollTo(0, 0);
  }

  function preferredTheme() {
    try {
      var stored = localStorage.getItem('blog-theme');
      if (stored === 'light' || stored === 'dark') return stored;
    } catch (error) { /* ignore */ }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (themeButton) {
      themeButton.textContent = theme === 'dark' ? '☀' : '☾';
      themeButton.setAttribute('aria-label', theme === 'dark' ? '切换到浅色主题' : '切换到深色主题');
    }
  }

  if (themeButton) {
    themeButton.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('blog-theme', next); } catch (error) { /* ignore */ }
      applyTheme(next);
    });
  }

  window.addEventListener('hashchange', render);

  applyTheme(preferredTheme());
  render();
})();
