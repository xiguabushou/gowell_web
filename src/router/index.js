import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'login',
    component: () => import( '../views/user/LoginView.vue')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import( '../views/user/RegisterView.vue')
  },
  {
    path: '/forgetPassword',
    name: 'forgetPassword',
    component: () => import( '../views/user/ForgetPasswordView.vue')
  },
  {
    path: '/resetForgotPassword',
    name: 'resetForgotPassword',
    component: () => import( '../views/user/ResetForgotPassword.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
