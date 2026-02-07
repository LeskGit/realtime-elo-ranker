import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayersModule } from './modules/players/players.module';
import { MatchesModule } from './modules/matches/matches.module';
import { RankingModule } from './modules/ranking/ranking.module';
import { EloModule } from './modules/elo/elo.module';
import { RealtimeModule } from './modules/realtime/realtime.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'realtime-elo-ranker.db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    PlayersModule,
    MatchesModule,
    RankingModule,
    EloModule,
    RealtimeModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
