import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './shared/infrastructure/database/pg-pool.provider';
import { CatalogModule } from './modules/catalog/catalog.module';
import { CustomersModule } from './modules/customers/customers.module';
import { DeliveriesModule } from './modules/deliveries/deliveries.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    CatalogModule,
    CustomersModule,
    DeliveriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
