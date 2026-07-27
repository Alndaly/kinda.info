export const locales = ['zh', 'en'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'zh';

export function hasLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function localizeHref(locale: Locale, href: string) {
  if (
    locale === defaultLocale ||
    href.startsWith('http') ||
    href.startsWith('mailto:') ||
    href.startsWith('#')
  ) {
    return href;
  }

  if (href === '/') return `/${locale}`;
  return `/${locale}${href}`;
}

export function getLocaleAlternates(locale: Locale, href: string) {
  return {
    canonical: localizeHref(locale, href),
    languages: {
      'zh-CN': href,
      en: localizeHref('en', href),
      'x-default': href,
    },
  };
}

const zh = {
  metadata: {
    title: 'Kinda — 笔记、影像与作品',
    description: '关于代码、影像与日常感受的个人档案。把认真做过的东西，安静地留在这里。',
    keywords: ['Kinda', '七月', '个人网站', '笔记', '摄影', '独立开发', 'MDX'],
  },
  header: {
    homeLabel: 'Kinda 首页',
    navigationLabel: '主导航',
    mobileNavigationLabel: '移动端导航',
    hello: 'Say hello',
    items: {
      notes: '笔记',
      photography: '摄影',
      projects: '作品',
      about: '关于',
    },
  },
  footer: {
    manifesto: ['愿我们仍然对世界好奇，', '也仍然有力气把它做好。'],
    notes: 'Notes',
    frames: 'Frames',
    xiaohongshu: '小红书',
    wechat: '公众号',
    made: 'Made slowly in HangZhou · Built from local MDX',
  },
  home: {
    archive: 'Personal archive · No. 07',
    eyebrow: 'Notes, frames & things I make',
    displayName: '七月',
    intro: ['一个关于代码、影像和生活感受的个人档案。', '我把认真想过、看见过、做出来的东西，安静地留在这里。'],
    read: '开始阅读',
    seeWorld: '看看我眼中的世界',
    photoAlt: '七月在旅途中',
    noteLabel: '今日小记',
    note: ['把生活调到', '适合自己的焦距。'],
    scroll: 'Scroll to wander',
    recentThoughts: '最近在想',
    allNotes: '全部笔记',
    recentFrames: '最近看见',
    allFrames: '完整暗房',
    recentProjects: '最近在做',
    allProjects: '所有作品',
    manifesto: [
      '我不想让这里变成另一条需要追赶的时间线。',
      '它更像一张桌子：放着翻到一半的书、冲洗好的照片，',
      '还有几个仍在长大的小产品。',
    ],
    meet: '认识 Kinda',
  },
  notes: {
    title: '笔记',
    description: '关于开发、设计与生活的长期笔记。',
    intro: '写给未来的自己，也写给偶然路过的你。这里没有信息流，只有值得慢一点读的东西。',
    back: '回到笔记',
    minRead: '分钟阅读',
    thanks: '谢谢你读到这里。',
    continue: '继续漫游笔记',
    readAria: '阅读',
  },
  photography: {
    title: '暗房',
    metadataTitle: '摄影',
    description: '一些被光照亮，也被我记住的瞬间。',
    intro: '我拍照，不是为了证明去过哪里。只是有些光、有些表情，如果不按下快门，就会永远消失。',
    diary: '一份持续生长的视觉日记 · 始于 2022',
    back: '回到暗房',
  },
  projects: {
    title: '作品',
    description: '在真实世界里试着解决问题的一些产品与开源项目。',
    intro: '代码只是材料，产品才是我和世界对话的方式。这里收录正在生长的产品、开源工具，也保留那些曾经认真做过的实验。',
    back: '回到作品',
    visit: '查看项目',
  },
  about: {
    metadataTitle: '关于',
    metadataDescription: '你好，我是 Kinda。一个写代码、拍照片，也认真生活的人。',
    title: ['你好，', '我是 Kinda。'],
    portraitAlt: '七月在旅途中',
    lead: '一个写代码、拍照片，也认真生活的人。',
    columns: [
      '我喜欢把模糊的问题拆开，再把它们重新做成清晰、好用、有一点温度的东西。开发是我理解世界的方式，摄影则提醒我：不是所有重要的事都需要被解释。',
      '这个网站不是简历，也不是内容平台。它是一份持续生长的个人档案——收留长笔记、路上的光、做过的产品，以及那些暂时还说不清楚的念头。',
    ],
    elsewhere: '在别处找到我',
    elsewhereDescription: '文章、视频与生活碎片会落在不同的地方。挑一个你习惯的入口，我们在那里见。',
    wechat: '微信公众号',
    wechatDescription: '扫描二维码关注「七月文」，读一些更完整的文字。',
    wechatAlt: '微信公众号七月文二维码',
    bilibili: '哔哩哔哩',
    xiaohongshu: '小红书',
    xiaohongshuDestination: '去看看生活切片',
  },
  notFound: {
    title: '走丢了',
    description: '这一页可能被移动了，也可能从来没有存在过。',
    back: '回到首页',
  },
} as const;

const en = {
  metadata: {
    title: 'Kinda — Notes, Frames & Things',
    description: 'A personal archive of code, photography, products, and the quiet observations that shape a life.',
    keywords: ['Kinda', 'July', 'personal website', 'notes', 'photography', 'indie developer', 'MDX'],
  },
  header: {
    homeLabel: 'Kinda home',
    navigationLabel: 'Primary navigation',
    mobileNavigationLabel: 'Mobile navigation',
    hello: 'Say hello',
    items: {
      notes: 'Notes',
      photography: 'Frames',
      projects: 'Work',
      about: 'About',
    },
  },
  footer: {
    manifesto: ['May we stay curious about the world,', 'and still have the strength to make it better.'],
    notes: 'Notes',
    frames: 'Frames',
    xiaohongshu: 'REDnote',
    wechat: 'WeChat',
    made: 'Made slowly in Hangzhou · Built from local MDX',
  },
  home: {
    archive: 'Personal archive · No. 07',
    eyebrow: 'Notes, frames & things I make',
    displayName: 'July',
    intro: ['A personal archive of code, images, and everyday feeling.', 'Things I have thought through, witnessed, and made—kept here quietly.'],
    read: 'Start reading',
    seeWorld: 'See the world through my eyes',
    photoAlt: 'July on the road',
    noteLabel: 'A note for today',
    note: ['Adjust life to', 'your own focal length.'],
    scroll: 'Scroll to wander',
    recentThoughts: 'Recent thoughts',
    allNotes: 'All notes',
    recentFrames: 'Recently seen',
    allFrames: 'Enter the darkroom',
    recentProjects: 'Currently making',
    allProjects: 'All work',
    manifesto: [
      'I do not want this place to become another timeline to chase.',
      'It is more like a desk: a half-read book, developed photographs,',
      'and a few small products still learning how to grow.',
    ],
    meet: 'Meet Kinda',
  },
  notes: {
    title: 'Notes',
    description: 'Long-form notes on development, design, and living.',
    intro: 'Written for my future self, and for whoever happens to pass by. No feed here—only things worth reading slowly.',
    back: 'Back to notes',
    minRead: 'min read',
    thanks: 'Thank you for reading this far.',
    continue: 'Keep wandering',
    readAria: 'Read',
  },
  photography: {
    title: 'Darkroom',
    metadataTitle: 'Photography',
    description: 'Moments held by light, and remembered by me.',
    intro: 'I do not take photographs to prove where I have been. Some light and expressions simply disappear forever unless the shutter is pressed.',
    diary: 'An ongoing visual diary · Since 2022',
    back: 'Back to the darkroom',
  },
  projects: {
    title: 'Work',
    description: 'Products and open-source projects made to solve real problems.',
    intro: 'Code is only material; products are how I speak with the world. These are growing products, open tools, and experiments once pursued in earnest.',
    back: 'Back to work',
    visit: 'Visit project',
  },
  about: {
    metadataTitle: 'About',
    metadataDescription: 'Hello, I am Kinda—a developer, photographer, and someone trying to live attentively.',
    title: ['Hello,', 'I am Kinda.'],
    portraitAlt: 'July on the road',
    lead: 'I write code, take photographs, and try to live attentively.',
    columns: [
      'I like taking vague problems apart and rebuilding them into things that feel clear, useful, and a little warm. Development is how I understand the world; photography reminds me that not everything important needs an explanation.',
      'This website is neither a résumé nor a content platform. It is a growing personal archive for long notes, light found on the road, products I have made, and thoughts that are not ready to be named.',
    ],
    elsewhere: 'Find me elsewhere',
    elsewhereDescription: 'Essays, videos, and fragments of daily life settle in different places. Choose the doorway that feels familiar.',
    wechat: 'WeChat Official Account',
    wechatDescription: 'Scan the code and follow “七月文” for longer writing in Chinese.',
    wechatAlt: 'QR code for the 七月文 WeChat Official Account',
    bilibili: 'Bilibili',
    xiaohongshu: 'REDnote',
    xiaohongshuDestination: 'See fragments of daily life',
  },
  notFound: {
    title: 'Lost',
    description: 'This page may have moved, or perhaps it never existed.',
    back: 'Back home',
  },
} as const;

export const dictionaries = { zh, en };

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
