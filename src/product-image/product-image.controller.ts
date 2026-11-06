import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { ProductImageService } from './product-image.service';

@Controller('products/:productId/images')
export class ProductImageController {
  constructor(private readonly productImageService: ProductImageService) {}

  /**
   * Get all images of product
   *
   * GET /products/:productId/images
   */
  @Get()
  async findByProductId(@Param('productId', ParseIntPipe) productId: number) {
    const data = await this.productImageService.findByProductId(productId);

    return {
      success: true,
      data,
    };
  }

  /**
   * Upload one image to product
   *
   * POST /products/:productId/images
   */
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Param('productId', ParseIntPipe) productId: number,

    @UploadedFile()
    file: Express.Multer.File,
  ) {
    const data = await this.productImageService.create(productId, file, false);

    return {
      success: true,
      data,
    };
  }

  /**
   * Delete one image
   *
   * DELETE /products/:productId/images/:imageId
   */
  @Delete(':imageId')
  async remove(
    @Param('productId', ParseIntPipe) productId: number,

    @Param('imageId', ParseIntPipe) imageId: number,
  ) {
    await this.productImageService.remove(productId, imageId);

    return {
      success: true,
    };
  }
}
