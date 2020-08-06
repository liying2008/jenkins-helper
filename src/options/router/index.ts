import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Layout from '@/options/layout/Layout.vue'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Layout',
    component: Layout,
    redirect: '/settings',
    children: [
      {
        path: '/settings',
        name: 'Settings',
        component: () => import('../pages/Settings.vue')
      },
      {
        path: '/import-export',
        name: 'ImportExport',
        component: () => import('../pages/ImportExport.vue')
      },
      {
        path: '/about',
        name: 'About',
        component: () => import('../pages/About.vue')
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

export default router
