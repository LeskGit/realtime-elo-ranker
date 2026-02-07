import { Controller, Get, Sse } from '@nestjs/common';
import { Observable } from 'rxjs';
import { RankingService } from './ranking.service';
import { RealtimeService } from '../realtime/realtime.service';
import { Player } from '../players/entity/player.entity';

@Controller('ranking')
export class RankingController {
  constructor(
    private readonly rankingService: RankingService,
    private readonly realtimeService: RealtimeService,
  ) {}

  @Get()
  getRanking(): Promise<Player[]> {
    return this.rankingService.getRanking();
  }

  @Sse('events')
  events(): Observable<{ data: unknown }> {
    return this.realtimeService.getRankingEvents();
  }
}
