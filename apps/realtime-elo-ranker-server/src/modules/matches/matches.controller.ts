import { Body, Controller, HttpCode, Post, ValidationPipe } from '@nestjs/common';
import { CreateMatchDto } from './dto/creatematch';
import { MatchesService } from './matches.service';

@Controller('match')
export class MatchesController {

    constructor(private readonly matchesService: MatchesService) {}

    @Post()
    @HttpCode(200)
    publishMatch(@Body(new ValidationPipe({whitelist: true, forbidNonWhitelisted: true, transform: true})) match: CreateMatchDto) {
        return this.matchesService.publishMatch(match);
    }
}
