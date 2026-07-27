import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Asterisk } from 'lucide-react';

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
            src="https://oss.kinda.info/image/202407162310900.jpg"
            alt="Kinda"
            fill
            priority
            sizes="(max-width: 768px) 90vw, 38vw"
            className="object-cover"
          />
          <span>Self portrait / 2024</span>
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
    </div>
  );
}
