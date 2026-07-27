import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Asterisk, BookOpenText, MessageCircle, Play } from 'lucide-react';
import { siteConfig } from '@/site.config';

export const metadata: Metadata = {
  title: '关于',
  description: '你好，我是 Kinda。一个写代码、拍照片，也认真生活的人。',
};

export default function AboutPage() {
  return (
    <div className="site-container page-top">
      <header className="about-hero">
        <div>
          <span className="section-index">Index / 04</span>
          <h1>你好，<br />我是 Kinda。</h1>
        </div>
        <div className="about-portrait">
          <Image
            src="/images/july-portrait.jpg"
            alt="七月在旅途中"
            fill
            priority
            sizes="(max-width: 768px) 90vw, 38vw"
            className="object-cover"
          />
          <span>Portrait / July</span>
        </div>
      </header>

      <section className="about-copy">
        <Asterisk className="h-7 w-7 text-accent" />
        <div>
          <p className="about-lead">一个写代码、拍照片，也认真生活的人。</p>
          <div className="about-columns">
            <p>我喜欢把模糊的问题拆开，再把它们重新做成清晰、好用、有一点温度的东西。开发是我理解世界的方式，摄影则提醒我：不是所有重要的事都需要被解释。</p>
            <p>这个网站不是简历，也不是内容平台。它是一份持续生长的个人档案——收留长笔记、路上的光、做过的产品，以及那些暂时还说不清楚的念头。</p>
          </div>
          <div className="mt-10 flex flex-wrap gap-5">
            <Link className="text-link" href="https://github.com/Alndaly" target="_blank">GitHub <ArrowUpRight /></Link>
            <Link className="text-link" href="mailto:1142704468@qq.com">Email <ArrowUpRight /></Link>
          </div>
        </div>
      </section>

      <section id="contact" className="about-contact">
        <header className="about-contact-heading">
          <span className="section-index">Elsewhere / 05</span>
          <div>
            <h2>在别处找到我</h2>
            <p>文章、视频与生活碎片会落在不同的地方。挑一个你习惯的入口，我们在那里见。</p>
          </div>
        </header>

        <div className="contact-grid">
          <article className="contact-wechat">
            <div className="contact-card-heading">
              <span className="contact-index">01</span>
              <MessageCircle aria-hidden="true" />
            </div>
            <div>
              <span className="contact-kicker">WeChat Official Account</span>
              <h3>微信公众号</h3>
              <p>扫描二维码关注「七月文」，读一些更完整的文字。</p>
            </div>
            <div className="contact-qr">
              <Image
                src={siteConfig.wechatQr}
                alt="微信公众号七月文二维码"
                width={1200}
                height={1164}
                sizes="(max-width: 768px) 82vw, 34vw"
              />
            </div>
          </article>

          <Link
            className="contact-channel contact-bilibili"
            href={siteConfig.bilibili}
            target="_blank"
            rel="noreferrer"
          >
            <div className="contact-card-heading">
              <span className="contact-index">02</span>
              <Play aria-hidden="true" />
            </div>
            <div>
              <span className="contact-kicker">Video / Making</span>
              <h3>哔哩哔哩</h3>
            </div>
            <span className="contact-destination">
              UID 391938956 <ArrowUpRight aria-hidden="true" />
            </span>
          </Link>

          <Link
            className="contact-channel contact-xiaohongshu"
            href={siteConfig.xiaohongshu}
            target="_blank"
            rel="noreferrer"
          >
            <div className="contact-card-heading">
              <span className="contact-index">03</span>
              <BookOpenText aria-hidden="true" />
            </div>
            <div>
              <span className="contact-kicker">Frames / Daily Life</span>
              <h3>小红书</h3>
            </div>
            <span className="contact-destination">
              去看看生活切片 <ArrowUpRight aria-hidden="true" />
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
