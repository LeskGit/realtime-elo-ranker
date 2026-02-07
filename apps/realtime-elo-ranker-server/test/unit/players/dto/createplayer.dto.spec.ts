import { validate } from 'class-validator';
import { CreatePlayerDto } from '../../../src/modules/players/dto/createplayer.dto';

describe('CreatePlayerDto', () => {
  it('should require id', async () => {
    const dto = new CreatePlayerDto();
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should allow optional rank', async () => {
    const dto = new CreatePlayerDto();
    (dto as any).id = 'player-1';
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
