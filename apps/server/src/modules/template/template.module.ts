import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplatesController } from 'src/modules/template/controller/templates.controller';
import { Template } from 'src/modules/template/entity/template.entity';
import { TemplateService } from 'src/modules/template/service/template.service';

@Module({
  imports: [TypeOrmModule.forFeature([Template])],
  controllers: [TemplatesController],
  providers: [TemplateService],
})
export class TemplateModule implements OnModuleInit {
  constructor(private readonly templateService: TemplateService) {}

  async onModuleInit() {
    await this.templateService.ensureDefaults();
  }
}

