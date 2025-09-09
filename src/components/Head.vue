<template>
  <div class="header-container">
    <div class="header-bar">
      <button class="icon-btn left" @click="drawerVisible = true">
        <el-icon><Operation /></el-icon>
      </button>

      <div class="header-title">网站标题</div>

      <button class="icon-btn right" @click="onSearchClick">
        <el-icon><Search /></el-icon>
      </button>
    </div>

    <el-drawer
      v-model="drawerVisible"
      :with-header="false"
      direction="ltr"
      size="70%"
      class="side-drawer"
    >
      <div class="drawer-content">
        <div class="drawer-title">菜单</div>
        <el-menu
          class="menu"
          background-color="#1e1e1e"
          text-color="#e0e0e0"
          active-text-color="#409eff"
        >
          <el-menu-item index="1">
            <el-icon><House /></el-icon>
            <span>首页</span>
          </el-menu-item>
          <el-menu-item index="2">
            <el-icon><User /></el-icon>
            <span>个人中心</span>
          </el-menu-item>
          <el-menu-item index="3">
            <el-icon><Setting /></el-icon>
            <span>设置</span>
          </el-menu-item>
        </el-menu>
      </div>
    </el-drawer>
  </div>
  
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Operation, House, User, Setting } from '@element-plus/icons-vue'

const drawerVisible = ref(false)

const onSearchClick = () => {
  ElMessage.info('搜索功能开发中')
}
</script>

<style lang="css" scoped>
.header-container {
  padding: 12px;
  background-color: #121212;
}

.header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  background-color: #1e1e1e;
  border: 1px solid #333;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
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

.icon-btn.right {
  background-color: #242a31;
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
}

.icon-btn.left {
  border-top-left-radius: 12px;
  border-bottom-left-radius: 12px;
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

@media (max-width: 768px) {
  .header-bar {
    height: 52px;
  }
  .icon-btn {
    width: 58px;
  }
}
</style>