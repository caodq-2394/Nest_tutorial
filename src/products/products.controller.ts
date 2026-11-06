import {
  Controller,
  Get,
  Body,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { FindProductsQueryDto } from './dto/query-product.dto';
import { ProductsService } from './products.service';

@Controller('/api/v1/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(@Query() query: FindProductsQueryDto) {
    const result = await this.productsService.findAll(query);

    return {
      success: true,
      data: result.data,
      meta: result.meta,
    };
  }

  @Get('/featured')
  async findFeatured() {
    const data = await this.productsService.findFeatured();
    return {
      success: true,
      data,
    };
  }

  @Get(':id')
  async findId(@Param('id', ParseIntPipe) id: string) {
    const data = await this.productsService.findOne(+id);
    return {
      success: true,
      data,
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: string) {
    return this.productsService.remove(+id);
  }
}
