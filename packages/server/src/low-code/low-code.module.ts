import { Module } from '@nestjs/common';
import { LowCodeService } from './low-code.service';
import { LowCodeController } from './low-code.controller';
import { PagesController } from './pages.controller';
import { ComponentData } from './entities/low-code.entity';
import { Page } from './entities/low-code.entity';
import { Component } from './entities/low-code.entity';
import { PageCollaborator } from './entities/page-collaborator.entity';
import { OperationLog } from './entities/operation-log.entity';
import { PageVersion } from './entities/page-version.entity';
import { User } from '../user/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecretTool } from '../utils/SecretTool';
import { CollaborationGateway } from './collaboration.gateway';
import { CollaborationController } from './collaboration.controller';
import { OpenSumiConfigService } from './opensumi-config.service';
import { WorkspaceExplorerService } from './workspace-explorer.service';
import { WorkspaceService } from './workspace.service';
import { WorkspaceRuntimeService } from './workspace-runtime.service';
import { WorkspaceSessionService } from './workspace-session.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Page,
      Component,
      ComponentData,
      PageCollaborator,
      OperationLog,
      PageVersion,
      User,
    ]),
  ],
  controllers: [LowCodeController, PagesController, CollaborationController],
  providers: [
    SecretTool,
    LowCodeService,
    CollaborationGateway,
    OpenSumiConfigService,
    WorkspaceExplorerService,
    WorkspaceService,
    WorkspaceRuntimeService,
    WorkspaceSessionService,
  ],
})
export class LowCodeModule {}
