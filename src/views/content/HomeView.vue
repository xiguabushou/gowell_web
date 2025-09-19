<template>
  <div class="home-container">
    <div class="card-list">
      <div
        v-for="item in filteredData"
        :key="item.id"
      >
        <div
          class="cover"
          :style="{ backgroundImage: `url(${item.cover})` }"
          @click="goToDetail(item)"
        >
          <div class="overlay">
            <div class="title-pill">{{ item.title }}</div>
            <div class="tags">
              <span class="tag">{{ item.content_type }}</span>
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
        :total="total"
        @current-change="onPageChange"
      />
    </div>
  </div>
  
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getList } from '@/api/content'


const currentPage = ref(1)
const pageSize = ref(15) // 每页数量
const total = ref(0)
const filteredData = ref([])
const router = useRouter()

async function fetchContentList() {
  const params = {
    type_id: 0,
    page: currentPage.value,
    page_size: pageSize.value,
  }
  const res = await getList(params)
  total.value = res.data?.total || 0
  filteredData.value = res.data?.list || []
}

const onPageChange=(newPage)=>{
  currentPage.value = newPage
  fetchContentList()
}

const goToDetail = (item) => {
  if (!item || !item.uid) return
  if (item.content_type == '视频'){
    router.push({ name: 'videoDetail', params: { uid: item.uid } })
    return
  }
  if (item.content_type == '图片'){
    router.push({ name: 'photoDetail', params: { uid: item.uid } })
    return
  }
}


// 初始化加载
fetchContentList()
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

.cover {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 */
  background-size: cover;
  background-position: center;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
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