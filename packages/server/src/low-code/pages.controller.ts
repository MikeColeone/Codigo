import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type {
  PostReleaseRequest,
  PostQuestionDataRequest,
} from '@codigo/schema';
import {
  GetUserAgent,
  GetUserIP,
  getUserMess,
} from '../utils/GetUserMessageTool';
import type { TCurrentUser } from '../utils/GetUserMessageTool';
import { SecretTool } from '../utils/SecretTool';
import { LowCodeService } from './low-code.service';

@Controller('pages')
export class PagesController {
  constructor(
    private readonly secretTool: SecretTool,
    private readonly lowCodeService: LowCodeService,
  ) {}

  @Put('me')
  @UseGuards(AuthGuard('jwt'))
  upsertMyPage(
    @Body() body: PostReleaseRequest,
    @getUserMess() user: TCurrentUser,
  ) {
    return this.lowCodeService.release(body, user);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getMyPage(@getUserMess() user: TCurrentUser) {
    return this.lowCodeService.getMyReleaseData(user);
  }

  @Get(':id')
  getPage(@Param('id', ParseIntPipe) id: number) {
    return this.lowCodeService.getReleaseData(id);
  }

  @Get(':id/submissions/me')
  isMySubmissionPosted(
    @Param('id', ParseIntPipe) pageId: number,
    @GetUserIP() ip: string,
    @GetUserAgent() agent: string,
  ) {
    const key = this.secretTool.getSecret(ip + agent);
    return this.lowCodeService.isQuestionDataPosted(key, pageId);
  }

  @Post(':id/submissions')
  postSubmission(
    @Param('id', ParseIntPipe) pageId: number,
    @Body() body: Pick<PostQuestionDataRequest, 'props'>,
    @GetUserIP() ip: string,
    @GetUserAgent() agent: string,
  ) {
    const key = this.secretTool.getSecret(ip + agent);
    return this.lowCodeService.postQuestionData(
      { page_id: pageId, ...body },
      key,
    );
  }

  @Get('me/analytics/components')
  @UseGuards(AuthGuard('jwt'))
  getAnalyticsComponents(@getUserMess() user: TCurrentUser) {
    return this.lowCodeService.getQuestionComponents(user);
  }

  @Get('me/analytics/submissions')
  @UseGuards(AuthGuard('jwt'))
  getAnalyticsSubmissions(@getUserMess() user: TCurrentUser) {
    return this.lowCodeService.getQuestionData(user.id);
  }

  @Get('me/analytics/components/:componentId/submissions')
  @UseGuards(AuthGuard('jwt'))
  getAnalyticsSubmissionsByComponent(
    @getUserMess() user: TCurrentUser,
    @Param('componentId', ParseIntPipe) componentId: number,
  ) {
    return this.lowCodeService.getQuestionDataByIdRequest({
      id: componentId,
      userId: user.id,
    });
  }
}
