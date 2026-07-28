const config = {
  darkMode: ['class'],
  content: [
    './components/**/*.{js,ts,jsx,tsx,md,mdx}',
    './app/**/*.{js,ts,jsx,tsx,md,mdx}',
    './lib/**/*.{js,ts}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'PingFang SC',
          'Hiragino Sans GB',
          'Microsoft YaHei',
          'sans-serif',
        ],
        display: [
          'Newsreader Variable',
          'Noto Serif SC Variable',
          'Songti SC',
          'Georgia',
          'serif',
        ],
        mono: ['ui-monospace', 'monospace'],
        code: ['SFMono-Regular', 'Consolas', 'monospace'],
      },
      colors: {
        paper: 'hsl(var(--paper))',
        ink: 'hsl(var(--ink))',
        line: 'hsl(var(--line))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        memo: {
          DEFAULT: 'hsl(var(--memo-raw))',
          ink: 'hsl(var(--memo-ink))',
        },
        inverse: {
          background: 'hsl(var(--inverse-background))',
          foreground: 'hsl(var(--inverse-foreground))',
          muted: 'hsl(var(--inverse-muted-foreground))',
          line: 'hsl(var(--inverse-line))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'slow-spin': {
          to: { transform: 'rotate(360deg)' },
        },
        'nudge-down': {
          '0%, 100%': { transform: 'translateY(-2px)' },
          '50%': { transform: 'translateY(3px)' },
        },
        'fade-in': {
          from: { opacity: '0' },
        },
        'dialog-in': {
          from: { opacity: '0', transform: 'translateY(-0.75rem) scale(0.985)' },
        },
        'backdrop-enter': {
          from: { opacity: '0', transform: 'scale(1.035)' },
        },
        'backdrop-drift': {
          to: { transform: 'scale(1.055) translate3d(-0.6%, -0.4%, 0)' },
        },
      },
      animation: {
        'slow-spin': 'slow-spin 22s linear infinite',
        spinner: 'slow-spin 1s linear infinite',
        'nudge-down': 'nudge-down 1.8s ease-in-out infinite',
        'fade-in': 'fade-in 220ms ease',
        'dialog-in': 'dialog-in 260ms cubic-bezier(0.22, 1, 0.36, 1)',
        'backdrop-enter': 'backdrop-enter 900ms ease',
        'backdrop-drift': 'backdrop-drift 26s ease-in-out infinite alternate',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
