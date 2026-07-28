import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { GlobalAudioProvider } from '@/components/audio/global-audio-provider';
import { ThemeProvider } from '@/components/theme-provider';
import '@fontsource-variable/newsreader';
import '@fontsource-variable/newsreader/wght-italic.css';
import '@fontsource-variable/noto-serif-sc';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github-dark.css';
import './globals.css';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Kinda RSS"
          href="/feed.xml"
        />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <GlobalAudioProvider>
            <div className="page-noise" aria-hidden="true" />
            {children}
            <SpeedInsights />
            <Analytics />
          </GlobalAudioProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
