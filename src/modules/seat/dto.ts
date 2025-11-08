import { IsArray, IsBoolean, IsString } from 'class-validator';

export class UpdateSeatStatusDto {
  @IsArray()
  @IsString({ each: true })
  seats!: string[];

  @IsBoolean()
  status!: boolean;
}
