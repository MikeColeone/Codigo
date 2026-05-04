import type { TComponentTypes } from "../schema/components";

export interface AdminBigScreenSummary {
  publishedSiteCount: number;
  publishedTodayCount: number;
  publishActionCount: number;
  templateCount: number;
  publishedTemplateCount: number;
  materialTypeCount: number;
  materialInstanceCount: number;
  collaboratorCount: number;
  collaborationPageCount: number;
  publicSiteCount: number;
  privateSiteCount: number;
  expiringSiteCount: number;
  versionCount: number;
  averageComponentsPerSite: number;
  pageViewCount: number;
  uniqueVisitorCount: number;
}

export interface AdminBigScreenTrendPoint {
  date: string;
  label: string;
  realValue: number;
  displayValue: number;
  isMock: boolean;
}

export interface AdminBigScreenDistributionItem {
  name: string;
  value: number;
}

export interface AdminBigScreenComponentStat {
  type: TComponentTypes | string;
  instanceCount: number;
  pageCount: number;
}

export interface AdminBigScreenRecentReleaseItem {
  pageId: number;
  pageName: string;
  ownerName: string;
  version: number;
  visibility: "public" | "private";
  publishedAt: string;
}

export interface AdminBigScreenOverviewResponse {
  generatedAt: string;
  mockedSections: string[];
  summary: AdminBigScreenSummary;
  publishTrend: AdminBigScreenTrendPoint[];
  visibilityStats: AdminBigScreenDistributionItem[];
  layoutModeStats: AdminBigScreenDistributionItem[];
  templateTagStats: AdminBigScreenDistributionItem[];
  componentTypeStats: AdminBigScreenComponentStat[];
  recentReleases: AdminBigScreenRecentReleaseItem[];
}
