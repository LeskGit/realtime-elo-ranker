import { PlayersService } from './players.service';
import { CreatePlayerDto } from './dto/createplayer.dto';
import { Controller, Delete, Get, Param, Post, Put, Body, ParseIntPipe } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';

@Controller('players')
export class PlayersController {

    constructor(private readonly playersService: PlayersService) {}

    @Post()
    createPlayer(@Body(new ValidationPipe({whitelist: true, forbidNonWhitelisted: true, transform: true})) player: CreatePlayerDto) {
        return this.playersService.createPlayer(player);
    }
}
