import { Module } from '@nestjs/common';
import { PlayersController } from './modules/players/players.controller';
import { MatchesController } from './modules/matches/matches.controller';
import { RankingController } from './modules/ranking/ranking.controller';
import { EloController } from './modules/elo/elo.controller';
import { RealtimeController } from './modules/realtime/realtime.controller';

@Module({
  imports: [],
  controllers: [PlayersController, MatchesController, RankingController, EloController, RealtimeController],
  providers: [],
})
export class AppModule {}
