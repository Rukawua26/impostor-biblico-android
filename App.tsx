import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useReducer, useState } from 'react';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { SocketProvider, useSocket } from './src/context/SocketContext';
import { Animated, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getEntriesForCategory } from './src/data/bibleDeck';
import { IntroScreen } from './src/components/IntroScreen';
import { GameModeScreen } from './src/components/GameModeScreen';
import { OnlineSetupScreen } from './src/components/OnlineSetupScreen';
import { WaitingRoomScreen } from './src/components/WaitingRoomScreen';
import { OnlineGameScreen } from './src/components/OnlineGameScreen';
import { SetupScreen } from './src/components/SetupScreen';
import { DiscussionScreen } from './src/components/DiscussionScreen';
import { RevealScreen } from './src/components/RevealScreen';
import { VoteScreen } from './src/components/VoteScreen';
import { EliminatedScreen } from './src/components/EliminatedScreen';
import { ResultScreen } from './src/components/ResultScreen';
import { RulesScreen } from './src/components/RulesScreen';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { resolveVote, resolveNextRound } from './src/game/resolveVote';
import { createRound, normalizePlayers } from './src/game/createRound';
import { defaultPlayers } from './src/data/defaultPlayers';
import {
  loadFrequentPlayers,
  loadRecentImpostors,
  loadUsedWords,
  saveFrequentPlayers,
  saveRecentImpostors,
  saveUsedWords,
} from './src/storage/gameStorage';
import type { Player } from './src/types/game';
import { gameReducer, initialGameState } from './src/game/gameReducer';

export default function App() {
  return (
    <ThemeProvider>
      <SocketProvider>
        <GameApp />
      </SocketProvider>
    </ThemeProvider>
  );
}

type GameMode = 'selecting' | 'presencial' | 'online';

function GameApp() {
  const { colors, isDarkMode } = useTheme();
  const { roomCode, leaveRoom, gameStarted, myRole } = useSocket();
  const [gameMode, setGameMode] = useState<GameMode>('selecting');
  const [showIntro, setShowIntro] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const [newFrequentPlayerName, setNewFrequentPlayerName] = useState('');
  const [setupMessage, setSetupMessage] = useState('');

  const firstSpeakerPulse = useRef(new Animated.Value(0)).current;

  const {
    phase,
    allPlayers,
    frequentPlayers,
    settings,
    round,
    revealIndex,
    cardVisible,
    selectedVoteIds,
    discussionTimeLeft,
    voteTimeLeft,
    roundNumber,
    eliminatedIds,
    roundStarterIds,
    gameResult,
    eliminatedPlayerName,
    activePlayers,
  } = state;

  const normalizedAll = useMemo(() => normalizePlayers(allPlayers), [allPlayers]);
  const canStart =
    normalizedAll.length >= 3 &&
    settings.discussionMinutes > 0 &&
    settings.voteMinutes > 0 &&
    settings.impostorCount > 0 &&
    settings.impostorCount <= 5 &&
    settings.impostorCount < normalizedAll.length;
  const visibleEliminatedIds = useMemo(() => {
    if (selectedVoteIds.length > 0) {
      return [...new Set([...eliminatedIds, ...selectedVoteIds])];
    }
    return eliminatedIds;
  }, [eliminatedIds, selectedVoteIds]);
  const visibleEliminatedPlayers = allPlayers.filter((player) => visibleEliminatedIds.includes(player.id));
  const visibleActivePlayers = activePlayers.filter((player) => !visibleEliminatedIds.includes(player.id));
  const impostorPlayers = activePlayers.filter((player) => round?.impostorIds.includes(player.id));
  const currentPlayer = activePlayers[revealIndex];
  const selectedPlayers = activePlayers.filter((player) => selectedVoteIds.includes(player.id));
  const firstSpeaker = activePlayers.find((player) => player.id === round?.firstSpeakerId);
  const selectedImpostorCount = selectedVoteIds.filter((id) => round?.impostorIds.includes(id)).length;
  const selectedWasOnlyImpostors =
    selectedVoteIds.length > 0 && selectedImpostorCount === selectedVoteIds.length;
  const selectedHadNoImpostors = selectedVoteIds.length > 0 && selectedImpostorCount === 0;
  const currentPlayerIsImpostor = !!currentPlayer && !!round?.impostorIds.includes(currentPlayer.id);
  const activeImpostorIds =
    round?.impostorIds.filter(
      (id) => activePlayers.some((player) => player.id === id) && !visibleEliminatedIds.includes(id),
    ) ?? [];

  useEffect(() => {
    let isMounted = true;

    async function loadSavedData() {
      const [savedPlayers, savedUsedWords, savedRecentImpostors] = await Promise.all([
        loadFrequentPlayers(),
        loadUsedWords(),
        loadRecentImpostors(),
      ]);

      if (!isMounted) return;

      const players: Player[] =
        savedPlayers.length > 0
          ? savedPlayers.slice(0, Math.max(3, Math.min(savedPlayers.length, 6))).map((name) => ({
              id: Date.now() + Math.random(),
              name,
            }))
          : defaultPlayers;

      dispatch({
        type: 'LOAD_SAVED_DATA',
        payload: {
          frequentPlayers: savedPlayers.length > 0 ? savedPlayers : defaultPlayers.map((p) => p.name),
          usedWords: savedUsedWords,
          recentImpostors: savedRecentImpostors,
          players,
        },
      });
    }

    loadSavedData().finally(() => {
      if (isMounted) setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (phase !== 'discussion' || !firstSpeaker) {
      firstSpeakerPulse.stopAnimation();
      firstSpeakerPulse.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(firstSpeakerPulse, {
          toValue: 1,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.timing(firstSpeakerPulse, {
          toValue: 0,
          duration: 850,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [firstSpeaker, firstSpeakerPulse, phase]);

  useEffect(() => {
    if (phase !== 'discussion' || discussionTimeLeft <= 0) return;

    const interval = setInterval(() => {
      dispatch({ type: 'DECREMENT_DISCUSSION_TIME' });
    }, 1000);

    return () => clearInterval(interval);
  }, [discussionTimeLeft, phase]);

  useEffect(() => {
    if (phase !== 'vote' || voteTimeLeft <= 0) return;

    const interval = setInterval(() => {
      dispatch({ type: 'DECREMENT_VOTE_TIME' });
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
    dispatch({ type: 'UPDATE_PLAYER_NAME', id, name });
    setSetupMessage('');
  }

  function addPlayerByName(name: string) {
    const cleanName = name.trim();
    if (!cleanName) return;

    dispatch({ type: 'ADD_PLAYER', player: { id: Date.now() + Math.random(), name: cleanName } });
    setSetupMessage('');
  }

  async function addFrequentPlayer() {
    const cleanName = newFrequentPlayerName.trim();
    if (!cleanName) return;

    const nextFrequentPlayers = await saveFrequentPlayers([...frequentPlayers, cleanName]);
    dispatch({ type: 'SET_FREQUENT_PLAYERS', players: nextFrequentPlayers });
    addPlayerByName(cleanName);
    setNewFrequentPlayerName('');
  }

  async function removeFrequentPlayer(name: string) {
    const nextFrequentPlayers = await saveFrequentPlayers(
      frequentPlayers.filter((playerName) => playerName.toLocaleLowerCase() !== name.toLocaleLowerCase()),
    );

    dispatch({ type: 'SET_FREQUENT_PLAYERS', players: nextFrequentPlayers });
  }

  function removePlayer(id: number) {
    dispatch({ type: 'REMOVE_PLAYER', id });
    setSetupMessage('');
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

    if (
      settings.impostorCount <= 0 ||
      settings.impostorCount > 5 ||
      settings.impostorCount >= players.length
    ) {
      setSetupMessage('La cantidad de impostores debe ser de 1 a 5 y menor que la cantidad de jugadores.');
      return;
    }

    const entries = getEntriesForCategory(settings.categoryId);
    const usedWordSet = new Set(state.usedWords.map((word) => word.toLocaleLowerCase()));
    const hasAvailableWord = entries.some((entry) => !usedWordSet.has(entry.word.toLocaleLowerCase()));
    const nextRound = createRound(
      players,
      settings.impostorCount,
      settings.categoryId,
      hasAvailableWord ? state.usedWords : [],
      state.recentImpostors,
      [],
    );
    const nextImpostorNames = players
      .filter((player) => nextRound.impostorIds.includes(player.id))
      .map((player) => player.name);
    const nextUsedWords = await saveUsedWords(
      hasAvailableWord ? [...state.usedWords, nextRound.word] : [nextRound.word],
    );
    const nextRecentImpostors = await saveRecentImpostors(nextImpostorNames);
    const nextFrequentPlayers = await saveFrequentPlayers([
      ...frequentPlayers,
      ...players.map((player) => player.name),
    ]);

    dispatch({
      type: 'START_GAME',
      payload: {
        players,
        round: nextRound,
        settings,
        frequentPlayers: nextFrequentPlayers,
        usedWords: nextUsedWords,
        recentImpostors: nextRecentImpostors,
      },
    });
  }

  function beginReveal() {
    dispatch({ type: 'BEGIN_REVEAL' });
  }

  function continueReveal() {
    if (!cardVisible) {
      dispatch({ type: 'SHOW_CARD' });
      return;
    }

    dispatch({ type: 'CONTINUE_REVEAL', maxDiscussionMinutes: settings.discussionMinutes });
  }

  function goToVote() {
    dispatch({ type: 'GO_TO_VOTE', voteMinutes: settings.voteMinutes });
  }

  function toggleVoteSelection(playerId: number) {
    dispatch({ type: 'TOGGLE_VOTE', playerId });
  }

  function handleVoteResult() {
    const outcome = resolveVote(
      selectedVoteIds,
      activeImpostorIds,
      activePlayers,
      roundNumber,
      settings.maxRounds,
    );
    if (!outcome) return;

    if (outcome.type === 'result') {
      dispatch({
        type: 'HANDLE_VOTE_RESULT',
        phase: 'result',
        eliminatedPlayerName: outcome.eliminatedPlayerName,
        gameResult: outcome.gameResult,
      });
      return;
    }

    dispatch({
      type: 'HANDLE_VOTE_RESULT',
      phase: 'eliminated',
      eliminatedPlayerName: outcome.eliminatedPlayerName,
    });
  }

  function nextRound() {
    const outcome = resolveNextRound(
      selectedVoteIds,
      activePlayers,
      round?.impostorIds ?? [],
      roundStarterIds,
    );

    if (outcome.type === 'result') {
      dispatch({ type: 'IMPOSTOR_WIN', eliminatedPlayerName: eliminatedPlayerName });
      return;
    }

    const { remaining, nextFirstSpeakerId } = outcome;
    const usedActiveStarters = roundStarterIds.filter((id) => remaining.some((player) => player.id === id));

    dispatch({
      type: 'NEXT_ROUND',
      payload: {
        remaining,
        nextFirstSpeakerId,
        roundStarterIds: usedActiveStarters.includes(nextFirstSpeakerId)
          ? [nextFirstSpeakerId]
          : [...usedActiveStarters, nextFirstSpeakerId],
        discussionMinutes: settings.discussionMinutes,
      },
    });
  }

  function leaveOnlineRoom() {
    leaveRoom();
    setGameMode('selecting');
  }

  function resetGame() {
    dispatch({ type: 'RESET_GAME' });
  }

  function formatTime(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: colors.background }]}>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        <Text style={[styles.loadingText, { color: colors.onBackground }]}>Cargando...</Text>
      </View>
    );
  }

  if (showIntro) {
    return <IntroScreen onFinish={() => setShowIntro(false)} />;
  }

  if (gameMode === 'selecting') {
    return (
      <GameModeScreen
        onSelectPresencial={() => setGameMode('presencial')}
        onSelectOnline={() => setGameMode('online')}
      />
    );
  }

  if (gameMode === 'online') {
    if (gameStarted && myRole) {
      return <OnlineGameScreen onLeave={leaveOnlineRoom} />;
    }
    if (roomCode) {
      return <WaitingRoomScreen onBack={leaveOnlineRoom} />;
    }
    return <OnlineSetupScreen onBack={leaveOnlineRoom} />;
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'android' ? undefined : 'padding'}
    >
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View
          style={[
            styles.hero,
            {
              backgroundColor: colors.surfaceContainer,
              borderColor: colors.outline,
              shadowColor: colors.primary,
            },
            phase === 'reveal' && styles.heroCompact,
          ]}
        >
          <Text style={[styles.kicker, { color: colors.primary }]}>Juego presencial multijugador</Text>
          <Text
            style={[styles.title, { color: colors.onSurface }, phase === 'reveal' && styles.titleCompact]}
          >
            El Impostor Biblico
          </Text>
          {subtitle && phase !== 'reveal' ? (
            <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>{subtitle}</Text>
          ) : null}
          {phase !== 'reveal' ? (
            <View style={[styles.heroLine, { backgroundColor: colors.primary }]} />
          ) : null}
        </View>

        {phase === 'setup' && (
          <ErrorBoundary>
            <SetupScreen
              allPlayers={allPlayers}
              frequentPlayers={frequentPlayers}
              newFrequentPlayerName={newFrequentPlayerName}
              settings={settings}
              setupMessage={setupMessage}
              canStart={canStart}
              onUpdatePlayerName={updatePlayerName}
              onAddPlayerByName={addPlayerByName}
              onAddFrequentPlayer={addFrequentPlayer}
              onRemovePlayer={removePlayer}
              onRemoveFrequentPlayer={removeFrequentPlayer}
              onStartGame={startGame}
              onNewFrequentPlayerNameChange={setNewFrequentPlayerName}
              onSettingsChange={(s) => dispatch({ type: 'SET_SETTINGS', settings: s })}
            />
          </ErrorBoundary>
        )}

        {phase === 'rules' && (
          <ErrorBoundary>
            <RulesScreen maxRounds={settings.maxRounds} onBeginReveal={beginReveal} />
          </ErrorBoundary>
        )}

        {phase === 'reveal' && currentPlayer && (
          <ErrorBoundary>
            <RevealScreen
              currentPlayer={currentPlayer}
              cardVisible={cardVisible}
              currentPlayerIsImpostor={currentPlayerIsImpostor}
              round={round}
              onContinueReveal={continueReveal}
            />
          </ErrorBoundary>
        )}

        {phase === 'discussion' && (
          <ErrorBoundary>
            <DiscussionScreen
              roundNumber={roundNumber}
              maxRounds={settings.maxRounds}
              discussionTimeLeft={discussionTimeLeft}
              firstSpeaker={firstSpeaker}
              firstSpeakerPulse={firstSpeakerPulse}
              visibleActivePlayers={visibleActivePlayers}
              visibleEliminatedPlayers={visibleEliminatedPlayers}
              onGoToVote={goToVote}
              formatTime={formatTime}
            />
          </ErrorBoundary>
        )}

        {phase === 'vote' && (
          <ErrorBoundary>
            <VoteScreen
              activePlayers={activePlayers}
              selectedVoteIds={selectedVoteIds}
              selectedPlayers={selectedPlayers}
              settings={settings}
              voteTimeLeft={voteTimeLeft}
              formatTime={formatTime}
              onToggleVoteSelection={toggleVoteSelection}
              onConfirmVote={handleVoteResult}
              onNewGame={startGame}
              onEditGame={resetGame}
            />
          </ErrorBoundary>
        )}

        {phase === 'eliminated' && (
          <ErrorBoundary>
            <EliminatedScreen
              eliminatedPlayerName={eliminatedPlayerName}
              isPluralEliminated={selectedVoteIds.length > 1}
              selectedWasOnlyImpostors={selectedWasOnlyImpostors}
              selectedHadNoImpostors={selectedHadNoImpostors}
              activePlayers={activePlayers}
              selectedVoteIds={selectedVoteIds}
              visibleActivePlayers={visibleActivePlayers}
              visibleEliminatedPlayers={visibleEliminatedPlayers}
              onNextRound={nextRound}
            />
          </ErrorBoundary>
        )}

        {phase === 'result' && (
          <ErrorBoundary>
            <ResultScreen
              gameResult={gameResult}
              impostorPlayers={impostorPlayers}
              selectedPlayers={selectedPlayers}
              visibleEliminatedPlayers={visibleEliminatedPlayers}
              round={round}
              settings={settings}
              selectedVoteIds={selectedVoteIds}
              onNewGame={startGame}
              onEditGame={resetGame}
            />
          </ErrorBoundary>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2A23CF',
  },
  content: {
    flexGrow: 1,
    padding: 18,
    paddingTop: 64,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  hero: {
    backgroundColor: '#B76288',
    borderColor: '#0B78B3',
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
    padding: 14,
  },
  heroCompact: {
    borderRadius: 14,
    marginBottom: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  kicker: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.6,
    lineHeight: 30,
    marginTop: 6,
  },
  titleCompact: {
    fontSize: 18,
    lineHeight: 22,
    marginTop: 2,
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  heroLine: {
    backgroundColor: '#FF4406',
    borderRadius: 999,
    height: 3,
    marginTop: 10,
    width: 60,
  },
});
