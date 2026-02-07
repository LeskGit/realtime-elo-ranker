import { Body, Controller, HttpCode, Post, ValidationPipe } from '@nestjs/common';
import { CreatePlayerDto } from './dto/createplayer.dto';
import { PlayersService } from './players.service';

@Controller('player')
export class PlayersController {

    constructor(private readonly playersService: PlayersService) {}

    @Post()
    @HttpCode(200)
    createPlayer(@Body(new ValidationPipe({whitelist: true, forbidNonWhitelisted: true, transform: true})) player: CreatePlayerDto) {
        return this.playersService.createPlayer(player);
    }
}
