import { Module } from '@nestjs/common';
import { LowCodeService } from './low-code.service';
import { LowCodeController } from './low-code.controller';
import { PagesController } from './pages.controller';
import { ComponentData } from './entities/low-code.entity';
import { Page } from './entities/low-code.entity';
import { Component } from './entities/low-code.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecretTool } from '../utils/SecretTool';

@Module({
  imports: [TypeOrmModule.forFeature([Page, Component, ComponentData])],
  controllers: [LowCodeController, PagesController],
  providers: [SecretTool, LowCodeService],
})
export class LowCodeModule {}
