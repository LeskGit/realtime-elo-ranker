import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePlayerDto } from './dto/createplayer.dto';
import { Player } from './entity/player.entity';
import { RealtimeService } from '../realtime/realtime.service';

const DEFAULT_INITIAL_RANK = 1000;

@Injectable()
export class PlayersService {
    constructor(
        @InjectRepository(Player) private readonly playerRepository: Repository<Player>,
        private readonly realtimeService: RealtimeService,
    ) {}

    async createPlayer(createPlayerDto: CreatePlayerDto): Promise<Player> {
        const existing = await this.playerRepository.findOne({
            where: { id: createPlayerDto.id },
        });
        if (existing) {
            throw new ConflictException({
                code: 409,
                message: 'player already exists',
            });
        }

        const rank =
            createPlayerDto.rank ??
            (await this.getAverageRank()) ??
            DEFAULT_INITIAL_RANK;

        const newPlayer: Player = this.playerRepository.create({
            id: createPlayerDto.id,
            rank,
        });
        await this.playerRepository.save(newPlayer);
        this.realtimeService.emitRankingUpdate(newPlayer);
        return newPlayer;
    }

    private async getAverageRank(): Promise<number | null> {
        const result = await this.playerRepository
            .createQueryBuilder('player')
            .select('AVG(player.rank)', 'avg')
            .getRawOne<{ avg: string | null }>();

        if (!result?.avg) {
            return null;
        }

        return Math.round(Number(result.avg));
    }
}
