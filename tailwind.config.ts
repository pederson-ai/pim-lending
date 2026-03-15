import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(214 32% 91%)',
        input: 'hsl(214 32% 91%)',
        ring: 'hsl(221 83% 53%)',
        background: 'hsl(210 40% 98%)',
        foreground: 'hsl(222 47% 11%)',
        muted: 'hsl(210 40% 96%)',
        'muted-foreground': 'hsl(215 16% 47%)',
        card: 'hsl(0 0% 100%)',
        'card-foreground': 'hsl(222 47% 11%)',
        primary: 'hsl(221 83% 53%)',
        'primary-foreground': 'hsl(210 40% 98%)',
        secondary: 'hsl(210 40% 96%)',
        'secondary-foreground': 'hsl(222 47% 11%)',
        accent: 'hsl(210 40% 96%)',
        'accent-foreground': 'hsl(222 47% 11%)'
      }
    }
  },
  plugins: [],
}

export default config
