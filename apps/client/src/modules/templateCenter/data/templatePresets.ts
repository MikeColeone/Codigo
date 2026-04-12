import type { TemplatePreset } from "../types/templates";
import { createAdminConsoleTemplate } from "./adminConsoleTemplate";

export const templates: TemplatePreset[] = [createAdminConsoleTemplate()];
