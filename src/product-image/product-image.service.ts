import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProductImage } from './entities/product-image.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class ProductImageService {
  constructor(
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
    productId: number,
    file: Express.Multer.File,
    isMain: boolean,
  ): Promise<ProductImage> {
    const uploadedImage = await this.cloudinaryService.uploadImage(
      file,
      `products/${productId}`,
    );

    try {
      const productImage = this.productImageRepository.create({
        productId,
        imageUrl: uploadedImage.secure_url,
        publicId: uploadedImage.public_id,
        fileType: file.mimetype,
        fileSize: file.size,
        isMain,
      });

      // return await this.productImageRepository.save(productImage);

      const savedImage = await this.productImageRepository.save(productImage);

      return savedImage;
    } catch (error) {
      // DB save fail -> rollback Cloudinary
      await this.cloudinaryService
        .deleteImage(uploadedImage.public_id)
        .catch(() => undefined);

      throw error;
    }
  }

  async findByProductId(productId: number): Promise<ProductImage[]> {
    return this.productImageRepository.find({
      where: {
        productId,
      },
      order: {
        isMain: 'DESC',
        id: 'ASC',
      },
    });
  }

  async findOne(productId: number, imageId: number): Promise<ProductImage> {
    const image = await this.productImageRepository.findOne({
      where: {
        id: imageId,
        productId,
      },
    });

    if (!image) {
      throw new NotFoundException('Product image not found');
    }

    return image;
  }

  async remove(productId: number, imageId: number): Promise<void> {
    const image = await this.findOne(productId, imageId);

    // 1. Delete Cloudinary
    await this.cloudinaryService.deleteImage(image.publicId);

    // 2. Delete DB
    await this.productImageRepository.delete({
      id: imageId,
      productId,
    });
  }
}
