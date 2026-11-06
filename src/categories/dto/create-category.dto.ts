import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateCategoryDto {
  @ApiProperty({
    example: 'Laptops',
    description: 'Category name',
  })
  @IsString()
  @IsNotEmpty()
  readonly name!: string;

  @ApiProperty({
    example: 'Laptop products',
    description: 'Category description',
    required: false,
  })
  @IsString()
  readonly description!: string;
}
