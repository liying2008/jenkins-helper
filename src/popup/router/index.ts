import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHashHistory } from 'vue-router'
import Layout from '~/popup/layout/Layout.vue'


const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Layout',
    component: Layout,
    // redirect: '/monitor',
    children: [
      {
        path: '/monitor',
        name: 'Monitor',
        component: () => import('../pages/monitor/Index.vue'),
      },
      {
        path: '/params',
        name: 'Params',
        component: () => import('../pages/params/Index.vue'),
      },
      {
        path: '/computer',
        name: 'Computer',
        component: () => import('../pages/computer/Index.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})


export default router
