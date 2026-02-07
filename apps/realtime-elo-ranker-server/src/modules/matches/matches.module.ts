import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { Match } from './entity/match.entity';
import { Player } from '../players/entity/player.entity';
import { EloModule } from '../elo/elo.module';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [TypeOrmModule.forFeature([Match, Player]), EloModule, RealtimeModule],
  controllers: [MatchesController],
  providers: [MatchesService],
})

export class MatchesModule {}
