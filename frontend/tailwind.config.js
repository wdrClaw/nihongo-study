/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 日式游戏主色调 - 符合 iPhone 13 Pro Max 设计规范
        primary: {
          50: '#FFF0F5',
          100: '#FFDDEC',
          200: '#FFBDD6',
          300: '#FF94BD',
          400: '#FF6B9D', // 樱花粉主色
          500: '#FF6B9D',
          600: '#E5408A',
          700: '#C91D6F',
          800: '#A61E5C',
          900: '#7D1A45',
        },
        secondary: {
          50: '#F0F0FF',
          100: '#E0E1FF',
          200: '#C6C8FF',
          300: '#A5A8FF',
          400: '#8B90FF',
          500: '#6C5CE7', // 靛蓝紫主色
          600: '#5D4ED4',
          700: '#4C40C1',
          800: '#3E34A3',
          900: '#342C85',
        },
        accent: {
          50: '#FFFEF7',
          100: '#FFFAEB',
          200: '#FFF3C4',
          300: '#FFEB9C',
          400: '#FFE066',
          500: '#FFD93D', // 金色主色
          600: '#FFC107',
          700: '#FF9800',
          800: '#FF6F00',
          900: '#E65100',
        },
        // 游戏状态色
        success: '#00B894',
        warning: '#FF8F00',
        error: '#FF6B6B',
        info: '#4299E1',
        // 背景色系统
        background: {
          primary: '#F8F6FF',   // 淡紫白
          secondary: '#FFF5F7', // 淡粉白
          glass: 'rgba(255,255,255,0.95)',
        },
        // 文字色系统
        text: {
          primary: '#2D3436',
          secondary: '#636E72',
          light: '#A0AEC0',
        }
      },
      fontFamily: {
        // 中文字體
        'sans-cn': ['Noto Sans SC', 'PingFang SC', 'Hiragino Sans GB', 'sans-serif'],
        // 日語字體
        'sans-jp': ['Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Meiryo', 'sans-serif'],
        // 遊戲像素字體（後續替換為實際像素字體）
        'pixel': ['monospace'],
      },
      // 動畫時長
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
        '1200': '1200ms',
        '1500': '1500ms',
      },
      // 陰影
      boxShadow: {
        'game': '0 4px 16px rgba(0, 0, 0, 0.1)',
        'card': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'button': '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}