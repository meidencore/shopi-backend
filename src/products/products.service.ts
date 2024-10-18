import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductRequest } from './dto/create-product.request';
import { DatabaseService } from 'src/database/database.service';
import { promises as fs } from 'fs';
import { join } from 'path';
import { PRODUCT_IMAGE } from './product-image';

@Injectable()
export class ProductsService {
  constructor(private readonly databaseService: DatabaseService) {}
  async createProduct(data: CreateProductRequest, userId: number) {
    return await this.databaseService.products.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async getProduct(id: number) {
    try {
      return {
        ...(await this.databaseService.products.findUniqueOrThrow({
          where: { id },
        })),
        imageExists: await this.imageExists(id),
      };
    } catch {
      throw new NotFoundException(`Product not found with ID: ${id}`);
    }
  }

  async getProducts() {
    const products = await this.databaseService.products.findMany();
    return Promise.all(
      products.map(async (product) => ({
        ...product,
        imageExists: await this.imageExists(product.id),
      })),
    );
  }

  private async imageExists(productId: number) {
    try {
      await fs.access(
        join(`${PRODUCT_IMAGE}/${productId}.jpg`),
        fs.constants.F_OK,
      );
      return true;
    } catch {
      return false;
    }
  }
}
