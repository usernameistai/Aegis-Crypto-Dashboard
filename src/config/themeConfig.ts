export interface Theme {
  label: string;
  className: string;
}

export const themeConfig: Theme[] = [
  { label: 'Default', className: 'background' },
  { label: 'Night', className: 'background-nighttime' },
  { label: 'Spring', className: 'background-spring' },
  { label: 'Summer', className: 'background-summer' },
  { label: 'Autumn', className: 'background-autumn' },
  { label: 'Winter', className: 'background-winter' },
];
export const preload_images = [
  '/background.webp',
  '/backgroundNighttime.webp',
  '/spring.webp',
  '/summer.webp',
  '/autumn.webp',
  '/winter.webp',
];