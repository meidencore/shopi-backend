import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards';
import { CreateProductRequest } from './dto/create-product.request';
import { ProductsService } from './products.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TokenPayload } from '../auth/interfaces/token-payload.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PRODUCT_IMAGE } from './product-image';

@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async createProducts(
    @Body() body: CreateProductRequest,
    @CurrentUser() user: TokenPayload,
  ) {
    return await this.productsService.createProduct(body, user.UserId);
  }

  @Post(':productId/image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: PRODUCT_IMAGE,
        filename: (req, file, callback) => {
          callback(
            null,
            `${req.params.productId}${extname(file.originalname)}`,
          );
        },
      }),
    }),
  )
  async uploadProductImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5000000 }),
          new FileTypeValidator({ fileType: 'image/jpeg' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return { message: `${file.originalname} uploaded correct` };
  }

  @Get()
  async getProducts(@Query('status') status?: string) {
    return await this.productsService.getProducts(status);
  }

  @Get(':productId')
  async getProduct(@Param('productId', ParseIntPipe) productId: number) {
    return await this.productsService.getProduct(productId);
  }
}
