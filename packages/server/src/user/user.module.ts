import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { CaptchaTool } from 'src/utils/captchaTool';
import { SecretTool } from 'src/utils/secretTool';
import { TextMessageTool } from 'src/utils/TextMessageTool';
import { RandomTool } from 'src/utils/RandomTool';
@Module({
  controllers: [UserController],
  providers: [
    UserService,
    SecretTool,
    CaptchaTool,
    TextMessageTool,
    RandomTool,
  ],
})
export class UserModule {}
