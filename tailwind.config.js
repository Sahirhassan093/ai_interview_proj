/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
      './app/**/*.{ts,tsx}',
      './components/**/*.{ts,tsx}',
      './pages/**/*.{ts,tsx}',
    ],
    theme: {
      extend: {
        colors: {
          background: 'var(--background)',
          foreground: 'var(--foreground)',
          card: 'var(--card)',
          'card-foreground': 'var(--card-foreground)',
          primary: 'var(--primary)',
          'primary-foreground': 'var(--primary-foreground)',
          secondary: 'var(--secondary)',
          'secondary-foreground': 'var(--secondary-foreground)',
          muted: 'var(--muted)',
          'muted-foreground': 'var(--muted-foreground)',
          accent: 'var(--accent)',
          'accent-foreground': 'var(--accent-foreground)',
          destructive: 'var(--destructive)',
          border: 'var(--border)',
          input: 'var(--input)',
          ring: 'var(--ring)',
          // Add more if needed
        },
      },
    },
    plugins: [
      require('tailwindcss-animate'),
    ],
  };
  