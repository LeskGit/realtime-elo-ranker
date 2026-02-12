import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

// Cette classe représente le DTO utilisé pour créer un nouveau match (avec des règles de validation).

export class CreateMatchDto {
    @IsString()
    @IsNotEmpty()
    readonly winner?: string;

    @IsString()
    @IsNotEmpty()
    readonly loser?: string;

    @IsBoolean()
    @IsNotEmpty()
    readonly draw: boolean;
}
