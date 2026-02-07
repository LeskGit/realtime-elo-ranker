import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreatePlayerDto {

    @IsString()
    @IsNotEmpty()
    readonly id: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    readonly rank?: number;
}
