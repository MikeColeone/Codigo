import { Injectable, OnModuleDestroy } from '@nestjs/common';
import type {
  PageWorkspaceResponse,
  PageWorkspaceRuntimeResponse,
} from '@codigo/schema';
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import type { TCurrentUser } from '../utils/GetUserMessageTool';
import { WorkspaceService } from './workspace.service';

interface RuntimeProcessRecord {
  child: ChildProcessWithoutNullStreams;
  payload: PageWorkspaceRuntimeResponse;
}

@Injectable()
export class WorkspaceRuntimeService implements OnModuleDestroy {
  private readonly runtimes = new Map<number, RuntimeProcessRecord>();

  constructor(private readonly workspaceService: WorkspaceService) {}

  async onModuleDestroy() {
    await Promise.all(
      Array.from(this.runtimes.keys()).map((pageId) =>
        this.stopPageWorkspaceRuntime(pageId),
      ),
    );
  }

  async getPageWorkspaceRuntime(
    pageId: number,
    user: TCurrentUser,
  ): Promise<PageWorkspaceRuntimeResponse> {
    const workspace = await this.workspaceService.getPageWorkspace(
      pageId,
      user,
    );
    const currentRuntime = this.runtimes.get(pageId);

    if (!workspace.exists) {
      return this.createStoppedPayload(workspace, 'workspace_missing');
    }

    if (!currentRuntime) {
      return this.createStoppedPayload(workspace, 'stopped');
    }

    const nextPayload = {
      ...currentRuntime.payload,
      updatedAt: new Date().toISOString(),
    };
    currentRuntime.payload = nextPayload;
    return nextPayload;
  }

  async startPageWorkspaceRuntime(
    pageId: number,
    user: TCurrentUser,
  ): Promise<PageWorkspaceRuntimeResponse> {
    const workspace = await this.prepareWorkspace(pageId, user);
    const existingRuntime = this.runtimes.get(pageId);

    if (existingRuntime) {
      if (
        existingRuntime.payload.status === 'running' ||
        existingRuntime.payload.status === 'starting'
      ) {
        return {
          ...existingRuntime.payload,
          updatedAt: new Date().toISOString(),
        };
      }

      await this.stopPageWorkspaceRuntime(pageId);
    }

    const previewPort = this.resolvePreviewPort(pageId);
    const runtimeId = `workspace-${pageId}-runtime`;
    const cwd = workspace.workspaceRoot;
    const command = `pnpm dev -- --host 0.0.0.0 --port ${previewPort}`;
    const child = spawn(
      this.resolvePnpmCommand(),
      ['dev', '--', '--host', '0.0.0.0', '--port', String(previewPort)],
      {
        cwd,
        env: {
          ...process.env,
          BROWSER: 'none',
          PORT: String(previewPort),
        },
        stdio: 'pipe',
      },
    );

    const payload: PageWorkspaceRuntimeResponse = {
      pageId,
      workspaceId: workspace.workspaceId,
      runtimeId,
      status: 'starting',
      previewUrl: this.buildPreviewUrl(previewPort),
      previewPort,
      command,
      cwd,
      pid: child.pid,
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastOutput: '',
      exitCode: null,
    };

    const record: RuntimeProcessRecord = {
      child,
      payload,
    };

    child.stdout.on('data', (buffer) => {
      const text = buffer.toString();
      record.payload = this.withOutput(record.payload, text, 'running');
    });

    child.stderr.on('data', (buffer) => {
      const text = buffer.toString();
      const nextStatus =
        record.payload.status === 'running' ? 'running' : 'starting';
      record.payload = this.withOutput(record.payload, text, nextStatus);
    });

    child.on('exit', (code) => {
      record.payload = {
        ...record.payload,
        status: code === 0 ? 'stopped' : 'error',
        exitCode: code,
        updatedAt: new Date().toISOString(),
      };
      this.runtimes.delete(pageId);
    });

    child.on('error', (error) => {
      record.payload = this.withOutput(
        {
          ...record.payload,
          status: 'error',
          updatedAt: new Date().toISOString(),
        },
        error.message,
        'error',
      );
      this.runtimes.delete(pageId);
    });

    this.runtimes.set(pageId, record);

    return payload;
  }

  async stopPageWorkspaceRuntime(pageId: number) {
    const runtime = this.runtimes.get(pageId);
    if (!runtime) {
      return null;
    }

    runtime.child.kill();
    this.runtimes.delete(pageId);

    return {
      ...runtime.payload,
      status: 'stopped' as const,
      updatedAt: new Date().toISOString(),
    };
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

  private createStoppedPayload(
    workspace: PageWorkspaceResponse,
    status: 'workspace_missing' | 'stopped',
  ): PageWorkspaceRuntimeResponse {
    const previewPort = this.resolvePreviewPort(workspace.pageId);

    return {
      pageId: workspace.pageId,
      workspaceId: workspace.workspaceId,
      runtimeId: `workspace-${workspace.pageId}-runtime`,
      status,
      previewUrl:
        status === 'workspace_missing'
          ? undefined
          : this.buildPreviewUrl(previewPort),
      previewPort: status === 'workspace_missing' ? undefined : previewPort,
      command: `pnpm dev -- --host 0.0.0.0 --port ${previewPort}`,
      cwd: workspace.workspaceRoot,
      updatedAt: new Date().toISOString(),
      exitCode: null,
    };
  }

  private withOutput(
    payload: PageWorkspaceRuntimeResponse,
    chunk: string,
    status: PageWorkspaceRuntimeResponse['status'],
  ) {
    const lastOutput = [payload.lastOutput, chunk]
      .filter(Boolean)
      .join('')
      .slice(-4000);

    return {
      ...payload,
      status,
      lastOutput,
      updatedAt: new Date().toISOString(),
    };
  }

  private resolvePnpmCommand() {
    return process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
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
