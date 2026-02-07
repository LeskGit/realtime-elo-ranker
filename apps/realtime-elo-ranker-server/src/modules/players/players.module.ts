import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player } from './entity/player.entity';
import { PlayersController } from './players.controller';
import { PlayersService } from './players.service';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [TypeOrmModule.forFeature([Player]), RealtimeModule],
  controllers: [PlayersController],
  providers: [PlayersService],
})

export class PlayersModule {}
