import { Injectable } from '@nestjs/common';
import { CreateProductRequest } from './dto/create-product.request';
import { DatabaseService } from 'src/database/database.service';

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
  async getProducts() {
    return this.databaseService.products.findMany();
  }
}
