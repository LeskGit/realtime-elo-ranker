import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';
import { Observable } from 'rxjs';
import { Player } from '../players/entity/player.entity';

type RankingEvent = { data: unknown };

@Injectable()
export class RealtimeService {
  private readonly emitter = new EventEmitter();

  emitRankingUpdate(player: Player): void {
    this.emitter.emit('ranking', {
      data: {
        type: 'RankingUpdate',
        player: {
          id: player.id,
          rank: player.rank,
        },
      },
    } satisfies RankingEvent);
  }

  emitError(error: { code: number; message: string }): void {
    this.emitter.emit('ranking', {
      data: {
        type: 'Error',
        message: error.message,
        code: error.code,
      },
    } satisfies RankingEvent);
  }

  getRankingEvents(): Observable<RankingEvent> {
    return new Observable((subscriber) => {
      const handler = (event: RankingEvent) => subscriber.next(event);
      this.emitter.on('ranking', handler);
      return () => {
        this.emitter.off('ranking', handler);
      };
    });
  }
}
