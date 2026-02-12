import { validate } from 'class-validator';
import { CreateMatchDto } from '../../../src/modules/matches/dto/creatematch';

describe('CreateMatchDto', () => {
  it('should require winner/loser even when draw is true', async () => {
    const dto = new CreateMatchDto();
    (dto as any).draw = true;
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should allow draw with winner/loser provided', async () => {
    const dto = new CreateMatchDto();
    (dto as any).draw = true;
    (dto as any).winner = 'alice';
    (dto as any).loser = 'bob';
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should require winner/loser when draw is false', async () => {
    const dto = new CreateMatchDto();
    (dto as any).draw = false;
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
