import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/Home.vue')
    },
    {
      path: '/music',
      name: 'music',
      component: () => import('@/views/Music.vue')
    },
    {
      path: '/lyrics',
      name: 'lyrics',
      component: () => import('@/views/Lyrics.vue')
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/Settings.vue')
    }
  ]
})

export default router
