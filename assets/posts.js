/* 站点配置与文章数据。改这里就能更新博客，不需要构建工具。 */
window.BLOG = {
  site: {
    name: "心尘山总站",
    tagline: "为人民服务⭐",
    bio: "“我们从来没靠过别人，我们只是靠自己这双手” —心辰Stellan",
    avatar: "assets/fish.png",
    about: "如果世界危机来临，我唯一能做的便是在此留下世人存在的足迹。",
    footer: "© 2026 by.XinChen",
    sections: { posts: "文章", about: "刻言录" },
    theme: { accent: "#1f6feb", accentDark: "#789ef7", bgLight: "#ffffff", bgDark: "#000000", bgImage: "assets/bg.png", rainbow: true, rainbowWidth: 3, rainbowSpeed: 3, rainbowAlpha: 100, cardAlpha: 0, cardBlur: 0, cardRadius: 0, cardShadow: true, layoutWidth: 720, bgBlur: 0, bgDim: 40, textLight: "#ff0000", textDark: "#e6e9ef", mutedLight: "#000000", mutedDark: "#9aa3b2" },
    links: [{ label: "GitHub", href: "https://github.com/feaus-001" }, { label: "邮箱", href: "https://mail.google.com/mail/?view=cm&fs=1&to=052626000abc%40gmail.com" }],
    music: { enabled: true, tracks: [{ title: "傘", artist: "奶皇 / topkingcream", src: "assets/music/song-01.mp3" }, { title: "四海五洲", artist: "奶皇 / topkingcream", src: "assets/music/song-02.mp3" }, { title: "快把皮球踢到百貨商場", artist: "奶皇 / topkingcream", src: "assets/music/song-03.mp3" }, { title: "文藝b抑鬱的理由", artist: "奶皇 / topkingcream", src: "assets/music/song-04.mp3" }, { title: "發條玩具烏龜", artist: "奶皇 / topkingcream", src: "assets/music/song-05.mp3" }, { title: "白色風車", artist: "奶皇 / topkingcream", src: "assets/music/song-06.mp3" }, { title: "草坪", artist: "奶皇 / topkingcream", src: "assets/music/song-07.mp3" }, { title: "金魚。坏天氣", artist: "奶皇 / topkingcream", src: "assets/music/song-08.mp3" }, { title: "關於那些被我丟掉的東西", artist: "奶皇 / topkingcream", src: "assets/music/song-09.mp3" }] },
    decor: { meteors: true, seasons: true, progress: true, backToTop: true, calendar: true },
    features: { guestbook: true, inbox: true },
    inboxPin: "xinchen-2026-secure",
    supabase: { url: "https://fzbvrgcdnwaxyhlhfmhw.supabase.co", key: "sb_publishable_cA0BnfnCO4MPZGbbSWCAjQ_pkOOVRT1" },
  },
  posts: [
    {
      slug: "post-20261112-2222",
      title: "关于对未来的窃窃私语",
      date: "2026-11-12",
      tags: ["特殊", "自我"],
      summary: "...",
      body: `经过了2020-2023以及2023-2025的这几个破故事之后我得出了一个结论...

远离互联网。

所以我的计划很简单

和我的爱人在3年内见面

在2030年结婚并一起退网。

我爱你，晴，我们会一直走到无穷尽

上帝已死，而我们永存。`,
    },
    {
      slug: "post-20261112-1513",
      title: "不太舒心的事情",
      date: "2026-11-12",
      tags: [],
      summary: "",
      body: `关于我为什么要写这篇，原因很简单，我被隔壁班的英语老师盯上了。
我实在是想不明白我干了啥事能被你看到，我想问问隔壁班那位英语老师，你为什么莫名其妙盯上我了，我很害怕你说实话，我好不容易才把以前精神分裂后遗症的被人监视感消掉，你现在又给我增压力，我真的会精神焦虑，我每次都认真听课，光是视奸我一个隔壁班的人本身就是你的不对，你管好自己班的学生就可以了，没必要给别的班一个和你素不相识的人搞压力，我现在精神压力很大，中午我都不吃饭直接到教室里躲着你，我食堂都不敢去了，我真没辙了TT`,
    },
    {
      slug: "hello-letter",
      title: "给各位到者的一封信",
      date: "2026-11-11",
      tags: ["萌新必读"],
      summary: "关于我第一次尝试个人网站。",
      body: `## 关于我为什么做网站

我之所以做网页，原因有很多：

- 第一：我很喜欢个人的网站科技创作，因此想入手试试看；
- 第二：拖更了很久的尝试，不得不更，再不更新没机会了。
- 第三：也是因为我目前正在上学，而且后期上班赚钱养老婆立业，很难有时间去做这些东西了

嗯总之就是这样

做这些的目的，不仅是给自己，也是给大家。

总之各位访客，我代表心尘山总领导

心辰Stellan

欢迎你♥`,
    },
    {
      slug: "pixel-dsh",
      title: "我把 DSH 的字体换成了像素字体",
      date: "2026-11-11",
      tags: ["DSH", "折腾"],
      summary: "从系统字体装不上，到自己写一个插件让 Harness 自己加载字体，中间踩了两个坑。",
      body: `## 起因

想让界面和自己的像素画对上，于是盯上了 Fusion Pixel 这套缝合像素字体。

## 第一个坑：系统字体装了但看不见

按常规做法把 ttf 拷进 \`%LOCALAPPDATA%\\Microsoft\\Windows\\Fonts\`，再写 HKCU 注册表项。文件在，注册表在，字体却怎么都不出现。

原因：Windows 的**当前用户字体**是在登录时载入字体表的，运行中写注册表不会让已经启动的进程枚举到它。

## 第二个坑：Chromium 不会重新枚举字体

就算换了个能读到字体的进程，Chromium 也在启动时把字体列表缓存住了。不重启应用，设置里填了字体族名也只会静默回退。

## 最后的做法：让 Harness 自己带字体

不碰系统字体，写了个小插件：

- Host 半边把 ttf 挂在 \`/pixel-font/font.ttf\`；
- Client 半边在页面里注入 \`@font-face\`，再覆盖主题的 \`--dsh-font-family-text\` 和 \`--dsw-font-family\`。

浏览器自己加载字体，跟系统装没装彻底无关。装完直接 \`applied\`，连重启都省了。

> 结论：遇到“系统层不生效”的问题，有时候绕开系统层比修它更快。`,
    },
    {
      slug: "big-fat-fish",
      title: "一条大肥鱼是怎么火起来的",
      date: "2026-11-06",
      tags: ["网络", "AI"],
      summary: "从一次识图乌龙，到鲸鱼娘、女仆装和“统一 D 量衡”，互联网是怎么给一个模型安排人设的。",
      body: `## 外号的来历

据说有人把 DeepSeek 的蓝色鲸鱼 logo 发给它，让它认图。它没认出自己，说这是一条“蓝色大肥鱼”。

这个称呼就这样传开了。

## 形象是接力画出来的

现在流行的“鲸鱼娘”并不是一个人的作品：先是 B 站 UP 主的原创角色，被网友加上元素、换上女仆装、做成 Q 版，几轮之后才和 DeepSeek 绑定。更早还有一个“D 老师”，蓝发黑西装，走 Hot Nerd 路线，两派粉丝甚至为“谁才是正统”吵过。

## 人设怎么来的

- R1 把推理过程摊开给用户看，被拟人化成“内心戏多”；
- 烧 token 被说成“吃白饭”；
- 答错就是犯傻，摸鱼就是摸鱼。

严肃的技术能力，到网友眼里就变成了可以调侃的性格。

## 一点感想

官方没有参与，全是用户自己养出来的形象。模型可以升级，公众认知却不一定跟着更新——这大概是每个国民级 AI 都要面对的事。`,
    },
    {
      slug: "dsh-plugin-notes",
      title: "给 DSH 写插件的三个坑",
      date: "2026-10-28",
      tags: ["DSH", "开发"],
      summary: "侧栏入口、主面板、热加载，几个第一次写插件时容易踩的点。",
      body: `## 1. 侧栏入口和面板是两个槽位

想让插件在左侧栏出现，要同时注册两个地方：

- \`sidebar.panellist\`：注册一个 id，侧栏才会长出一个图标，\`label\` 写显示名；
- \`main\`：用**同一个 id** 注册面板本体，点图标时才会切过去。

只注册一个，要么有按钮没内容，要么面板存在但点不到。

\`\`\`yaml
- insert:
    - id: study-planner
      name: '@local/study-planner'
\`\`\`

## 2. 样式别用写死的颜色

DSH 的界面用 \`--dsw-alias-*\` 这组主题变量。写死 \`#fff\` 在亮色下还行，切到暗色就一片刺眼。用变量的话，主题换了样式自动跟着走。

## 3. 装完不生效，先看 application

\`install_bundle\` 返回的 \`application\` 才是结论：

- \`applied\`：已经生效；
- \`restart-required\`：得重启应用，常见原因是包解析表变了；
- \`failed\`：看 \`error.code\`，别猜。

日志和进程列表都不能证明插件生效，槽位查询和这个字段才能。`,
    },
  ],
};
