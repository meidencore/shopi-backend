import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { DatabaseModule } from 'src/database/database.module';
import { ProductGateway } from './product.gateway';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [ProductsController],
  providers: [ProductsService, ProductGateway],
  exports: [ProductsService],
})
export class ProductsModule {}
