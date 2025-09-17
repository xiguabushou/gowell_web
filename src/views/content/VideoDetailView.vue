<template>
  <div class="video-detail-container">
    <!-- 标题区域 -->
    <div class="title-section">
      <h1 class="video-title">{{ videoData.title || '视频标题' }}</h1>
    </div>

    <!-- 标签区域 -->
    <div class="tags-section">
      <div class="tags">
        <span class="tag" v-for="tag in videoData.tags" :key="tag" @click="searchTag(tag)">{{ tag }}</span>
      </div>
    </div>

    <!-- 视频播放器区域 -->
    <div class="video-player-section">
      <div class="video-player" :style="playerStyle">
        <video 
          v-if="videoData.video_url"
          ref="videoElement"
          :src="videoData.video_url"
          controls
          preload="metadata"
          class="video-element"
          @loadedmetadata="onVideoLoaded"
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
      <span>相关推荐：</span>
      <hr style="border: 1px solid #2d2d2d;">
            <div class="recommendations-grid">
                <div v-for="(item, index) in recommendList.slice(0, 6)" :key="item.id || index"
                    class="recommendation-item" @click="goToVideo(item)">
                    <div class="recommendation-cover" :style="{ backgroundImage: `url(${item.cover})` }" />
                    <div class="recommendation-title">{{ item.title || `推荐 ${index + 1}` }}</div>
                </div>
            </div>
        </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
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

// 视频播放器相关状态
const videoElement = ref(null)
const videoDimensions = ref({ width: 0, height: 0 })
const containerMaxWidth = ref(800) // 容器最大宽度

// 计算播放器容器样式
const playerStyle = computed(() => {
  if (videoDimensions.value.width === 0 || videoDimensions.value.height === 0) {
    // 如果视频尺寸未知，使用默认16:9比例
    return {
      paddingTop: '56.25%'
    }
  }
  
  const aspectRatio = videoDimensions.value.height / videoDimensions.value.width
  const containerWidth = Math.min(window.innerWidth - 24, containerMaxWidth.value) // 减去padding
  const containerHeight = containerWidth * aspectRatio
  
  return {
    width: '100%',
    paddingTop: `${aspectRatio * 100}%`,
    maxWidth: `${containerMaxWidth.value}px`,
    margin: '0 auto'
  }
})


// 视频元数据加载完成处理
const onVideoLoaded = () => {
  if (videoElement.value) {
    videoDimensions.value = {
      width: videoElement.value.videoWidth,
      height: videoElement.value.videoHeight
    }
  }
}

// 窗口大小变化处理
const handleResize = () => {
  // 重新计算容器最大宽度
  const screenWidth = window.innerWidth
  if (screenWidth >= 1024) {
    containerMaxWidth.value = 800
  } else if (screenWidth >= 768) {
    containerMaxWidth.value = 600
  } else {
    containerMaxWidth.value = screenWidth - 24
  }
}

const goToVideo = (item) => {
  if (!item || !item.uid) return
  router.push({ name: 'videoDetail', params: { uid: item.uid } })
}

onMounted(() => {  
  // 初始化容器尺寸
  handleResize()
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

// 组件卸载时清理监听器
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
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

const searchTag = (tag) => {
    router.push({
        path:'/search/1',
        query:{search_key: tag}
    })
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
  border-radius: 999px;
}

.video-player-section {
  margin-bottom: 24px;
}

.video-player {
  position: relative;
  width: 100%;
  background: #000;
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.3s ease;
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