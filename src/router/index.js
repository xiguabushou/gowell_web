import { createRouter, createWebHistory } from 'vue-router'
import { getLocalStorage,  removeLocalStorage} from '@/utils/common'

const routes = [
  {
    path: '/',
    name: 'index',
    component: () => import( '../views/layout/LayoutView.vue'),
    children: [
      {
        path: '/',
        name: 'home',
        component: () => import( '../views/content/HomeView.vue')
      },
      {
        path: '/video',
        name: 'video',
        component: () => import( '../views/content/VideoView.vue')
      },
      {
        path: '/photo',
        name: 'photo',
        component: () => import( '../views/content/PhotoView.vue')
      },
      {
        path: '/uploadVideo',
        name: 'uploadVideo',
        component: () => import( '../views/admin/UploadVideoView.vue')
      },
      {
        path: '/uploadPhoto',
        name: 'uploadPhoto',
        component: () => import( '../views/admin/UploadPhotoView.vue')
      },
      {
        path: '/videoDetail/:uid',
        name: 'videoDetail',
        component: () => import( '../views/content/VideoDetailView.vue')
      },
      {
        path: '/photoDetail/:uid',
        name: 'photoDetail',
        component: () => import( '../views/content/PhotoDetailView.vue')
      },
      {
        path: '/askForVipList',
        name: 'askForVipList',
        component: () => import( '../views/admin/AskForVipListView.vue')
      },
      {
        path: '/userManagement',
        name: 'userManagement',
        component: () => import( '../views/admin/UserManagementView.vue')
      },
      {
        path: '/contentList',
        name: 'contentList',
        component: () => import( '../views/admin/ContentListView.vue')
      }
    ]
  },
  {
    path: '/search/:type_id',
    name: 'search',
    component: () => import( '../views/content/SearchView.vue')
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
  },
  {
    path: '/:catchAll(.*)',
    component: () => import('../views/error/404View.vue'),
    name: 'NotFound'
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// 注册全局前置守卫
router.beforeEach((to, from, next) => {
  const whitelist = ['/login', '/register', '/forgetPassword', '/resetForgotPassword']
  if (whitelist.includes(to.path)) {
    return next()
  }

  const token = getLocalStorage('token')
  const expires_time = getLocalStorage('expires_time')

  if (token == null || token === '' || token === undefined) {
    removeLocalStorage('token')
    removeLocalStorage('expires_time')
    return next('/login')
  }

  if (expires_time == null || expires_time === '' || expires_time === undefined) {
    removeLocalStorage('token')
    removeLocalStorage('expires_time')
    return next('/login')
  }

  const currentUnixSeconds = Math.round(Date.now() / 1000)
  if (Number(expires_time) <= currentUnixSeconds) {
    removeLocalStorage('token')
    removeLocalStorage('expires_time')
    return next('/login')
  }

  return next()
});

export default router
