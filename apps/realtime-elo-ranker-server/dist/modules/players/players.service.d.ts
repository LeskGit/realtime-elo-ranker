import { Player } from "./entity/player.entity";
import { Repository } from "typeorm/browser/repository/Repository.js";
import { CreatePlayerDto } from "./dto/createplayer.dto";
export declare class PlayersService {
    private readonly playerRepository;
    constructor(playerRepository: Repository<Player>);
    createPlayer(createPlayerDto: CreatePlayerDto): Promise<Player>;
}
