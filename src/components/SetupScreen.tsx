import Svg, { Circle, Line, Path, Polygon, Rect } from 'react-native-svg';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { bibleCategories } from '../data/bibleDeck';
import type { CategoryId, GameSettings, Player } from '../types/game';

type CategoryIconProps = {
  categoryId: CategoryId;
  active: boolean;
};

function CategoryIcon({ categoryId, active }: CategoryIconProps) {
  const stroke = active ? '#0B78B3' : '#FFFFFF';
  const accent = active ? '#FFFFFF' : '#FF4406';

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
  return (
    <>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Jugadores</Text>
        <Text style={styles.helperText}>
          Selecciona jugadores frecuentes o agrega personas nuevas. Minimo 3.
        </Text>

        <Text style={styles.settingLabel}>Jugadores frecuentes</Text>
        <View style={styles.frequentList}>
          {frequentPlayers.map((name) => {
            const selected = allPlayers.some(
              (player) => player.name.trim().toLocaleLowerCase() === name.toLocaleLowerCase(),
            );

            return (
              <View key={name} style={styles.frequentRow}>
                <Pressable
                  style={[styles.frequentNameButton, selected && styles.frequentNameButtonSelected]}
                  onPress={() => onAddPlayerByName(name)}
                >
                  <Text style={styles.frequentNameText}>{name}</Text>
                </Pressable>
                <Pressable style={styles.smallButton} onPress={() => onRemoveFrequentPlayer(name)}>
                  <Text style={styles.smallButtonText}>X</Text>
                </Pressable>
              </View>
            );
          })}
        </View>

        <View style={styles.playerRow}>
          <TextInput
            style={styles.input}
            value={newFrequentPlayerName}
            placeholder="Nombre nuevo"
            placeholderTextColor="rgba(255,255,255,0.4)"
            returnKeyType="done"
            onChangeText={onNewFrequentPlayerNameChange}
            onSubmitEditing={onAddFrequentPlayer}
          />
          <Pressable style={styles.addButton} onPress={onAddFrequentPlayer}>
            <Text style={styles.smallButtonText}>+</Text>
          </Pressable>
        </View>

        <Text style={styles.settingLabel}>Jugadores de esta partida</Text>
        {allPlayers.map((player, index) => (
          <View key={player.id} style={styles.playerRow}>
            <TextInput
              style={styles.input}
              value={player.name}
              placeholder={`Jugador ${index + 1}`}
              placeholderTextColor="rgba(255,255,255,0.4)"
              returnKeyType="done"
              onChangeText={(name) => onUpdatePlayerName(player.id, name)}
            />
            {allPlayers.length > 3 && (
              <Pressable style={styles.smallButton} onPress={() => onRemovePlayer(player.id)}>
                <Text style={styles.smallButtonText}>X</Text>
              </Pressable>
            )}
          </View>
        ))}
        {setupMessage ? <Text style={styles.warningText}>{setupMessage}</Text> : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Configuracion</Text>

        <Text style={styles.settingLabel}>Categoria</Text>
        <View style={styles.optionGrid}>
          {bibleCategories.map((category) => (
            <Pressable
              key={category.id}
              style={[
                styles.categoryButton,
                settings.categoryId === category.id && styles.categoryButtonSelected,
              ]}
              onPress={() => onSettingsChange({ ...settings, categoryId: category.id })}
            >
              <CategoryIcon categoryId={category.id} active={settings.categoryId === category.id} />
              <Text style={styles.categoryButtonText}>{category.name}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.settingLabel}>Cantidad de impostores</Text>
        <TextInput
          style={styles.input}
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
          placeholderTextColor="rgba(255,255,255,0.4)"
        />

        <Text style={styles.settingLabel}>Tiempo de discusion (minutos)</Text>
        <TextInput
          style={styles.input}
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
          placeholderTextColor="rgba(255,255,255,0.4)"
        />

        <Text style={styles.settingLabel}>Tiempo de votacion (minutos)</Text>
        <TextInput
          style={styles.input}
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
          placeholderTextColor="rgba(255,255,255,0.4)"
        />

        <Text style={styles.settingLabel}>Rondas maximas</Text>
        <TextInput
          style={styles.input}
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
          placeholderTextColor="rgba(255,255,255,0.4)"
        />

        <Pressable
          style={[styles.primaryButton, !canStart && styles.disabledButton]}
          disabled={!canStart}
          onPress={onStartGame}
        >
          <Text style={styles.primaryButtonText}>Iniciar partida</Text>
        </Pressable>
      </View>
    </>
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
  playerRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#B76288',
    borderColor: '#0B78B3',
    borderRadius: 16,
    borderWidth: 1,
    color: '#FFFFFF',
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
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
  smallButton: {
    alignItems: 'center',
    backgroundColor: '#0B78B3',
    borderRadius: 14,
    justifyContent: 'center',
    minWidth: 44,
    paddingHorizontal: 12,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: '#0B78B3',
    borderRadius: 14,
    justifyContent: 'center',
    minWidth: 44,
    paddingHorizontal: 12,
  },
  smallButtonText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 16,
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
    backgroundColor: '#B76288',
    borderColor: '#0B78B3',
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  frequentNameButtonSelected: {
    backgroundColor: '#FF4406',
    borderColor: '#0B78B3',
  },
  frequentNameText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  helperText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 16,
  },
  warningText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 12,
  },
  settingLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
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
    backgroundColor: '#B76288',
    borderColor: '#0B78B3',
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
    minWidth: '30%',
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  categoryButtonSelected: {
    backgroundColor: '#FF4406',
    borderColor: '#0B78B3',
  },
  categoryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
});
