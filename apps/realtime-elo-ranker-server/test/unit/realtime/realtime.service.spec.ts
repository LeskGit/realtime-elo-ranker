import { firstValueFrom, take } from 'rxjs';
import { RealtimeService } from '../../src/modules/realtime/realtime.service';

describe('RealtimeService', () => {
  let service: RealtimeService;

  beforeEach(() => {
    service = new RealtimeService();
  });

  it('should emit ranking update events', async () => {
    const eventPromise = firstValueFrom(service.getRankingEvents().pipe(take(1)));
    service.emitRankingUpdate({ id: 'p1', rank: 1200 } as any);
    const event = await eventPromise;
    expect(event.data).toEqual({
      type: 'RankingUpdate',
      player: { id: 'p1', rank: 1200 },
    });
  });

  it('should emit error events', async () => {
    const eventPromise = firstValueFrom(service.getRankingEvents().pipe(take(1)));
    service.emitError({ code: 500, message: 'boom' });
    const event = await eventPromise;
    expect(event.data).toEqual({ type: 'Error', message: 'boom', code: 500 });
  });
});
