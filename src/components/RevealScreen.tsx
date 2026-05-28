import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { PanResponderInstance } from 'react-native';
import type { Player, Round } from '../types/game';

type RevealScreenProps = {
  currentPlayer: Player;
  cardVisible: boolean;
  curtainLifted: boolean;
  currentPlayerIsImpostor: boolean;
  round: Round | null;
  curtainTranslateY: Animated.Value;
  curtainPanResponder: PanResponderInstance;
  onContinueReveal: () => void;
};

export function RevealScreen({
  currentPlayer,
  cardVisible,
  curtainLifted,
  currentPlayerIsImpostor,
  round,
  curtainTranslateY,
  curtainPanResponder,
  onContinueReveal,
}: RevealScreenProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Turno de {currentPlayer.name}</Text>
      <Text style={styles.helperText}>
        Solo esta persona debe mirar la pantalla. El rol esta cubierto por un telon para evitar toques
        accidentales.
      </Text>
      <View
        style={[
          styles.roleCard,
          cardVisible &&
            curtainLifted &&
            (currentPlayerIsImpostor ? styles.roleCardImpostor : styles.roleCardCivil),
        ]}
      >
        {cardVisible ? (
          round?.impostorIds.includes(currentPlayer.id) ? (
            <>
              <Text style={styles.roleLabel}>Tu eres IMPOSTOR</Text>
              <Text style={styles.impostorText}>Impostor</Text>
              <Text style={styles.roleHint}>No sabes cual es la historia. Escucha a los demas y finge.</Text>
              <View style={styles.phraseCard}>
                <Text style={styles.phraseLabel}>Pista:</Text>
                <Text style={styles.phraseText}>
                  {round?.impostorCluesById[currentPlayer.id] ?? round?.impostorClue}
                </Text>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.roleLabel}>Historia biblica</Text>
              <Text style={styles.wordText}>{round?.word}</Text>
              <Text style={styles.roleHint}>Da pistas sin decir la frase exacta.</Text>
            </>
          )
        ) : (
          <>
            <Text style={styles.roleLabel}>Pantalla oculta</Text>
            <Text style={styles.hiddenText}>Solo {currentPlayer.name} debe ver.</Text>
          </>
        )}
        {cardVisible && !curtainLifted && (
          <Animated.View
            style={[styles.curtain, { transform: [{ translateY: curtainTranslateY }] }]}
            {...curtainPanResponder.panHandlers}
          >
            <Image source={require('../../assets/curtain-character.png')} style={styles.curtainCharacter} />
            <Text style={styles.curtainTitle}>Telon cerrado</Text>
            <Text style={styles.curtainText}>Desliza hacia arriba para ver tu rol.</Text>
            <Text style={styles.curtainArrow}>↑</Text>
          </Animated.View>
        )}
      </View>
      <Pressable
        style={[styles.primaryButton, cardVisible && !curtainLifted && styles.disabledButton]}
        disabled={cardVisible && !curtainLifted}
        onPress={onContinueReveal}
      >
        <Text style={styles.primaryButtonText}>
          {!cardVisible ? 'Ver mi rol' : curtainLifted ? 'Ocultar y pasar' : 'Levanta el telon primero'}
        </Text>
      </Pressable>
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
    backgroundColor: '#B76288',
    borderColor: '#0B78B3',
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 310,
    overflow: 'hidden',
    padding: 20,
    position: 'relative',
  },
  roleCardCivil: {
    backgroundColor: '#0B78B3',
    borderColor: '#0B78B3',
    borderWidth: 2,
    shadowColor: '#0B78B3',
    shadowOpacity: 0.26,
    shadowRadius: 18,
  },
  roleCardImpostor: {
    backgroundColor: '#B76288',
    borderColor: '#0B78B3',
    borderWidth: 2,
    shadowColor: '#0B78B3',
    shadowOpacity: 0.24,
    shadowRadius: 18,
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
    backgroundColor: '#FF4406',
    borderColor: '#FF4406',
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
  curtain: {
    alignItems: 'center',
    backgroundColor: '#FF4406',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    padding: 20,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 5,
  },
  curtainCharacter: {
    height: 104,
    marginBottom: 10,
    resizeMode: 'contain',
    width: 104,
  },
  curtainTitle: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '900',
    marginBottom: 6,
  },
  curtainText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    textAlign: 'center',
  },
  curtainArrow: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '900',
    marginTop: 6,
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
