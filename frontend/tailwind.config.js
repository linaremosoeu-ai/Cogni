const config = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        slate: {
          850: '#0f172a',
          900: '#0f172a'
        },
        indigo: {
          600: '#4f46e5',
          700: '#4338ca'
        }
      },
      fontFamily: {
        jakarta: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    }
  },
  plugins: []
};

export default config;
