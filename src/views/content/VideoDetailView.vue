<template>
  <div class="video-detail-container">
    <!-- 标题区域 -->
    <div class="title-section">
      <h1 class="video-title">{{ videoData.title || '视频标题' }}</h1>
    </div>

    <!-- 标签区域 -->
    <div class="tags-section">
      <div class="tags">
        <span class="tag" v-for="tag in videoData.tags" :key="tag">{{ tag }}</span>
      </div>
    </div>

    <!-- 视频播放器区域 -->
    <div class="video-player-section">
      <div class="video-player">
        <video 
          v-if="videoData.video_url"
          :src="videoData.video_url"
          controls
          preload="metadata"
          class="video-element"
        >
          您的浏览器不支持视频播放。
        </video>
        <div v-else class="video-placeholder">
          <div class="play-icon">▶</div>
          <p>视频播放器</p>
        </div>
      </div>
    </div>

    <!-- 相关推荐区域 -->
    <div class="recommendations-section">
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
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getInfo } from '@/api/content/VideoDetail'

const route = useRoute()
const router = useRouter()

const videoData = ref({
  title: '',
  video_url: '',
  tags: [],
})

const recommendList = ref([])


const goToVideo = (item) => {
  if (!item || !item.uid) return
  router.push({ name: 'videoDetail', params: { uid: item.uid } })
}

onMounted(() => {
  // 根据路由参数获取视频详情
  const videoId = route.params.uid
  if (videoId) {
    // 这里可以调用API获取视频详情
    console.log('获取视频详情:', videoId)
  }
})

async function fetchVideoInfo() {
  const params = { uid: route.params.uid }
  // 重置本地数据，避免残留
  videoData.value = { title: '', video_url: '', tags: [] }
  recommendList.value = []
  const res = await getInfo(params)
  videoData.value.title = res.data?.title || ''
  videoData.value.video_url = res.data?.video || ''
  videoData.value.tags = Array.isArray(res.data?.tags) ? res.data.tags : []
  recommendList.value = res.data?.recommend_list || []
}

// 首次加载
fetchVideoInfo()

// 监听路由参数变化，刷新数据
watch(
  () => route.params.uid,
  (newUid, oldUid) => {
    if (newUid && newUid !== oldUid) {
      fetchVideoInfo()
    }
  }
)
</script>

<style lang="css" scoped>
.video-detail-container {
  min-height: calc(100vh - 52px);
  background: #121212;
  padding: 12px 12px 22px;
  box-sizing: border-box;
}

.title-section {
  margin-bottom: 16px;
}

.video-title {
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
  border: 1px solid #ffffff;
  border-radius: 999px;
}

.video-player-section {
  margin-bottom: 24px;
}

.video-player {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 比例 */
  background: #000;
  border-radius: 10px;
  overflow: hidden;
}

.video-element {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2d2d2d, #1a1a1a);
  color: #e0e0e0;
}

.play-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.8;
}

.video-placeholder p {
  margin: 0;
  font-size: 16px;
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

/* 响应式设计 */
@media (min-width: 768px) {
  .video-detail-container {
    max-width: 800px;
    margin: 0 auto;
  }
  
  .video-title {
    font-size: 24px;
  }
  
  .recommendations-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  
  .recommendation-title {
    font-size: 14px;
  }
}

@media (min-width: 1024px) {
  .recommendations-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
}
</style>