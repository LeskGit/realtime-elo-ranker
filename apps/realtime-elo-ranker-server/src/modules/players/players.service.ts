import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePlayerDto } from './dto/createplayer.dto';
import { Player } from './entity/player.entity';
import { RealtimeService } from '../realtime/realtime.service';

// Ce service gère les opérations liées aux joueurs, notamment la création de nouveaux joueurs.

// Rang initial par défaut si aucun joueur n'existe encore et si aucun rang n'est spécifié lors de la création d'un joueur
const DEFAULT_INITIAL_RANK = 1000;

@Injectable()
export class PlayersService {
    constructor(
        // Ici, on injecte le repository TypeORM pour l'entité Player afin de pouvoir interagir avec la base de données.
        @InjectRepository(Player) private readonly playerRepository: Repository<Player>,
        private readonly realtimeService: RealtimeService,
    ) {}

    // Création d'un nouveau joueur.
    async createPlayer(createPlayerDto: CreatePlayerDto): Promise<Player> {
        await this.ensurePlayerDoesNotExist(createPlayerDto.id);
        const rank = await this.resolveInitialRank(createPlayerDto.rank);
        const newPlayer = this.buildPlayer(createPlayerDto.id, rank);

        await this.savePlayer(newPlayer);
        this.publishPlayerUpdate(newPlayer);

        return newPlayer;
    }

    // On s'assure qu'un joueur avec le même ID n'existe pas déjà dans la base de données. 
    // Si c'est le cas, on émet une erreur et on lance une exception.
    private async ensurePlayerDoesNotExist(playerId: string): Promise<void> {
        const existing = await this.playerRepository.findOne({
            where: { id: playerId },
        });

        if (!existing) {
            return;
        }

        this.throwPlayerAlreadyExists();
    }

    // On gère le cas où un joueur avec le même ID existe déjà 
    private throwPlayerAlreadyExists(): never {
        this.realtimeService.emitError({
            code: 409,
            message: 'player already exists',
        });
        throw new ConflictException({
            code: 409,
            message: 'player already exists',
        });
    }

    // Si un rang est fourni dans le DTO de création, on l'utilise. 
    // Sinon, on calcule le rang initial en fonction de la moyenne des rangs existants ou on utilise une valeur par défaut.
    private async resolveInitialRank(inputRank?: number): Promise<number> {
        return inputRank ?? (await this.getAverageRank()) ?? DEFAULT_INITIAL_RANK;
    }

    // On créer une nouvelle instance de Player à partir de l'ID et du rang fournis.
    private buildPlayer(id: string, rank: number): Player {
        return this.playerRepository.create({ id, rank });
    }

    // On sauvegarde le nouveau joueur dans la base de données.
    private async savePlayer(player: Player): Promise<void> {
        await this.playerRepository.save(player);
    }

    // On emet une mise à jour en temps réel pour informer les clients que le classement a été mis à jour avec le nouveau joueur.
    private publishPlayerUpdate(player: Player): void {
        this.realtimeService.emitRankingUpdate(player);
    }

    // Calcule la moyenne des rangs de tous les joueurs existants.
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
