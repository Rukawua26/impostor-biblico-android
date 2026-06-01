// Material Design 3 Color System
export const lightColors = {
  // Primary
  primary: '#6750A4',
  onPrimary: '#FFFFFF',
  primaryContainer: '#EADDFF',
  onPrimaryContainer: '#21005D',

  // Secondary
  secondary: '#625B71',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#E8DEF8',
  onSecondaryContainer: '#1D192B',

  // Tertiary
  tertiary: '#7D5260',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#FFD8E4',
  onTertiaryContainer: '#31111D',

  // Background
  background: '#FEF7FF',
  onBackground: '#1D1B20',

  // Surface
  surface: '#FDF8FD',
  onSurface: '#1D1B20',
  surfaceVariant: '#E7E0EC',
  onSurfaceVariant: '#49454F',
  outline: '#79747E',

  // Surface Containers
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#F7F2FA',
  surfaceContainer: '#F3EDF7',
  surfaceContainerHigh: '#ECE6F0',
  surfaceContainerHighest: '#E6E1E5',

  // Error
  error: '#BA1A1A',
  onError: '#FFFFFF',
  errorContainer: '#F2B8B5',
  onErrorContainer: '#601410',
};

export const darkColors = {
  // Primary
  primary: '#D0BCFF',
  onPrimary: '#381E72',
  primaryContainer: '#4F378B',
  onPrimaryContainer: '#EADDFF',

  // Secondary
  secondary: '#CCC2DC',
  onSecondary: '#382E5D',
  secondaryContainer: '#4F4758',
  onSecondaryContainer: '#EADDFF',

  // Tertiary
  tertiary: '#EFB8C8',
  onTertiary: '#492532',
  tertiaryContainer: '#633B48',
  onTertiaryContainer: '#FFD8E4',

  // Background
  background: '#141218',
  onBackground: '#E6E1E5',

  // Surface
  surface: '#1D1B20',
  onSurface: '#E6E1E5',
  surfaceVariant: '#49454F',
  onSurfaceVariant: '#CAC4D0',
  outline: '#938F99',

  // Surface Containers
  surfaceContainerLowest: '#1D1B20',
  surfaceContainerLow: '#2C2A2F',
  surfaceContainer: '#302E33',
  surfaceContainerHigh: '#3A373D',
  surfaceContainerHighest: '#4F4B56',

  // Error
  error: '#FFB4AB',
  onError: '#690005',
  errorContainer: '#93000A',
  onErrorContainer: '#FFDAD6',
};

// Export the current theme based on system preference (can be overridden by context)
export type Colors = typeof lightColors;

export const getThemeColors = (useDarkMode: boolean) => (useDarkMode ? darkColors : lightColors);
