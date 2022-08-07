import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHashHistory } from 'vue-router'

import Layout from '~/jenkins-tools/layout/Layout.vue'


const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Layout',
    component: Layout,
    redirect: '/api-tool',
    children: [
      {
        path: '/api-tool',
        name: 'ApiTool',
        component: () => import('../pages/api-tool/Index.vue'),
      },
      {
        path: '/job-migration',
        name: 'JobMigration',
        component: () => import('../pages/job-migration/Index.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
