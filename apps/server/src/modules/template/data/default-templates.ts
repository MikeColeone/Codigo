import type { TemplatePreset } from '@codigo/schema';
import { adminAnalyticsScreenTemplate } from 'src/modules/template/data/admin-analytics-screen';
import { adminConsoleStandardTemplate } from 'src/modules/template/data/admin-console-standard';

export const DEFAULT_TEMPLATE_PRESETS: TemplatePreset[] = [
  adminAnalyticsScreenTemplate,
  adminConsoleStandardTemplate,
  {
    key: 'admin-console-basic',
    name: '通用后台管理模板（基础版）',
    desc: '包含概览与用户管理两页，用于快速搭建后台管理系统骨架。',
    tags: ['admin', 'console'],
    pageTitle: '后台管理系统',
    pageCategory: 'admin',
    layoutMode: 'absolute',
    deviceType: 'pc',
    canvasWidth: 1280,
    canvasHeight: 1000,
    activePagePath: '/overview',
    pages: [
      {
        name: '概览',
        path: '/overview',
        components: [
          {
            type: 'titleText',
            props: { title: 'Dashboard', size: 'xl' },
            styles: {
              position: 'absolute',
              left: 24,
              top: 24,
              width: 320,
              height: 40,
            },
          },
        ],
      },
      {
        name: '用户管理',
        path: '/users',
        components: [
          {
            type: 'titleText',
            props: { title: 'Users', size: 'xl' },
            styles: {
              position: 'absolute',
              left: 24,
              top: 24,
              width: 320,
              height: 40,
            },
          },
          {
            type: 'table',
            props: {
              columnsText: JSON.stringify(
                [
                  { title: 'ID', dataIndex: 'id' },
                  { title: 'Name', dataIndex: 'name' },
                  { title: 'Role', dataIndex: 'role' },
                ],
                null,
                2,
              ),
              dataText: JSON.stringify(
                [
                  { id: 1, name: 'Alice', role: 'Admin' },
                  { id: 2, name: 'Bob', role: 'User' },
                ],
                null,
                2,
              ),
              size: 'middle',
              bordered: true,
              rowKey: 'id',
              pagination: false,
            },
            styles: {
              position: 'absolute',
              left: 24,
              top: 80,
              width: 1232,
              height: 600,
            },
          },
        ],
      },
    ],
  },
];
