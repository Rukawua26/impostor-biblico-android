import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Button } from './ui/Button';
import type { Player, Round } from '../types/game';
import { useTheme } from '../context/ThemeContext';

const HIDE_COOLDOWN_SECONDS = 5;

type RevealScreenProps = {
  currentPlayer: Player;
  cardVisible: boolean;
  currentPlayerIsImpostor: boolean;
  round: Round | null;
  onContinueReveal: () => void;
};

export function RevealScreen({
  currentPlayer,
  cardVisible,
  currentPlayerIsImpostor,
  round,
  onContinueReveal,
}: RevealScreenProps) {
  const { colors } = useTheme();
  const flipProgress = useRef(new Animated.Value(0)).current;
  const slideX = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(1)).current;
  const [isBusy, setIsBusy] = useState(false);
  const [hideCooldown, setHideCooldown] = useState(0);
  const isImpostor = currentPlayerIsImpostor;

  const frontRotation = useMemo(
    () =>
      flipProgress.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
      }),
    [flipProgress],
  );
  const backRotation = useMemo(
    () =>
      flipProgress.interpolate({
        inputRange: [0, 1],
        outputRange: ['180deg', '360deg'],
      }),
    [flipProgress],
  );

  useEffect(() => {
    flipProgress.setValue(0);
    slideX.setValue(90);
    cardOpacity.setValue(0);
    setHideCooldown(0);

    Animated.parallel([
      Animated.timing(slideX, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => setIsBusy(false));
  }, [cardOpacity, currentPlayer.id, flipProgress, slideX]);

  useEffect(() => {
    if (!cardVisible) {
      flipProgress.setValue(0);
      setHideCooldown(0);
      return;
    }

    setHideCooldown(HIDE_COOLDOWN_SECONDS);
    Animated.timing(flipProgress, {
      toValue: 1,
      duration: 520,
      useNativeDriver: true,
    }).start(() => setIsBusy(false));
  }, [cardVisible, flipProgress]);

  useEffect(() => {
    if (!cardVisible || hideCooldown <= 0) return;

    const timeout = setTimeout(() => {
      setHideCooldown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearTimeout(timeout);
  }, [cardVisible, hideCooldown]);

  function handleAction() {
    if (isBusy) return;

    if (!cardVisible) {
      setIsBusy(true);
      onContinueReveal();
      return;
    }

    if (hideCooldown > 0) return;

    setIsBusy(true);
    Animated.sequence([
      Animated.timing(flipProgress, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(slideX, {
          toValue: -110,
          duration: 240,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]),
    ]).start(({ finished }) => {
      if (finished) onContinueReveal();
    });
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.secondaryContainer, borderColor: colors.outline }]}>
      <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Turno de {currentPlayer.name}</Text>
      <Text style={[styles.helperText, { color: colors.onSurfaceVariant }]}>
        Entrega el telefono a esta persona. Usa el boton para girar la tarjeta y ver el rol en privado. Por
        seguridad, ocultar se activa despues de 5 segundos.
      </Text>

      <View style={styles.flipArea}>
        <Animated.View
          style={[
            styles.flipPerspective,
            {
              opacity: cardOpacity,
              transform: [{ translateX: slideX }],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.roleCard,
              styles.cardFace,
              {
                backgroundColor: colors.surfaceContainerLow,
                borderColor: colors.outline,
                transform: [{ perspective: 1000 }, { rotateY: frontRotation }],
              },
            ]}
          >
            <View style={[styles.iconBadge, { backgroundColor: colors.primaryContainer }]}>
              <Text style={[styles.iconBadgeText, { color: colors.primary }]}>?</Text>
            </View>
            <Text style={[styles.roleLabel, { color: colors.primary }]}>Mantén el secreto</Text>
            <Text style={[styles.hiddenText, { color: colors.onSurface }]}>
              ¿Listo, {currentPlayer.name}?
            </Text>
            <Text style={[styles.roleHint, { color: colors.onSurfaceVariant }]}>
              Toca para revelar tu rol y ver la palabra secreta de forma privada.
            </Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.roleCard,
              styles.cardFace,
              isImpostor ? styles.roleCardImpostor : styles.roleCardCivil,
              {
                backgroundColor: isImpostor ? colors.errorContainer : colors.tertiaryContainer,
                borderColor: isImpostor ? colors.error : colors.tertiary,
                transform: [{ perspective: 1000 }, { rotateY: backRotation }],
              },
            ]}
          >
            {isImpostor ? (
              <>
                <Text style={[styles.roleLabel, { color: colors.error }]}>Cuidado</Text>
                <Text style={[styles.impostorText, { color: colors.onErrorContainer }]}>Impostor</Text>
                <Text style={[styles.roleHint, { color: colors.onErrorContainer }]}>
                  No sabes cual es la historia. Escucha a los demas y finge.
                </Text>
                <View
                  style={[
                    styles.phraseCard,
                    {
                      backgroundColor: `${colors.surfaceContainerLowest}99`,
                      borderColor: colors.error,
                    },
                  ]}
                >
                  <Text style={[styles.phraseLabel, { color: colors.error }]}>Pista:</Text>
                  <Text style={[styles.phraseText, { color: colors.onErrorContainer }]}>
                    {round?.impostorCluesById[currentPlayer.id] ?? round?.impostorClue}
                  </Text>
                </View>
              </>
            ) : (
              <>
                <Text style={[styles.roleLabel, { color: colors.tertiary }]}>Historia biblica</Text>
                <Text style={[styles.wordText, { color: colors.onTertiaryContainer }]}>{round?.word}</Text>
                <Text style={[styles.roleHint, { color: colors.onTertiaryContainer }]}>
                  Da pistas sin decir la frase exacta.
                </Text>
                <View
                  style={[
                    styles.phraseCard,
                    {
                      backgroundColor: `${colors.surfaceContainerLowest}99`,
                      borderColor: colors.tertiary,
                    },
                  ]}
                >
                  <Text style={[styles.phraseLabel, { color: colors.tertiary }]}>
                    No digas esta palabra en voz alta
                  </Text>
                  <Text style={[styles.phraseText, { color: colors.onTertiaryContainer }]}>
                    Memoriza la palabra.
                  </Text>
                </View>
              </>
            )}
          </Animated.View>
        </Animated.View>
      </View>

      <Button
        title={
          !cardVisible
            ? 'Saber mi rol'
            : hideCooldown > 0
              ? `Ocultar disponible en ${hideCooldown}`
              : 'Ocultar y pasar'
        }
        onPress={handleAction}
        variant="primary"
        disabled={isBusy || (cardVisible && hideCooldown > 0)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#B76288',
    borderColor: '#0B78B3',
    borderRadius: 32,
    borderWidth: 1,
    marginBottom: 14,
    padding: 18,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: 14,
  },
  helperText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 16,
  },
  roleCard: {
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 350,
    overflow: 'hidden',
    padding: 20,
    position: 'relative',
    shadowOpacity: 0.24,
    shadowRadius: 18,
  },
  flipArea: {
    marginBottom: 18,
  },
  flipPerspective: {
    minHeight: 350,
  },
  cardFace: {
    backfaceVisibility: 'hidden',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  roleCardCivil: {
    borderWidth: 2,
    shadowColor: '#0B78B3',
  },
  roleCardImpostor: {
    borderWidth: 2,
    shadowColor: '#BA1A1A',
  },
  iconBadge: {
    alignItems: 'center',
    borderRadius: 18,
    height: 58,
    justifyContent: 'center',
    marginBottom: 18,
    width: 58,
  },
  iconBadgeText: {
    fontSize: 32,
    fontWeight: '900',
  },
  roleLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  wordText: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
  },
  impostorText: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '900',
    textAlign: 'center',
  },
  hiddenText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
  },
  roleHint: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 23,
    marginTop: 16,
    textAlign: 'center',
  },
  phraseCard: {
    borderWidth: 1,
    borderRadius: 16,
    marginTop: 20,
    padding: 16,
    width: '100%',
  },
  phraseLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  phraseText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontStyle: 'italic',
    lineHeight: 26,
    textAlign: 'center',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#FF4406',
    borderRadius: 20,
    marginTop: 16,
    paddingVertical: 15,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
  disabledButton: {
    opacity: 0.45,
  },
});
