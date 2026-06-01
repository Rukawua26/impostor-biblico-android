import Svg, { Circle, Line, Path, Polygon, Rect } from 'react-native-svg';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from './ui/Button';
import { bibleCategories } from '../data/bibleDeck';
import type { CategoryId, GameSettings, Player } from '../types/game';
import { useTheme } from '../context/ThemeContext';

type CategoryIconProps = {
  categoryId: CategoryId;
  active: boolean;
};

function CategoryIcon({ categoryId, active }: CategoryIconProps) {
  const { colors } = useTheme();
  const stroke = active ? colors.onPrimaryContainer : colors.onSurfaceVariant;
  const accent = active ? colors.primary : colors.tertiary;

  if (categoryId === 'historias') {
    return (
      <Svg width={46} height={46} viewBox="0 0 64 64">
        <Path
          d="M14 14h18c5 0 9 4 9 9v27H23c-5 0-9-4-9-9V14Z"
          fill="none"
          stroke={stroke}
          strokeWidth={4}
          strokeLinejoin="round"
        />
        <Path
          d="M41 23c0-5 4-9 9-9h4v36h-4c-5 0-9-4-9-9"
          fill="none"
          stroke={stroke}
          strokeWidth={4}
          strokeLinejoin="round"
        />
        <Line x1={22} y1={26} x2={33} y2={26} stroke={accent} strokeWidth={4} strokeLinecap="round" />
        <Line x1={22} y1={36} x2={33} y2={36} stroke={accent} strokeWidth={4} strokeLinecap="round" />
      </Svg>
    );
  }

  if (categoryId === 'personajes') {
    return (
      <Svg width={46} height={46} viewBox="0 0 64 64">
        <Circle cx={32} cy={20} r={10} fill="none" stroke={stroke} strokeWidth={4} />
        <Path
          d="M14 54c3-13 12-20 18-20s15 7 18 20"
          fill="none"
          stroke={stroke}
          strokeWidth={4}
          strokeLinecap="round"
        />
        <Path d="M25 43h14" stroke={accent} strokeWidth={4} strokeLinecap="round" />
      </Svg>
    );
  }

  if (categoryId === 'lugares') {
    return (
      <Svg width={46} height={46} viewBox="0 0 64 64">
        <Path
          d="M32 56s17-17 17-32a17 17 0 0 0-34 0c0 15 17 32 17 32Z"
          fill="none"
          stroke={stroke}
          strokeWidth={4}
          strokeLinejoin="round"
        />
        <Circle cx={32} cy={24} r={7} fill="none" stroke={accent} strokeWidth={4} />
      </Svg>
    );
  }

  if (categoryId === 'objetos') {
    return (
      <Svg width={46} height={46} viewBox="0 0 64 64">
        <Path d="M22 50h20" stroke={stroke} strokeWidth={4} strokeLinecap="round" />
        <Path
          d="M28 50V30c0-7 8-7 8 0v20"
          fill="none"
          stroke={stroke}
          strokeWidth={4}
          strokeLinecap="round"
        />
        <Path
          d="M20 30h24l-5-12H25l-5 12Z"
          fill="none"
          stroke={stroke}
          strokeWidth={4}
          strokeLinejoin="round"
        />
        <Circle cx={32} cy={18} r={4} fill={accent} />
      </Svg>
    );
  }

  if (categoryId === 'profecias') {
    return (
      <Svg width={46} height={46} viewBox="0 0 64 64">
        <Polygon
          points="32,8 37,25 54,25 40,35 45,52 32,42 19,52 24,35 10,25 27,25"
          fill="none"
          stroke={stroke}
          strokeWidth={4}
          strokeLinejoin="round"
        />
        <Line x1={32} y1={19} x2={32} y2={36} stroke={accent} strokeWidth={4} strokeLinecap="round" />
      </Svg>
    );
  }

  return (
    <Svg width={46} height={46} viewBox="0 0 64 64">
      <Rect x={12} y={12} width={16} height={16} rx={4} fill="none" stroke={stroke} strokeWidth={4} />
      <Rect x={36} y={12} width={16} height={16} rx={4} fill="none" stroke={accent} strokeWidth={4} />
      <Rect x={12} y={36} width={16} height={16} rx={4} fill="none" stroke={accent} strokeWidth={4} />
      <Rect x={36} y={36} width={16} height={16} rx={4} fill="none" stroke={stroke} strokeWidth={4} />
    </Svg>
  );
}

type SetupScreenProps = {
  allPlayers: Player[];
  frequentPlayers: string[];
  newFrequentPlayerName: string;
  settings: GameSettings;
  setupMessage: string;
  canStart: boolean;
  onUpdatePlayerName: (id: number, name: string) => void;
  onAddPlayerByName: (name: string) => void;
  onAddFrequentPlayer: () => void;
  onRemovePlayer: (id: number) => void;
  onRemoveFrequentPlayer: (name: string) => void;
  onStartGame: () => void;
  onNewFrequentPlayerNameChange: (name: string) => void;
  onSettingsChange: (settings: GameSettings) => void;
};

export function SetupScreen({
  allPlayers,
  frequentPlayers,
  newFrequentPlayerName,
  settings,
  setupMessage,
  canStart,
  onUpdatePlayerName,
  onAddPlayerByName,
  onAddFrequentPlayer,
  onRemovePlayer,
  onRemoveFrequentPlayer,
  onStartGame,
  onNewFrequentPlayerNameChange,
  onSettingsChange,
}: SetupScreenProps) {
  const { colors } = useTheme();
  const placeholderColor = `${colors.onSurfaceVariant}99`;

  return (
    <>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surfaceContainerLow, borderColor: colors.surfaceVariant },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Jugadores</Text>
        <Text style={[styles.helperText, { color: colors.onSurfaceVariant }]}>
          Selecciona jugadores frecuentes o agrega personas nuevas. Minimo 3.
        </Text>

        <Text style={[styles.settingLabel, { color: colors.primary }]}>Jugadores frecuentes</Text>
        <View style={styles.frequentList}>
          {frequentPlayers.map((name) => {
            const selected = allPlayers.some(
              (player) => player.name.trim().toLocaleLowerCase() === name.toLocaleLowerCase(),
            );

            return (
              <View key={name} style={styles.frequentRow}>
                <Pressable
                  style={({ pressed }) => [
                    styles.frequentNameButton,
                    {
                      backgroundColor: selected ? colors.primaryContainer : colors.surfaceContainerHighest,
                      borderColor: selected ? colors.primary : colors.outline,
                      opacity: pressed ? 0.78 : 1,
                    },
                  ]}
                  onPress={() => onAddPlayerByName(name)}
                >
                  <Text
                    style={[
                      styles.frequentNameText,
                      { color: selected ? colors.onPrimaryContainer : colors.onSurface },
                    ]}
                  >
                    {name}
                  </Text>
                </Pressable>
                <Button
                  title="X"
                  onPress={() => onRemoveFrequentPlayer(name)}
                  variant="outline"
                  size="small"
                />
              </View>
            );
          })}
        </View>

        <View style={styles.playerRow}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surfaceContainerLowest,
                borderColor: colors.outline,
                color: colors.onSurface,
              },
            ]}
            value={newFrequentPlayerName}
            placeholder="Nombre nuevo"
            placeholderTextColor={placeholderColor}
            returnKeyType="done"
            onChangeText={onNewFrequentPlayerNameChange}
            onSubmitEditing={onAddFrequentPlayer}
          />
          <Button title="+" onPress={onAddFrequentPlayer} variant="secondary" size="small" />
        </View>

        <Text style={[styles.settingLabel, { color: colors.primary }]}>Jugadores de esta partida</Text>
        {allPlayers.map((player, index) => (
          <View key={player.id} style={styles.playerRow}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surfaceContainerLowest,
                  borderColor: colors.outline,
                  color: colors.onSurface,
                },
              ]}
              value={player.name}
              placeholder={`Jugador ${index + 1}`}
              placeholderTextColor={placeholderColor}
              returnKeyType="done"
              onChangeText={(name) => onUpdatePlayerName(player.id, name)}
            />
            {allPlayers.length > 3 && (
              <Button title="X" onPress={() => onRemovePlayer(player.id)} variant="outline" size="small" />
            )}
          </View>
        ))}
        {setupMessage ? (
          <Text style={[styles.warningText, { color: colors.error }]}>{setupMessage}</Text>
        ) : null}
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: colors.surfaceContainerLow, borderColor: colors.surfaceVariant },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Configuracion</Text>

        <Text style={[styles.settingLabel, { color: colors.primary }]}>Categoria</Text>
        <View style={styles.optionGrid}>
          {bibleCategories.map((category) => {
            const selected = settings.categoryId === category.id;

            return (
              <Pressable
                key={category.id}
                style={({ pressed }) => [
                  styles.categoryButton,
                  {
                    backgroundColor: selected ? colors.primaryContainer : colors.surfaceContainerHighest,
                    borderColor: selected ? colors.primary : colors.surfaceVariant,
                    opacity: pressed ? 0.78 : 1,
                  },
                ]}
                onPress={() => onSettingsChange({ ...settings, categoryId: category.id })}
              >
                <CategoryIcon categoryId={category.id} active={selected} />
                <Text
                  style={[
                    styles.categoryButtonText,
                    { color: selected ? colors.onPrimaryContainer : colors.onSurface },
                  ]}
                >
                  {category.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.settingLabel, { color: colors.primary }]}>Cantidad de impostores</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.surfaceContainerLowest,
              borderColor: colors.outline,
              color: colors.onSurface,
            },
          ]}
          value={String(settings.impostorCount)}
          onChangeText={(text) => {
            const num = parseInt(text || '0', 10);
            if (!isNaN(num) && num >= 0 && num <= 5) {
              onSettingsChange({ ...settings, impostorCount: num });
            }
          }}
          keyboardType="number-pad"
          returnKeyType="done"
          placeholder="1"
          placeholderTextColor={placeholderColor}
        />

        <Text style={[styles.settingLabel, { color: colors.primary }]}>Tiempo de discusion (minutos)</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.surfaceContainerLowest,
              borderColor: colors.outline,
              color: colors.onSurface,
            },
          ]}
          value={String(settings.discussionMinutes)}
          onChangeText={(text) => {
            const num = parseInt(text || '0', 10);
            if (!isNaN(num) && num >= 0) {
              onSettingsChange({ ...settings, discussionMinutes: num });
            }
          }}
          keyboardType="number-pad"
          returnKeyType="done"
          placeholder="0"
          placeholderTextColor={placeholderColor}
        />

        <Text style={[styles.settingLabel, { color: colors.primary }]}>Tiempo de votacion (minutos)</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.surfaceContainerLowest,
              borderColor: colors.outline,
              color: colors.onSurface,
            },
          ]}
          value={String(settings.voteMinutes)}
          onChangeText={(text) => {
            const num = parseInt(text || '0', 10);
            if (!isNaN(num) && num >= 0) {
              onSettingsChange({ ...settings, voteMinutes: num });
            }
          }}
          keyboardType="number-pad"
          returnKeyType="done"
          placeholder="0"
          placeholderTextColor={placeholderColor}
        />

        <Text style={[styles.settingLabel, { color: colors.primary }]}>Rondas maximas</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.surfaceContainerLowest,
              borderColor: colors.outline,
              color: colors.onSurface,
            },
          ]}
          value={String(settings.maxRounds)}
          onChangeText={(text) => {
            const num = parseInt(text, 10);
            if (!isNaN(num) && num >= 1 && num <= 20) {
              onSettingsChange({ ...settings, maxRounds: num });
            }
          }}
          keyboardType="number-pad"
          returnKeyType="done"
          placeholder="20"
          placeholderTextColor={placeholderColor}
        />

        <Button
          title="Iniciar partida"
          onPress={onStartGame}
          variant="primary"
          disabled={!canStart}
          size="large"
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 32,
    borderWidth: 1,
    marginBottom: 14,
    padding: 18,
  },
  sectionTitle: {
    fontSize: 23,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: 14,
  },
  playerRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  frequentList: {
    gap: 10,
    marginBottom: 14,
  },
  frequentRow: {
    flexDirection: 'row',
    gap: 10,
  },
  frequentNameButton: {
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  frequentNameText: {
    fontSize: 15,
    fontWeight: '800',
  },
  helperText: {
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 16,
  },
  warningText: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 8,
    marginTop: 12,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  categoryButton: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    gap: 8,
    minWidth: '30%',
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
});
