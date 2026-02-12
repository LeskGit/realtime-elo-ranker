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

  it('should close event stream after an error event', async () => {
    const received: Array<{ data: unknown }> = [];
    let completed = false;

    service.getRankingEvents().subscribe({
      next: (event) => received.push(event as { data: unknown }),
      complete: () => {
        completed = true;
      },
    });

    service.emitError({ code: 500, message: 'boom' });
    service.emitRankingUpdate({ id: 'p2', rank: 1300 } as any);

    await new Promise((resolve) => setImmediate(resolve));

    expect(completed).toBe(true);
    expect(received).toHaveLength(1);
    expect(received[0].data).toEqual({ type: 'Error', message: 'boom', code: 500 });
  });
});
