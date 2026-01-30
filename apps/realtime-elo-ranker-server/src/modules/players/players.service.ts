import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Player } from "./entity/player.entity";
import { Repository } from "typeorm/browser/repository/Repository.js";
import { CreatePlayerDto } from "./dto/createplayer.dto";



@Injectable()
export class PlayersService {
    constructor(
        @InjectRepository(Player) private readonly playerRepository: Repository<Player>
    ) {}

    async createPlayer(createPlayerDto: CreatePlayerDto): Promise<Player> {
        const newPlayer : Player = this.playerRepository.create(createPlayerDto);
        await this.playerRepository.save(newPlayer);
        return newPlayer;
    }

}