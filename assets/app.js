(function () {
  'use strict';

  var site = window.BLOG.site;
  var posts = window.BLOG.posts.slice().sort(function (a, b) {
    return b.date.localeCompare(a.date);
  });

  var app = document.getElementById('app');
  var themeButton = document.getElementById('theme-toggle');

  function sectionLabel(name, fallback) {
    var sections = site.sections || {};
    return sections[name] || fallback;
  }

  function featureOn(name) {
    var features = site.features || {};
    return features[name] !== false;
  }

  // ---------------- 留言板 / 收信箱（GitHub Issues） ----------------
  var ISSUE_REPO = 'feaus-001/feaus-001.github.io';
  var ISSUE_URL = 'https://github.com/' + ISSUE_REPO + '/issues';

  function clearIssuesCache() {
    try { sessionStorage.removeItem('blog-issues'); } catch (error) { /* ignore */ }
  }

  function loadIssues() {
    var cached = null;
    try { cached = JSON.parse(sessionStorage.getItem('blog-issues') || 'null'); } catch (error) { /* ignore */ }
    if (cached && Date.now() - cached.at < 5 * 60 * 1000) return Promise.resolve(cached.items);
    return fetch('https://api.github.com/repos/' + ISSUE_REPO + '/issues?state=open&per_page=30&sort=created&direction=desc', {
      headers: { accept: 'application/vnd.github+json' },
    }).then(function (response) {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    }).then(function (items) {
      try { sessionStorage.setItem('blog-issues', JSON.stringify({ at: Date.now(), items: items })); } catch (error) { /* ignore */ }
      return items;
    });
  }

  function formatIssueDate(date) {
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
  }

  function fillIssues(mode) {
    var list = document.getElementById('board-list');
    if (!list) return;
    list.innerHTML = '<p class="empty">正在读取…</p>';
    loadIssues().then(function (items) {
      if (!Array.isArray(items) || !items.length) {
        list.innerHTML = '<p class="empty">还没有留言，来做第一个吧。</p>';
        return;
      }
      var seen = 0;
      try { seen = Number(localStorage.getItem('blog-inbox-seen') || 0); } catch (error) { /* ignore */ }
      list.innerHTML = items.map(function (issue) {
        var when = new Date(issue.created_at);
        var unread = when.getTime() > seen;
        var body = String(issue.body || '').trim();
        if (body.length > 400) body = body.slice(0, 400) + '…';
        return '<article class="board-item' + (mode === 'inbox' && unread ? ' is-unread' : '') + '">' +
          '<header><span class="board-author">' + escapeHtml((issue.user && issue.user.login) || '匿名') + '</span>' +
          '<span class="board-time">' + escapeHtml(formatIssueDate(when)) + '</span>' +
          (mode === 'inbox' && unread ? '<span class="board-dot"></span>' : '') +
          '</header>' +
          '<h2 class="board-title">' + escapeHtml(issue.title || '') + '</h2>' +
          '<p class="board-body">' + escapeHtml(body).replace(/\n/g, '<br>') + '</p>' +
          '</article>';
      }).join('');
    }).catch(function () {
      list.innerHTML = '<p class="empty">读取失败：GitHub API 可能被限流或暂时不可用，稍后再试。</p>';
    });
  }

  function writeIssueUrl() {
    var title = encodeURIComponent('[留言] ');
    var body = encodeURIComponent('昵称：\n\n留言：\n');
    return ISSUE_URL + '/new?title=' + title + '&body=' + body;
  }

  function boardActions(mode) {
    return '<div class="board-actions">' +
      (mode === 'guestbook'
        ? '<a class="board-btn board-btn-primary" href="' + writeIssueUrl() + '" target="_blank" rel="noreferrer">✍ 写留言</a>'
        : '<button type="button" class="board-btn" id="inbox-read">全部标为已读</button>') +
      '<button type="button" class="board-btn" id="board-refresh">刷新</button>' +
      '<a class="board-btn" href="' + ISSUE_URL + '" target="_blank" rel="noreferrer">在 GitHub 上打开</a>' +
      '</div>';
  }

  var GUEST_KEY = 'blog-guestbook';
  var SB = site.supabase || {};
  var SUPABASE_ON = !!(SB.url && SB.key);

  function sbRequest(path, options) {
    var opts = options || {};
    var headers = {
      apikey: SB.key,
      authorization: 'Bearer ' + SB.key,
      accept: 'application/json',
      'content-type': 'application/json',
    };
    if (opts.method === 'POST') headers.prefer = 'return=minimal';
    return fetch(String(SB.url).replace(/\/+$/, '') + '/rest/v1' + path, {
      method: opts.method || 'GET',
      headers: headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    }).then(function (response) {
      if (!response.ok) {
        return response.text().then(function (text) {
          throw new Error('HTTP ' + response.status + ' ' + text.slice(0, 120));
        });
      }
      if (response.status === 204) return null;
      var type = response.headers.get('content-type') || '';
      if (type.indexOf('json') < 0) return null;
      return response.json();
    });
  }

  function normalizeRows(rows) {
    return (rows || []).map(function (row) {
      return {
        id: row.id,
        name: row.name || '匿名',
        body: row.body != null ? row.body : (row.text || ''),
        at: row.created_at ? new Date(row.created_at).getTime() : (Number(row.at) || Date.now()),
        private: !!row.private,
        approved: row.approved !== false,
      };
    });
  }

  function localGuest() {
    try {
      var list = JSON.parse(localStorage.getItem(GUEST_KEY) || '[]');
      return Array.isArray(list) ? list : [];
    } catch (error) {
      return [];
    }
  }

  function saveLocalGuest(list) {
    try { localStorage.setItem(GUEST_KEY, JSON.stringify(list)); } catch (error) { /* ignore */ }
  }

  function rowsHtml(rows, mode) {
    if (!rows.length) return '<p class="empty">还没有留言，来写第一条吧。</p>';
    var seen = 0;
    try { seen = Number(localStorage.getItem('blog-inbox-seen') || 0); } catch (error) { /* ignore */ }
    return rows.slice().sort(function (a, b) { return b.at - a.at; }).map(function (row) {
      var unread = mode === 'inbox' && row.at > seen;
      var pending = row.approved === false;
      var tag = row.private
        ? '<span class="board-tag">私密</span>'
        : (pending ? '<span class="board-tag board-tag-pending">待审核</span>' : '');
      var actions = (mode === 'inbox' && row.id)
        ? '<div class="board-item-actions">' +
          (pending ? '<button type="button" class="board-btn board-btn-sm" data-action="approve" data-id="' + row.id + '">通过</button>' : '') +
          '<button type="button" class="board-btn board-btn-sm" data-action="delete" data-id="' + row.id + '">删除</button>' +
          '</div>'
        : '';
      return '<article class="board-item' + (unread ? ' is-unread' : '') + '">' +
        '<header><span class="board-author">' + escapeHtml(row.name) + '</span>' +
        tag +
        '<span class="board-time">' + escapeHtml(formatIssueDate(new Date(row.at))) + '</span>' +
        (unread ? '<span class="board-dot"></span>' : '') +
        '</header>' +
        '<p class="board-body">' + escapeHtml(String(row.body)).replace(/\n/g, '<br>') + '</p>' +
        actions +
        '</article>';
    }).join('');
  }

  function refreshBoard(mode) {
    var list = document.getElementById('board-list');
    if (!list) return;
    if (!SUPABASE_ON) {
      list.innerHTML = rowsHtml(normalizeRows(localGuest()), mode);
      return;
    }
    list.innerHTML = '<p class="empty">正在读取…</p>';
    var request;
    if (mode === 'inbox') {
      request = sbRequest('/rpc/read_inbox', { method: 'POST', body: { pass: sessionStorage.getItem('blog-inbox-pin') || '' } });
    } else {
      request = sbRequest('/messages?select=id,name,body,private,approved,created_at&private=eq.false&approved=eq.true&order=created_at.desc&limit=60')
        .catch(function () {
          return sbRequest('/messages?select=name,body,private,created_at&private=eq.false&order=created_at.desc&limit=60');
        });
    }
    request.then(function (rows) {
      list.innerHTML = rowsHtml(normalizeRows(rows), mode);
    }).catch(function (error) {
      list.innerHTML = '<p class="empty">读取失败：' + escapeHtml(error.message || '网络错误') + '</p>';
    });
  }

  function gmailUrl(content) {
    var to = '052626000abc@gmail.com';
    return 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(to) +
      '&su=' + encodeURIComponent('[心尘山留言板]') +
      '&body=' + encodeURIComponent(content || '');
  }

  function renderGuestbook() {
    if (!featureOn('guestbook')) return '<p class="empty">留言板未开启。</p>';
    return '<article class="article board">' +
      '<a class="back-link" href="#/">← 返回文章列表</a>' +
      '<h1 class="article-title">心尘山留言板</h1>' +
      '<p class="board-hint">' + (SUPABASE_ON
        ? '留言提交后需要站长审核通过才会公开显示；违规内容会被删除。详见 <a href="#/terms">声明与规则</a>。'
        : '还没接后端：留言暂时只存在你自己的浏览器里。接上 Supabase 后，所有人写、所有人看。') + '</p>' +
      '<form class="board-form" id="board-form">' +
        '<input id="board-name" class="board-input" maxlength="20" placeholder="昵称（可留空）">' +
        '<textarea id="board-text" class="board-input" rows="3" maxlength="500" placeholder="想说的话…"></textarea>' +
        '<label class="board-check"><input type="checkbox" id="board-private"> 仅站长可见（不公开）</label>' +
        '<div class="board-form-actions">' +
          '<button type="submit" class="board-btn board-btn-primary">发表留言</button>' +
          '<a class="board-btn" id="board-mail" href="#" target="_blank" rel="noreferrer">邮件发给站长</a>' +
          '<span class="board-status" id="board-status"></span>' +
        '</div>' +
      '</form>' +
      '<div class="board-list" id="board-list"></div>' +
      '</article>';
  }

  function renderTerms() {
    return '<article class="article terms">' +
      '<a class="back-link" href="#/">← 返回首页</a>' +
      '<h1 class="article-title">声明与规则</h1>' +
      '<h2>版权声明</h2>' +
      '<p>本站为非商业个人博客，文章除特别注明外均为站长原创，转载请注明出处。站内背景图、头像、音乐等素材版权归原作者所有，仅作个人欣赏；如权利人认为侵权，请通过邮箱联系站长，我会第一时间删除。</p>' +
      '<h2>留言规则</h2>' +
      '<p>留言须经站长审核通过后公开展示。请勿发布违法、侵权、广告、辱骂、人身攻击、色情、暴力或涉及他人隐私的内容；违规留言将被直接删除，必要时保留追究责任的权利。</p>' +
      '<h2>隐私说明</h2>' +
      '<p>留言会保存昵称和内容并公开展示（勾选「仅站长可见」的不公开）。本站不采集访客的其他个人信息，不使用统计追踪；如需删除自己的留言，请联系站长。</p>' +
      '<h2>免责</h2>' +
      '<p>本站内容仅供学习交流，不构成任何专业建议；外链内容由第三方提供，本站不承担责任。</p>' +
      '</article>';
  }

  function inboxUnlocked() {
    try { return sessionStorage.getItem('blog-inbox-unlocked') === '1'; } catch (error) { return false; }
  }

  function renderInbox() {
    if (!featureOn('inbox')) return '<p class="empty">收信箱未开启。</p>';
    if (!inboxUnlocked()) {
      return '<article class="article board">' +
        '<a class="back-link" href="#/">← 返回文章列表</a>' +
        '<h1 class="article-title">收信箱</h1>' +
        '<p class="board-hint">站长专用，输入口令进入。</p>' +
        '<form class="board-form" id="inbox-gate">' +
          '<input id="inbox-pin" class="board-input" type="password" placeholder="口令" autocomplete="off">' +
          '<div class="board-form-actions">' +
            '<button class="board-btn board-btn-primary" type="submit">进入</button>' +
            '<span class="board-status" id="inbox-status"></span>' +
          '</div>' +
        '</form>' +
        '</article>';
    }
    return '<article class="article board">' +
      '<a class="back-link" href="#/">← 返回文章列表</a>' +
      '<h1 class="article-title">收信箱</h1>' +
      '<p class="board-hint">' + (SUPABASE_ON
        ? '这里是全部留言（含待审核）。「通过」后才会公开显示，「删除」直接移除。'
        : '这里汇总这台浏览器里的留言；接上 Supabase 后可显示全部来信。') + '</p>' +
      '<div class="board-actions">' +
        '<button type="button" class="board-btn" id="inbox-read">全部标为已读</button>' +
        (SUPABASE_ON ? '' : '<button type="button" class="board-btn" id="inbox-clear">清空本机留言</button>') +
        '<a class="board-btn" href="' + gmailUrl('') + '" target="_blank" rel="noreferrer">打开 Gmail 收件箱</a>' +
      '</div>' +
      '<div class="board-list" id="board-list"></div>' +
      '</article>';
  }

  function bindBoard(mode) {
    if (mode === 'guestbook') {
      var form = document.getElementById('board-form');
      var status = document.getElementById('board-status');
      var mail = document.getElementById('board-mail');
      function syncMail() {
        var name = (document.getElementById('board-name').value || '').trim();
        var text = (document.getElementById('board-text').value || '').trim();
        mail.href = gmailUrl((name ? name + '：\n\n' : '') + text);
      }
      if (form) {
        form.addEventListener('submit', function (event) {
          event.preventDefault();
          var name = (document.getElementById('board-name').value || '').trim();
          var text = (document.getElementById('board-text').value || '').trim();
          if (name === '昵称（可留空）') name = '';
          if (text === '想说的话…' || text === '想说的话...') text = '';
          if (!text) {
            if (status) status.textContent = '先写点什么吧';
            return;
          }
          if (SUPABASE_ON) {
            if (status) status.textContent = '发送中…';
            var privateBox = document.getElementById('board-private');
            var isPrivate = !!(privateBox && privateBox.checked);
            sbRequest('/messages', { method: 'POST', body: { name: name || '匿名', body: text, private: isPrivate } })
              .then(function () {
                document.getElementById('board-text').value = '';
                if (privateBox) privateBox.checked = false;
                syncMail();
                if (status) status.textContent = isPrivate ? '已发送，只有站长能看到' : '已提交，等站长审核后显示';
                refreshBoard('guestbook');
              })
              .catch(function (error) {
                if (status) status.textContent = '发布失败：' + (error.message || '网络错误');
              });
            return;
          }
          var list = localGuest();
          list.push({ name: name, text: text, at: Date.now() });
          saveLocalGuest(list);
          document.getElementById('board-text').value = '';
          syncMail();
          if (status) status.textContent = '已发布（保存在本机浏览器）';
          refreshBoard('guestbook');
        });
      }
      ['board-name', 'board-text'].forEach(function (id) {
        var input = document.getElementById(id);
        if (input) input.addEventListener('input', syncMail);
      });
      syncMail();
      refreshBoard('guestbook');
      return;
    }

    refreshBoard(mode);
    var gate = document.getElementById('inbox-gate');
    if (gate) {
      gate.addEventListener('submit', function (event) {
        event.preventDefault();
        var pin = document.getElementById('inbox-pin').value;
        var status = document.getElementById('inbox-status');
        if (SUPABASE_ON) {
          if (status) status.textContent = '验证中…';
          sbRequest('/rpc/inbox_ok', { method: 'POST', body: { pass: pin } }).then(function (result) {
            if (result === true) {
              try {
                sessionStorage.setItem('blog-inbox-unlocked', '1');
                sessionStorage.setItem('blog-inbox-pin', pin);
              } catch (error) { /* ignore */ }
              render();
            } else if (status) {
              status.textContent = '口令不对';
            }
          }).catch(function (error) {
            if (status) status.textContent = '验证失败：' + (error.message || '网络错误');
          });
          return;
        }
        var expected = (site && site.inboxPin) || '052626';
        if (pin === expected) {
          try { sessionStorage.setItem('blog-inbox-unlocked', '1'); } catch (error) { /* ignore */ }
          render();
        } else if (status) {
          status.textContent = '口令不对';
        }
      });
      return;
    }
    var read = document.getElementById('inbox-read');
    if (read) {
      read.addEventListener('click', function () {
        try { localStorage.setItem('blog-inbox-seen', String(Date.now())); } catch (error) { /* ignore */ }
        refreshBoard(mode);
      });
    }
    var boardList = document.getElementById('board-list');
    if (boardList && SUPABASE_ON) {
      boardList.addEventListener('click', function (event) {
        var button = event.target.closest ? event.target.closest('button[data-action]') : null;
        if (!button) return;
        var pass = sessionStorage.getItem('blog-inbox-pin') || '';
        button.disabled = true;
        sbRequest('/rpc/moderate', {
          method: 'POST',
          body: { pass: pass, msg_id: Number(button.getAttribute('data-id')), action: button.getAttribute('data-action') },
        }).then(function (ok) {
          if (ok === true) refreshBoard(mode);
          else if (window.confirm('操作失败：口令可能已改。要清空本机记录重新登录吗？')) {
            sessionStorage.removeItem('blog-inbox-unlocked');
            render();
          }
        }).catch(function (error) {
          window.alert('操作失败：' + (error.message || '网络错误') + '\n（如果提示函数不存在，请先运行 supabase-moderation.sql）');
          button.disabled = false;
        });
      });
    }
    var clear = document.getElementById('inbox-clear');
    if (clear) {
      clear.addEventListener('click', function () {
        if (!window.confirm('清空本机保存的留言？')) return;
        saveLocalGuest([]);
        refreshBoard(mode);
      });
    }
  }

  function hexToRgb(hex) {
    var match = /^#?([a-f\d]{3}|[a-f\d]{6})$/i.exec(String(hex || '').trim());
    if (!match) return null;
    var value = match[1];
    if (value.length === 3) value = value[0] + value[0] + value[1] + value[1] + value[2] + value[2];
    return {
      r: parseInt(value.slice(0, 2), 16),
      g: parseInt(value.slice(2, 4), 16),
      b: parseInt(value.slice(4, 6), 16),
    };
  }

  function mixHex(accent, base, ratio) {
    var a = hexToRgb(accent);
    var b = hexToRgb(base);
    if (!a || !b) return accent;
    var channels = ['r', 'g', 'b'].map(function (key) {
      return Math.round(a[key] * (1 - ratio) + b[key] * ratio).toString(16).padStart(2, '0');
    });
    return '#' + channels.join('');
  }

  function number(value, fallback) {
    var parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function applyAccent() {
    var theme = site.theme || {};
    var root = document.documentElement;
    var dark = root.getAttribute('data-theme') === 'dark';
    var accent = dark ? (theme.accentDark || theme.accent) : (theme.accent || theme.accentDark);
    if (accent) {
      root.style.setProperty('--accent', accent);
      root.style.setProperty('--accent-soft', mixHex(accent, dark ? '#0e1117' : '#ffffff', 0.85));
    }
    var background = dark ? (theme.bgDark || theme.bgLight) : (theme.bgLight || theme.bgDark);
    if (background) root.style.setProperty('--bg', background);
    var textColor = dark ? (theme.textDark || theme.textLight) : (theme.textLight || theme.textDark);
    if (textColor) root.style.setProperty('--fg', textColor);
    var mutedColor = dark ? (theme.mutedDark || theme.mutedLight) : (theme.mutedLight || theme.mutedDark);
    if (mutedColor) root.style.setProperty('--muted', mutedColor);
    var rgb = hexToRgb(background || (dark ? '#0e1117' : '#ffffff')) || { r: 255, g: 255, b: 255 };
    var cardAlpha = number(theme.cardAlpha, 72) / 100;
    var dimAlpha = number(theme.bgDim, 0) / 100;
    root.style.setProperty('--card-bg', 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + cardAlpha + ')');
    root.style.setProperty('--card-blur', number(theme.cardBlur, 12) + 'px');
    root.style.setProperty('--card-radius', number(theme.cardRadius, 18) + 'px');
    root.style.setProperty('--layout-width', number(theme.layoutWidth, 860) + 'px');
    root.style.setProperty('--bg-blur', number(theme.bgBlur, 0) + 'px');
    root.style.setProperty('--dim-bg', 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + dimAlpha + ')');
    root.style.setProperty('--rb-width', number(theme.rainbowWidth, 2) + 'px');
    root.style.setProperty('--rb-speed', number(theme.rainbowSpeed, 9) + 's');
    root.style.setProperty('--rb-alpha', String(number(theme.rainbowAlpha, 85) / 100));
    root.classList.toggle('has-card-shadow', theme.cardShadow !== false);
    if (theme.bgImage) {
      var imageUrl = String(theme.bgImage);
      try { imageUrl = new URL(imageUrl, location.href).href; } catch (error) { /* 保留原值 */ }
      var dim = number(theme.bgDim, 0) / 100;
      var overlay = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + dim + ')';
      root.style.setProperty(
        '--bg-image',
        'linear-gradient(' + overlay + ',' + overlay + '),url("' + imageUrl.replace(/"/g, '%22') + '")',
      );
      root.classList.add('has-bg-image');
      if (!document.querySelector('.bg-scrim')) {
        var scrim = document.createElement('div');
        scrim.className = 'bg-scrim';
        document.body.insertBefore(scrim, document.body.firstChild);
      }
    } else {
      root.classList.remove('has-bg-image');
      var existing = document.querySelector('.bg-scrim');
      if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
    }
    root.classList.toggle('rainbow-frame', theme.rainbow !== false);
  }

  function applySiteChrome() {
    var brand = document.querySelector('.brand');
    if (brand && site.name) brand.textContent = site.name;
    var navLinks = document.querySelectorAll('.nav-link');
    if (navLinks[0]) navLinks[0].textContent = sectionLabel('posts', '文章');
    if (navLinks[1]) navLinks[1].textContent = sectionLabel('about', '关于');
    var footer = document.querySelector('.site-footer');
    if (footer && site.footer && footer.firstElementChild) footer.firstElementChild.textContent = site.footer;
    var buildMeta = document.querySelector('meta[name="site-build"]');
    if (footer && buildMeta && footer.lastElementChild) {
      footer.lastElementChild.textContent = '静态博客 · v' + String(buildMeta.getAttribute('content') || '').slice(0, 6);
    }
  }

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
        (featureOn('guestbook') ? '<div class="hero-links"><a class="chip" href="#/guestbook">留言板</a></div>' : '') +
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
      '<h2 class="section-title">' + escapeHtml(sectionLabel('posts', '文章')) + '</h2>' +
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
    var aboutText = site.about || site.bio;
    return (
      '<article class="article">' +
        '<a class="back-link" href="#/">← 返回文章列表</a>' +
        '<h1 class="article-title">' + escapeHtml(sectionLabel('about', '关于')) + '</h1>' +
        '<div class="about-card">' +
          (site.avatar ? '<img class="hero-avatar" src="' + escapeHtml(site.avatar) + '" alt="头像">' : '') +
          '<p class="hero-bio" style="margin-top:16px">' + escapeHtml(aboutText) + '</p>' +
          '<div class="hero-links">' + links() + '</div>' +
        '</div>' +
      '</article>'
    );
  }

  function currentRoute() {
    var hash = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
    if (hash.indexOf('post/') === 0) return { view: 'post', slug: hash.slice(5) };
    if (hash === 'about') return { view: 'about' };
    if (hash === 'guestbook') return { view: 'guestbook' };
    if (hash === 'inbox') return { view: 'inbox' };
    if (hash === 'terms') return { view: 'terms' };
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
    } else if (route.view === 'guestbook') {
      app.innerHTML = renderGuestbook();
      document.title = '留言板 · ' + site.name;
      bindBoard('guestbook');
    } else if (route.view === 'inbox') {
      app.innerHTML = renderInbox();
      document.title = '收信箱 · ' + site.name;
      bindBoard('inbox');
    } else if (route.view === 'terms') {
      app.innerHTML = renderTerms();
      document.title = '声明与规则 · ' + site.name;
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
    applyAccent();
  }

  if (themeButton) {
    themeButton.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('blog-theme', next); } catch (error) { /* ignore */ }
      applyTheme(next);
    });
  }

  function setupMusic() {
    var music = site.music;
    if (!music || music.enabled === false) return;
    var tracks = (music.tracks || []).filter(function (track) { return track && track.src; });
    if (!tracks.length) return;

    var audio = document.createElement('audio');
    audio.preload = 'none';
    audio.style.display = 'none';
    document.body.appendChild(audio);

    var root = document.createElement('div');
    root.className = 'music-player';
    root.innerHTML =
      '<button type="button" class="mp-btn mp-prev" aria-label="上一首">⏮</button>' +
      '<button type="button" class="mp-btn mp-play" aria-label="播放">▶</button>' +
      '<span class="mp-info"><span class="mp-title"></span><span class="mp-time">0:00 / 0:00</span></span>' +
      '<input class="mp-progress" type="range" min="0" max="1000" value="0" aria-label="播放进度">' +
      '<button type="button" class="mp-btn mp-next" aria-label="下一首">⏭</button>';
    document.body.appendChild(root);

    var titleEl = root.querySelector('.mp-title');
    var timeEl = root.querySelector('.mp-time');
    var playBtn = root.querySelector('.mp-play');
    var progress = root.querySelector('.mp-progress');
    var index = 0;
    var dragging = false;

    function formatTime(seconds) {
      var value = Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
      var minutes = Math.floor(value / 60);
      var rest = Math.floor(value % 60);
      return minutes + ':' + String(rest).padStart(2, '0');
    }

    function load(indexToLoad, play) {
      index = (indexToLoad + tracks.length) % tracks.length;
      var track = tracks[index];
      audio.src = track.src;
      titleEl.textContent = [track.title, track.artist].filter(Boolean).join(' · ') || track.src;
      audio.load();
      if (play) audio.play().catch(function () { /* 浏览器可能拒绝播放 */ });
    }

    function updateButton() {
      var playing = !audio.paused && !audio.ended;
      playBtn.textContent = playing ? '⏸' : '▶';
      playBtn.setAttribute('aria-label', playing ? '暂停' : '播放');
      root.setAttribute('data-playing', String(playing));
    }

    function updateProgress() {
      var duration = audio.duration || 0;
      var current = audio.currentTime || 0;
      if (!dragging && duration > 0) progress.value = String(Math.round((current / duration) * 1000));
      timeEl.textContent = formatTime(current) + ' / ' + formatTime(duration);
    }

    playBtn.addEventListener('click', function () {
      root.removeAttribute('data-blocked');
      if (!audio.src) {
        load(index, true);
        return;
      }
      if (audio.paused) audio.play().catch(function () { /* ignore */ });
      else audio.pause();
    });
    root.querySelector('.mp-prev').addEventListener('click', function () { load(index - 1, true); });
    root.querySelector('.mp-next').addEventListener('click', function () { load(index + 1, true); });
    progress.addEventListener('input', function () { dragging = true; });
    progress.addEventListener('change', function () {
      dragging = false;
      if (audio.duration) audio.currentTime = (Number(progress.value) / 1000) * audio.duration;
    });
    audio.addEventListener('play', updateButton);
    audio.addEventListener('pause', updateButton);
    audio.addEventListener('ended', function () { load(index + 1, true); });
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateProgress);
    audio.addEventListener('error', function () {
      titleEl.textContent = '音频加载失败：' + (tracks[index].title || tracks[index].src);
    });

    function tryAutoplay() {
      audio.play().then(function () {
        root.removeAttribute('data-blocked');
      }).catch(function () {
        // 浏览器禁止自动播放：提示一下，并等用户第一次点击/按键时开始
        root.setAttribute('data-blocked', 'true');
        function resume(event) {
          document.removeEventListener('pointerdown', resume);
          document.removeEventListener('keydown', resume);
          var target = event && event.target;
          if (target && target.closest && target.closest('.music-player')) return;
          audio.play().then(function () {
            root.removeAttribute('data-blocked');
          }).catch(function () { /* ignore */ });
        }
        document.addEventListener('pointerdown', resume);
        document.addEventListener('keydown', resume);
      });
    }

    load(0, false);
    tryAutoplay();
  }

  function checkBuild() {
    var meta = document.querySelector('meta[name="site-build"]');
    if (!meta) return;
    var current = meta.getAttribute('content');
    if (!current || current === 'dev') return;
    try {
      if (sessionStorage.getItem('blog-build-check') === current) return;
    } catch (error) { /* ignore */ }
    fetch(location.pathname + '?v=' + Date.now(), { cache: 'no-store' })
      .then(function (response) { return response.text(); })
      .then(function (html) {
        var match = /<meta name="site-build" content="([^"]+)"/.exec(html);
        if (!match || match[1] === current) return;
        try { sessionStorage.setItem('blog-build-check', match[1]); } catch (error) { /* ignore */ }
        location.replace(location.pathname + '?v=' + encodeURIComponent(match[1]) + (location.hash || ''));
      })
      .catch(function () { /* 取不到就算了，下次再检 */ });
  }

  window.addEventListener('hashchange', render);

  applySiteChrome();
  applyTheme(preferredTheme());
  render();
  setupMusic();
  checkBuild();
})();
