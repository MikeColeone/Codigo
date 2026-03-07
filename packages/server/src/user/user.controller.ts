import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { SendCodeDto } from './dto/SendSmsDto';
import { GetUserIP, GetUserAgent } from '../utils/GetUserMessageTool';
import { CaptchaDto } from './dto/CaptchaDto';
import { SecretTool } from 'src/utils/secretTool';
import { RandomTool } from 'src/utils/RandomTool';
import { RedisModule } from 'src/utils/modules/redis.module';
import { TextMessageTool } from 'src/utils/TextMessageTool';
@Controller('user')
export class UserController {
  constructor(
    private readonly redis: RedisModule,
    private readonly userService: UserService,
    private readonly secrectTool: SecretTool,
    private readonly textMessageTool: TextMessageTool,
    private readonly randomCode: RandomTool,
  ) {}

  // 查找用户
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  // 图形验证码接口
  @Post('captcha')
  async getCaptcha(
    @Body() body: CaptchaDto,
    @GetUserIP() ip: string,
    @GetUserAgent() agent: string,
  ) {
    const { type } = body;
    const key = this.secrectTool.getSecret(ip + agent);
    return this.userService.getCaptcha(type, key);
  }

  // 测试接口
  // @Post('send_code')
  // async sendCode() {
  //   console.log('发送短信接口被调用');
  //   const phone = '19839704896';
  //   const randomCode = '1234';
  //   const codeRes = await this.textMessageTool.sendTextMessage(
  //     phone,
  //     randomCode,
  //   );
  //   return codeRes;
  // }
}
