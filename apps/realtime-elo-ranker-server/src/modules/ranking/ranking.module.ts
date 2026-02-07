import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player } from '../players/entity/player.entity';
import { RankingController } from './ranking.controller';
import { RankingService } from './ranking.service';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [TypeOrmModule.forFeature([Player]), RealtimeModule],
  controllers: [RankingController],
  providers: [RankingService],
})
export class RankingModule {}
