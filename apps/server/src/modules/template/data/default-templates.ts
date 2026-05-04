import type { TemplatePreset } from '@codigo/schema';
import { adminAnalyticsScreenTemplate } from 'src/modules/template/data/admin-analytics-screen';
import { adminConsoleStandardTemplate } from 'src/modules/template/data/admin-console-standard';
import { adminSystemBasicTemplate } from 'src/modules/template/data/admin-system-basic';
import { devOpsBasicTemplate } from 'src/modules/template/data/dev-ops-basic';
import { singlePageAdminTemplatePresets } from 'src/modules/template/data/single-page-admin-templates';
export const DEFAULT_TEMPLATE_PRESETS: TemplatePreset[] = [
  adminAnalyticsScreenTemplate,
  adminConsoleStandardTemplate,
  adminSystemBasicTemplate,
  devOpsBasicTemplate,
  ...singlePageAdminTemplatePresets,
];
