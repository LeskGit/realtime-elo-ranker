import { validate } from 'class-validator';
import { CreateMatchDto } from '../../../src/modules/matches/dto/creatematch';

describe('CreateMatchDto', () => {
  it('should allow draw without winner/loser', async () => {
    const dto = new CreateMatchDto();
    (dto as any).draw = true;
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
