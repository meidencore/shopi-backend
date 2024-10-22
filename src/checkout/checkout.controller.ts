import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CreateSessionRequest } from './dto/create-session.request';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guards';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @UseGuards(JwtAuthGuard)
  @Post('session')
  async createSession(@Body() request: CreateSessionRequest) {
    return this.checkoutService.createSession(request.productId);
  }

  @Post('webhook')
  async handleCheckoutWebhooks(@Body() event: any) {
    return this.checkoutService.handleCheckoutWebhooks(event);
  }
}
