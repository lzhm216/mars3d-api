import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export function getDatabaseConfig(): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'mars3d',
    entities: [__dirname + '/../modules/**/entities/*.entity{.ts,.js}'],
    synchronize: true, // 开发环境自动同步表结构
    logging: true,
  };
}
