import { BadRequestException, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMatchDto } from './dto/creatematch';
import { Match } from './entity/match.entity';
import { Player } from '../players/entity/player.entity';
import { EloService } from '../elo/elo.service';
import { RealtimeService } from '../realtime/realtime.service';

// Ce service gère les opérations liées aux matchs, notamment la publication de nouveaux résultats 
// de matchs et la mise à jour des classements des joueurs en conséquence.

@Injectable()
export class MatchesService {

    // Ici, on injecte les repositories TypeORM pour les entités Match et Player afin de pouvoir interagir 
    // avec la base de données, ainsi que le service Elo pour calculer les mises à jour de classement et le 
    // service Realtime pour émettre des mises à jour en temps réel aux clients.
    constructor(
        @InjectRepository(Match) private readonly matchesRepository: Repository<Match>,
        @InjectRepository(Player) private readonly playersRepository: Repository<Player>,
        private readonly eloService: EloService,
        private readonly realtimeService: RealtimeService,
    ) {}

    // Publication d'un nouveau résultat de match. 
    async publishMatch(createMatchDto: CreateMatchDto): Promise<{ winner: Player; loser: Player }> {
        const { winner, loser, draw } = createMatchDto;
        this.validateMatchInput(winner, loser, draw);

        const { winnerPlayer, loserPlayer } = await this.loadPlayers(winner!, loser!);
        this.applyEloUpdate(winnerPlayer, loserPlayer, draw);

        await this.playersRepository.save([winnerPlayer, loserPlayer]);
        await this.saveMatch(winnerPlayer, loserPlayer, draw);

        this.emitUpdates(winnerPlayer, loserPlayer);

        return { winner: winnerPlayer, loser: loserPlayer };
    }

    // Validation de l'entrée du match pour s'assurer que les données sont correctes avant de procéder à la publication du résultat.
    private validateMatchInput(winner?: string, loser?: string, draw?: boolean): void {

        // Cas où le gagnant ou le perdant n'est pas fourni
        if (!winner || !loser) {
            this.realtimeService.emitError({
                code: 400,
                message: 'winner and loser are required to publish a match result',
            });
            throw new BadRequestException({
                code: 400,
                message: 'winner and loser are required to publish a match result',
            });
        }

        // Cas où le gagnant et le perdant sont les mêmes joueurs
        if (winner === loser) {
            this.realtimeService.emitError({
                code: 400,
                message: 'winner and loser must be different players',
            });
            throw new BadRequestException({
                code: 400,
                message: 'winner and loser must be different players',
            });
        }

        // Cas où le champ "draw" n'est pas un booléen
        if (typeof draw !== 'boolean') {
            this.realtimeService.emitError({
                code: 400,
                message: 'draw must be a boolean',
            });
            throw new BadRequestException({
                code: 400,
                message: 'draw must be a boolean',
            });
        }
    }

    // Chargement des joueurs gagnant et perdant à partir de la base de données.
    // Si l'un des joueurs n'existe pas, on émet une erreur et on lance une exception.
    private async loadPlayers(winnerId: string, loserId: string): Promise<{
        winnerPlayer: Player;
        loserPlayer: Player;
    }> {
        const [winnerPlayer, loserPlayer] = await Promise.all([
            this.playersRepository.findOne({ where: { id: winnerId } }),
            this.playersRepository.findOne({ where: { id: loserId } }),
        ]);

        if (!winnerPlayer || !loserPlayer) {
            this.realtimeService.emitError({
                code: 422,
                message: 'winner or loser does not exist',
            });
            throw new UnprocessableEntityException({
                code: 422,
                message: 'winner or loser does not exist',
            });
        }

        return { winnerPlayer, loserPlayer };
    }

    // Application de la mise à jour du classement ELO pour les joueurs gagnant et perdant 
    // en fonction du résultat du match (victoire, défaite ou match nul).
    private applyEloUpdate(winnerPlayer: Player, loserPlayer: Player, draw: boolean): void {
        const winnerExpected = this.eloService.expectedScore(winnerPlayer.rank, loserPlayer.rank);
        const loserExpected = this.eloService.expectedScore(loserPlayer.rank, winnerPlayer.rank);

        const winnerScore = draw ? 0.5 : 1;
        const loserScore = draw ? 0.5 : 0;

        winnerPlayer.rank = this.eloService.newRank(winnerPlayer.rank, winnerExpected, winnerScore);
        loserPlayer.rank = this.eloService.newRank(loserPlayer.rank, loserExpected, loserScore);
    }

    // Sauvegarde du nouveau match dans la base de données.
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
