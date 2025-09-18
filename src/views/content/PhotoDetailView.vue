<template>
    <div class="photo-detail-container">
        <!-- 标题区域 -->
        <div class="title-section">
            <h1 class="photo-title">{{ photoData.title || '图集标题' }}</h1>
        </div>

        <!-- 标签区域 -->
        <div class="tags-section">
            <div class="tags">
                <span class="tag" v-for="tag in photoData.tags" :key="tag" @click="searchTag(tag)">{{ tag }}</span>
            </div>
        </div>

        <!-- 图片列表区域 -->
        <div class="photo-list">
            <div v-for="(url, index) in photoData.images" :key="url || index" class="photo-item">
                <img :src="url" class="photo-img" loading="lazy" />
            </div>
        </div>

        <!-- 分页区域（如后端大图集分页返回，可用） -->
        <div class="pagination-wrapper">
            <el-pagination layout="prev, pager, next, jumper" :current-page="currentPage" :page-size="pageSize"
                :total="total" @current-change="onPageChange" />
        </div>

        <!-- 推荐列表：两列三行 -->
        <div class="recommendations-section">
            <span>相关推荐：</span>
            <hr style="border: 1px solid #2d2d2d;">
            <div class="recommendations-grid">
                <div v-for="(item, index) in recommendList.slice(0, 6)" :key="item.id || index"
                    class="recommendation-item" @click="goToPhoto(item)">
                    <div class="recommendation-cover" :style="{ backgroundImage: `url(${item.cover})` }" />
                    <div class="recommendation-title">{{ item.title || `推荐 ${index + 1}` }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getInfo } from '@/api/content/PhotoDetail'

const route = useRoute()
const router = useRouter()

const currentPage = ref(1)
const pageSize = ref(15)
const total = ref(0)

const photoData = ref({
    title: '',
    tags: [],
    images: []
})

const recommendList = ref([])

async function fetchPhotoInfo() {
    const params = { 
        uid: route.params.uid, 
        page: currentPage.value, 
        page_size: pageSize.value 
    }
    photoData.value = { 
        title: '', 
        tags: [], 
        images: [] 
    }

    const res = await getInfo(params)
    photoData.value.title = res.data?.title || ''
    photoData.value.tags = Array.isArray(res.data?.tags) ? res.data.tags : []

    const images = res.data?.images || []
    photoData.value.images = Array.isArray(images) ? images : []
    total.value = res.data?.total || 0
    recommendList.value = res.data?.recommend_list || []
}

const onPageChange = (newPage) => {
    currentPage.value = newPage
    fetchPhotoInfo()
}

const goToPhoto = (item) => {
    if (!item || !item.uid) return
    router.push({ name: 'photoDetail', params: { uid: item.uid } })
}

const searchTag = (tag) => {
    router.push({
        path:'/search/2',
        query:{search_key: tag}
    })
}

// 首次加载
fetchPhotoInfo()

// 路由变化重新拉取
watch(
    () => route.params.uid,
    (newUid, oldUid) => {
        if (newUid && newUid !== oldUid) {
            currentPage.value = 1
            fetchPhotoInfo()
        }
    }
)
</script>

<style lang="css" scoped>
.photo-detail-container {
    min-height: 100vh;
    background: #121212;
    padding: 12px 12px 22px;
    box-sizing: border-box;
}

.title-section {
    margin-bottom: 16px;
}

.photo-title {
    color: #e0e0e0;
    font-size: 20px;
    font-weight: 600;
    margin: 0;
    text-align: center;
    padding: 12px 16px;
    background: rgba(33, 33, 33, 0.7);
    border-radius: 10px;
}

.tags-section {
    margin-bottom: 20px;
}

.tags {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
}

.tag {
    padding: 6px 12px;
    color: #cfd8dc;
    font-size: 14px;
    background: rgba(33, 33, 33, 0.7);
    border-radius: 999px;
}

.photo-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.photo-item {
    border-radius: 10px;
    overflow: hidden;
    background: #000;
}

.photo-img {
    width: 100%;
    display: block;
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
    .photo-detail-container {
        max-width: 800px;
        margin: 0 auto;
    }

    .photo-title {
        font-size: 24px;
    }
}

.recommendations-section {
    margin-top: 16px;
}

.recommendations-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}

.recommendation-item {
    cursor: pointer;
}

.recommendation-cover {
    position: relative;
    width: 100%;
    padding-top: 56.25%;
    background-size: cover;
    background-position: center;
    border-radius: 8px;
    overflow: hidden;
}

.recommendation-title {
    margin-top: 8px;
    color: #e0e0e0;
    font-size: 14px;
    text-align: center;
}
</style>