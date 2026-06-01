type BibleBookInfo = {
  number: string;
  slug: string;
};

const bibleBooks: Record<string, BibleBookInfo> = {
  genesis: { number: '01', slug: 'genesis' },
  exodo: { number: '02', slug: 'exodo' },
  levitico: { number: '03', slug: 'levitico' },
  numeros: { number: '04', slug: 'numeros' },
  deuteronomio: { number: '05', slug: 'deuteronomio' },
  josue: { number: '06', slug: 'josue' },
  jueces: { number: '07', slug: 'jueces' },
  rut: { number: '08', slug: 'rut' },
  '1 samuel': { number: '09', slug: '1-samuel' },
  '2 samuel': { number: '10', slug: '2-samuel' },
  '1 reyes': { number: '11', slug: '1-reyes' },
  '2 reyes': { number: '12', slug: '2-reyes' },
  '1 cronicas': { number: '13', slug: '1-cronicas' },
  '2 cronicas': { number: '14', slug: '2-cronicas' },
  esdras: { number: '15', slug: 'esdras' },
  nehemias: { number: '16', slug: 'nehemias' },
  ester: { number: '17', slug: 'ester' },
  job: { number: '18', slug: 'job' },
  salmos: { number: '19', slug: 'salmos' },
  salmo: { number: '19', slug: 'salmos' },
  proverbios: { number: '20', slug: 'proverbios' },
  eclesiastes: { number: '21', slug: 'eclesiastes' },
  'cantar de los cantares': { number: '22', slug: 'cantar-de-los-cantares' },
  isaias: { number: '23', slug: 'isaias' },
  jeremias: { number: '24', slug: 'jeremias' },
  lamentaciones: { number: '25', slug: 'lamentaciones' },
  ezequiel: { number: '26', slug: 'ezequiel' },
  daniel: { number: '27', slug: 'daniel' },
  oseas: { number: '28', slug: 'oseas' },
  joel: { number: '29', slug: 'joel' },
  amos: { number: '30', slug: 'amos' },
  abdias: { number: '31', slug: 'abdias' },
  jonas: { number: '32', slug: 'jonas' },
  miqueas: { number: '33', slug: 'miqueas' },
  nahum: { number: '34', slug: 'nahum' },
  habacuc: { number: '35', slug: 'habacuc' },
  sofonias: { number: '36', slug: 'sofonias' },
  ageo: { number: '37', slug: 'ageo' },
  zacarias: { number: '38', slug: 'zacarias' },
  malaquias: { number: '39', slug: 'malaquias' },
  mateo: { number: '40', slug: 'mateo' },
  marcos: { number: '41', slug: 'marcos' },
  lucas: { number: '42', slug: 'lucas' },
  juan: { number: '43', slug: 'juan' },
  hechos: { number: '44', slug: 'hechos' },
  romanos: { number: '45', slug: 'romanos' },
  '1 corintios': { number: '46', slug: '1-corintios' },
  '2 corintios': { number: '47', slug: '2-corintios' },
  galatas: { number: '48', slug: 'galatas' },
  efesios: { number: '49', slug: 'efesios' },
  filipenses: { number: '50', slug: 'filipenses' },
  colosenses: { number: '51', slug: 'colosenses' },
  '1 tesalonicenses': { number: '52', slug: '1-tesalonicenses' },
  '2 tesalonicenses': { number: '53', slug: '2-tesalonicenses' },
  '1 timoteo': { number: '54', slug: '1-timoteo' },
  '2 timoteo': { number: '55', slug: '2-timoteo' },
  tito: { number: '56', slug: 'tito' },
  filemon: { number: '57', slug: 'filemon' },
  hebreos: { number: '58', slug: 'hebreos' },
  santiago: { number: '59', slug: 'santiago' },
  '1 pedro': { number: '60', slug: '1-pedro' },
  '2 pedro': { number: '61', slug: '2-pedro' },
  '1 juan': { number: '62', slug: '1-juan' },
  '2 juan': { number: '63', slug: '2-juan' },
  '3 juan': { number: '64', slug: '3-juan' },
  judas: { number: '65', slug: 'judas' },
  revelacion: { number: '66', slug: 'revelacion' },
  apocalipsis: { number: '66', slug: 'revelacion' },
};

function normalizeBookName(bookName: string) {
  return bookName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase();
}

export function getJwBibleUrl(reference: string | null | undefined) {
  const firstReference = reference?.split(';')[0]?.trim();
  if (!firstReference) return null;

  const match = firstReference.match(/^(.+?)\s+(\d+):(\d+)/);
  if (!match) return null;

  const [, rawBookName, rawChapter, rawVerse] = match;
  const bookInfo = bibleBooks[normalizeBookName(rawBookName)];
  if (!bookInfo) return null;

  const chapter = rawChapter.padStart(3, '0');
  const verse = rawVerse.padStart(3, '0');
  const verseId = `${bookInfo.number}${chapter}${verse}`;

  return `https://www.jw.org/es/biblioteca/biblia/biblia-estudio/libros/${bookInfo.slug}/${Number(rawChapter)}/#v${verseId}`;
}
