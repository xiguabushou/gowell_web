import { createRouter, createWebHistory } from 'vue-router'
import { getLocalStorage,  removeLocalStorage} from '@/utils/common'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import( '../components/Head.vue')
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

// 注册全局前置守卫
router.beforeEach((to, from, next) => {
  let token = getLocalStorage('token')
  let expires_time = getLocalStorage('expires_time')

  if(to.path != '/login' && to.path != '/register' && to.path != '/forgetPassword'){
    if(token == null || token == '' || token == undefined){
      removeLocalStorage('expires_time')
      next('/login')
    }

    if(expires_time == null || expires_time == '' || expires_time == undefined){
      removeLocalStorage('token')
      next('/login')
    }

    let newTime = Math.round(new Date() / 1000)
    if(expires_time <= newTime){
      removeLocalStorage('token')
      removeLocalStorage('expires_time')
      next('/login')
    }
  }
  next()
});

export default router
