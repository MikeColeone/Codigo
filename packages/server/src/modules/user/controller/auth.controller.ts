import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  GetUserAgent,
  GetUserIP,
} from 'src/shared/helpers/current-user.helper';
import { RandomTool } from 'src/shared/utils/random.tool';
import { SecretTool } from 'src/shared/utils/secret.tool';
import { CaptchaDto } from 'src/modules/user/dto/captcha.dto';
import {
  PhoneLoginDto,
  PasswordLoginDto,
} from 'src/modules/user/dto/login.dto';
import { SendCodeDto } from 'src/modules/user/dto/sendSms.dto';
import { UserService } from 'src/modules/user/service/user.service';

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
    return this.userService.getCaptcha(key, query.type);
  }

  @Post('sms-codes')
  async sendCode(
    @Body() body: SendCodeDto,
    @GetUserAgent() agent: string,
    @GetUserIP() ip: string,
  ) {
    const { phone, captcha, type } = body;
    console.log(phone, captcha, type);
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
