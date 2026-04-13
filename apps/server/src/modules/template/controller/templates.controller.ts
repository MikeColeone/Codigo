import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { TemplateListQuery, UpsertTemplateRequest } from '@codigo/schema';
import { RolesGuard } from 'src/core/guard/roles.guard';
import { Roles } from 'src/core/guard/roles.decorator';
import { TemplateService } from 'src/modules/template/service/template.service';

@Controller('templates')
export class TemplatesController {
  constructor(private readonly templateService: TemplateService) {}

  @Get()
  listTemplates(@Query() query: TemplateListQuery) {
    return this.templateService.getList(query);
  }

  @Get('key/:key')
  getTemplateByKey(@Param('key') key: string) {
    return this.templateService.getDetailByKey(key);
  }

  @Get(':id')
  getTemplate(@Param('id', ParseIntPipe) id: number) {
    return this.templateService.getDetailById(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  createTemplate(@Body() body: UpsertTemplateRequest) {
    return this.templateService.createTemplate(body);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  updateTemplate(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpsertTemplateRequest,
  ) {
    return this.templateService.updateTemplate(id, body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  deleteTemplate(@Param('id', ParseIntPipe) id: number) {
    return this.templateService.deleteTemplate(id);
  }
}

