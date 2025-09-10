<template>
  <div class="home-container">
    <div class="card-list">
      <div
        v-for="item in pagedVideos"
        :key="item.id"
        class="video-card"
      >
        <div
          class="cover"
          :style="{ backgroundImage: `url(${item.cover})` }"
        >
          <div class="overlay">
            <div class="title-pill">{{ item.title }}</div>
            <div class="tags">
              <span v-for="tag in item.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="pagination-wrapper">
      <el-pagination
        layout="prev, pager, next, jumper"
        :current-page="currentPage"
        :page-size="pageSize"
        :total="videos.length"
        @current-change="onPageChange"
      />
    </div>
  </div>
  
</template>

<script setup>
import { ref, computed } from 'vue'

// 模拟数据（可替换为接口返回）
const videos = ref([
  { id: 1,  title: '标题 - 1',  cover: 'https://picsum.photos/seed/1/800/450',  tags: ['剧情', '热播', '高清'] },
  { id: 2,  title: '标题 - 2',  cover: 'https://picsum.photos/seed/2/800/450',  tags: ['搞笑', '短剧', '推荐'] },
  { id: 3,  title: '标题 - 3',  cover: 'https://picsum.photos/seed/3/800/450',  tags: ['动作', '热门', '4K'] },
  { id: 4,  title: '标题 - 4',  cover: 'https://picsum.photos/seed/4/800/450',  tags: ['爱情', '新片', '收藏'] },
  { id: 5,  title: '标题 - 5',  cover: 'https://picsum.photos/seed/5/800/450',  tags: ['综艺', '真人秀', '精选'] },
  { id: 6,  title: '标题 - 6',  cover: 'https://picsum.photos/seed/6/800/450',  tags: ['科幻', '冒险', '杜比'] },
  { id: 7,  title: '标题 - 7',  cover: 'https://picsum.photos/seed/7/800/450',  tags: ['纪录', '高分', '口碑'] },
  { id: 8,  title: '标题 - 8',  cover: 'https://picsum.photos/seed/8/800/450',  tags: ['动漫', '番剧', '更新'] },
  { id: 9,  title: '标题 - 9',  cover: 'https://picsum.photos/seed/9/800/450',  tags: ['音乐', '演唱会', '现场'] },
])

const currentPage = ref(1)
const pageSize = ref(5) // 移动端每页三条，符合示意图

const pagedVideos = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return videos.value.slice(start, start + pageSize.value)
})

const onPageChange = (page) => {
  currentPage.value = page
}
</script>

<style lang="css" scoped>
.home-container {
  min-height: 100vh;
  background: #121212;
  padding: 12px 12px 22px;
  box-sizing: border-box;
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.video-card {
  background: #1e1e1e;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 14px;
}

.cover {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 */
  background-size: cover;
  background-position: center;
  border-radius: 10px;
  overflow: hidden;
}

.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.35));
}

.title-pill {
  max-width: 82%;
  padding: 8px 14px;
  text-align: center;
  color: #e0e0e0;
  background: transparent;
  border: none;
  border-radius: 10px;
  font-weight: 600;
}

.tags {
  display: flex;
  gap: 22px;
}

.tag {
  padding: 2px 8px;
  color: #cfd8dc;
  font-size: 12px;
  background: rgba(33, 33, 33, 0.7);
  border: 1px solid #ffffff;
  border-radius: 999px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 18px;
}

/* 细节统一 LoginView 深色风格（非背景型分页） */
:deep(.el-pagination .el-pager li.is-active) {
  color: #409eff;
}

/* 深色主题：分页按钮与页码 */
:deep(.el-pagination button),
:deep(.el-pagination .el-pager li) {
  background-color: transparent;
  color: #e0e0e0;
  border: 1px solid #333;
}

:deep(.el-pagination button:hover),
:deep(.el-pagination .el-pager li:hover) {
  background-color: #2d2d2d;
  border-color: #444;
  color: #ffffff;
}

:deep(.el-pagination button.is-disabled) {
  color: #666 !important;
  border-color: #2a2a2a !important;
}

/* 跳页输入框深色样式 */
:deep(.el-pagination .el-input__wrapper) {
  background: #2d2d2d !important;
  border: 1px solid #444 !important;
}

:deep(.el-pagination .el-input__inner) {
  color: #e0e0e0 !important;
}

@media (min-width: 768px) {
  .card-list {
    max-width: 560px;
    margin: 0 auto;
  }
}
</style>