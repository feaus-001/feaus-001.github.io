/* 编辑器与站点共用的渲染 / 序列化逻辑（编辑器用，站点 app.js 仍有自己的副本）。 */
(function () {
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
    var lines = String(source || '').split(/\r?\n/);
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

  function quoteBody(body) {
    return String(body || '')
      .replace(/\\/g, '\\\\')
      .replace(/`/g, '\\`')
      .replace(/\$\{/g, '\\${');
  }

  function json(value) {
    return JSON.stringify(String(value == null ? '' : value));
  }

  function numberOr(value, fallback) {
    var parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function serialize(blog) {
    var site = blog.site || {};
    var posts = blog.posts || [];
    var sections = site.sections || {};
    var theme = site.theme || {};
    var music = site.music || {};
    var decor = site.decor || {};
    var features = site.features || {};
    var out = [];
    out.push('/* 站点配置与文章数据。改这里就能更新博客，不需要构建工具。 */');
    out.push('window.BLOG = {');
    out.push('  site: {');
    out.push('    name: ' + json(site.name) + ',');
    out.push('    tagline: ' + json(site.tagline) + ',');
    out.push('    bio: ' + json(site.bio) + ',');
    out.push('    avatar: ' + json(site.avatar) + ',');
    out.push('    about: ' + json(site.about) + ',');
    out.push('    footer: ' + json(site.footer) + ',');
    out.push('    sections: { posts: ' + json(sections.posts || '文章') + ', about: ' + json(sections.about || '关于') + ' },');
    out.push('    theme: { accent: ' + json(theme.accent) + ', accentDark: ' + json(theme.accentDark) +
      ', bgLight: ' + json(theme.bgLight) + ', bgDark: ' + json(theme.bgDark) +
      ', bgImage: ' + json(theme.bgImage) + ', rainbow: ' + (theme.rainbow !== false) +
      ', rainbowWidth: ' + numberOr(theme.rainbowWidth, 2) +
      ', rainbowSpeed: ' + numberOr(theme.rainbowSpeed, 9) +
      ', rainbowAlpha: ' + numberOr(theme.rainbowAlpha, 85) +
      ', cardAlpha: ' + numberOr(theme.cardAlpha, 72) +
      ', cardBlur: ' + numberOr(theme.cardBlur, 12) +
      ', cardRadius: ' + numberOr(theme.cardRadius, 18) +
      ', cardShadow: ' + (theme.cardShadow !== false) +
      ', layoutWidth: ' + numberOr(theme.layoutWidth, 860) +
      ', bgBlur: ' + numberOr(theme.bgBlur, 0) +
      ', bgDim: ' + numberOr(theme.bgDim, 0) +
      ', textLight: ' + json(theme.textLight) +
      ', textDark: ' + json(theme.textDark) +
      ', mutedLight: ' + json(theme.mutedLight) +
      ', mutedDark: ' + json(theme.mutedDark) +
      ' },');
    out.push('    links: [' + (site.links || []).map(function (link) {
      return '{ label: ' + json(link.label) + ', href: ' + json(link.href) + ' }';
    }).join(', ') + '],');
    out.push('    music: { enabled: ' + (music.enabled === true) + ', tracks: [' + (music.tracks || []).map(function (track) {
      return '{ title: ' + json(track.title) + ', artist: ' + json(track.artist) + ', src: ' + json(track.src) + ' }';
    }).join(', ') + '] },');
    out.push('    decor: { meteors: ' + (decor.meteors !== false) + ', seasons: ' + (decor.seasons !== false) +
      ', progress: ' + (decor.progress !== false) + ', backToTop: ' + (decor.backToTop !== false) +
      ', calendar: ' + (decor.calendar !== false) + ' },');
    out.push('    features: { guestbook: ' + (features.guestbook !== false) + ', inbox: ' + (features.inbox !== false) + ' },');
    out.push('    inboxPin: ' + json(site.inboxPin || '052626') + ',');
    out.push('  },');
    out.push('  posts: [');
    posts.forEach(function (post) {
      out.push('    {');
      out.push('      slug: ' + json(post.slug) + ',');
      out.push('      title: ' + json(post.title) + ',');
      out.push('      date: ' + json(post.date) + ',');
      out.push('      tags: [' + (post.tags || []).map(json).join(', ') + '],');
      out.push('      summary: ' + json(post.summary) + ',');
      out.push('      body: `' + quoteBody(post.body) + '`,');
      out.push('    },');
    });
    out.push('  ],');
    out.push('};');
    return out.join('\n') + '\n';
  }

  window.BlogEditor = { escapeHtml: escapeHtml, renderMarkdown: renderMarkdown, serialize: serialize };
})();
