import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

import { Roles } from 'src/users/decorators/roles.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { AuthGuard } from 'src/guards/auth.guard';
import { AdminProductsService } from './admin-product.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UserRoles } from 'src/users/entities/user.entity';

@Controller('api/v1/admin/products')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRoles.ADMIN)
export class AdminProductsController {
  constructor(private readonly AdminProductsService: AdminProductsService) {}

  @Get()
  async findAll() {
    const data = await this.AdminProductsService.findAllAdmin();

    return {
      success: true,
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.AdminProductsService.findOneAdmin(id);

    return {
      success: true,
      data,
    };
  }

  @Post()
  @UseInterceptors(FilesInterceptor('images', 10))
  async create(
    @Body() createProductDto: CreateProductDto,
    @Body('mainImageIndex')
    mainImageIndex: string,
    @UploadedFiles()
    files: Express.Multer.File[],
  ) {
    const data = await this.AdminProductsService.create(
      createProductDto,
      files,
      Number(mainImageIndex ?? 0),
    );

    return {
      success: true,
      data,
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const data = await this.AdminProductsService.update(id, updateProductDto);

    return {
      success: true,
      data,
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.AdminProductsService.remove(id);

    return {
      success: true,
      message: 'Product deleted successfully',
    };
  }
}
