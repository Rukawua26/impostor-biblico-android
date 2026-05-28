import { createRound, normalizePlayers, pickNextFirstSpeaker } from '../createRound';
import type { Player } from '../../types/game';

describe('normalizePlayers', () => {
  it('returns players unchanged when all valid and unique', () => {
    const players: Player[] = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 3, name: 'Charlie' },
    ];
    expect(normalizePlayers(players)).toEqual(players);
  });

  it('trims whitespace from names', () => {
    const players: Player[] = [
      { id: 1, name: '  Alice  ' },
      { id: 2, name: 'Bob ' },
    ];
    const result = normalizePlayers(players);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Alice');
    expect(result[1].name).toBe('Bob');
  });

  it('removes empty names', () => {
    const players: Player[] = [
      { id: 1, name: '' },
      { id: 2, name: 'Bob' },
      { id: 3, name: '   ' },
    ];
    expect(normalizePlayers(players)).toHaveLength(1);
  });

  it('deduplicates names case-insensitively', () => {
    const players: Player[] = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'alice' },
      { id: 3, name: 'ALICE' },
    ];
    expect(normalizePlayers(players)).toHaveLength(1);
  });

  it('returns empty array for empty input', () => {
    expect(normalizePlayers([])).toEqual([]);
  });

  it('returns empty array when all names are invalid', () => {
    const players: Player[] = [
      { id: 1, name: '' },
      { id: 2, name: '   ' },
    ];
    expect(normalizePlayers(players)).toHaveLength(0);
  });
});

describe('pickNextFirstSpeaker', () => {
  const players: Player[] = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Charlie' },
  ];

  it('returns an eligible player id', () => {
    const speakerId = pickNextFirstSpeaker(players, []);
    expect(players.some((p) => p.id === speakerId)).toBe(true);
  });

  it('returns a player who has not spoken when possible', () => {
    const usedIds = [1, 2];
    const speakerId = pickNextFirstSpeaker(players, usedIds);
    expect(speakerId).toBe(3);
  });

  it('falls back to any player when all have spoken', () => {
    const usedIds = [1, 2, 3];
    const speakerId = pickNextFirstSpeaker(players, usedIds);
    expect(players.some((p) => p.id === speakerId)).toBe(true);
  });
});

describe('createRound', () => {
  const players: Player[] = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Charlie' },
    { id: 4, name: 'David' },
    { id: 5, name: 'Eve' },
  ];

  it('returns a round with the expected structure', () => {
    const round = createRound(players, 1, 'historias', [], [], []);
    expect(round).toHaveProperty('word');
    expect(round).toHaveProperty('impostorIds');
    expect(round).toHaveProperty('impostorClue');
    expect(round).toHaveProperty('impostorCluesById');
    expect(round).toHaveProperty('impostorReference');
    expect(round).toHaveProperty('firstSpeakerId');
  });

  it('selects the correct number of impostors', () => {
    const round = createRound(players, 2, 'historias', [], [], []);
    expect(round.impostorIds).toHaveLength(2);
  });

  it('assigns a clue to each impostor', () => {
    const round = createRound(players, 2, 'historias', [], [], []);
    expect(round.impostorIds).toHaveLength(2);
    round.impostorIds.forEach((id) => {
      expect(round.impostorCluesById[id]).toBeDefined();
    });
  });

  it('sets a first speaker id that belongs to a player', () => {
    const round = createRound(players, 1, 'historias', [], [], []);
    expect(players.some((p) => p.id === round.firstSpeakerId)).toBe(true);
  });

  it('picks a word from the given category', () => {
    const round = createRound(players, 1, 'personajes', [], [], []);
    const categoryData = jest.requireActual('../../data/bibleDeck');
    const category = categoryData.bibleCategories.find((c: { id: string }) => c.id === 'personajes');
    const categoryWords = category.words.map((w: { word: string }) => w.word);
    expect(categoryWords).toContain(round.word);
  });

  it('avoids used words when possible', () => {
    const round = createRound(players, 1, 'historias', ['David y Goliat', 'El arca de Noe'], [], []);
    expect(round.word).not.toBe('David y Goliat');
    expect(round.word).not.toBe('El arca de Noe');
  });

  it('falls back to all words when all are used', () => {
    const allWords = [
      'David y Goliat',
      'El arca de Noe',
      'Jonas y el gran pez',
      'Daniel en el foso de los leones',
      'La torre de Babel',
    ];
    const round = createRound(players, 1, 'historias', allWords, [], []);
    expect(round.word).toBeTruthy();
  });

  it('avoids recent impostors when possible', () => {
    const recentImpostors = ['Alice'];
    const round = createRound(players, 1, 'historias', [], recentImpostors, []);
    expect(round.impostorIds.includes(1)).toBe(false);
  });

  it('falls back to any player when all are recent impostors', () => {
    const allNames = players.map((p) => p.name);
    const round = createRound(players, 1, 'historias', [], allNames, []);
    expect(round.impostorIds).toHaveLength(1);
  });

  it('sets the impostor clue for the round', () => {
    const round = createRound(players, 1, 'historias', [], [], []);
    expect(typeof round.impostorClue).toBe('string');
    expect(round.impostorClue.length).toBeGreaterThan(0);
  });

  it('sets the biblical reference for the word', () => {
    const round = createRound(players, 1, 'historias', [], [], []);
    expect(typeof round.impostorReference).toBe('string');
    expect(round.impostorReference.length).toBeGreaterThan(0);
  });
});
