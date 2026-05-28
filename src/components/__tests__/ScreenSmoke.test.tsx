import { render, screen } from '@testing-library/react-native';
import { VoteScreen } from '../VoteScreen';
import { RulesScreen } from '../RulesScreen';
import { EliminatedScreen } from '../EliminatedScreen';
import type { GameSettings, Player } from '../../types/game';

const players: Player[] = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
];

const settings: GameSettings = {
  discussionMinutes: 5,
  voteMinutes: 3,
  maxRounds: 20,
  impostorCount: 1,
  categoryId: 'historias',
};

describe('VoteScreen smoke', () => {
  it('renders title and player list', () => {
    render(
      <VoteScreen
        activePlayers={players}
        selectedVoteIds={[]}
        selectedPlayers={[]}
        settings={settings}
        voteTimeLeft={120}
        formatTime={(s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`}
        onToggleVoteSelection={jest.fn()}
        onConfirmVote={jest.fn()}
        onNewGame={jest.fn()}
        onEditGame={jest.fn()}
      />,
    );
    expect(screen.getByText('Votacion fisica')).toBeOnTheScreen();
    expect(screen.getByText('Alice')).toBeOnTheScreen();
    expect(screen.getByText('Bob')).toBeOnTheScreen();
  });

  it('shows confirm disabled with no selection', () => {
    render(
      <VoteScreen
        activePlayers={players}
        selectedVoteIds={[]}
        selectedPlayers={[]}
        settings={settings}
        voteTimeLeft={120}
        formatTime={(s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`}
        onToggleVoteSelection={jest.fn()}
        onConfirmVote={jest.fn()}
        onNewGame={jest.fn()}
        onEditGame={jest.fn()}
      />,
    );
    expect(screen.getByText('Confirmar eliminado')).toBeDisabled();
  });

  it('shows confirm enabled with selection', () => {
    render(
      <VoteScreen
        activePlayers={players}
        selectedVoteIds={[1]}
        selectedPlayers={[players[0]]}
        settings={settings}
        voteTimeLeft={120}
        formatTime={(s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`}
        onToggleVoteSelection={jest.fn()}
        onConfirmVote={jest.fn()}
        onNewGame={jest.fn()}
        onEditGame={jest.fn()}
      />,
    );
    expect(screen.getByText('Confirmar eliminado')).toBeEnabled();
  });
});

describe('RulesScreen smoke', () => {
  it('renders rules and button', () => {
    render(<RulesScreen maxRounds={20} onBeginReveal={jest.fn()} />);
    expect(screen.getByText('Como se juega')).toBeOnTheScreen();
    expect(screen.getByText('Entendido')).toBeOnTheScreen();
  });
});

describe('EliminatedScreen smoke', () => {
  it('renders eliminated result', () => {
    render(
      <EliminatedScreen
        eliminatedPlayerName="Alice"
        isPluralEliminated={false}
        selectedWasOnlyImpostors={true}
        selectedHadNoImpostors={false}
        activePlayers={players}
        selectedVoteIds={[1]}
        visibleActivePlayers={[players[1]]}
        visibleEliminatedPlayers={[players[0]]}
        onNextRound={jest.fn()}
      />,
    );
    expect(screen.getByText('Alice fue eliminado')).toBeOnTheScreen();
    expect(screen.getByText('Siguiente ronda')).toBeOnTheScreen();
  });

  it('renders plural eliminated', () => {
    render(
      <EliminatedScreen
        eliminatedPlayerName="Alice, Bob"
        isPluralEliminated={true}
        selectedWasOnlyImpostors={false}
        selectedHadNoImpostors={false}
        activePlayers={players}
        selectedVoteIds={[1]}
        visibleActivePlayers={[]}
        visibleEliminatedPlayers={players}
        onNextRound={jest.fn()}
      />,
    );
    expect(screen.getByText('Alice, Bob fueron eliminados')).toBeOnTheScreen();
  });
});
