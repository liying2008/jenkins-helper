import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Layout from '@/jenkins_tools/layout/Layout.vue'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Layout',
    component: Layout,
    redirect: '/api-tool',
    children: [
      {
        path: '/api-tool',
        name: 'ApiTool',
        component: () => import('../pages/api-tool/Index.vue')
      },
      {
        path: '/job-migration',
        name: 'JobMigration',
        component: () => import('../pages/job-migration/Index.vue')
      },
    ]
  }
]

const router = new VueRouter({
  routes
})

export default router
