import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BotService } from './bot.service';
import { StartUpdate } from './updates/start.update';
import { OrderUpdate } from './updates/order.update';
import { RegisterScene } from './scenes/register.scene';
import { CartService } from './services/cart.service';
import { UserModule } from 'src/modules/user/user.module';
import { ProductModule } from 'src/modules/product/product.module';
import { OrderModule } from 'src/modules/order/order.module';

@Module({
  imports: [ConfigModule, UserModule, ProductModule, OrderModule],
  providers: [BotService, StartUpdate, OrderUpdate, RegisterScene, CartService],
  exports: [BotService],
})
export class BotModule {}
