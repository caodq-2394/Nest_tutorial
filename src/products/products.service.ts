import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { FindProductsQueryDto } from './dto/query-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async findAll(query: FindProductsQueryDto) {
    const {
      keyword,
      category,
      minPrice,
      maxPrice,
      sort = 'newest',
      page = 1,
      limit = 10,
    } = query;

    const queryBuilder = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'image', 'image.isMain = :isMain', {
        isMain: true,
      })
      .where('product.isActive = :isActive', {
        isActive: true,
      });

    // Search keyword
    if (keyword) {
      queryBuilder.andWhere(
        `(
        product.name LIKE :keyword
        OR product.description LIKE :keyword
      )`,
        {
          keyword: `%${keyword}%`,
        },
      );
    }

    // Filter category
    if (category) {
      queryBuilder.andWhere('product.categoryId = :category', {
        category,
      });
    }

    // Minimum price
    if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', {
        minPrice,
      });
    }

    // Maximum price
    if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', {
        maxPrice,
      });
    }

    // Sort
    switch (sort) {
      case 'price_asc':
        queryBuilder.orderBy('product.price', 'ASC');
        break;

      case 'price_desc':
        queryBuilder.orderBy('product.price', 'DESC');
        break;

      case 'oldest':
        queryBuilder.orderBy('product.createdAt', 'ASC');
        break;

      case 'newest':
      default:
        queryBuilder.orderBy('product.createdAt', 'DESC');
        break;
    }

    // Pagination
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);

    const [products, total] = await queryBuilder.getManyAndCount();

    const data = products.map((product) => {
      const mainImage = product.images?.[0] ?? null;

      return {
        ...product,
        images: undefined,
        mainImage: mainImage?.imageUrl ?? null,
      };
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findFeatured() {
    const products = await this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'image', 'image.isMain = :isMain', {
        isMain: true,
      })
      .where('product.isFeatured = :isFeatured', {
        isFeatured: true,
      })
      .andWhere('product.isActive = :isActive', {
        isActive: true,
      })
      .getMany();

    return products.map((product) => {
      const mainImage = product.images?.[0] ?? null;

      return {
        ...product,
        images: undefined,
        mainImage: mainImage?.imageUrl ?? null,
      };
    });
  }

  findOne(id: number) {
    return this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'image', 'image.isMain = :isMain', {
        isMain: true,
      })
      .where('product.id = :id', { id })
      .andWhere('product.isActive = :isActive', {
        isActive: true,
      })
      .getOne();
  }

  remove(id: number) {
    return this.productsRepository.delete(id);
  }
}
