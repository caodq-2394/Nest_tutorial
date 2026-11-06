import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class CreateProductDto {
  @ApiPropertyOptional({
    description: 'The name of the product',
    example: '',
    default: '',
  })
  @IsString()
  @IsNotEmpty()
  readonly name!: string;

  @ApiPropertyOptional({
    description: 'The description of the product',
    example: '',
    default: '',
  })
  @IsString()
  @IsOptional()
  readonly description!: string;

  @ApiPropertyOptional({
    description: 'The price of the product',
    example: '',
    default: '',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  readonly price!: number;

  @ApiPropertyOptional({
    description: 'The stock quantity of the product',
    example: '',
    default: '',
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  readonly stock!: number;

  @ApiPropertyOptional({
    description: 'The category ID of the product',
    example: '',
    default: '',
  })
  @Type(() => Number)
  @IsInt()
  readonly categoryId!: number;

  @ApiPropertyOptional({
    description: 'Whether the product is active',
    example: true,
    default: true,
  })
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  readonly isActive!: boolean;

  @ApiPropertyOptional({
    description: 'Whether the product is featured',
    example: '',
    default: '',
  })
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  readonly isFeatured!: boolean;
}
