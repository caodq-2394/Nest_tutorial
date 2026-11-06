import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductImageService } from 'src/product-image/product-image.service';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { Category } from 'src/categories/entities/category.entity';
import { ProductImage } from 'src/product-image/entities/product-image.entity';

@Injectable()
export class AdminProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,

    private readonly productImageService: ProductImageService,
  ) {}

  async findAllAdmin() {
    return this.productsRepository.find({
      relations: {
        category: true,
        images: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOneAdmin(id: number) {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: {
        category: true,
        images: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async create(
    createProductDto: CreateProductDto,
    files: Express.Multer.File[] = [],
    mainImageIndex,
  ) {
    const category = await this.categoriesRepository.findOne({
      where: {
        id: createProductDto.categoryId,
      },
    });

    if (!category) {
      throw new NotFoundException(
        `Category with id ${createProductDto.categoryId} not found`,
      );
    }

    const product = this.productsRepository.create({
      ...createProductDto,
      category,
    });

    const savedProduct = await this.productsRepository.save(product);

    const uploadedImages: ProductImage[] = [];

    try {
      for (let index = 0; index < files.length; index++) {
        const file = files[index];

        const image = await this.productImageService.create(
          savedProduct.id,
          file,
          index === mainImageIndex,
        );

        uploadedImages.push(image);
      }

      return {
        id: savedProduct.id,
        name: savedProduct.name,
        price: savedProduct.price,
        description: savedProduct.description,
        categoryId: savedProduct.categoryId,
        images: uploadedImages,
      };
    } catch (error) {
      await this.productsRepository.delete(savedProduct.id);

      throw error;
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.findOneAdmin(id);

    Object.assign(product, updateProductDto);

    return this.productsRepository.save(product);
  }

  async remove(id: number) {
    const product = await this.findOneAdmin(id);

    await this.productsRepository.remove(product);
  }
}
