import type { ReactNode } from "react";
import type { TemplatePreviewSchema } from "@/modules/template-center/utils/preview";

export interface ProjectWorkspacePageRecord {
  id: number;
  page_name: string;
  desc?: string | null;
}

export interface PageVersionItem {
  id: string;
  page_id: number;
  version: number;
  desc: string;
  created_at: string;
}

export interface MyPagePayload {
  page: ProjectWorkspacePageRecord | null;
  versions: PageVersionItem[];
}

export interface PreviewState {
  title: string;
  subtitle: string;
  schema: TemplatePreviewSchema;
}

export interface LocalDraftMeta {
  hasDraft: boolean;
  isUpdatedAfterPublish: boolean;
  updatedAt: string;
}

export interface ProjectWorkspaceNavItem {
  description: string;
  icon: ReactNode;
  key: ProjectWorkspaceTab;
  label: string;
  title: string;
}

export type ProjectWorkspaceTab =
  | "developing"
  | "published"
  | "versions";
