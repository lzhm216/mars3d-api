import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { getDatabaseConfig } from './config/database.config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { RoleModule } from './modules/role/role.module';
import { PermissionModule } from './modules/permission/permission.module';
import { LayerModule } from './modules/layer/layer.module';
import { MarkerModule } from './modules/marker/marker.module';
import { BookmarkModule } from './modules/bookmark/bookmark.module';
import { LogModule } from './modules/log/log.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(getDatabaseConfig()),
    AuthModule,
    UserModule,
    RoleModule,
    PermissionModule,
    LayerModule,
    MarkerModule,
    BookmarkModule,
    LogModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  ],
})
export class AppModule {}
