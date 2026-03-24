import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { GetUserAgent, GetUserIP } from '../utils/GetUserMessageTool';
import { RandomTool } from 'src/utils/RandomTool';
import { SecretTool } from 'src/utils/SecretTool';
import { CaptchaDto } from './dto/captcha.dto';
import { PhoneLoginDto, PasswordLoginDto } from './dto/login.dto';
import { SendCodeDto } from './dto/sendSms.dto';
import { UserService } from './user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly secrectTool: SecretTool,
    private readonly randomTool: RandomTool,
  ) {}

  @Get('captcha')
  async getCaptcha(
    @Query() query: CaptchaDto,
    @GetUserIP() ip: string,
    @GetUserAgent() agent: string,
  ) {
    const key = this.secrectTool.getSecret(ip + agent);
    return this.userService.getCaptcha(query.type, key);
  }

  @Post('sms-codes')
  async sendCode(
    @Body() body: SendCodeDto,
    @GetUserAgent() agent: string,
    @GetUserIP() ip: string,
  ) {
    const { phone, captcha, type } = body;
    const key = this.secrectTool.getSecret(ip + agent);
    return this.userService.sendCode(
      phone,
      captcha,
      type,
      key,
      this.randomTool.randomCode(),
    );
  }

  @Post('tokens/password')
  passwordLogin(@Body() body: PasswordLoginDto) {
    return this.userService.passwordLogin(body);
  }

  @Post('tokens/phone')
  phoneLogin(@Body() body: PhoneLoginDto) {
    return this.userService.phoneLogin(body);
  }
}
