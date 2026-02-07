import { Test } from '@nestjs/testing';
import { MatchesController } from '../../src/modules/matches/matches.controller';
import { MatchesService } from '../../src/modules/matches/matches.service';

describe('MatchesController', () => {
  let controller: MatchesController;
  const service = {
    publishMatch: jest.fn().mockResolvedValue({
      winner: { id: 'a', rank: 1016 },
      loser: { id: 'b', rank: 984 },
    }),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [MatchesController],
      providers: [{ provide: MatchesService, useValue: service }],
    }).compile();

    controller = moduleRef.get(MatchesController);
  });

  it('should publish a match', async () => {
    await controller.publishMatch({ winner: 'a', loser: 'b', draw: false });
    expect(service.publishMatch).toHaveBeenCalledWith({
      winner: 'a',
      loser: 'b',
      draw: false,
    });
  });
});
