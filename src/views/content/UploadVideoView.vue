<template>
  <div class="upload-container">
    <div class="upload-form">
      <!-- 标题输入框 -->
      <div class="form-group">
        <label class="form-label">标题:</label>
        <input 
          v-model="formData.title" 
          type="text" 
          class="form-input"
          placeholder="请输入标题"
        />
      </div>

      <!-- 标签输入框 -->
      <div class="form-group">
        <label class="form-label">tags:</label>
        <input 
          v-model="formData.tags" 
          type="text" 
          class="form-input"
          placeholder="请输入标签，用逗号分隔"
        />
      </div>

      <!-- 视频上传区域 -->
      <div class="upload-area">
        <div 
          v-if="!videoFile" 
          class="upload-placeholder"
          @click="triggerVideoUpload"
        >
          上传视频
        </div>
        <div 
          v-else 
          class="video-preview"
          @click="triggerVideoUpload"
        >
          <video 
            ref="videoElement"
            :src="videoUrl" 
            class="preview-video"
            @loadedmetadata="onVideoLoaded"
          ></video>
          <div class="video-info">
            <span class="video-name">{{ videoFile.name }}</span>
            <span class="video-duration">{{ formatDuration(videoDuration) }}</span>
          </div>
        </div>
        <input 
          ref="videoInput"
          type="file"
          accept=".mp4"
          style="display: none"
          @change="handleVideoUpload"
        />
      </div>

      <!-- 时长滑块 -->
      <div v-if="videoDuration > 0" class="slider-container">
        <label class="slider-label">选择封面时间点:</label>
        <div class="slider-wrapper">
          <input 
            v-model="selectedTime"
            type="range"
            :min="0"
            :max="videoDuration"
            step="0.1"
            class="time-slider"
            @input="updateCoverPreview"
          />
          <div class="time-display">{{ formatTime(selectedTime) }}</div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="button-group">
        <button class="btn btn-cancel" @click="handleCancel">取消</button>
        <button 
          class="btn btn-submit" 
          :disabled="!canSubmit"
          @click="handleSubmit"
        >
          提交
        </button>
      </div>
    </div>
    </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { uploadVideo } from '@/api/content'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

// 表单数据
const formData = ref({
  title: '',
  tags: ''
})

// 视频相关
const videoFile = ref(null)
const videoUrl = ref('')
const videoElement = ref(null)
const videoInput = ref(null)
const videoDuration = ref(0)

// 封面相关
const coverPreview = ref('')
const selectedTime = ref(0)

// 计算属性
const canSubmit = computed(() => {
  return formData.value.title.trim() && 
         formData.value.tags.trim() && 
         videoFile.value && 
         coverPreview.value
})

// 触发视频上传
const triggerVideoUpload = () => {
  videoInput.value?.click()
}

// 处理视频上传
const handleVideoUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // 检查文件格式
  if (!file.type.includes('video/mp4')) {
    alert('只能上传MP4格式的视频文件')
    return
  }

  // 检查文件大小（可选，限制为100MB）
  if (file.size > 1000 * 1024 * 1024) {
    ElMessage.info('视频文件大小不能超过1000MB')
    return
  }

  videoFile.value = file
  videoUrl.value = URL.createObjectURL(file)
  selectedTime.value = 0
  coverPreview.value = ''
}

// 视频加载完成
const onVideoLoaded = () => {
  videoDuration.value = videoElement.value.duration
  selectedTime.value = 0
}

// 更新封面预览
const updateCoverPreview = async () => {
  if (!videoElement.value || videoDuration.value === 0) return

  try {
    // 设置视频到指定时间点
    videoElement.value.currentTime = selectedTime.value
    
    // 等待视频跳转到指定时间
    await new Promise(resolve => {
      const onSeeked = () => {
        videoElement.value.removeEventListener('seeked', onSeeked)
        resolve()
      }
      videoElement.value.addEventListener('seeked', onSeeked)
    })

    // 创建canvas来截取当前帧
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    // 设置canvas尺寸
    canvas.width = videoElement.value.videoWidth
    canvas.height = videoElement.value.videoHeight
    
    // 绘制当前帧
    ctx.drawImage(videoElement.value, 0, 0, canvas.width, canvas.height)
    
    // 转换为base64图片
    coverPreview.value = canvas.toDataURL('image/jpeg', 0.8)
  } catch (error) {
    console.error('生成封面预览失败:', error)
  }
}

// 格式化时长
const formatDuration = (seconds) => {
  if (!seconds) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 格式化时间
const formatTime = (seconds) => {
  if (!seconds) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 取消操作
const handleCancel = () => {
  // 清理资源
  if (videoUrl.value) {
    URL.revokeObjectURL(videoUrl.value)
  }
  router.go(-1)
}

// 提交表单
const handleSubmit = async () => {
  if (!canSubmit.value) return

  try {
    // 创建FormData对象
    const formDataToSend = new FormData()
    
    // 添加表单字段
    formDataToSend.append('title', formData.value.title.trim())
    formDataToSend.append('tags', formData.value.tags.trim())
    
    // 添加视频文件
    formDataToSend.append('video', videoFile.value)
    
    // 将封面预览转换为Blob并添加
    if (coverPreview.value) {
      const coverBlob = await dataURLToBlob(coverPreview.value)
      formDataToSend.append('cover', coverBlob, 'cover.jpg')
    }

    // 显示加载状态
    const submitBtn = document.querySelector('.btn-submit')
    const originalText = submitBtn.textContent
    submitBtn.textContent = '上传中...'
    submitBtn.disabled = true

    // 调用API
    const response = await uploadVideo(formDataToSend)
    
    if (response.code === 0) {
      ElMessage.success('视频上传成功！')
      handleCancel()
    } else {
      ElMessage.error(`上传失败: ${response.message || '未知错误'}`)
    }
  } catch (error) {
    ElMessage.error(`上传失败: ${error.message || '网络错误'}`)
  } finally {
    // 恢复按钮状态
    const submitBtn = document.querySelector('.btn-submit')
    submitBtn.textContent = '提交'
    submitBtn.disabled = false
  }
}

// 将base64图片转换为Blob
const dataURLToBlob = (dataURL) => {
  return new Promise((resolve) => {
    const arr = dataURL.split(',')
    const mime = arr[0].match(/:(.*?);/)[1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    resolve(new Blob([u8arr], { type: mime }))
  })
}
</script>

<style lang="css" scoped>
.upload-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20px;
  box-sizing: border-box;
}

.upload-form {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  color: #333;
  font-size: 16px;
  font-weight: 500;
}

.form-input {
  padding: 12px 16px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  color: #333;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s;
}

.form-input:focus {
  border-color: #409eff;
}

.form-input::placeholder {
  color: #999;
}

.upload-area {
  border: 2px dashed #ddd;
  border-radius: 12px;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.3s;
}

.upload-area:hover {
  border-color: #409eff;
}

.upload-placeholder {
  color: #666;
  font-size: 18px;
  font-weight: 500;
}

.video-preview {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.preview-video {
  max-width: 100%;
  max-height: 180px;
  border-radius: 8px;
}

.video-info {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.video-name {
  color: #333;
  font-size: 14px;
  font-weight: 500;
}

.video-duration {
  color: #666;
  font-size: 12px;
}

.slider-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.slider-label {
  color: #333;
  font-size: 14px;
  font-weight: 500;
}

.slider-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.time-slider {
  flex: 1;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.time-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  background: #409eff;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
}

.time-slider::-webkit-slider-thumb:hover {
  background: #66b3ff;
  transform: scale(1.1);
}

.time-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: #409eff;
  border-radius: 50%;
  cursor: pointer;
  border: none;
  transition: all 0.3s;
}

.time-slider::-moz-range-thumb:hover {
  background: #66b3ff;
  transform: scale(1.1);
}

.time-display {
  color: #333;
  font-size: 14px;
  font-weight: 500;
  min-width: 50px;
  text-align: center;
}

.button-group {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 20px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 100px;
}

.btn-cancel {
  background: white;
  color: #333;
  border: 1px solid #ddd;
}

.btn-cancel:hover {
  background: #f5f5f5;
  border-color: #409eff;
}

.btn-submit {
  background: #409eff;
  color: #fff;
}

.btn-submit:hover:not(:disabled) {
  background: #66b3ff;
}

.btn-submit:disabled {
  background: #c0c4cc;
  cursor: not-allowed;
  opacity: 0.6;
}

@media (min-width: 768px) {
  .upload-form {
    max-width: 500px;
  }
}
</style>