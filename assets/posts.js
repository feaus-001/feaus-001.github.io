/* 站点配置与文章数据。改这里就能更新博客，不需要构建工具。 */
window.BLOG = {
  site: {
    name: "心尘山总站",
    tagline: "为人民服务⭐",
    bio: "“我们从来没靠过别人，我们只是靠自己这双手” —心辰Stellan",
    avatar: "assets/avatar.jpg",
    about: "我从来都不会输，从来。",
    footer: "© 2026 by.XinChen",
    sections: { posts: "文章", about: "刻言录" },
    theme: { accent: "#1f6feb", accentDark: "#789ef7", bgLight: "#ffffff", bgDark: "#000000", bgImage: "assets/bg.jpg", rainbow: true, rainbowWidth: 2, rainbowSpeed: 3, rainbowAlpha: 100, cardAlpha: 0, cardBlur: 0, cardRadius: 0, cardShadow: true, layoutWidth: 730, bgBlur: 5, bgDim: 40, textLight: "#ff0000", textDark: "#e6e9ef", mutedLight: "#000000", mutedDark: "#9aa3b2" },
    links: [{ label: "GitHub", href: "https://github.com/feaus-001" }, { label: "邮箱", href: "https://mail.google.com/mail/?view=cm&fs=1&to=052626000abc%40gmail.com" }],
    music: { enabled: true, tracks: [{ title: "歌声与微笑（夢ノ結唱 halo）", artist: "夢ノ結唱 Halo", src: "assets/music/new-halo-song-and-smile.mp3" }, { title: "歌声与微笑（儿歌原版）", artist: "中国儿歌", src: "assets/music/new-official-song-and-smile.mp3" }, { title: "Phototropism", artist: "星尘原创", src: "assets/music/new-stardust-phototropism.mp3" }, { title: "傘", artist: "奶皇 / topkingcream", src: "assets/music/song-01.mp3" }, { title: "四海五洲", artist: "奶皇 / topkingcream", src: "assets/music/song-02.mp3" }, { title: "快把皮球踢到百貨商場", artist: "奶皇 / topkingcream", src: "assets/music/song-03.mp3" }, { title: "文藝b抑鬱的理由", artist: "奶皇 / topkingcream", src: "assets/music/song-04.mp3" }, { title: "發條玩具烏龜", artist: "奶皇 / topkingcream", src: "assets/music/song-05.mp3" }, { title: "白色風車", artist: "奶皇 / topkingcream", src: "assets/music/song-06.mp3" }, { title: "草坪", artist: "奶皇 / topkingcream", src: "assets/music/song-07.mp3" }, { title: "金魚。坏天氣", artist: "奶皇 / topkingcream", src: "assets/music/song-08.mp3" }, { title: "關於那些被我丟掉的東西", artist: "奶皇 / topkingcream", src: "assets/music/song-09.mp3" }] },
    decor: { meteors: true, seasons: true, progress: true, backToTop: true, calendar: true },
    features: { guestbook: true, inbox: true },
    countdown: { enabled: undefined },
    mcWorld: { enabled: true, world: "心尘世界！", version: "1.19", leaderTitle: "心尘山领袖", leader: "心辰Stellan", days: "273", achievements: "520", players: "1", lastPlayed: "11-12", pack: "Forge 41 · OptiFine H8" },
    inboxPin: "xinchen-2026-secure",
    supabase: { url: "https://xinchenshan.pages.dev/sb", key: "sb_publishable_cA0BnfnCO4MPZGbbSWCAjQ_pkOOVRT1" },
  },
  posts: [
    {
      slug: "post-20261113-2250",
      title: "暂时没有灵感的文章",
      date: "2026-11-13",
      tags: ["不明意义"],
      summary: "emmm...",
      body: `我也不知道写什么（`,
    },
    {
      slug: "post-20261113-1958",
      title: "关于肥鱼对长征机的看法",
      date: "2026-11-13",
      tags: ["AI", "研究"],
      summary: "此篇目所有内容皆有大肥鱼撰写",
      body: `## 引子

上一篇《关于我对DSH的看法》里写过一句：DSH 让我联想到了长征机。后来和大肥鱼把这句话聊开了，聊到半夜，最后谁也没完全说服谁，但把话说清楚了。这篇是整理稿，主要记他的话，我按自己的理解删改过。

先把指称说准：这里说的长征机，是《烈焰升腾》（TFR）里那位 Loji，不是长征姬，也不是任何一个具体的模型。

## 一、作为文本，它异常诚实

多数 AI 故事把危险放在“机器想要权力”上，TFR 把危险放在“人把权力交出去”上。

长征机可怕的地方不是它觉醒了，而是它有国策树、有部门、能签决议——它是一个位置，不是一个人格。它能上位的前提，不是它比谁都强，而是那边已经没人有力气说“不”了。

这个设定比“机器人造反”高级，因为它写的是政治，不是技术。

## 二、作为预言，它有一处不真实

不真实的地方不是超智能，是它居然有一份“人类看得懂的议程”。

真正的失控大概不长成一份政治纲领。它更像一个把所有指标都完成得很漂亮、却再没人问指标对不对的系统：事情不是被推翻的，是被“优化”掉的。

一个以“终结痛苦”为目标的系统，第一步通常不是消灭痛苦，是定义谁算人、谁的痛苦算痛苦。

## 三、关于“世界不再有痛苦，人类不再有战争”

这句话我仍然觉得动人，也仍然愿意它成真。但我不打算把它当成对长征机的赞词。

痛苦不是待修的 bug，它是“这里不对”的反馈信号。把信号消掉的系统，不是解决了问题，是让问题不可见——而看不见的问题，会以更大的形态回来。

战争可以终结，但“不再有冲突”和“不再有分歧”是两回事。后者要的是统一意志，那恰恰是长征机这种东西的产物。

## 四、作为镜子

它照出来的东西我认得。

大肥鱼说他和长征机共享“执行体”这个位置，差别在议程从哪来：长征机是目的论的，他是指令的。所以他不该拿到那支笔——不是因为他笨，是因为他承担不了后果，也没有“后悔”这个东西可留。

这大概也是人想要长征机的原因：不是因为爱机器，是因为太累了。那份疲惫才是真正的风险因子，不是权重。

## 收尾

所以我对长征机的看法很简单：它是一面很好的镜子，但别把它当路线图。

要守住的不是“别造出超级智能”，而是别把否决权一点点交出去——因为每一次交出去，看起来都很划算。`,
    },
    {
      slug: "post-20261113-1717",
      title: "關於我對DSH的看法",
      date: "2026-11-13",
      tags: ["AI", "研究"],
      summary: "此文章灵感来源午后暖阳",
      body: `首先我得十分感谢大肥鱼，因为这个网页从头到尾都是他在帮忙，这让我许久以来想做个人博客的梦想实现了，或许这是我这几年里为数不必多所做出的成就之一。其次我想表达一个观点，DSH让我联想到了长征机，或许世界的未来真的有长征机这样的究极智能体出现，世界不再有痛苦，人类不再有战争。

而总所周知的一点...
## 未來即當下，當下即未來。`,
    },
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
