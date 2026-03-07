import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { RedisOptions } from 'ioredis';
import { JwtModuleOptions } from '@nestjs/jwt';
// 数据库连接配置
export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: '192.168.231.128',
  port: 13306,
  username: 'root',
  password: '123456',
  database: 'codigo_lowcode',
  entities: ['dist/**/*.entityf.ts,.js}'],
  autoLoadEntities: true,
  synchronize: true,
};

// Redis 连接配置
export const redisConfig: RedisOptions = {
  host: '192.168.231.128',
  port: 6379,
};

// 短信发送配置
export const TextMessageConfig = {
  AppKey: process.env.APP_KEY,
  AppSecret: process.env.APP_SECRET,
  AppCode: process.env.APPCODE,
};

// token 参数配置
export const jwtConfig: JwtModuleOptions = {
  secret: process.env.JWT_SECRET,
  signOptions: { expiresIn: '7d' },
  global: true,
};

// 微信登陆配置
export const WeChatLoginConfig = {};
