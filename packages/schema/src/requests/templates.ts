import type { IPageSchema, PageCategory, PageLayoutMode } from "../schema/low-code";
import type { TemplateDeviceType, TemplatePreset } from "../models/template";

export interface TemplateListQuery {
  q?: string;
  pageCategory?: PageCategory;
  layoutMode?: PageLayoutMode;
  deviceType?: TemplateDeviceType;
}

export interface TemplateListItem {
  id: number;
  key: string;
  name: string;
  desc: string;
  tags: string[];
  pageTitle: string;
  pageCategory: PageCategory;
  layoutMode: PageLayoutMode;
  deviceType: TemplateDeviceType;
  canvasWidth: number;
  canvasHeight: number;
  activePagePath: string;
  pagesCount: number;
  coverUrl?: string | null;
  updatedAt?: string;
}

export type GetTemplateListResponse = TemplateListItem[];

export interface TemplateDetailResponse {
  id: number;
  key: string;
  version: number;
  coverUrl?: string | null;
  preset: TemplatePreset;
  schema?: IPageSchema;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpsertTemplateRequest {
  preset: TemplatePreset;
  coverUrl?: string | null;
  status?: "draft" | "published" | "archived";
}
