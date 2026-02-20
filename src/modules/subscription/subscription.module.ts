import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Subscription } from './entities/subscription.entity';
import { SubscriptionService } from './services/subscription.service';
import { StripeService } from './services/stripe.service';
import { SubscriptionController } from './controllers/subscription.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Subscription]),
    AuthModule,
  ],
  providers: [
    SubscriptionService,
    StripeService,
    {
      provide: 'IPaymentProvider',
      useClass: StripeService,
    },
  ],
  controllers: [SubscriptionController],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}