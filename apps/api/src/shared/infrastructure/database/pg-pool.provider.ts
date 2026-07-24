import { Global, Module, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

export const PG_POOL = 'PG_POOL';

const pgPoolProvider: Provider = {
  provide: PG_POOL,
  useFactory: (configService: ConfigService) => {
    const databaseUrl = configService.get<string>('DATABASE_URL');
    return new Pool({
      connectionString: databaseUrl,
    });
  },
  inject: [ConfigService],
};

@Global()
@Module({
  providers: [pgPoolProvider],
  exports: [PG_POOL],
})
export class DatabaseModule {}
