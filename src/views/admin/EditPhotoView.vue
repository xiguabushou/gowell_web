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
        <label class="form-label">标签:</label>
        <input 
          v-model="formData.tags" 
          type="text" 
          class="form-input"
          placeholder="请输入标签，用逗号分隔"
        />
      </div>

      <!-- 封面上传区域 -->
      <div class="upload-area">
        <!-- 加载状态 -->
        <div v-if="isLoading" class="loading-placeholder">
          加载中...
        </div>
        <!-- 现有封面显示 -->
        <div 
          v-else-if="formData.cover" 
          class="cover-preview"
          @click="triggerCoverUpload"
        >
          <img 
            :src="formData.cover" 
            alt="图集封面" 
            class="existing-cover"
          />
          <div class="cover-overlay">
            <span class="overlay-text">点击重新上传封面</span>
          </div>
        </div>
        <!-- 上传占位符 -->
        <div 
          v-else 
          class="upload-placeholder"
          @click="triggerCoverUpload"
        >
          上传封面
        </div>
        <input 
          ref="coverInput"
          type="file"
          accept="image/*"
          style="display: none"
          @change="handleCoverUpload"
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
          保存修改
        </button>
      </div>
    </div>

    <!-- 图片列表区域 -->
    <div class="image-list-container">
      <div class="image-list-header">
        <h3>图片列表</h3>
        <button class="btn btn-primary" @click="handleUploadImage">
          <i class="icon-plus"></i>
          上传图片
        </button>
      </div>

      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-wrapper">
        <div class="loading-text">加载中...</div>
      </div>

      <!-- 空数据状态 -->
      <div v-else-if="formData.images.length === 0" class="empty-wrapper">
        <div class="empty-text">暂无图片</div>
      </div>

      <!-- 图片列表 -->
      <div v-else class="image-list">
        <div 
          v-for="(image, index) in paginatedImages" 
          :key="index" 
          class="image-item"
        >
          <img :src="image" alt="图片" class="image-preview" />
          <button @click="handleDeleteImage(index)" class="btn btn-delete">删除</button>
        </div>
      </div>
      
      <!-- 分页组件 -->
      <div v-if="formData.images.length > 0" class="pagination-wrapper">
        <el-pagination
          layout="prev, pager, next, jumper"
          :current-page="currentPage"
          :page-size="pageSize"
          :total="totalImages"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getEditPhotoInfo, editContentPhotoInfo, uploadContentPhoto, deleteContentPhoto } from '@/api/content'

const route = useRoute()
const router = useRouter()

// 表单数据
const formData = reactive({
  uid: '',
  title: '',
  tags: '',
  cover: '',
  images: []
})

// 分页相关
const currentPage = ref(1)
const pageSize = ref(8)
const totalImages = ref(0)
const isLoading = ref(false)

// 封面相关
const coverInput = ref(null)

// 计算属性
const canSubmit = computed(() => {
  return formData.title.trim() && 
         formData.tags.trim() && 
         formData.cover
})

// 直接使用后端返回的图片数组
const paginatedImages = computed(() => {
  return formData.images
})

// 获取编辑数据
const fetchEditData = async () => {
  const uid = route.params.uid
  if (!uid) {
    ElMessage.error('缺少图集ID参数')
    router.go(-1)
    return
  }

  isLoading.value = true
  try {
    const params = {
      uid: uid,
      page: currentPage.value,
      page_size: pageSize.value
    }
    
    const response = await getEditPhotoInfo(params)
    if (response.code === 0) {
      const data = response.data
      formData.uid = data.uid
      formData.title = data.title || ''
      formData.tags = data.tags || ''
      formData.cover = data.cover || ''
      // 处理images可能为null的情况
      formData.images = data.images || []
      totalImages.value = data.total || 0
    } else {
      ElMessage.error(response.msg || '获取数据失败')
    }
  } catch (error) {
    console.error('获取编辑数据失败:', error)
    ElMessage.error('获取数据失败')
  } finally {
    isLoading.value = false
  }
}

// 触发封面上传
const triggerCoverUpload = () => {
  coverInput.value?.click()
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
  if (file.size > 50 * 1024 * 1024) {
    ElMessage.error('图片文件大小不能超过50MB')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    formData.cover = e.target.result
  }
  reader.readAsDataURL(file)
}

// 处理删除图片
const handleDeleteImage = async (index) => {
  const imageUrl = formData.images[index]
  
  // 从图片URL中提取image_id（.png前的部分）
  const imageId = extractImageId(imageUrl)
  
  if (!imageId) {
    ElMessage.error('无法获取图片ID')
    return
  }

  try {
    // 调用删除图片API
    const response = await deleteContentPhoto({
      uid: formData.uid,
      image_id: imageId
    })

    if (response.code === 0) {
      ElMessage.success('图片删除成功')
      
      // 删除成功后重新获取当前页数据
      await fetchEditData()
      
      // 如果当前页没有图片了，回到上一页
      if (formData.images.length === 0 && currentPage.value > 1) {
        currentPage.value -= 1
        await fetchEditData()
      }
    } else {
      ElMessage.error(response.msg || '删除图片失败')
    }
  } catch (error) {
    console.error('删除图片失败:', error)
    ElMessage.error('删除图片失败，请稍后重试')
  }
}

// 处理上传新图片
const handleUploadImage = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.multiple = true
  input.onchange = async (event) => {
    const files = Array.from(event.target.files)
    
    if (files.length === 0) return

    // 验证所有文件
    for (const file of files) {
      if (!file.type.includes('image/')) {
        ElMessage.error(`${file.name} 不是有效的图片文件`)
        return
      }

      if (file.size > 50 * 1024 * 1024) {
        ElMessage.error(`${file.name} 文件大小不能超过50MB`)
        return
      }
    }

    try {
      // 创建FormData对象
      const formDataToSend = new FormData()
      formDataToSend.append('uid', formData.uid)
      
      // 添加所有图片文件
      files.forEach(file => {
        formDataToSend.append('photo', file)
      })

      // 调用上传图片API
      const response = await uploadContentPhoto(formDataToSend)

      if (response.code === 0) {
        ElMessage.success(`成功上传 ${files.length} 张图片`)
        
        // 上传成功后，重新获取图集数据以更新图片列表
        await fetchEditData()
      } else {
        ElMessage.error(response.msg || '上传图片失败')
      }
    } catch (error) {
      console.error('上传图片失败:', error)
      ElMessage.error('上传图片失败，请稍后重试')
    }
  }
  input.click()
}

// 处理当前页变更
const handleCurrentChange = (newPage) => {
  currentPage.value = newPage
  // 重新请求数据，因为是后端分页
  fetchEditData()
}

// 处理提交
const handleSubmit = async () => {
  if (!canSubmit.value) return

  try {
    // 显示加载状态
    const submitBtn = document.querySelector('.btn-submit')
    const originalText = submitBtn.textContent
    submitBtn.textContent = '保存中...'
    submitBtn.disabled = true

    // 创建FormData对象
    const formDataToSend = new FormData()
    
    // 添加基本参数
    formDataToSend.append('uid', formData.uid)
    formDataToSend.append('title', formData.title.trim())
    formDataToSend.append('tags', formData.tags.trim())
    
    // 检查是否需要重新上传封面
    // 如果封面是base64格式（新上传的），则添加封面文件
    if (formData.cover && formData.cover.startsWith('data:image/')) {
      // 将base64转换为blob
      const coverBlob = await dataURLToBlob(formData.cover)
      formDataToSend.append('cover', coverBlob, 'cover.jpg')
    }
    // 如果封面是URL格式（原有的），则不传cover参数

    // 调用修改图集信息接口
    const response = await editContentPhotoInfo(formDataToSend)
    
    if (response.code === 0) {
      ElMessage.success('图集修改成功！')
      handleCancel()
    } else {
      ElMessage.error(response.msg || '修改失败')
    }
  } catch (error) {
    console.error('修改图集失败:', error)
    ElMessage.error(`修改失败: ${error.message || '网络错误'}`)
  } finally {
    // 恢复按钮状态
    const submitBtn = document.querySelector('.btn-submit')
    if (submitBtn) {
      submitBtn.textContent = '保存修改'
      submitBtn.disabled = false
    }
  }
}

// 处理取消
const handleCancel = () => {
  router.go(-1)
}

// 从图片URL中提取image_id（.png前的部分）
const extractImageId = (imageUrl) => {
  try {
    // 获取URL路径部分
    const url = new URL(imageUrl)
    const pathname = url.pathname
    
    // 找到最后一个斜杠和.png之间的部分
    const lastSlashIndex = pathname.lastIndexOf('/')
    const filename = pathname.substring(lastSlashIndex + 1)
    
    // 找到.png的位置并提取前面的部分
    const pngIndex = filename.indexOf('.png')
    if (pngIndex > 0) {
      return filename.substring(0, pngIndex)
    }
    
    return null
  } catch (error) {
    console.error('提取图片ID失败:', error)
    return null
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

// 组件挂载时获取数据
onMounted(() => {
  fetchEditData()
})
</script>

<style lang="css" scoped>
.upload-container {
  min-height: calc(100vh - 56px);
  background: #f5f5f5;
  padding: 20px;
  box-sizing: border-box;
}



.upload-form {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  width: 100%;
  box-sizing: border-box;
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

.loading-placeholder {
  color: #666;
  font-size: 16px;
  font-weight: 500;
}

.cover-preview {
  width: 100%;
  height: 200px;
  position: relative;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
}

.existing-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  border-radius: 8px;
}

.cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 8px;
}

.cover-preview:hover .cover-overlay {
  opacity: 1;
}

.overlay-text {
  color: white;
  font-size: 16px;
  font-weight: 500;
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

.btn-primary {
  background: #409eff;
  color: white;
  border: 1px solid #409eff;
  padding: 8px 16px;
  font-size: 14px;
}

.btn-primary:hover {
  background: #66b1ff;
  border-color: #66b1ff;
}

.btn-delete {
  background: #f56c6c;
  color: white;
  border: 1px solid #f56c6c;
  padding: 6px 12px;
  font-size: 12px;
}

.btn-delete:hover {
  background: #f78989;
  border-color: #f78989;
}

/* 图片列表容器 */
.image-list-container {
  max-width: 800px;
  margin: 20px auto 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
}

.image-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
}

.image-list-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

/* 加载与空状态 */
.loading-wrapper,
.empty-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  text-align: center;
}

.loading-text,
.empty-text {
  font-size: 16px;
  color: #666;
  padding: 20px;
}

/* 图片列表 */
.image-list {
  padding: 20px 30px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.image-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  background: #fafafa;
  transition: all 0.3s ease;
}

.image-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.image-preview {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 10px;
}

/* 分页样式 - 与ContentListView保持一致 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding: 20px 30px;
  border-top: 1px solid #e0e0e0;
  background: #f8f9fa;
}

/* Element Plus 分页样式微调 */
::deep(.el-pagination .el-pager li.is-active) {
  color: #409eff;
}

::deep(.el-pagination button),
::deep(.el-pagination .el-pager li) {
  background-color: white;
  color: #333;
  border: 1px solid #ddd;
}

::deep(.el-pagination button:hover),
::deep(.el-pagination .el-pager li:hover) {
  background-color: #f5f5f5;
  border-color: #409eff;
  color: #409eff;
}

::deep(.el-pagination button.is-disabled) {
  color: #c0c4cc !important;
  border-color: #ebeef5 !important;
}

::deep(.el-pagination .el-input__wrapper) {
  background: white !important;
  border: 1px solid #ddd !important;
}

::deep(.el-pagination .el-input__inner) {
  color: #333 !important;
}

@media (min-width: 768px) {
  .upload-form {
    max-width: 800px;
  }
}

@media (max-width: 768px) {
  .upload-container {
    padding: 10px;
  }

  .upload-form {
    padding: 20px;
  }

  .image-list-container {
    margin: 10px auto 0;
  }

  .image-list-header {
    padding: 15px 20px;
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }

  .image-list {
    padding: 15px 20px;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
  }

  .pagination-wrapper {
    padding: 15px 20px;
  }
}
</style>