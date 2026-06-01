export const bibleWords = [
  { word: 'David y Goliat', pista: 'Honda', referencia: '1 Samuel 17:4-50' },
  { word: 'El arca de Noe', pista: 'Diluvio', referencia: 'Genesis 6:13-22; 7:1-24' },
  { word: 'Jonas y el gran pez', pista: 'Pez', referencia: 'Jonas 1:17; 2:1-10' },
  { word: 'Daniel en el foso de los leones', pista: 'Leones', referencia: 'Daniel 6:16-23' },
  { word: 'La torre de Babel', pista: 'Lenguas', referencia: 'Genesis 11:1-9' },
  { word: 'Moises y el mar rojo', pista: 'Mar', referencia: 'Exodo 14:21-31' },
  { word: 'El buen samaritano', pista: 'Projimo', referencia: 'Lucas 10:30-37' },
  { word: 'La ultima cena', pista: 'Cena', referencia: 'Mateo 26:20-29; Lucas 22:14-20' },
  { word: 'Jose y sus hermanos', pista: 'Tunica', referencia: 'Genesis 37:3-28; 45:1-15' },
  { word: 'Sanson y Dalila', pista: 'Cabello', referencia: 'Jueces 16:4-22' },
  { word: 'La multiplicacion de los panes', pista: 'Panes', referencia: 'Mateo 14:15-21; Juan 6:5-13' },
  { word: 'El hijo prodigo', pista: 'Regreso', referencia: 'Lucas 15:11-32' },
  { word: 'Jesus calma la tormenta', pista: 'Tormenta', referencia: 'Marcos 4:35-41' },
  { word: 'La oveja perdida', pista: 'Oveja', referencia: 'Lucas 15:3-7' },
  { word: 'La pesca milagrosa', pista: 'Redes', referencia: 'Lucas 5:1-11; Juan 21:4-11' },
  { word: 'El nacimiento de Jesus', pista: 'Belen', referencia: 'Lucas 2:1-20; Mateo 2:1-11' },
  {
    word: 'La resurreccion de Jesus',
    pista: 'Resurreccion',
    referencia: 'Mateo 28:1-10; 1 Corintios 15:3-8',
  },
  { word: 'El Reino mesianico', pista: 'Reino', referencia: 'Daniel 2:44; Mateo 6:10' },
  {
    word: 'Nuevo cielo y nueva tierra',
    pista: 'Renovacion',
    referencia: 'Isaias 65:17; 2 Pedro 3:13; Revelacion 21:1',
  },
  { word: 'Armagedon', pista: 'Guerra', referencia: 'Revelacion 16:14, 16; 19:11-21' },
  { word: 'Resurreccion', pista: 'Vida', referencia: 'Daniel 12:2; Juan 5:28, 29; Hechos 24:15' },
  { word: 'Jesus', pista: 'Mesias', referencia: 'Mateo 16:16; Juan 1:41; Hechos 2:36' },
  { word: 'Moises', pista: 'Liberador', referencia: 'Exodo 3:1-12; Deuteronomio 34:10-12' },
  { word: 'David', pista: 'Pastor', referencia: '1 Samuel 16:11-13; Hechos 13:22' },
  { word: 'Abraham', pista: 'Fe', referencia: 'Genesis 12:1-9; Romanos 4:11, 12' },
  { word: 'Jerusalen', pista: 'Ciudad', referencia: '2 Samuel 5:6-9; Salmo 122:1-9' },
  { word: 'Belen', pista: 'Nacimiento', referencia: 'Miqueas 5:2; Lucas 2:4-7' },
  { word: 'Arca del pacto', pista: 'Pacto', referencia: 'Exodo 25:10-22; Hebreos 9:4' },
  { word: 'Mana', pista: 'Alimento', referencia: 'Exodo 16:4-35; Juan 6:31-35' },
  { word: 'Los diez mandamientos', pista: 'Tablas', referencia: 'Exodo 20:1-17; 31:18' },
];

export function getRandomWord() {
  const index = Math.floor(Math.random() * bibleWords.length);
  return { ...bibleWords[index] };
}
