import { lightColors, darkColors, getThemeColors } from './colors';
import { typography } from './typography';

// Theme context will be created in a separate file
export { lightColors, darkColors, getThemeColors, typography };

// Default export for backward compatibility
export const lightTheme = {
  ...lightColors,
  ...typography,
};

export const darkTheme = {
  ...darkColors,
  ...typography,
};
