export type ThemePreference = 'system' | 'light' | 'dark';

export const THEME_STORAGE_KEY = 'artinary-theme-preference';

export const THEME_EVENT = 'artinary-theme-change';

const isThemePreference = (value: string): value is ThemePreference => {
  return value === 'system' || value === 'light' || value === 'dark';
};

export const getSystemPreferDark = () => {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
};

export const resoveIsDark = (preference: ThemePreference) => {
  if (preference === 'dark') return true;
  if (preference === 'light') return false;
  return getSystemPreferDark();
};

export const readStoredTheme = (): ThemePreference => {
  if (typeof window === 'undefined') return 'system';
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored && isThemePreference(stored) ? stored : 'system';
};

export const writeStoredTheme = (preference: ThemePreference) => {
  localStorage.setItem(THEME_STORAGE_KEY, preference);
};

export const applyTheme = (preference: ThemePreference) => {
  const root = document.documentElement;
  const isDark = resoveIsDark(preference);
  root.classList.toggle('dark', isDark);
  root.dataset.theme = preference;
  root.style.colorScheme = isDark ? 'dark' : 'light';
};

export const notifyThemeChange = (preference: ThemePreference) => {
  window.dispatchEvent(
    new CustomEvent<ThemePreference>(THEME_EVENT, { detail: preference }),
  );
};
