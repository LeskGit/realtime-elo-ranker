import { Test } from '@nestjs/testing';
import { PlayersController } from '../../src/modules/players/players.controller';
import { PlayersService } from '../../src/modules/players/players.service';

describe('PlayersController', () => {
  let controller: PlayersController;
  const service = {
    createPlayer: jest.fn().mockResolvedValue({ id: 'p1', rank: 1000 }),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [PlayersController],
      providers: [{ provide: PlayersService, useValue: service }],
    }).compile();

    controller = moduleRef.get(PlayersController);
  });

  it('should create a player', async () => {
    await controller.createPlayer({ id: 'p1' });
    expect(service.createPlayer).toHaveBeenCalledWith({ id: 'p1' });
  });
});
