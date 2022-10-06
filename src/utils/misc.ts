export const isDarkMode = () => document.documentElement.classList.contains('dark');

export const prefersDarkTheme = () => window.matchMedia('(prefers-color-scheme: dark)').matches;
