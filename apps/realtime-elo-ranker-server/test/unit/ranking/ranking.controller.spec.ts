import { Test } from '@nestjs/testing';
import { of } from 'rxjs';
import { RankingController } from '../../src/modules/ranking/ranking.controller';
import { RankingService } from '../../src/modules/ranking/ranking.service';
import { RealtimeService } from '../../src/modules/realtime/realtime.service';

describe('RankingController', () => {
  let controller: RankingController;
  const rankingService = {
    getRanking: jest.fn().mockResolvedValue([{ id: 'p1', rank: 1000 }]),
  };
  const realtimeService = {
    getRankingEvents: jest.fn().mockReturnValue(of({ data: { type: 'Ping' } })),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [RankingController],
      providers: [
        { provide: RankingService, useValue: rankingService },
        { provide: RealtimeService, useValue: realtimeService },
      ],
    }).compile();

    controller = moduleRef.get(RankingController);
  });

  it('should get ranking', async () => {
    const result = await controller.getRanking();
    expect(result).toEqual([{ id: 'p1', rank: 1000 }]);
  });

  it('should expose events stream', () => {
    const stream = controller.events();
    expect(stream).toBeDefined();
    expect(realtimeService.getRankingEvents).toHaveBeenCalled();
  });
});
