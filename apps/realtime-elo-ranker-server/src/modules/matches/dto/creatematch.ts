import { IsBoolean, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export class CreateMatchDto {
    @ValidateIf((value) => value.draw === false)
    @IsString()
    @IsNotEmpty()
    readonly winner?: string;

    @ValidateIf((value) => value.draw === false)
    @IsString()
    @IsNotEmpty()
    readonly loser?: string;

    @IsBoolean()
    @IsNotEmpty()
    readonly draw: boolean;
}
