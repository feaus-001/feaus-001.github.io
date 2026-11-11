# 个人博客

纯静态，无需构建工具，双击 `index.html` 就能看。

## 结构

| 文件 | 作用 |
|---|---|
| `index.html` | 页面骨架（头部、导航、挂载点、页脚） |
| `assets/style.css` | 全部样式，含亮/暗两套主题变量 |
| `assets/app.js` | 路由（`#/`、`#/post/<slug>`、`#/about`）、Markdown 渲染、主题切换 |
| `assets/posts.js` | **站点信息 + 文章数据**，平时只改这个文件 |
| `assets/fish.png` | 头像，换成自己的图即可 |

## 改内容

打开 `assets/posts.js`：

```js
window.BLOG = {
  site: {
    name: '你的名字',
    tagline: '一句话介绍',
    bio: '长一点的自我介绍',
    avatar: 'assets/fish.png',
    links: [{ label: 'GitHub', href: 'https://github.com/you' }],
  },
  posts: [
    {
      slug: 'hello-world',        // 唯一，会出现在地址 #/post/hello-world
      title: '第一篇文章',
      date: '2026-11-12',          // YYYY-MM-DD，列表按日期倒序
      tags: ['日常'],
      summary: '列表里显示的一句话摘要',
      body: `## 小标题

正文段落。

- 列表项
- 另一项

> 引用

\`行内代码\`、**粗体**、[链接](https://example.com)
`,
    },
  ],
};
```

`body` 支持的 Markdown 子集：`## / ###` 标题、`-` 列表、`>` 引用、`---` 分隔线、`` `行内代码` ``、``` 代码块 ```、`**粗体**`、`[文字](链接)`。

## 本地预览

双击 `index.html` 即可（没有 `fetch`，`file://` 下也能用）。

想用本地服务器（部署前更接近线上环境）：

```bash
python -m http.server 8080
# 打开 http://localhost:8080
```

## 让别人访问（上线）

现在它是本地文件，只有你能打开。要给别人一个链接，把它放到静态托管上就行，推荐 **GitHub Pages**（免费、地址固定、编辑器就在网页里）。

### 方式 A：GitHub Pages（推荐，不用装任何东西）

1. 登录 GitHub，新建一个 **public** 仓库，比如叫 `my-blog`；
2. 进仓库 → **Add file → Upload files**，把 `blog` 文件夹里的**全部内容**（`index.html`、`assets/`、`README.md`、`.nojekyll`）拖进去，Commit；
3. 仓库 **Settings → Pages** → Source 选 **Deploy from a branch** → 分支 `main`、目录 `/ (root)` → Save；
4. 等 30–60 秒，访问 `https://<你的用户名>.github.io/my-blog/`。

注意：`.nojekyll` 不要漏，它让 Pages 直接按静态文件发布，不走 Jekyll。

### 方式 B：Netlify Drop

把 `blog` 文件夹直接拖到 <https://app.netlify.com/drop>，立刻得到一个链接（要长期保留需要注册认领）。

### 方式 C：Vercel / Cloudflare Pages

导入仓库，Framework 选 “Other”，构建命令留空，输出目录填 `/`。

## 日常编辑（改完自动上线）

上线后不用碰命令行，全部在 GitHub 网页上完成：

| 想改什么 | 怎么做 |
|---|---|
| 文章 | 仓库里点 `assets/posts.js` → 右上角铅笔 → 改完 **Commit changes** |
| 头像 | 上传一张新图，命名为 `fish.png` 覆盖 `assets/fish.png`（或改 `posts.js` 里的 `avatar` 路径） |
| 名字 / 简介 / 链接 | `assets/posts.js` 顶部的 `site` 字段 |
| 配色 / 排版 | `assets/style.css` 开头的 CSS 变量 |

提交后 Pages 大约 30–60 秒自动重新发布，刷新页面即可看到。手机上用 GitHub App 或浏览器也能改。

> 想要「后台表单式编辑」（不碰代码、点点鼠标写文章），可以接 Decap CMS 或类似方案，需要多配一步 OAuth —— 要的话告诉我。


## 说明

- 主题默认跟随系统，右上角可手动切换，选择记在 `localStorage`；
- 没有后端、没有追踪脚本，文章数据全在 `posts.js` 里；
- 想换像素风字体，在 `style.css` 的 `body` 里加一行 `font-family: 'Fusion Pixel 12px Prop zh-Hans', ...` 即可（需要先安装该字体，或用 `@font-face` 引入）。
