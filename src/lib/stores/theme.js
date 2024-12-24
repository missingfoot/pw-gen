import { writable } from 'svelte/store';

// Create a media query to detect system theme preference
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

// Initialize theme based on system preference
const initialTheme = mediaQuery.matches ? 'dark' : 'light';
export const theme = writable(initialTheme);

// Update theme when system preference changes
mediaQuery.addEventListener('change', (e) => {
  theme.set(e.matches ? 'dark' : 'light');
});

// Subscribe to changes and update localStorage
theme.subscribe(value => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('theme', value);
        document.documentElement.setAttribute('data-theme', value);
    }
});
