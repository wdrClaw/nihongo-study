/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 日語遊戲主色調 - 櫻花粉 + 靛藍 + 金色
        primary: {
          50: '#FFF0F3',
          100: '#FFDDEC',
          200: '#FFC2DA',
          300: '#FF94BD',
          400: '#FF5694',
          500: '#FFB7C5', // 櫻花粉主色
          600: '#F7407A',
          700: '#E11D48',
          800: '#BE123C',
          900: '#9F1239',
        },
        secondary: {
          50: '#EBEDF9',
          100: '#C5CAE9',
          200: '#9FA8DA',
          300: '#7986CB',
          400: '#5C6BC0',
          500: '#3F51B5', // 靛藍主色
          600: '#3949AB',
          700: '#303F9F',
          800: '#283593',
          900: '#1A237E',
        },
        accent: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#FFD700', // 金色主色
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        // 遊戲狀態色
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
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