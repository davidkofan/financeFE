import { createRouter, createWebHistory } from 'vue-router';
//import Login from '@/components/login/login-component.vue';
import Board from '@/components/board/BoardComponent.vue';
import Admin from '@/components/admin/AdminComponent.vue';

const routes = [
  {
    path: '/',
    name: 'board',
    component: Board,
  },
  {
    path: '/admin',
    name: 'admin',
    component: Admin,
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
