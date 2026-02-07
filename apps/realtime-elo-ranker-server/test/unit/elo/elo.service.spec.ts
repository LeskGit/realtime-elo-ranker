import { EloService } from '../../src/modules/elo/elo.service';

describe('EloService', () => {
  let service: EloService;

  beforeEach(() => {
    service = new EloService();
  });

  it('should compute expected scores that sum to ~1', () => {
    const a = service.expectedScore(1200, 800);
    const b = service.expectedScore(800, 1200);
    expect(a + b).toBeCloseTo(1, 6);
  });

  it('should increase rank on win when expected score is lower', () => {
    const expected = service.expectedScore(800, 1200);
    const next = service.newRank(800, expected, 1);
    expect(next).toBeGreaterThan(800);
  });
});
