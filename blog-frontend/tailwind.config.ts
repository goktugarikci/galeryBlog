// blog-frontend/tailwind.config.ts (YENİ DOSYA VEYA GÜNCELLENMİŞ HALİ)
import type { Config } from 'tailwindcss'

const config: Config = {
  // 1. Tailwind'e HANGİ dosyalara bakacağını söyle
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}', // <-- Bu satır çok önemli
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // 2. Veritabanından gelen renkleri Tailwind'e tanıt
      colors: {
        'primary': 'var(--color-primary)',
        'secondary': 'var(--color-secondary)',
        'background': 'var(--color-background)',
        'text': 'var(--color-text)',
        'btn-addtocart': 'var(--color-btn-addtocart)',
        'btn-addtocart-text': 'var(--color-btn-addtocart-text)',
        'colorCardBackground':'--color-card-background',
        'colorCardText':'--color-card-text',
      },
    },
  },
  plugins: [],
}
export default config