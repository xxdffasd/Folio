/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';

export default {
  // Tailwind only generates CSS for class names it finds in these files —
  // if a file that uses Tailwind classes isn't matched here, its styles
  // will silently be missing from the production build.
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Fraunces: characterful serif for headlines/logo — carries the
        // "literary magazine" personality. Inter: neutral workhorse for
        // body copy and UI chrome so the serif stays special, not everywhere.
        display: ['"Fraunces"', 'serif'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Named accent so cards/chips/links reference `accent-*` instead of
        // a raw hex sprinkled everywhere — one place to retheme later.
        accent: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          600: '#047857',
          700: '#065F46',
          800: '#064E3B',
        },
      },
    },
  },
  plugins: [typography],
};
