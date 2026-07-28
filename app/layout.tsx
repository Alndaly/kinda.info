import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { GlobalAudioProvider } from '@/components/audio/global-audio-provider';
import { ThemeProvider } from '@/components/theme-provider';
import '@fontsource-variable/newsreader';
import '@fontsource-variable/newsreader/wght-italic.css';
import '@fontsource-variable/noto-serif-sc';
import 'katex/dist/katex.min.css';
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
            <div
              className="pointer-events-none fixed inset-0 z-[60] bg-[image:repeating-radial-gradient(circle_at_20%_30%,transparent_0,rgba(0,0,0,0.7)_0.65px,transparent_1.2px),repeating-radial-gradient(circle_at_80%_70%,transparent_0,rgba(0,0,0,0.6)_0.55px,transparent_1.1px)] bg-[length:5px_7px,7px_5px] opacity-[0.035] mix-blend-multiply dark:opacity-[0.045] dark:mix-blend-screen dark:invert"
              aria-hidden="true"
            />
            {children}
            <SpeedInsights />
            <Analytics />
          </GlobalAudioProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
