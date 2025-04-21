import type { Config } from "tailwindcss";

import base from "./base";

export default {
  content: base.content,
  presets: [base],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter_400Regular'], // Example if using @expo-google-fonts/inter
        'inter-medium': ['Inter_500Medium'],
        'inter-semibold': ['Inter_600SemiBold'],
        'inter-bold': ['Inter_700Bold'],
        bubbly: ['Fredoka-Regular'],
        'bubbly-bold': ['Fredoka-Bold']
      },
      letterSpacing: {
        widest: '0.25em'
      },
      colors: {
        primary: {
          DEFAULT: '#f472b6',
          dark: '#E3579D',
          overlay: 'rgba(244, 114, 182, 0.1)', // Slight pink background tint'
        },
        secondary: {
          DEFAULT: '#FFD166'
        },
      }
    },
    plugins: []
  },
} satisfies Config;
