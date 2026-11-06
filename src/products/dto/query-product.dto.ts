import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FindProductsQueryDto {
  @ApiPropertyOptional({
    description: 'The keyword for searching products',
    example: '',
    default: '',
  })
  @IsOptional()
  @IsString()
  readonly keyword?: string;

  @ApiPropertyOptional({
    description: 'The category for searching products',
    example: '',
    default: '',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readonly category?: number;

  @ApiPropertyOptional({
    description: 'The minimum price for searching products',
    example: '',
    default: '',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  readonly minPrice?: number;

  @ApiPropertyOptional({
    description: 'The maximum price for searching products',
    example: '',
    default: '',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  readonly maxPrice?: number;

  @ApiPropertyOptional({
    description: 'The sorting option for the products',
    example: 'price_asc',
    default: 'price_asc',
  })
  @IsOptional()
  @IsIn(['price_asc', 'price_desc', 'newest', 'oldest'])
  readonly sort?: string;

  @ApiPropertyOptional({
    description: 'The page number for pagination',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readonly page: number = 1;

  @ApiPropertyOptional({
    description: 'The number of products per page',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readonly limit: number = 10;
}
