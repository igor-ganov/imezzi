import { describe, expect, test } from 'bun:test';
import { stationName } from '../../src/lib/map/station-name.ts';

describe('stationName', () => {
  test('drops the /IMP SPEC tag and title-cases', () => {
    expect(stationName('BARI/IMP SPEC')).toBe('Bari');
    expect(stationName('SALITA GRANAROLO/IMP SPEC')).toBe('Salita Granarolo');
  });

  test('drops the /METRO tag', () => {
    expect(stationName('DINEGRO/METRO')).toBe('Dinegro');
    expect(stationName('S.AGOSTINO/METRO')).toBe('S.Agostino');
  });

  test('strips a lone trailing slash', () => {
    expect(stationName('SAN PANTALEO/')).toBe('San Pantaleo');
  });

  test('keeps roman numerals and re-capitalizes after apostrophes', () => {
    expect(stationName('XX SETTEMBRE')).toBe('XX Settembre');
    expect(stationName("SANT'ANTONINO/")).toBe("Sant'Antonino");
  });

  test('title-cases ordinary short words but keeps initials', () => {
    expect(stationName('DE FERRARI/METRO')).toBe('De Ferrari');
    expect(stationName('VIA B. BIANCO/IMP SPEC')).toBe('Via B. Bianco');
  });

  test('leaves an ordinary place name readable', () => {
    expect(stationName('GENOVA/PIAZZA MANIN')).toBe('Genova/Piazza Manin');
  });
});
