import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class CreatePlayerDto {

    @IsString()
    @IsNotEmpty()
    readonly id: string;

    @IsInt()
    @Min(1)
    readonly rank: number;
}