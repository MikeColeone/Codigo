import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type {
  PageWorkspaceIDEConfigResponse,
  PageWorkspaceExplorerResponse,
  PageWorkspaceFileResponse,
  PageWorkspaceResponse,
  PageWorkspaceRuntimeResponse,
  PageWorkspaceSessionResponse,
  PostQuestionDataRequest,
  PostReleaseRequest,
} from '@codigo/schema';
import {
  GetUserAgent,
  GetUserIP,
  getUserMess,
} from '../utils/GetUserMessageTool';
import type { TCurrentUser } from '../utils/GetUserMessageTool';
import { SecretTool } from '../utils/SecretTool';
import { LowCodeService } from './low-code.service';
import { OpenSumiConfigService } from './opensumi-config.service';
import { WorkspaceExplorerService } from './workspace-explorer.service';
import { WorkspaceRuntimeService } from './workspace-runtime.service';
import { WorkspaceSessionService } from './workspace-session.service';
import { WorkspaceService } from './workspace.service';

@Controller('pages')
export class PagesController {
  constructor(
    private readonly secretTool: SecretTool,
    private readonly lowCodeService: LowCodeService,
    private readonly openSumiConfigService: OpenSumiConfigService,
    private readonly workspaceExplorerService: WorkspaceExplorerService,
    private readonly workspaceService: WorkspaceService,
    private readonly workspaceRuntimeService: WorkspaceRuntimeService,
    private readonly workspaceSessionService: WorkspaceSessionService,
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

  @Get(':id/versions')
  @UseGuards(AuthGuard('jwt'))
  getPageVersions(@Param('id', ParseIntPipe) id: number) {
    return this.lowCodeService.getPageVersions(id);
  }

  @Get(':id/versions/:versionId')
  @UseGuards(AuthGuard('jwt'))
  getPageVersionDetail(
    @Param('id', ParseIntPipe) id: number,
    @Param('versionId') versionId: string,
  ) {
    return this.lowCodeService.getPageVersionDetail(id, versionId);
  }

  @Get(':id/workspace')
  @UseGuards(AuthGuard('jwt'))
  getPageWorkspace(
    @Param('id', ParseIntPipe) id: number,
    @getUserMess() user: TCurrentUser,
  ): Promise<PageWorkspaceResponse> {
    return this.workspaceService.getPageWorkspace(id, user);
  }

  @Post(':id/workspace')
  @UseGuards(AuthGuard('jwt'))
  syncPageWorkspace(
    @Param('id', ParseIntPipe) id: number,
    @getUserMess() user: TCurrentUser,
  ): Promise<PageWorkspaceResponse> {
    return this.workspaceService.syncPageWorkspace(id, user);
  }

  @Get(':id/workspace/session')
  @UseGuards(AuthGuard('jwt'))
  getPageWorkspaceSession(
    @Param('id', ParseIntPipe) id: number,
    @getUserMess() user: TCurrentUser,
  ): Promise<PageWorkspaceSessionResponse> {
    return this.workspaceSessionService.getPageWorkspaceSession(id, user);
  }

  @Post(':id/workspace/session')
  @UseGuards(AuthGuard('jwt'))
  startPageWorkspaceSession(
    @Param('id', ParseIntPipe) id: number,
    @getUserMess() user: TCurrentUser,
  ): Promise<PageWorkspaceSessionResponse> {
    return this.workspaceSessionService.startPageWorkspaceSession(id, user);
  }

  @Get(':id/workspace/runtime')
  @UseGuards(AuthGuard('jwt'))
  getPageWorkspaceRuntime(
    @Param('id', ParseIntPipe) id: number,
    @getUserMess() user: TCurrentUser,
  ): Promise<PageWorkspaceRuntimeResponse> {
    return this.workspaceRuntimeService.getPageWorkspaceRuntime(id, user);
  }

  @Post(':id/workspace/runtime')
  @UseGuards(AuthGuard('jwt'))
  startPageWorkspaceRuntime(
    @Param('id', ParseIntPipe) id: number,
    @getUserMess() user: TCurrentUser,
  ): Promise<PageWorkspaceRuntimeResponse> {
    return this.workspaceRuntimeService.startPageWorkspaceRuntime(id, user);
  }

  @Delete(':id/workspace/runtime')
  @UseGuards(AuthGuard('jwt'))
  stopPageWorkspaceRuntime(@Param('id', ParseIntPipe) id: number) {
    return this.workspaceRuntimeService.stopPageWorkspaceRuntime(id);
  }

  @Get(':id/workspace/ide-config')
  @UseGuards(AuthGuard('jwt'))
  getPageWorkspaceIDEConfig(
    @Param('id', ParseIntPipe) id: number,
    @getUserMess() user: TCurrentUser,
  ): Promise<PageWorkspaceIDEConfigResponse> {
    return this.openSumiConfigService.getPageWorkspaceIDEConfig(id, user);
  }

  @Post(':id/workspace/ide-config')
  @UseGuards(AuthGuard('jwt'))
  startPageWorkspaceIDEConfig(
    @Param('id', ParseIntPipe) id: number,
    @getUserMess() user: TCurrentUser,
  ): Promise<PageWorkspaceIDEConfigResponse> {
    return this.openSumiConfigService.startPageWorkspaceIDEConfig(id, user);
  }

  @Get(':id/workspace/explorer')
  @UseGuards(AuthGuard('jwt'))
  getPageWorkspaceExplorer(
    @Param('id', ParseIntPipe) id: number,
    @getUserMess() user: TCurrentUser,
  ): Promise<PageWorkspaceExplorerResponse> {
    return this.workspaceExplorerService.getPageWorkspaceExplorer(id, user);
  }

  @Get(':id/workspace/file')
  @UseGuards(AuthGuard('jwt'))
  getPageWorkspaceFile(
    @Param('id', ParseIntPipe) id: number,
    @Query('path') path: string,
    @getUserMess() user: TCurrentUser,
  ): Promise<PageWorkspaceFileResponse> {
    return this.workspaceExplorerService.getPageWorkspaceFile(id, user, path);
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
