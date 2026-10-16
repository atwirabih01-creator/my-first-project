// Zaki design tokens: bright, calm colours; big rounded shapes.
import { Platform } from 'react-native';

export const C = {
  bg: '#EAF6F7',
  card: '#FFFFFF',
  text: '#1E3A4C',
  textSoft: '#4B6575',
  border: '#D5E5EA',
  primary: '#1F7F8A', // white text on this passes WCAG AA
  primarySoft: '#D8F1F3',
  mint: '#25804F',
  mintSoft: '#E2F5EA',
  sun: '#FFC857',
  sunSoft: '#FFF4D6',
  coral: '#C2453A', // "I need help" (white text AA)
  coralSoft: '#FFE6E2',
  lilac: '#6A55A8',
  lilacSoft: '#EFEAFB',
  wrong: '#B54708',
  wrongSoft: '#FFF0E0',
  owlBody: '#2A9DAA',
  owlBelly: '#D8F1F3',
  beak: '#FF9F43',
  owlDark: '#1F7F8A',
  cheek: '#FF8A65',
  waGreen: '#075E54',
  waBubble: '#DCF8C6',
  waBg: '#ECE5DD',
};

export const R = { sm: 12, md: 18, lg: 26, pill: 999 };
export const S = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const MaxWidth = 560;

/** Dyslexia-friendly option: a plain, widely available sans font with extra spacing. */
export const DyslexiaFont = Platform.select({
  ios: 'Verdana',
  android: 'sans-serif',
  web: 'Verdana, "Trebuchet MS", Tahoma, Arial, sans-serif',
  default: undefined,
});
