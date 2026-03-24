import { Injectable } from '@nestjs/common';
import type {
  PageWorkspaceResponse,
  PageWorkspaceSessionResponse,
  PageWorkspaceSessionStatus,
} from '@codigo/schema';
import type { TCurrentUser } from '../utils/GetUserMessageTool';
import { WorkspaceService } from './workspace.service';

@Injectable()
export class WorkspaceSessionService {
  private readonly sessions = new Map<number, PageWorkspaceSessionResponse>();

  constructor(private readonly workspaceService: WorkspaceService) {}

  async getPageWorkspaceSession(
    pageId: number,
    user: TCurrentUser,
  ): Promise<PageWorkspaceSessionResponse> {
    const workspace = await this.workspaceService.getPageWorkspace(
      pageId,
      user,
    );
    const existingSession = this.sessions.get(pageId);

    if (!workspace.exists) {
      return this.createSessionPayload(workspace, 'workspace_missing');
    }

    if (!existingSession) {
      return this.createSessionPayload(workspace, 'stopped');
    }

    const nextSession = {
      ...existingSession,
      heartbeatAt: new Date().toISOString(),
    };
    this.sessions.set(pageId, nextSession);
    return nextSession;
  }

  async startPageWorkspaceSession(
    pageId: number,
    user: TCurrentUser,
  ): Promise<PageWorkspaceSessionResponse> {
    const workspace = await this.prepareWorkspace(pageId, user);
    const currentSession = this.sessions.get(pageId);
    const nextSession = this.createSessionPayload(
      workspace,
      'ready',
      currentSession?.previewPort,
      currentSession?.sessionId,
    );

    this.sessions.set(pageId, nextSession);
    return nextSession;
  }

  private async prepareWorkspace(pageId: number, user: TCurrentUser) {
    const workspace = await this.workspaceService.getPageWorkspace(
      pageId,
      user,
    );
    if (workspace.exists) {
      return workspace;
    }
    return this.workspaceService.syncPageWorkspace(pageId, user);
  }

  private createSessionPayload(
    workspace: PageWorkspaceResponse,
    status: PageWorkspaceSessionStatus,
    previewPort = this.resolvePreviewPort(workspace.pageId),
    sessionId = `workspace-${workspace.pageId}-session`,
  ): PageWorkspaceSessionResponse {
    const ideUrl =
      status === 'workspace_missing'
        ? undefined
        : this.buildIDEUrl(workspace, previewPort);
    const previewUrl =
      status === 'ready' ? this.buildPreviewUrl(previewPort) : undefined;

    return {
      pageId: workspace.pageId,
      workspaceId: workspace.workspaceId,
      sessionId,
      status,
      bridgeMode: 'iframe',
      ideUrl,
      previewUrl,
      previewPort: status === 'workspace_missing' ? undefined : previewPort,
      terminalCwd: workspace.workspaceRoot,
      terminalCommand: `pnpm --dir ${workspace.workspaceRelativePath} dev`,
      terminalTitle: workspace.workspaceName,
      heartbeatAt: new Date().toISOString(),
    };
  }

  private buildIDEUrl(workspace: PageWorkspaceResponse, previewPort: number) {
    const baseUrl = process.env.OPENSUMI_BASE_URL ?? 'http://localhost:20000';
    const searchParams = new URLSearchParams({
      pageId: String(workspace.pageId),
      workspaceId: workspace.workspaceId,
      workspaceName: workspace.workspaceName,
      workspacePath: workspace.workspaceRelativePath,
      workspaceRoot: workspace.workspaceRoot,
      schemaFilePath: workspace.schemaFilePath,
      entryFilePath: workspace.entryFilePath,
      terminalCwd: workspace.workspaceRoot,
      previewUrl: this.buildPreviewUrl(previewPort),
    });

    return `${baseUrl}?${searchParams.toString()}`;
  }

  private buildPreviewUrl(previewPort: number) {
    const previewHost =
      process.env.WORKSPACE_PREVIEW_HOST ?? 'http://localhost';
    return `${previewHost}:${previewPort}`;
  }

  private resolvePreviewPort(pageId: number) {
    const basePort = Number(process.env.WORKSPACE_DEV_BASE_PORT ?? 4100);
    return basePort + pageId;
  }
}
