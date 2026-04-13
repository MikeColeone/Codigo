import type { TemplateDetailResponse, TemplateListItem, TemplatePreset } from '@codigo/schema';
import { Template } from 'src/modules/template/entity/template.entity';

export function toIsoString(value: Date | undefined) {
  return value ? value.toISOString() : undefined;
}

export function applyPreset(entity: Template, preset: TemplatePreset) {
  entity.key = preset.key;
  entity.name = preset.name;
  entity.desc = preset.desc;
  entity.tags = preset.tags;
  entity.page_title = preset.pageTitle;
  entity.page_category = preset.pageCategory;
  entity.layout_mode = preset.layoutMode;
  entity.device_type = preset.deviceType;
  entity.canvas_width = preset.canvasWidth;
  entity.canvas_height = preset.canvasHeight;
  entity.active_page_path = preset.activePagePath;
  entity.pages_count = preset.pages.length;
  entity.preset = preset;
}

export function asTemplateListItem(template: Template): TemplateListItem {
  return {
    id: template.id,
    key: template.key,
    name: template.name,
    desc: template.desc,
    tags: template.tags ?? [],
    pageTitle: template.page_title,
    pageCategory: template.page_category,
    layoutMode: template.layout_mode,
    deviceType: template.device_type,
    canvasWidth: template.canvas_width,
    canvasHeight: template.canvas_height,
    activePagePath: template.active_page_path,
    pagesCount: template.pages_count,
    coverUrl: template.cover_url,
    updatedAt: toIsoString(template.updated_at),
  };
}

export function asTemplateDetail(template: Template): TemplateDetailResponse {
  return {
    id: template.id,
    key: template.key,
    version: template.version,
    coverUrl: template.cover_url,
    preset: template.preset,
    createdAt: toIsoString(template.created_at),
    updatedAt: toIsoString(template.updated_at),
  };
}

