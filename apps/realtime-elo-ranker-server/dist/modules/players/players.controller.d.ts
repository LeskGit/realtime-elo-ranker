import { PlayersService } from './players.service';
import { CreatePlayerDto } from './dto/createplayer.dto';
export declare class PlayersController {
    private readonly playersService;
    constructor(playersService: PlayersService);
    createPlayer(player: CreatePlayerDto): Promise<import("./entity/player.entity").Player>;
}
