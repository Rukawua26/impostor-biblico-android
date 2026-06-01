import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';

type IntroScreenProps = {
  onFinish: () => void;
};

const INTRO_DURATION = 6000;

export function IntroScreen({ onFinish }: IntroScreenProps) {
  const { colors } = useTheme();
  const screenOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslate = useRef(new Animated.Value(15)).current;
  const dividerOpacity = useRef(new Animated.Value(0)).current;
  const authorOpacity = useRef(new Animated.Value(0)).current;
  const finishedRef = useRef(false);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onFinish();
  }, [onFinish]);

  useEffect(() => {
    const timeout = setTimeout(finish, INTRO_DURATION);

    return () => clearTimeout(timeout);
  }, [finish]);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(screenOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslate, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(dividerOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(authorOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(2000),
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(finish);

    return () => {
      screenOpacity.stopAnimation();
      logoScale.stopAnimation();
      logoOpacity.stopAnimation();
      textOpacity.stopAnimation();
      textTranslate.stopAnimation();
      dividerOpacity.stopAnimation();
      authorOpacity.stopAnimation();
    };
  }, [
    authorOpacity,
    dividerOpacity,
    finish,
    logoOpacity,
    logoScale,
    screenOpacity,
    textOpacity,
    textTranslate,
  ]);

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity, backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <Animated.View
        style={[
          styles.logoWrapper,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
            backgroundColor: colors.secondaryContainer,
            borderColor: colors.outline,
          },
        ]}
      >
        <Image source={require('../../assets/icon.png')} style={styles.logo} />
      </Animated.View>
      <Animated.View
        style={[styles.textBlock, { opacity: textOpacity, transform: [{ translateY: textTranslate }] }]}
      >
        <Text style={[styles.title, { color: colors.onSurface }]}>El Impostor Biblico</Text>
        <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
          Juego presencial de deduccion
        </Text>
      </Animated.View>
      <Animated.View style={[styles.divider, { opacity: dividerOpacity, backgroundColor: colors.primary }]} />
      <Animated.View style={[styles.authorBlock, { opacity: authorOpacity }]}>
        <Text style={[styles.authorLabel, { color: colors.onSurfaceVariant }]}>Creado por</Text>
        <Text style={[styles.authorName, { color: colors.onSurface }]}>Miguel Angel Oñate</Text>
        <Text style={[styles.rightsText, { color: colors.onSurfaceVariant }]}>
          Reservados todos los derechos
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#2A23CF',
    flex: 1,
    justifyContent: 'center',
    padding: 28,
  },
  logoWrapper: {
    alignItems: 'center',
    backgroundColor: '#B76288',
    borderColor: '#FF4406',
    borderRadius: 32,
    borderWidth: 2,
    height: 200,
    justifyContent: 'center',
    shadowColor: '#FF4406',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    width: 200,
  },
  logo: {
    borderRadius: 24,
    height: 180,
    resizeMode: 'cover',
    width: 180,
  },
  textBlock: {
    alignItems: 'center',
    marginTop: 24,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '900',
    lineHeight: 42,
    textAlign: 'center',
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    marginTop: 10,
    textAlign: 'center',
  },
  divider: {
    backgroundColor: '#0B78B3',
    borderRadius: 999,
    height: 3,
    marginTop: 28,
    width: 80,
  },
  authorBlock: {
    alignItems: 'center',
    marginTop: 24,
  },
  authorLabel: {
    color: '#FF4406',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.4,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  authorName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 6,
    textAlign: 'center',
  },
  rightsText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginTop: 14,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});
