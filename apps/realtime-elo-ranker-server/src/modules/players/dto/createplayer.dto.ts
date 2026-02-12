import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

// Cette classe représente le DTO utilisé pour créer un nouveau joueur (avec des règles de validation).

export class CreatePlayerDto {

    @IsString()
    @IsNotEmpty()
    readonly id: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    readonly rank?: number;
}
