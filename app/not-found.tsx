import Link from 'next/link';
import { ArrowLeft, Asterisk } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="site-container grid min-h-[65svh] place-items-center py-20 text-center">
      <div>
        <Asterisk className="mx-auto mb-7 h-8 w-8 text-accent" />
        <p className="section-index">Error / 404</p>
        <h1 className="mt-4 font-display text-[clamp(5rem,18vw,12rem)] leading-none tracking-[-0.08em]">
          走丢了
        </h1>
        <p className="mx-auto mt-5 max-w-md leading-7 text-muted-foreground">
          这一页可能被移动了，也可能从来没有存在过。
        </p>
        <Link href="/" className="back-link mb-0 mt-9">
          <ArrowLeft /> 回到首页
        </Link>
      </div>
    </div>
  );
}
