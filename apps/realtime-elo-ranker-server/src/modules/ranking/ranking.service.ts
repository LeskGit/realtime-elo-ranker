import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from '../players/entity/player.entity';

@Injectable()
export class RankingService {
  constructor(
    @InjectRepository(Player) private readonly playersRepository: Repository<Player>,
  ) {}

  async getRanking(): Promise<Player[]> {
    const players = await this.playersRepository.find({
      order: { rank: 'DESC', id: 'ASC' },
    });

    if (players.length === 0) {
      throw new NotFoundException({
        code: 404,
        message: 'ranking is not available because no players exist',
      });
    }

    return players;
  }
}
