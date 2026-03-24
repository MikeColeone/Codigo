import { Injectable } from '@nestjs/common';
import type {
  PageWorkspaceIDEConfigResponse,
  PageWorkspaceRuntimeResponse,
  PageWorkspaceSessionResponse,
} from '@codigo/schema';
import type { TCurrentUser } from '../utils/GetUserMessageTool';
import { WorkspaceRuntimeService } from './workspace-runtime.service';
import { WorkspaceSessionService } from './workspace-session.service';
import { WorkspaceService } from './workspace.service';

@Injectable()
export class OpenSumiConfigService {
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly workspaceSessionService: WorkspaceSessionService,
    private readonly workspaceRuntimeService: WorkspaceRuntimeService,
  ) {}

  async getPageWorkspaceIDEConfig(
    pageId: number,
    user: TCurrentUser,
  ): Promise<PageWorkspaceIDEConfigResponse> {
    const workspace = await this.workspaceService.getPageWorkspace(
      pageId,
      user,
    );
    const session = await this.workspaceSessionService.getPageWorkspaceSession(
      pageId,
      user,
    );
    const runtime = await this.workspaceRuntimeService.getPageWorkspaceRuntime(
      pageId,
      user,
    );

    return this.buildConfig(workspace, session, runtime);
  }

  async startPageWorkspaceIDEConfig(
    pageId: number,
    user: TCurrentUser,
  ): Promise<PageWorkspaceIDEConfigResponse> {
    const workspace = await this.workspaceService.getPageWorkspace(
      pageId,
      user,
    );
    const session =
      await this.workspaceSessionService.startPageWorkspaceSession(
        pageId,
        user,
      );
    const runtime = await this.workspaceRuntimeService.getPageWorkspaceRuntime(
      pageId,
      user,
    );

    return this.buildConfig(workspace, session, runtime);
  }

  private buildConfig(
    workspace: Awaited<ReturnType<WorkspaceService['getPageWorkspace']>>,
    session: PageWorkspaceSessionResponse,
    runtime: PageWorkspaceRuntimeResponse,
  ): PageWorkspaceIDEConfigResponse {
    const serverUrl =
      process.env.OPENSUMI_SERVER_URL ?? 'http://localhost:20000';
    const wsUrl = process.env.OPENSUMI_WS_URL;
    const browserBaseUrl =
      process.env.OPENSUMI_BROWSER_URL ??
      session.ideUrl ??
      process.env.OPENSUMI_BASE_URL ??
      'http://localhost:5173/opensumi-host.html';
    const hostOrigin = new URL(browserBaseUrl).origin;
    const channelId = `codigo-opensumi-${workspace.workspaceId}`;
    const launchQuery = this.buildLaunchQuery(workspace, session, runtime);

    return {
      pageId: workspace.pageId,
      workspaceId: workspace.workspaceId,
      sessionId: session.sessionId,
      runtimeId: runtime.runtimeId,
      provider: 'opensumi',
      mode: 'external-host',
      channelId,
      browserUrl: this.appendSearchParams(browserBaseUrl, launchQuery),
      serverUrl,
      wsUrl,
      hostOrigin,
      workspaceDir: workspace.workspaceRoot,
      workspacePath: workspace.workspaceRelativePath,
      terminalCwd: session.terminalCwd,
      previewUrl: runtime.previewUrl ?? session.previewUrl,
      launchQuery,
      capabilities: {
        fileSystem: true,
        terminal: true,
        preview: Boolean(runtime.previewUrl ?? session.previewUrl),
      },
      heartbeatAt: new Date().toISOString(),
    };
  }

  private buildLaunchQuery(
    workspace: Awaited<ReturnType<WorkspaceService['getPageWorkspace']>>,
    session: PageWorkspaceSessionResponse,
    runtime: PageWorkspaceRuntimeResponse,
  ) {
    const query: Record<string, string> = {
      pageId: String(workspace.pageId),
      workspaceId: workspace.workspaceId,
      channelId: `codigo-opensumi-${workspace.workspaceId}`,
      workspaceName: workspace.workspaceName,
      workspacePath: workspace.workspaceRelativePath,
      workspaceRoot: workspace.workspaceRoot,
      schemaFilePath: workspace.schemaFilePath,
      entryFilePath: workspace.entryFilePath,
      terminalCwd: session.terminalCwd,
      terminalCommand: session.terminalCommand,
      sessionId: session.sessionId,
      runtimeId: runtime.runtimeId,
    };

    const previewUrl = runtime.previewUrl ?? session.previewUrl;
    if (previewUrl) {
      query.previewUrl = previewUrl;
    }

    if (runtime.previewPort != null) {
      query.previewPort = String(runtime.previewPort);
    }

    return query;
  }

  private appendSearchParams(url: string, query: Record<string, string>) {
    const target = new URL(url);
    for (const [key, value] of Object.entries(query)) {
      target.searchParams.set(key, value);
    }
    return target.toString();
  }
}
