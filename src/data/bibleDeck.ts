export const bibleCategories = [
  {
    id: 'historias',
    name: 'Historias biblicas',
    words: [
      'David y Goliat',
      'El arca de Noe',
      'Jonas y el gran pez',
      'Daniel en el foso de los leones',
      'La torre de Babel',
      'Moises y el mar rojo',
      'El buen samaritano',
      'La ultima cena',
      'Jose y sus hermanos',
      'Sanson y Dalila',
      'La multiplicacion de los panes',
      'El hijo prodigo',
      'Jesus calma la tormenta',
      'La oveja perdida',
      'La pesca milagrosa',
      'El nacimiento de Jesus',
    ],
  },
  {
    id: 'personajes',
    name: 'Personajes biblicos',
    words: [
      'Noe',
      'Abraham',
      'Sara',
      'Jose',
      'Moises',
      'Josue',
      'Rut',
      'Ester',
      'David',
      'Salomon',
      'Daniel',
      'Jonas',
      'Maria',
      'Pedro',
      'Pablo',
      'Juan el Bautista',
    ],
  },
  {
    id: 'lugares',
    name: 'Lugares biblicos',
    words: [
      'Jerusalen',
      'Belen',
      'Egipto',
      'Mar Rojo',
      'Monte Sinai',
      'Babilonia',
      'Nazaret',
      'Galilea',
      'Jordan',
      'Jerico',
      'Eden',
      'Betel',
      'Samaria',
      'Damasco',
    ],
  },
  {
    id: 'objetos',
    name: 'Objetos y simbolos',
    words: [
      'Arca',
      'Mana',
      'Honda',
      'Tablas de la ley',
      'Rollo',
      'Aceite',
      'Lampara',
      'Tunica',
      'Red de pesca',
      'Canasta',
      'Copa',
      'Pan',
      'Semilla',
      'Moneda',
    ],
  },
  {
    id: 'mixto',
    name: 'Mixto',
    words: [],
  },
];

export function getWordsForCategory(categoryId: string) {
  const category = bibleCategories.find((item) => item.id === categoryId);

  if (!category || category.id === 'mixto') {
    return bibleCategories
      .filter((item) => item.id !== 'mixto')
      .flatMap((item) => item.words);
  }

  return category.words;
}
