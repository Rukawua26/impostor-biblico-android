import { getJwBibleUrl } from '../jwBibleUrl';

describe('getJwBibleUrl', () => {
  it('builds a JW.org URL for a single verse', () => {
    expect(getJwBibleUrl('Daniel 2:44')).toBe(
      'https://www.jw.org/es/biblioteca/biblia/biblia-estudio/libros/daniel/2/#v27002044',
    );
  });

  it('uses the first verse when the reference has a range', () => {
    expect(getJwBibleUrl('Daniel 2:31-45')).toBe(
      'https://www.jw.org/es/biblioteca/biblia/biblia-estudio/libros/daniel/2/#v27002031',
    );
  });

  it('uses the first reference when there are multiple references', () => {
    expect(getJwBibleUrl('Genesis 6:13-22; 7:1-24')).toBe(
      'https://www.jw.org/es/biblioteca/biblia/biblia-estudio/libros/genesis/6/#v01006013',
    );
  });

  it('supports numbered books', () => {
    expect(getJwBibleUrl('1 Corintios 15:3-8')).toBe(
      'https://www.jw.org/es/biblioteca/biblia/biblia-estudio/libros/1-corintios/15/#v46015003',
    );
  });

  it('returns null for unsupported references', () => {
    expect(getJwBibleUrl('Referencia desconocida')).toBeNull();
  });
});
