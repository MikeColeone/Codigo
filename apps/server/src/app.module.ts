import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { jwtConfig, redisConfig } from 'src/config';
import { typeOrmConfig } from 'src/database/typeorm.config';
import { UserModule } from './modules/user/user.module';
import { RedisModule } from './shared/modules/redis.module';
import { User } from './modules/user/entity/user.entity';
import { FlowModule } from './modules/flow/flow.module';
import { ResourcesModule } from './modules/resources/resources.module';
import { AdminModule } from './modules/admin/admin.module';
import { TemplateModule } from './modules/template/template.module';
import { JwtStrategy } from './core/guard/jwt.strategy';
@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    { ...TypeOrmModule.forFeature([User]), global: true },
    UserModule,
    FlowModule,
    ResourcesModule,
    AdminModule,
    TemplateModule,
    RedisModule.forRoot(redisConfig),
    JwtModule.register(jwtConfig),
  ],
  controllers: [],
  providers: [JwtStrategy],
})
export class AppModule {}
