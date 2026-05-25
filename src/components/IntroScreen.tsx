import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';

type IntroScreenProps = {
  onFinish: () => void;
};

const INTRO_DURATION = 5000;

export function IntroScreen({ onFinish }: IntroScreenProps) {
  const logoScale = useRef(new Animated.Value(0.82)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslate = useRef(new Animated.Value(18)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 550,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 70,
          friction: 8,
        }),
      ]),
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 520,
          useNativeDriver: true,
        }),
        Animated.timing(contentTranslate, {
          toValue: 0,
          duration: 520,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(footerOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.delay(2550),
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 520,
        useNativeDriver: true,
      }),
    ]).start(onFinish);

    const fallback = setTimeout(onFinish, INTRO_DURATION + 500);
    return () => clearTimeout(fallback);
  }, [contentOpacity, contentTranslate, footerOpacity, logoOpacity, logoScale, onFinish, screenOpacity]);

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      <StatusBar style="light" />
      <View style={styles.orbOne} />
      <View style={styles.orbTwo} />
      <Animated.View
        style={[
          styles.logo,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        <Image source={require('../../assets/app-brand.png')} style={styles.logoImage} />
      </Animated.View>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: contentOpacity,
            transform: [{ translateY: contentTranslate }],
          },
        ]}
      >
        <Text style={styles.title}>El Impostor Biblico</Text>
        <Text style={styles.subtitle}>Juego presencial de deduccion</Text>
      </Animated.View>
      <Animated.View style={[styles.footer, { opacity: footerOpacity }]}>
        <Text style={styles.footerText}>Todos los derechos reservados</Text>
        <Text style={styles.authorText}>Creado y desarrollado por Miguel Angel Oñate</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#050B1E',
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 28,
  },
  orbOne: {
    backgroundColor: '#9788f7',
    borderRadius: 220,
    height: 440,
    opacity: 0.28,
    position: 'absolute',
    right: -190,
    top: -120,
    width: 440,
  },
  orbTwo: {
    backgroundColor: '#006eff',
    borderRadius: 170,
    bottom: -120,
    height: 340,
    left: -160,
    opacity: 0.28,
    position: 'absolute',
    width: 340,
  },
  logo: {
    alignItems: 'center',
    backgroundColor: '#050B1E',
    borderColor: '#37e895',
    borderRadius: 34,
    borderWidth: 2,
    height: 170,
    justifyContent: 'center',
    shadowColor: '#37e895',
    shadowOpacity: 0.35,
    shadowRadius: 28,
    width: 300,
  },
  logoImage: {
    borderRadius: 28,
    height: 150,
    resizeMode: 'cover',
    width: 280,
  },
  content: {
    alignItems: 'center',
    marginTop: 28,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '900',
    lineHeight: 42,
    textAlign: 'center',
  },
  subtitle: {
    color: '#9788f7',
    fontSize: 17,
    fontWeight: '700',
    marginTop: 10,
    textAlign: 'center',
  },
  footer: {
    bottom: 52,
    left: 24,
    position: 'absolute',
    right: 24,
  },
  footerText: {
    color: '#37e895',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.4,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  authorText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
    marginTop: 8,
    textAlign: 'center',
  },
});
