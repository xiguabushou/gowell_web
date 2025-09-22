<template>
    <div class="header-container">
        <div class="header-bar">
            <button class="icon-btn" @click="goBackHome">
                <el-icon><ArrowLeft /></el-icon>
            </button>

            <el-input
                class="header-title"
                v-model="keyword"
                placeholder="请输入关键词"
                clearable
                @keyup.enter="onSearch"
            />

            <button class="icon-btn" @click="onSearch">
                <el-icon><Check /></el-icon>
            </button>
        </div>
    </div>
    <div class="home-container">
        <div class="card-list" v-if="total > 0">
            <div v-for="item in filteredData" :key="item.id">
                <div class="cover" :style="{ backgroundImage: `url(${item.cover})` }" @click="goToDetail(item)">
                    <div class="overlay">
                        <div class="title-pill">{{ item.title }}</div>
                        <div class="tags">
                            <span class="tag">{{ item.content_type }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <el-empty v-else-if="hasSearched" description="找不到相关内容" :image-size="120" />

        <div class="pagination-wrapper" v-if="total > 0">
            <el-pagination layout="prev, pager, next, jumper" :current-page="currentPage" :page-size="pageSize"
                :total="total" @current-change="onPageChange" />
        </div>
    </div>

</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute} from 'vue-router'
import { getList } from '@/api/content'
import { ElMessage } from 'element-plus'



const currentPage = ref(1)
const pageSize = ref(18) // 每页数量
const total = ref(0)
const filteredData = ref([])
const router = useRouter()
const keyword = ref('')
const hasSearched = ref(false)
const route = useRoute()

async function fetchContentList() {
    const type_id = route.params.type_id
    const params = {
        type_id: type_id,
        page: currentPage.value,
        page_size: pageSize.value,
        keyword: keyword.value
    }
    const res = await getList(params)
    total.value = res.data?.total || 0
    filteredData.value = res.data?.list || []
    if (total.value == 0 ){
        hasSearched.value = true
    }
}

const onPageChange = (newPage) => {
    if (!keyword.value || !keyword.value.trim()) {
        ElMessage.warning('输入内容不能为空')
        return
    }
    currentPage.value = newPage
    fetchContentList()
}

const onSearch = () => {
    if (!keyword.value || !keyword.value.trim()) {
        ElMessage.warning('输入内容不能为空')
        return
    }
    currentPage.value = 1
    fetchContentList()
}

const goToDetail = (item) => {
    if (!item || !item.uid) return
    if (item.content_type == '视频') {
        router.push({ name: 'videoDetail', params: { uid: item.uid } })
        return
    }
    if (item.content_type == '图片') {
        router.push({ name: 'photoDetail', params: { uid: item.uid } })
        return
    }
}

const goBackHome = () =>{
    const type_id = route.params.type_id
    if (type_id == "1") {
        router.push("/video")
    }else if(type_id == "2"){
        router.push("/photo")
    }else{
        router.push("/")
    }
}

onMounted(() => {
    const q = route.query?.search_key
    if (typeof q === 'string' && q.trim()) {
        keyword.value = q
        currentPage.value = 1
        fetchContentList()
    }
})

watch(() => route.query?.search_key, (newVal) => {
    const val = typeof newVal === 'string' ? newVal : ''
    if (val && val.trim()) {
        keyword.value = val
        currentPage.value = 1
        fetchContentList()
    }
})

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
  font-size: 16px;
  font-weight: 600;
  color: #121212;
}

/* 头部搜索框深色样式，仅作用于此页面的输入框 */
.header-title:deep(.el-input__wrapper) {
  background: #2b2b2b !important;
  border: 1px solid #444 !important;
  box-shadow: none !important;
}

.header-title:deep(.el-input__inner) {
  color: #e0e0e0 !important;
}

.header-title:deep(.el-input__inner::placeholder) {
  color: #9e9e9e !important;
}

.home-container {
    min-height: calc(100vh - 56px);
    background: #121212;
    padding: 12px 12px 22px;
    box-sizing: border-box;
}

.card-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.cover {
    position: relative;
    width: 100%;
    padding-top: 56.25%;
    /* 16:9 */
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
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.35));
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

@media (min-width: 512px) {
  .card-list {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
}

@media (min-width: 1024px) {
  .card-list {
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
}
</style>