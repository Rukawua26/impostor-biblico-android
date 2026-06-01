import { StyleSheet, Text, View } from 'react-native';
import { Button } from './ui/Button';
import { useTheme } from '../context/ThemeContext';

type RulesScreenProps = {
  maxRounds: number;
  onBeginReveal: () => void;
};

export function RulesScreen({ maxRounds, onBeginReveal }: RulesScreenProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.secondaryContainer, borderColor: colors.outline }]}>
      <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Como se juega</Text>
      <Text style={[styles.ruleText, { color: colors.onSurfaceVariant }]}>
        1. Uno o varios jugadores seran impostores y no veran la historia biblica.
      </Text>
      <Text style={[styles.ruleText, { color: colors.onSurfaceVariant }]}>
        2. Los demas jugadores ven la misma historia solo una vez y deben memorizarla.
      </Text>
      <Text style={[styles.ruleText, { color: colors.onSurfaceVariant }]}>
        3. La app elige al azar quien empieza a dar pistas.
      </Text>
      <Text style={[styles.ruleText, { color: colors.onSurfaceVariant }]}>
        4. Cada jugador da pistas sin decir la frase exacta.
      </Text>
      <Text style={[styles.ruleText, { color: colors.onSurfaceVariant }]}>
        5. En la votacion todos levantan la mano y el facilitador registra al eliminado.
      </Text>
      <Text style={[styles.ruleText, { color: colors.onSurfaceVariant }]}>
        6. Si eliminan a todos los impostores, el grupo gana.
      </Text>
      <Text style={[styles.ruleText, { color: colors.onSurfaceVariant }]}>
        7. Si votan a un inocente, ese jugador queda eliminado y la siguiente ronda empieza sin volver a
        mostrar la palabra.
      </Text>
      <Text style={[styles.ruleText, { color: colors.onSurfaceVariant }]}>
        8. Si queda al menos un impostor tras {maxRounds} rondas, los impostores ganan la partida.
      </Text>
      <Button title="Entendido" onPress={onBeginReveal} variant="primary" />
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
  ruleText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
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
});
