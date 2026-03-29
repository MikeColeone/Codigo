import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { UserService } from 'src/modules/user/service/user.service';
import { SendCodeDto } from 'src/modules/user/dto/sendSms.dto';
import {
  GetUserIP,
  GetUserAgent,
  getUserMess,
} from 'src/shared/helpers/current-user.helper';
import type { TCurrentUser } from 'src/shared/helpers/current-user.helper';
import { CaptchaDto } from 'src/modules/user/dto/captcha.dto';
import { SecretTool } from 'src/shared/utils/secret.tool';
import { RandomTool } from 'src/shared/utils/random.tool';
import { RegisterDto } from 'src/modules/user/dto/register.dto';
import {
  PhoneLoginDto,
  PasswordLoginDto,
} from 'src/modules/user/dto/login.dto';
import { AuthGuard } from '@nestjs/passport';

/**
 * 用户控制器，处理与用户相关的 HTTP 请求
 */
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly secrectTool: SecretTool,
    private readonly randomTool: RandomTool,
  ) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getCurrentUser(@getUserMess() user: TCurrentUser) {
    return user;
  }

  /**
   * 图形验证码接口
   * @param body 请求体，包含验证码类型
   * @param ip 用户 IP 地址
   * @param agent 用户代理信息
   * @returns
   */
  @Post('captcha')
  async getCaptcha(
    @Body() body: CaptchaDto,
    @GetUserIP() ip: string,
    @GetUserAgent() agent: string,
  ) {
    const { type } = body;
    const key = this.secrectTool.getSecret(ip + agent);
    return this.userService.getCaptcha(key, type);
  }

  /**
   * 注册接口
   * @param body 请求体，包含注册信息
   * @returns 注册结果
   */
  @Post('register')
  register(@Body() body: RegisterDto) {
    const { phone, sendCode, password, confirm } = body;
    return this.userService.register(phone, sendCode, password, confirm);
  }

  /**
   * 账号密码登录控制器
   */
  @Post('password_login')
  passwordLogin(@Body() body: PasswordLoginDto) {
    return this.userService.passwordLogin(body);
  }

  /**
   * 手机验证码登录控制器
   * @param body 请求体，包含手机号和验证码
   * @return 登录结果，包含 JWT token 或错误信息
   */
  @Post('phone_login')
  phoneLogin(@Body() body: PhoneLoginDto) {
    return this.userService.phoneLogin(body);
  }
}
