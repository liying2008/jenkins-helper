import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Layout from '@/popup/layout/Layout.vue'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Layout',
    component: Layout,
    redirect: '/monitor',
    children: [
      {
        path: '/monitor',
        name: 'Monitor',
        component: () => import('../pages/Monitor.vue')
      },
      {
        path: '/params',
        name: 'Params',
        component: () => import('../pages/Params.vue')
      },
      {
        path: '/computer',
        name: 'Computer',
        component: () => import('../pages/Computer.vue')
      },
      {
        path: '/jenkins-tools',
        name: 'JenkinsTools',
        component: () => import('../pages/JenkinsTools.vue')
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

export default router
