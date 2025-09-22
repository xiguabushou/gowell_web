<template>
  <div class="header-container">
    <div class="header-bar">
      <button class="icon-btn" @click="drawerVisible = true">
        <el-icon>
          <Operation />
        </el-icon>
      </button>

      <div class="header-title">GOWELL</div>

      <button class="icon-btn" @click="onSearchClick">
        <el-icon>
          <Search />
        </el-icon>
      </button>
    </div>

    <el-drawer v-model="drawerVisible" :with-header="false" direction="ltr" :size="drawerSize" class="side-drawer">
      <div class="drawer-content">
        <img style="height: 50px; width: auto; padding: 16px 16px 0 16px;" src="../assets/favicon.svg" alt="logo">
        <div class="drawer-title">{{ store.getters.userInfo != null ? store.getters.userInfo.email : 'XXXX' }}</div>
        <el-menu class="menu" background-color="#1e1e1e" text-color="#e0e0e0" active-text-color="#409eff"
          @select="handleMenuSelect">
          <el-menu-item index="1">
            <el-icon>
              <House />
            </el-icon>
            <span>首页</span>
          </el-menu-item>
          <el-menu-item index="2">
            <el-icon>
              <VideoCamera />
            </el-icon>
            <span>视频</span>
          </el-menu-item>
          <el-menu-item index="3">
            <el-icon>
              <Picture />
            </el-icon>
            <span>图片</span>
          </el-menu-item>
          <div v-if="isAdmin">
            <el-sub-menu index="4">
              <template #title>
                <el-icon>
                  <Upload />
                </el-icon>
                <span>上传</span>
              </template>
              <el-menu-item index="4-1">
                <el-icon>
                  <VideoCamera />
                </el-icon>
                <span>上传视频</span>
              </el-menu-item>
              <el-menu-item index="4-2">
                <el-icon>
                  <Picture />
                </el-icon>
                <span>上传图片</span>
              </el-menu-item>
            </el-sub-menu>
            <el-sub-menu index="5">
              <template #title>
                <el-icon><User /></el-icon>
                <span>用户</span>
              </template>
              <el-menu-item index="5-1">
                <el-icon><Promotion /></el-icon>
                <span>VIP申请</span>
              </el-menu-item>
              <el-menu-item index="5-2">
                <el-icon><Avatar /></el-icon>
                <span>用户管理</span>
              </el-menu-item>
            </el-sub-menu>
            <el-menu-item index="6">
              <el-icon><EditPen /></el-icon>
            <span>内容编辑</span>
          </el-menu-item>
          </div>
        </el-menu>

        <!-- 退出登录按钮区域 -->
        <div class="logout-section">
          <el-button class="logout-btn" color="#121212" @click="showLogoutConfirm" :icon="SwitchButton">
            退出登录
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>

</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Operation, House, VideoCamera, Picture, Upload, SwitchButton } from '@element-plus/icons-vue'
import { removeLocalStorage } from '@/utils/common'
import { useRouter, useRoute } from 'vue-router'
import { logout } from '@/api/user'
import store from '@/store';

const router = useRouter()
const route = useRoute()
const drawerVisible = ref(false)
const isAdmin = ref(false)

const onSearchClick = () => {
  if (route.path == "/video" || route.path.split('/')[1] == "videoDetail") {
    router.push("/search/1")
  } else if (route.path == "/photo" || route.path.split('/')[1] == "photoDetail") {
    router.push("/search/2")
  } else {
    router.push("/search/0")
  }

}

const drawerSize = computed(() => {
  return window.innerWidth * 0.5 > 300 ? '300px' : '55%'
})

// 显示退出登录确认对话框
const showLogoutConfirm = () => {
  ElMessageBox.confirm(
    '您确定要退出登录吗？',
    '退出登录确认',
    {
      confirmButtonText: '确定退出',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(() => {
    handleLogout()
  }).catch(() => {
    ElMessage.info('已取消退出')
  })
}

// 处理退出登录
const handleLogout = async () => {
  try {
    // 调用退出登录API
    await logout()
    // 清除本地存储的用户信息
    store.commit('setUserInfo', null)
    removeLocalStorage("token")
    removeLocalStorage("expires_time")
    // 关闭侧边栏
    drawerVisible.value = false
    // 跳转到登录页面
    router.push('/login')
    ElMessage.success('已成功退出登录')
  } catch (error) {
    ElMessage.error('退出登录失败，请重试')
  }
}

const handleMenuSelect = (key) => {
  drawerVisible.value = false
  switch (key) {
    case '1': router.push('/'); break
    case '2': router.push('/video'); break
    case '3': router.push('/photo'); break
    case '4-1': router.push('/uploadVideo'); break
    case '4-2': router.push('/uploadPhoto'); break
    case '5-1': router.push('/askForVipList');break
    case '5-2': router.push('/userManagement');break
    case '6': router.push('/contentList');break
    default: break
  }
}

const checkIsAdmin = () => {
  try {
    if (store.getters.userInfo.role_id == 2) {
      isAdmin.value = true
    } else {
      isAdmin.value = false
    }
  }
  catch {
    router.push({
      path: "/login",
      query: { key: "timeout" }
    })
  }
}

checkIsAdmin()

</script>

<style lang="css" scoped>
.header-container {
  background-color: #121212;
}

.header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  background-color: #1e1e1e;
  color: #e0e0e0;
}

.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 100%;
  border: none;
  background: transparent;
  color: #e0e0e0;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}

.icon-btn :deep(.el-icon) {
  font-size: 26px;
}

.icon-btn:hover {
  background-color: rgba(255, 255, 255, 0.06);
}

.header-title {
  flex: 1;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  color: #bbdefb;
}

/* 抽屉为 Teleport 节点，需使用 :deep 选择器覆盖样式 */
:deep(.side-drawer) {
  --el-drawer-bg-color: #1e1e1e;
}

:deep(.side-drawer.el-drawer),
:deep(.side-drawer .el-drawer__body) {
  padding: 0 !important;
  background-color: #1e1e1e !important;
}

/* 去除抽屉白边（阴影/边框/圆角） */
:deep(.side-drawer.el-drawer) {
  box-shadow: none !important;
  border: none !important;
  border-radius: 0 !important;
}

/* 抽屉容器也设为深色，避免四周露白 */
:deep(.side-drawer .el-drawer__container) {
  background-color: #1e1e1e !important;
}

/* 头部区域统一深色且无外边距，避免白边 */
:deep(.side-drawer .el-drawer__header) {
  margin: 0 !important;
  padding: 16px !important;
  background-color: #1e1e1e !important;
  color: #e0e0e0 !important;
  border-bottom: 1px solid #333;
}

.drawer-content {
  color: #e0e0e0;
  background-color: #1e1e1e;
  height: 100%;
  display: flex;
  flex-direction: column;
  /* 允许子项在弹性容器内正确滚动 */
  min-height: 0;
}

.drawer-title {
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 1px solid #333;
}

.menu {
  border-right: none;
  border: none;
  width: 100%;
  background-color: #1e1e1e;
  /* 占据剩余空间并启用内部滚动，避免挤压底部按钮 */
  flex: 1 1 auto;
  overflow-y: auto;
}

/* 统一菜单深色风格并避免浅色 hover/active */
.menu :deep(.el-menu-item),
.menu :deep(.el-sub-menu__title) {
  background-color: #1e1e1e;
}

/* 背景保持一致，仅通过文字颜色高亮 */
.menu :deep(.el-menu-item:hover),
.menu :deep(.el-menu-item.is-active),
.menu :deep(.el-sub-menu__title:hover) {
  background-color: #1e1e1e;
  color: #409eff;
}

/* 退出登录按钮区域 */
.logout-section {
  padding: 16px;
  border-top: 1px solid #333;
  background-color: #1e1e1e;
  /* 始终固定在抽屉底部 */
  margin-top: auto;
}

.logout-btn {
  width: 100%;
  height: 40px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.3);
}

@media (max-width: 768px) {
  .header-bar {
    height: 52px;
  }

  .icon-btn {
    width: 58px;
  }
}
</style>