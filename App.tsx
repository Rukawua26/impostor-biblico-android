import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { bibleCategories, getEntriesForCategory } from './src/data/bibleDeck';
import { IntroScreen } from './src/components/IntroScreen';
import { defaultPlayers } from './src/data/defaultPlayers';
import { createRound, normalizePlayers } from './src/game/createRound';
import {
  loadFrequentPlayers,
  loadUsedWords,
  saveFrequentPlayers,
  saveUsedWords,
} from './src/storage/gameStorage';
import type { GameResult, GameSettings, Phase, Player, Round } from './src/types/game';

const defaultSettings: GameSettings = {
  discussionMinutes: 0,
  voteMinutes: 0,
  maxRounds: 5,
  impostorCount: 1,
  categoryId: 'historias',
};

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [phase, setPhase] = useState<Phase>('setup');
  const [allPlayers, setAllPlayers] = useState<Player[]>(defaultPlayers);
  const [frequentPlayers, setFrequentPlayers] = useState<string[]>(defaultPlayers.map((player) => player.name));
  const [newFrequentPlayerName, setNewFrequentPlayerName] = useState('');
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const [activePlayers, setActivePlayers] = useState<Player[]>([]);
  const [settings, setSettings] = useState<GameSettings>(defaultSettings);
  const [round, setRound] = useState<Round | null>(null);
  const [revealIndex, setRevealIndex] = useState(0);
  const [cardVisible, setCardVisible] = useState(false);
  const [curtainLifted, setCurtainLifted] = useState(false);
  const [selectedVoteId, setSelectedVoteId] = useState<number | null>(null);
  const [discussionTimeLeft, setDiscussionTimeLeft] = useState(0);
  const [voteTimeLeft, setVoteTimeLeft] = useState(0);
  const [setupMessage, setSetupMessage] = useState('');
  const [roundNumber, setRoundNumber] = useState(1);
  const [eliminatedIds, setEliminatedIds] = useState<number[]>([]);
  const [gameResult, setGameResult] = useState<GameResult>(null);
  const [eliminatedPlayerName, setEliminatedPlayerName] = useState('');
  const curtainTranslateY = useRef(new Animated.Value(0)).current;

  const impostorPlayers = activePlayers.filter((player) => round?.impostorIds.includes(player.id));
  const currentPlayer = activePlayers[revealIndex];
  const selectedPlayer = activePlayers.find((player) => player.id === selectedVoteId);
  const firstSpeaker = activePlayers.find((player) => player.id === round?.firstSpeakerId);
  const normalizedAll = useMemo(() => normalizePlayers(allPlayers), [allPlayers]);
  const canStart =
    normalizedAll.length >= 3 &&
    settings.discussionMinutes > 0 &&
    settings.voteMinutes > 0 &&
    settings.impostorCount > 0 &&
    settings.impostorCount < normalizedAll.length;
  const visibleEliminatedIds = useMemo(() => {
    if (selectedVoteId) {
      return [...new Set([...eliminatedIds, selectedVoteId])];
    }

    return eliminatedIds;
  }, [eliminatedIds, selectedVoteId]);
  const visibleEliminatedPlayers = allPlayers.filter((player) =>
    visibleEliminatedIds.includes(player.id),
  );
  const visibleActivePlayers = activePlayers.filter(
    (player) => !visibleEliminatedIds.includes(player.id),
  );
  const activeImpostorIds = round?.impostorIds.filter(
    (id) => activePlayers.some((player) => player.id === id) && !visibleEliminatedIds.includes(id),
  ) ?? [];
  const selectedWasImpostor = !!selectedVoteId && !!round?.impostorIds.includes(selectedVoteId);
  function resetCurtain() {
    setCurtainLifted(false);
    curtainTranslateY.setValue(0);
  }

  const curtainPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => phase === 'reveal' && cardVisible && !curtainLifted,
        onMoveShouldSetPanResponder: (_, gesture) =>
          phase === 'reveal' && cardVisible && !curtainLifted && Math.abs(gesture.dy) > 8,
        onPanResponderMove: (_, gesture) => {
          curtainTranslateY.setValue(Math.min(0, Math.max(-170, gesture.dy)));
        },
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dy < -35) {
            setCurtainLifted(true);
          }

          Animated.spring(curtainTranslateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 70,
            friction: 8,
          }).start();
        },
      }),
    [cardVisible, curtainLifted, curtainTranslateY, phase],
  );

  useEffect(() => {
    let isMounted = true;

    async function loadSavedData() {
      const [savedPlayers, savedUsedWords] = await Promise.all([
        loadFrequentPlayers(),
        loadUsedWords(),
      ]);

      if (!isMounted) return;

      if (savedPlayers.length > 0) {
        setFrequentPlayers(savedPlayers);
        setAllPlayers(savedPlayers.slice(0, Math.max(3, Math.min(savedPlayers.length, 6))).map((name, index) => ({
          id: Date.now() + index,
          name,
        })));
      }

      setUsedWords(savedUsedWords);
    }

    loadSavedData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (phase !== 'discussion' || discussionTimeLeft <= 0) return;

    const interval = setInterval(() => {
      setDiscussionTimeLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [discussionTimeLeft, phase]);

  useEffect(() => {
    if (phase !== 'vote' || voteTimeLeft <= 0) return;

    const interval = setInterval(() => {
      setVoteTimeLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, voteTimeLeft]);

  const subtitle = useMemo(() => {
    if (phase === 'setup') return 'Configura jugadores y la partida.';
    if (phase === 'rules') return 'Lee las reglas antes de empezar.';
    if (phase === 'reveal') return 'Pasa el telefono para ver roles en secreto.';
    if (phase === 'discussion') return `Ronda ${roundNumber} de ${settings.maxRounds}`;
    if (phase === 'vote') return 'El grupo decide quien es el impostor.';
    if (phase === 'eliminated') return `${eliminatedPlayerName} fue eliminado.`;
    if (gameResult === 'innocents') return 'El grupo gano la partida.';
    if (gameResult === 'impostor') return 'Los impostores ganaron la partida.';
    return '';
  }, [phase, roundNumber, settings.maxRounds, eliminatedPlayerName, gameResult]);

  function updatePlayerName(id: number, name: string) {
    setAllPlayers((current) =>
      current.map((player) => (player.id === id ? { ...player, name } : player)),
    );
    setSetupMessage('');
  }

  function addPlayerByName(name: string) {
    const cleanName = name.trim();
    if (!cleanName) return;

    setAllPlayers((current) => {
      const exists = current.some(
        (player) => player.name.trim().toLocaleLowerCase() === cleanName.toLocaleLowerCase(),
      );

      if (exists) return current;

      return [...current, { id: Date.now() + current.length, name: cleanName }];
    });
    setSetupMessage('');
  }

  async function addFrequentPlayer() {
    const cleanName = newFrequentPlayerName.trim();
    if (!cleanName) return;

    const nextFrequentPlayers = await saveFrequentPlayers([...frequentPlayers, cleanName]);
    setFrequentPlayers(nextFrequentPlayers);
    addPlayerByName(cleanName);
    setNewFrequentPlayerName('');
  }

  function removePlayer(id: number) {
    setAllPlayers((current) => current.filter((player) => player.id !== id));
    setSetupMessage('');
  }

  async function removeFrequentPlayer(name: string) {
    const nextFrequentPlayers = await saveFrequentPlayers(
      frequentPlayers.filter((playerName) => playerName.toLocaleLowerCase() !== name.toLocaleLowerCase()),
    );

    setFrequentPlayers(nextFrequentPlayers);
  }

  async function startGame() {
    const players = normalizePlayers(allPlayers);

    if (players.length < 3) {
      setSetupMessage('Necesitas al menos 3 jugadores con nombres distintos.');
      return;
    }

    if (settings.discussionMinutes <= 0 || settings.voteMinutes <= 0) {
      setSetupMessage('Coloca el tiempo de discusion y votacion en minutos.');
      return;
    }

    if (settings.impostorCount <= 0 || settings.impostorCount >= players.length) {
      setSetupMessage('La cantidad de impostores debe ser menor que la cantidad de jugadores.');
      return;
    }

    const entries = getEntriesForCategory(settings.categoryId);
    const usedWordSet = new Set(usedWords.map((word) => word.toLocaleLowerCase()));
    const hasAvailableWord = entries.some((entry) => !usedWordSet.has(entry.word.toLocaleLowerCase()));
    const nextRound = createRound(
      players,
      settings.impostorCount,
      settings.categoryId,
      hasAvailableWord ? usedWords : [],
    );
    const nextUsedWords = await saveUsedWords(
      hasAvailableWord ? [...usedWords, nextRound.word] : [nextRound.word],
    );
    const nextFrequentPlayers = await saveFrequentPlayers([
      ...frequentPlayers,
      ...players.map((player) => player.name),
    ]);

    setFrequentPlayers(nextFrequentPlayers);
    setUsedWords(nextUsedWords);
    setAllPlayers(players);
    setActivePlayers(players);
    setRound(nextRound);
    setRevealIndex(0);
    setCardVisible(false);
    resetCurtain();
    setSelectedVoteId(null);
    setDiscussionTimeLeft(settings.discussionMinutes * 60);
    setVoteTimeLeft(settings.voteMinutes * 60);
    setRoundNumber(1);
    setEliminatedIds([]);
    setGameResult(null);
    setEliminatedPlayerName('');
    setPhase('rules');
  }

  function beginReveal() {
    setPhase('reveal');
  }

  function continueReveal() {
    if (!cardVisible) {
      setCardVisible(true);
      resetCurtain();
      return;
    }

    if (!curtainLifted) return;

    if (revealIndex === activePlayers.length - 1) {
      setPhase('discussion');
      setCardVisible(false);
      resetCurtain();
      setDiscussionTimeLeft(settings.discussionMinutes * 60);
      return;
    }

    setRevealIndex((current) => current + 1);
    setCardVisible(false);
    resetCurtain();
  }

  function goToVote() {
    setVoteTimeLeft(settings.voteMinutes * 60);
    setSelectedVoteId(null);
    setPhase('vote');
  }

  function handleVoteResult(eliminatedId: number) {
    setSelectedVoteId(eliminatedId);

    const remainingImpostorIds = activeImpostorIds.filter((id) => id !== eliminatedId);

    if (round?.impostorIds.includes(eliminatedId) && remainingImpostorIds.length === 0) {
      setGameResult('innocents');
      setPhase('result');
      return;
    }

    const eliminated = activePlayers.find((player) => player.id === eliminatedId);
    setEliminatedPlayerName(eliminated?.name ?? '');

    if (roundNumber >= settings.maxRounds) {
      setGameResult('impostor');
      setPhase('result');
      return;
    }

    setPhase('eliminated');
  }

  function nextRound() {
    const remaining = activePlayers.filter((player) => player.id !== selectedVoteId);

    const remainingImpostors = round?.impostorIds.filter((id) =>
      remaining.some((player) => player.id === id),
    ).length ?? 0;

    if (remaining.length <= remainingImpostors * 2) {
      setGameResult('impostor');
      setPhase('result');
      return;
    }

    setEliminatedIds((current) => [
      ...current,
      ...(selectedVoteId ? [selectedVoteId] : []),
    ]);
    setActivePlayers(remaining);
    setRoundNumber((current) => current + 1);
    setDiscussionTimeLeft(settings.discussionMinutes * 60);
    setCardVisible(false);
    resetCurtain();
    setSelectedVoteId(null);
    setPhase('discussion');
  }

  function resetGame() {
    setPhase('setup');
    setActivePlayers([]);
    setRevealIndex(0);
    setCardVisible(false);
    resetCurtain();
    setSelectedVoteId(null);
    setRound(null);
    setSetupMessage('');
    setRoundNumber(1);
    setEliminatedIds([]);
    setGameResult(null);
    setEliminatedPlayerName('');
    setDiscussionTimeLeft(0);
    setVoteTimeLeft(0);
  }

  function formatTime(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  if (showIntro) {
    return <IntroScreen onFinish={() => setShowIntro(false)} />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'android' ? undefined : 'padding'}
    >
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Text style={styles.kicker}>Juego presencial multijugador</Text>
          <Text style={styles.title}>El Impostor Biblico</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          <View style={styles.heroLine} />
        </View>

        {phase === 'setup' && (
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
                        style={[
                          styles.frequentNameButton,
                          selected && styles.frequentNameButtonSelected,
                        ]}
                        onPress={() => addPlayerByName(name)}
                      >
                        <Text style={styles.frequentNameText}>{name}</Text>
                      </Pressable>
                      <Pressable
                        style={styles.smallButton}
                        onPress={() => removeFrequentPlayer(name)}
                      >
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
                  placeholderTextColor="#9788f7"
                  returnKeyType="done"
                  onChangeText={setNewFrequentPlayerName}
                  onSubmitEditing={addFrequentPlayer}
                />
                <Pressable style={styles.addButton} onPress={addFrequentPlayer}>
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
                    placeholderTextColor="#9788f7"
                    returnKeyType="done"
                    onChangeText={(name) => updatePlayerName(player.id, name)}
                  />
                  {allPlayers.length > 3 && (
                    <Pressable
                      style={styles.smallButton}
                      onPress={() => removePlayer(player.id)}
                    >
                      <Text style={styles.smallButtonText}>X</Text>
                    </Pressable>
                  )}
                </View>
              ))}
              {setupMessage ? (
                <Text style={styles.warningText}>{setupMessage}</Text>
              ) : null}
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
                    onPress={() => setSettings((prev) => ({ ...prev, categoryId: category.id }))}
                  >
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
                  if (!isNaN(num) && num >= 0) {
                    setSettings((prev) => ({ ...prev, impostorCount: num }));
                  }
                }}
                keyboardType="number-pad"
                returnKeyType="done"
                placeholder="1"
                placeholderTextColor="#9788f7"
              />

              <Text style={styles.settingLabel}>Tiempo de discusion (minutos)</Text>
              <TextInput
                style={styles.input}
                value={String(settings.discussionMinutes)}
                onChangeText={(text) => {
                  const num = parseInt(text || '0', 10);
                  if (!isNaN(num) && num >= 0) {
                    setSettings((prev) => ({ ...prev, discussionMinutes: num }));
                  }
                }}
                keyboardType="number-pad"
                returnKeyType="done"
                placeholder="0"
                placeholderTextColor="#9788f7"
              />

              <Text style={styles.settingLabel}>Tiempo de votacion (minutos)</Text>
              <TextInput
                style={styles.input}
                value={String(settings.voteMinutes)}
                onChangeText={(text) => {
                  const num = parseInt(text || '0', 10);
                  if (!isNaN(num) && num >= 0) {
                    setSettings((prev) => ({ ...prev, voteMinutes: num }));
                  }
                }}
                keyboardType="number-pad"
                returnKeyType="done"
                placeholder="0"
                placeholderTextColor="#9788f7"
              />

              <Text style={styles.settingLabel}>Rondas maximas</Text>
              <TextInput
                style={styles.input}
                value={String(settings.maxRounds)}
                onChangeText={(text) => {
                  const num = parseInt(text, 10);
                  if (!isNaN(num) && num >= 1 && num <= 10) {
                    setSettings((prev) => ({ ...prev, maxRounds: num }));
                  }
                }}
                keyboardType="number-pad"
                returnKeyType="done"
                placeholder="5"
                placeholderTextColor="#9788f7"
              />

              <Pressable
                style={[styles.primaryButton, !canStart && styles.disabledButton]}
                disabled={!canStart}
                onPress={startGame}
              >
                <Text style={styles.primaryButtonText}>Iniciar partida</Text>
              </Pressable>
            </View>
          </>
        )}

        {phase === 'rules' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Como se juega</Text>
            <Text style={styles.ruleText}>
              1. Uno o varios jugadores seran impostores y no veran la historia
              biblica.
            </Text>
            <Text style={styles.ruleText}>
              2. Los demas jugadores ven la misma historia solo una vez y deben
              memorizarla.
            </Text>
            <Text style={styles.ruleText}>
              3. La app elige al azar quien empieza a dar pistas.
            </Text>
            <Text style={styles.ruleText}>
              4. Cada jugador da pistas sin decir la frase exacta.
            </Text>
            <Text style={styles.ruleText}>
              5. En la votacion todos levantan la mano y el facilitador registra
              al eliminado.
            </Text>
            <Text style={styles.ruleText}>
              6. Si eliminan a todos los impostores, el grupo gana.
            </Text>
            <Text style={styles.ruleText}>
              7. Si votan a un inocente, ese jugador queda eliminado y la
              siguiente ronda empieza sin volver a mostrar la palabra.
            </Text>
            <Text style={styles.ruleText}>
              8. Si queda al menos un impostor tras {settings.maxRounds} rondas,
              los impostores ganan la partida.
            </Text>
            <Pressable style={styles.primaryButton} onPress={beginReveal}>
              <Text style={styles.primaryButtonText}>Entendido</Text>
            </Pressable>
          </View>
        )}

        {phase === 'reveal' && currentPlayer && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Turno de {currentPlayer.name}
            </Text>
            <Text style={styles.helperText}>
              Solo esta persona debe mirar la pantalla. El rol esta cubierto por
              un telon para evitar toques accidentales.
            </Text>
            <View style={styles.roleCard}>
              {cardVisible ? (
                round?.impostorIds.includes(currentPlayer.id) ? (
                  <>
                    <Text style={styles.roleLabel}>Tu eres IMPOSTOR</Text>
                    <Text style={styles.impostorText}>Impostor</Text>
                    <Text style={styles.roleHint}>
                      No sabes cual es la historia. Escucha a los demas y finge.
                    </Text>
                    <View style={styles.phraseCard}>
                      <Text style={styles.phraseLabel}>
                        Frase para comenzar:
                      </Text>
                      <Text style={styles.phraseText}>
                        {round?.impostorClue}
                      </Text>
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={styles.roleLabel}>Historia biblica</Text>
                    <Text style={styles.wordText}>{round?.word}</Text>
                    <Text style={styles.roleHint}>
                      Da pistas sin decir la frase exacta.
                    </Text>
                  </>
                )
              ) : (
                <>
                  <Text style={styles.roleLabel}>Pantalla oculta</Text>
                  <Text style={styles.hiddenText}>
                    Solo {currentPlayer.name} debe ver.
                  </Text>
                </>
              )}
              {cardVisible && !curtainLifted && (
                <Animated.View
                  style={[
                    styles.curtain,
                    { transform: [{ translateY: curtainTranslateY }] },
                  ]}
                  {...curtainPanResponder.panHandlers}
                >
                  <Image
                    source={require('./assets/curtain-character.png')}
                    style={styles.curtainCharacter}
                  />
                  <Text style={styles.curtainTitle}>Telon cerrado</Text>
                  <Text style={styles.curtainText}>
                    Desliza hacia arriba para ver tu rol.
                  </Text>
                  <Text style={styles.curtainArrow}>↑</Text>
                </Animated.View>
              )}
            </View>
            <Pressable
              style={[
                styles.primaryButton,
                cardVisible && !curtainLifted && styles.disabledButton,
              ]}
              disabled={cardVisible && !curtainLifted}
              onPress={continueReveal}
            >
              <Text style={styles.primaryButtonText}>
                {!cardVisible
                  ? 'Ver mi rol'
                  : curtainLifted
                    ? 'Ocultar y pasar'
                    : 'Levanta el telon primero'}
              </Text>
            </Pressable>
          </View>
        )}

        {phase === 'discussion' && (
          <View style={styles.card}>
            <View style={styles.roundBadge}>
              <Text style={styles.roundBadgeText}>
                Ronda {roundNumber} de {settings.maxRounds}
              </Text>
            </View>
            <Text style={styles.timerText}>{formatTime(discussionTimeLeft)}</Text>
            <Text style={styles.bodyText}>
              Cada jugador da una pista breve. Los impostores deben fingir.
            </Text>
            {firstSpeaker ? (
              <View style={styles.firstSpeakerCard}>
                <Text style={styles.firstSpeakerLabel}>Empieza</Text>
                <Text style={styles.firstSpeakerName}>{firstSpeaker.name}</Text>
                <Text style={styles.firstSpeakerHint}>Luego sigan en sentido horario.</Text>
              </View>
            ) : null}
            <Text style={styles.helperText}>
              Tiempo restante de discusion. Pueden avanzar antes si todos estan
              listos.
            </Text>
            <View style={styles.listCard}>
              <Text style={styles.listTitle}>Jugadores activos</Text>
              <Text style={styles.listText}>
                {visibleActivePlayers.map((player) => player.name).join(', ')}
              </Text>
            </View>
            {visibleEliminatedPlayers.length > 0 && (
              <View style={styles.listCardMuted}>
                <Text style={styles.listTitle}>Eliminados</Text>
                <Text style={styles.listText}>
                  {visibleEliminatedPlayers.map((player) => player.name).join(', ')}
                </Text>
              </View>
            )}
            <Pressable style={styles.primaryButton} onPress={goToVote}>
              <Text style={styles.primaryButtonText}>Ir a votacion</Text>
            </Pressable>
          </View>
        )}

        {phase === 'vote' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Votacion fisica</Text>
            <Text style={styles.timerText}>{formatTime(voteTimeLeft)}</Text>
            <Text style={styles.helperText}>
              Todos votan levantando la mano. El facilitador marca al jugador que
              el grupo decidio eliminar.
            </Text>
            {activePlayers.map((player) => {
              return (
                <Pressable
                  key={player.id}
                  style={[
                    styles.voteButton,
                    selectedVoteId === player.id && styles.voteButtonSelected,
                  ]}
                  onPress={() => setSelectedVoteId(player.id)}
                >
                  <Text style={styles.voteButtonText}>{player.name}</Text>
                </Pressable>
              );
            })}
            {selectedPlayer ? (
              <Text style={styles.warningText}>
                Confirmar eliminado: {selectedPlayer.name}
              </Text>
            ) : null}
            <Pressable
              style={[styles.primaryButton, !selectedVoteId && styles.disabledButton]}
              disabled={!selectedVoteId}
              onPress={() => selectedVoteId && handleVoteResult(selectedVoteId)}
            >
              <Text style={styles.primaryButtonText}>Confirmar eliminado</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={startGame}>
              <Text style={styles.secondaryButtonText}>Nueva partida</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={resetGame}>
              <Text style={styles.secondaryButtonText}>Editar partida</Text>
            </Pressable>
          </View>
        )}

        {phase === 'eliminated' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              {eliminatedPlayerName} fue eliminado
            </Text>
            <Text style={selectedWasImpostor ? styles.successMessageText : styles.dangerMessageText}>
              {selectedWasImpostor
                ? 'Era impostor, pero todavia queda otro impostor en la partida.'
                : 'No era impostor. El juego continua.'}
            </Text>
            <Text style={styles.bodyText}>
              Quedan {activePlayers.length - 1} jugadores en la partida.
            </Text>
            <Text style={styles.helperText}>
              La palabra no se vuelve a mostrar. Los jugadores deben recordarla.
            </Text>
            <View style={styles.listCard}>
              <Text style={styles.listTitle}>Siguen jugando</Text>
              <Text style={styles.listText}>
                {visibleActivePlayers.map((player) => player.name).join(', ')}
              </Text>
            </View>
            <View style={styles.listCardMuted}>
              <Text style={styles.listTitle}>Eliminados</Text>
              <Text style={styles.listText}>
                {visibleEliminatedPlayers.map((player) => player.name).join(', ')}
              </Text>
            </View>
            <Pressable style={styles.primaryButton} onPress={nextRound}>
              <Text style={styles.primaryButtonText}>
                Siguiente ronda
              </Text>
            </Pressable>
          </View>
        )}

        {phase === 'result' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              {gameResult === 'innocents'
                ? 'El grupo gano la partida'
                : 'Los impostores ganaron la partida'}
            </Text>
            <Text style={styles.bodyText}>
              Impostores: {impostorPlayers.map((player) => player.name).join(', ')}
            </Text>
            {selectedVoteId ? (
              <Text style={styles.bodyText}>
                Ultimo eliminado: {selectedPlayer?.name}
              </Text>
            ) : null}
            {visibleEliminatedPlayers.length > 0 && (
              <View style={styles.listCardMuted}>
                <Text style={styles.listTitle}>Eliminados</Text>
                <Text style={styles.listText}>
                  {visibleEliminatedPlayers.map((player) => player.name).join(', ')}
                </Text>
              </View>
            )}
            <Text style={styles.bodyText}>
              Historia: {round?.word}
            </Text>
            <View style={styles.listCard}>
              <Text style={styles.listTitle}>Pista usada</Text>
              <Text style={styles.listText}>{round?.impostorClue}</Text>
            </View>
            <View style={styles.listCard}>
              <Text style={styles.listTitle}>Referencias biblicas</Text>
              <Text style={styles.listText}>{round?.impostorReference}</Text>
            </View>
            {gameResult === 'impostor' && (
              <Text style={styles.bodyText}>
                Al menos un impostor sobrevivio {settings.maxRounds} rondas sin
                ser descubierto.
              </Text>
            )}
            <Pressable style={styles.primaryButton} onPress={startGame}>
              <Text style={styles.primaryButtonText}>Nueva partida</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={resetGame}>
              <Text style={styles.secondaryButtonText}>
                Volver a jugadores
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050B1E',
  },
  content: {
    flexGrow: 1,
    padding: 18,
    paddingTop: 64,
  },
  hero: {
    backgroundColor: '#081333',
    borderColor: '#263D8F',
    borderRadius: 34,
    borderWidth: 1,
    marginBottom: 18,
    overflow: 'hidden',
    padding: 22,
  },
  kicker: {
    color: '#37e895',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -0.8,
    lineHeight: 42,
    marginTop: 10,
  },
  subtitle: {
    color: '#9788f7',
    fontSize: 17,
    lineHeight: 24,
    marginTop: 12,
  },
  heroLine: {
    backgroundColor: '#006eff',
    borderRadius: 999,
    height: 4,
    marginTop: 18,
    width: 92,
  },
  card: {
    backgroundColor: '#0B1638',
    borderColor: '#2D3D89',
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
    backgroundColor: '#050B1E',
    borderColor: '#2D3D89',
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
    backgroundColor: '#006eff',
    borderRadius: 20,
    marginTop: 16,
    paddingVertical: 15,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#081333',
    borderColor: '#2D3D89',
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 8,
    paddingVertical: 14,
  },
  secondaryButtonText: {
    color: '#37e895',
    fontSize: 16,
    fontWeight: '800',
  },
  disabledButton: {
    opacity: 0.45,
  },
  smallButton: {
    alignItems: 'center',
    backgroundColor: '#ff4a48',
    borderRadius: 14,
    justifyContent: 'center',
    minWidth: 44,
    paddingHorizontal: 12,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: '#37e895',
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
    backgroundColor: '#050B1E',
    borderColor: '#2D3D89',
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  frequentNameButtonSelected: {
    backgroundColor: '#1A2460',
    borderColor: '#37e895',
  },
  frequentNameText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  helperText: {
    color: '#9788f7',
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 16,
  },
  warningText: {
    color: '#ff4a48',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 12,
  },
  successMessageText: {
    color: '#37e895',
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 28,
    marginBottom: 12,
  },
  dangerMessageText: {
    color: '#ff4a48',
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 28,
    marginBottom: 12,
  },
  roleCard: {
    alignItems: 'center',
    backgroundColor: '#050B1E',
    borderColor: '#2D3D89',
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 220,
    overflow: 'hidden',
    padding: 20,
    position: 'relative',
  },
  roleLabel: {
    color: '#9788f7',
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
    color: '#ff4a48',
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
    color: '#C8C1FF',
    fontSize: 16,
    lineHeight: 23,
    marginTop: 16,
    textAlign: 'center',
  },
  phraseCard: {
    backgroundColor: '#1A2460',
    borderColor: '#9788f7',
    borderWidth: 1,
    borderRadius: 16,
    marginTop: 20,
    padding: 16,
    width: '100%',
  },
  phraseLabel: {
    color: '#37e895',
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
    backgroundColor: '#006eff',
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
    height: 112,
    marginBottom: 12,
    resizeMode: 'contain',
    width: 112,
  },
  curtainTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 6,
  },
  curtainText: {
    color: '#DCD8FF',
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
  ruleText: {
    color: '#DCD8FF',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
  },
  timerText: {
    color: '#37e895',
    fontSize: 54,
    fontWeight: '900',
    marginBottom: 12,
    textAlign: 'center',
  },
  bodyText: {
    color: '#C8C1FF',
    fontSize: 17,
    lineHeight: 25,
    marginBottom: 10,
  },
  firstSpeakerCard: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#081333',
    borderColor: '#37e895',
    borderRadius: 26,
    borderWidth: 2,
    marginBottom: 16,
    minWidth: '58%',
    paddingHorizontal: 22,
    paddingVertical: 20,
    shadowColor: '#37e895',
    shadowOpacity: 0.28,
    shadowRadius: 20,
  },
  firstSpeakerLabel: {
    color: '#9788f7',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.4,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  firstSpeakerName: {
    color: '#37e895',
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 40,
    textAlign: 'center',
  },
  firstSpeakerHint: {
    color: '#DCD8FF',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: 10,
    textAlign: 'center',
  },
  listCard: {
    backgroundColor: '#050B1E',
    borderColor: '#2D3D89',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    padding: 14,
  },
  listCardMuted: {
    backgroundColor: '#081333',
    borderColor: '#2D3D89',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    padding: 14,
  },
  listTitle: {
    color: '#37e895',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  listText: {
    color: '#DCD8FF',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
  },
  voteButton: {
    backgroundColor: '#050B1E',
    borderColor: '#2D3D89',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    padding: 15,
  },
  voteButtonSelected: {
    backgroundColor: '#1A2460',
    borderColor: '#37e895',
  },
  voteButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  settingLabel: {
    color: '#DCD8FF',
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
    backgroundColor: '#050B1E',
    borderColor: '#2D3D89',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  categoryButtonSelected: {
    backgroundColor: '#1A2460',
    borderColor: '#37e895',
  },
  categoryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  roundBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#006eff',
    borderRadius: 12,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  roundBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
