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

      <!-- 封面上传区域 -->
      <div class="upload-area">
        <div 
          v-if="!coverFile" 
          class="upload-placeholder"
          @click="triggerCoverUpload"
        >
          上传封面
        </div>
        <div 
          v-else 
          class="cover-preview"
          @click="triggerCoverUpload"
        >
          <img 
            :src="coverUrl" 
            class="preview-image"
            alt="封面预览"
          />
          <div class="image-info">
            <span class="image-name">{{ coverFile.name }}</span>
          </div>
        </div>
        <input 
          ref="coverInput"
          type="file"
          accept="image/*"
          style="display: none"
          @change="handleCoverUpload"
        />
      </div>

      <!-- 图片上传区域 -->
      <div class="upload-area">
        <div 
          v-if="imageFiles.length === 0" 
          class="upload-placeholder"
          @click="triggerImageUpload"
        >
          上传图片
        </div>
        <div 
          v-else 
          class="images-preview"
          @click="triggerImageUpload"
        >
          <div class="images-grid">
            <div 
              v-for="(image, index) in imageFiles" 
              :key="index"
              class="image-item"
            >
              <img 
                :src="image.url" 
                class="preview-image"
                :alt="`图片${index + 1}`"
              />
              <button 
                class="remove-btn"
                @click.stop="removeImage(index)"
              >
                ×
              </button>
            </div>
            <div class="add-more">
              <span>+ 添加更多</span>
            </div>
          </div>
        </div>
        <input 
          ref="imageInput"
          type="file"
          accept="image/*"
          multiple
          style="display: none"
          @change="handleImageUpload"
        />
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { uploadPhoto } from '@/api/content/UploadPhoto'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 表单数据
const formData = ref({
  title: '',
  tags: ''
})

// 封面相关
const coverFile = ref(null)
const coverUrl = ref('')
const coverInput = ref(null)

// 图片相关
const imageFiles = ref([])
const imageInput = ref(null)

// 计算属性
const canSubmit = computed(() => {
  return formData.value.title.trim() && 
         formData.value.tags.trim() && 
         coverFile.value && 
         imageFiles.value.length > 0
})

// 触发封面上传
const triggerCoverUpload = () => {
  coverInput.value?.click()
}

// 触发图片上传
const triggerImageUpload = () => {
  imageInput.value?.click()
}

// 处理封面上传
const handleCoverUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // 检查文件格式
  if (!file.type.includes('image/')) {
    ElMessage.error('只能上传图片文件')
    return
  }

  // 检查文件大小（限制为10MB）
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.error('封面图片大小不能超过10MB')
    return
  }

  // 清理之前的封面
  if (coverUrl.value) {
    URL.revokeObjectURL(coverUrl.value)
  }

  coverFile.value = file
  coverUrl.value = URL.createObjectURL(file)
}

// 处理图片上传
const handleImageUpload = (event) => {
  const files = Array.from(event.target.files)
  if (files.length === 0) return

  // 检查文件格式和大小
  for (const file of files) {
    if (!file.type.includes('image/')) {
      ElMessage.error('只能上传图片文件')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      ElMessage.error('图片文件大小不能超过10MB')
      return
    }
  }

  // 添加新图片
  files.forEach(file => {
    imageFiles.value.push({
      file: file,
      url: URL.createObjectURL(file)
    })
  })

  // 清空input以便可以重复选择相同文件
  event.target.value = ''
}

// 移除图片
const removeImage = (index) => {
  const image = imageFiles.value[index]
  if (image && image.url) {
    URL.revokeObjectURL(image.url)
  }
  imageFiles.value.splice(index, 1)
}

// 取消操作
const handleCancel = () => {
  // 清理资源
  if (coverUrl.value) {
    URL.revokeObjectURL(coverUrl.value)
  }
  imageFiles.value.forEach(image => {
    if (image.url) {
      URL.revokeObjectURL(image.url)
    }
  })
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
    
    // 添加封面文件
    formDataToSend.append('cover', coverFile.value)
    
    // 添加图片文件
    imageFiles.value.forEach((image, index) => {
      formDataToSend.append('photo', image.file)
    })

    // 显示加载状态
    const submitBtn = document.querySelector('.btn-submit')
    const originalText = submitBtn.textContent
    submitBtn.textContent = '上传中...'
    submitBtn.disabled = true

    // 调用API
    const response = await uploadPhoto(formDataToSend)
    
    if (response.code === 0) {
      ElMessage.success('图片上传成功！')
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
</script>

<style lang="css" scoped>
.upload-container {
  min-height: 100vh;
  background: #121212;
  padding: 20px;
  box-sizing: border-box;
}

.upload-form {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  color: #e0e0e0;
  font-size: 16px;
  font-weight: 500;
}

.form-input {
  padding: 12px 16px;
  background: #2d2d2d;
  border: 1px solid #444;
  border-radius: 8px;
  color: #e0e0e0;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s;
}

.form-input:focus {
  border-color: #409eff;
}

.form-input::placeholder {
  color: #666;
}

.upload-area {
  border: 2px dashed #444;
  border-radius: 12px;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.3s;
}

.upload-area:hover {
  border-color: #666;
}

.upload-placeholder {
  color: #e0e0e0;
  font-size: 18px;
  font-weight: 500;
}

.cover-preview {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.images-preview {
  width: 100%;
  height: 100%;
  padding: 16px;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
}

.image-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  transition: background 0.3s;
}

.remove-btn:hover {
  background: rgba(255, 0, 0, 0.8);
}

.add-more {
  aspect-ratio: 1;
  border: 2px dashed #666;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.add-more:hover {
  border-color: #409eff;
  color: #409eff;
}

.image-info {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.image-name {
  color: #e0e0e0;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  word-break: break-all;
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
  background: #2d2d2d;
  color: #e0e0e0;
  border: 1px solid #444;
}

.btn-cancel:hover {
  background: #3d3d3d;
  border-color: #666;
}

.btn-submit {
  background: #409eff;
  color: #fff;
}

.btn-submit:hover:not(:disabled) {
  background: #66b3ff;
}

.btn-submit:disabled {
  background: #666;
  cursor: not-allowed;
  opacity: 0.6;
}

@media (min-width: 768px) {
  .upload-form {
    max-width: 500px;
  }
}
</style>