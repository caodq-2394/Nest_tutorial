import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreateCartDto {
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  readonly productId!: number;

  @IsInt()
  @Min(1)
  readonly quantity!: number;
}
