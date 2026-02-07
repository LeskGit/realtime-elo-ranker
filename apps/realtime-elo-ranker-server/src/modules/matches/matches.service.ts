import { BadRequestException, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMatchDto } from './dto/creatematch';
import { Match } from './entity/match.entity';
import { Player } from '../players/entity/player.entity';
import { EloService } from '../elo/elo.service';
import { RealtimeService } from '../realtime/realtime.service';

@Injectable()
export class MatchesService {
    constructor(
        @InjectRepository(Match) private readonly matchesRepository: Repository<Match>,
        @InjectRepository(Player) private readonly playersRepository: Repository<Player>,
        private readonly eloService: EloService,
        private readonly realtimeService: RealtimeService,
    ) {}

    async publishMatch(createMatchDto: CreateMatchDto): Promise<{ winner: Player; loser: Player }> {
        const { winner, loser, draw } = createMatchDto;
        this.validateMatchInput(winner, loser);

        const { winnerPlayer, loserPlayer } = await this.loadPlayers(winner!, loser!);
        this.applyEloUpdate(winnerPlayer, loserPlayer, draw);

        await this.playersRepository.save([winnerPlayer, loserPlayer]);
        await this.saveMatch(winnerPlayer, loserPlayer, draw);

        this.emitUpdates(winnerPlayer, loserPlayer);

        return { winner: winnerPlayer, loser: loserPlayer };
    }

    private validateMatchInput(winner?: string, loser?: string): void {
        if (!winner || !loser) {
            throw new BadRequestException({
                code: 400,
                message: 'winner and loser are required to publish a match result',
            });
        }
        if (winner === loser) {
            throw new BadRequestException({
                code: 400,
                message: 'winner and loser must be different players',
            });
        }
    }

    private async loadPlayers(winnerId: string, loserId: string): Promise<{
        winnerPlayer: Player;
        loserPlayer: Player;
    }> {
        const [winnerPlayer, loserPlayer] = await Promise.all([
            this.playersRepository.findOne({ where: { id: winnerId } }),
            this.playersRepository.findOne({ where: { id: loserId } }),
        ]);

        if (!winnerPlayer || !loserPlayer) {
            throw new UnprocessableEntityException({
                code: 422,
                message: 'winner or loser does not exist',
            });
        }

        return { winnerPlayer, loserPlayer };
    }

    private applyEloUpdate(winnerPlayer: Player, loserPlayer: Player, draw: boolean): void {
        const winnerExpected = this.eloService.expectedScore(winnerPlayer.rank, loserPlayer.rank);
        const loserExpected = this.eloService.expectedScore(loserPlayer.rank, winnerPlayer.rank);

        const winnerScore = draw ? 0.5 : 1;
        const loserScore = draw ? 0.5 : 0;

        winnerPlayer.rank = this.eloService.newRank(winnerPlayer.rank, winnerExpected, winnerScore);
        loserPlayer.rank = this.eloService.newRank(loserPlayer.rank, loserExpected, loserScore);
    }

    private async saveMatch(winnerPlayer: Player, loserPlayer: Player, draw: boolean): Promise<void> {
        const newMatch = this.matchesRepository.create({
            winnerId: winnerPlayer.id,
            loserId: loserPlayer.id,
            draw,
        });
        await this.matchesRepository.save(newMatch);
    }

    private emitUpdates(winnerPlayer: Player, loserPlayer: Player): void {
        this.realtimeService.emitRankingUpdate(winnerPlayer);
        this.realtimeService.emitRankingUpdate(loserPlayer);
    }
}
