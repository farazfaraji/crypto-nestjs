import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configValidationSchema } from './config.schema';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { join } from 'path';
import { ExchangeRepository } from './repositories/exchange.repository';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { CacheService } from './redis.service';
import { JobService } from './job.service';
import { EmailService } from './email.service';
import { BullModule } from '@nestjs/bull';
import { WorkerService } from './worker.service';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
        },
      }),
    }),
    BullModule.registerQueue({
      name: 'send-mail',
    }),
    ConfigModule.forRoot({
      envFilePath: [`${process.env.NODE_ENV || ''}.env`],
      validationSchema: configValidationSchema,
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        config: {
          host: configService.get('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
        },
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [User],
        migrationsTableName: 'migrations',
        migrations: [
          join(__dirname, 'database/migrations/', '*.migrations.{ts,js}'),
        ],
        cli: {
          migrationsDir: 'src/database/migrations',
        },
        synchronize: !!parseInt(configService.get<string>('DB_SYNC')),
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ExchangeRepository,
    CacheService,
    JobService,
    WorkerService,
    EmailService,
  ],
})
export class AppModule {}
