import type { ComponentType } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  iconLeft?: ComponentType<{ size?: number; color?: string }>;
  iconRight?: ComponentType<{ size?: number; color?: string }>;
}

type ButtonColors = {
  outline: string;
  primary: string;
  secondaryContainer: string;
};

export const Button = ({
  title,
  onPress,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  iconLeft,
  iconRight,
}: ButtonProps) => {
  const { colors } = useTheme();
  const IconLeft = iconLeft;
  const IconRight = iconRight;
  const textColor = variant === 'outline' || variant === 'secondary' ? colors.primary : colors.onPrimary;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.container,
        variant === 'primary' && getPrimaryStyle(colors),
        variant === 'secondary' && getSecondaryStyle(colors),
        variant === 'outline' && getOutlineStyle(colors),
        size === 'small' && styles.sizeSmall,
        size === 'medium' && styles.sizeMedium,
        size === 'large' && styles.sizeLarge,
        disabled && styles.disabled,
      ]}
    >
      <View style={styles.iconContainer}>
        {IconLeft ? <IconLeft size={20} color={textColor} /> : null}
        <Text style={[styles.text, { color: textColor }]}>{title}</Text>
        {IconRight ? <IconRight size={20} color={textColor} /> : null}
      </View>
    </Pressable>
  );
};

const getPrimaryStyle = (colors: ButtonColors) => ({
  backgroundColor: colors.primary,
});

const getSecondaryStyle = (colors: ButtonColors) => ({
  backgroundColor: colors.secondaryContainer,
});

const getOutlineStyle = (colors: ButtonColors) => ({
  borderWidth: 1,
  borderColor: colors.outline,
  backgroundColor: 'transparent',
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sizeSmall: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  sizeMedium: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  sizeLarge: {
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  disabled: {
    opacity: 0.5,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});
