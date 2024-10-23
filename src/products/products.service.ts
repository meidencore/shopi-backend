import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductRequest } from './dto/create-product.request';
import { DatabaseService } from 'src/database/database.service';
import { promises as fs } from 'fs';
import { join } from 'path';
import { PRODUCT_IMAGE } from './product-image';
import { Prisma } from '@prisma/client';
import { ProductGateway } from './product.gateway';

@Injectable()
export class ProductsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly productGateway: ProductGateway,
  ) {}
  async createProduct(data: CreateProductRequest, userId: number) {
    const product = await this.databaseService.products.create({
      data: {
        ...data,
        userId,
      },
    });
    this.productGateway.handleUpdateProduct();
    return product;
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

  async getProducts(status?: string) {
    const args: Prisma.ProductsFindManyArgs = {};

    if (status === 'availible') {
      args.where = { sold: false };
    }

    const products = await this.databaseService.products.findMany(args);
    return Promise.all(
      products.map(async (product) => ({
        ...product,
        imageExists: await this.imageExists(product.id),
      })),
    );
  }

  async update(productId: number, data: Prisma.ProductsUpdateInput) {
    await this.databaseService.products.update({
      where: { id: productId },
      data,
    });
    this.productGateway.handleUpdateProduct();
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
