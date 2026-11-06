import { IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductImageDto {
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isMain?: boolean;
}
