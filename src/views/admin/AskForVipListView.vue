<template>
  <div class="ask-for-vip-container">
    <div v-if="loading" class="loading-wrapper">
      <div class="loading-text">加载中...</div>
    </div>
    <div v-else-if="filteredData.length === 0" class="empty-wrapper">
      <div class="empty-text">暂无申请记录</div>
    </div>
    <div v-else class="application-list">
      <div
        v-for="application in filteredData"
        :key="application.id"
        class="application-card"
      >
        <div class="applicant-info">
          <span class="label">申请人:</span>
          <span class="value">{{ application.email }}</span>
        </div>
        <div class="application-time">
          <span class="label">申请时间:</span>
          <span class="value">{{ formatDate(application.CreatedAt) }}</span>
        </div>
        <div class="application-content">
          <div class="content-label">申请内容</div>
          <div class="content-text">{{ application.message }}</div>
        </div>
        <div class="action-buttons">
          <button 
            class="btn btn-agree" 
            :disabled="processingIds.has(application.id)"
            @click="handleApplication(application.id, 'approve')"
          >
            {{ processingIds.has(application.id) ? '处理中...' : '同意' }}
          </button>
          <button 
            class="btn btn-disagree" 
            :disabled="processingIds.has(application.id)"
            @click="handleApplication(application.id, 'reject')"
          >
            {{ processingIds.has(application.id) ? '处理中...' : '不同意' }}
          </button>
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
import { ref, onMounted } from 'vue'
import { getListAboutAskForVip, approvingForVip } from '@/api/user'
import { ElMessage, ElMessageBox } from 'element-plus'

const currentPage = ref(1)
const pageSize = ref(10) // 每页数量
const total = ref(0)
const filteredData = ref([])
const loading = ref(false)
const processingIds = ref(new Set()) // 正在处理的申请ID

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

// 获取申请列表数据
async function fetchApplicationList() {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      page_size: pageSize.value,
    }
    const res = await getListAboutAskForVip(params)
    
    if (res.code === 0 && res.data) {
      total.value = res.data.total || 0
      filteredData.value = res.data.list || []
    } else {
      console.error('获取申请列表失败:', res.msg)
      filteredData.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('请求申请列表出错:', error)
    filteredData.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 分页变化处理
const onPageChange = (newPage) => {
  currentPage.value = newPage
  fetchApplicationList()
}

// 处理申请（同意/不同意）
const handleApplication = async (applicationId, action) => {
  const application = filteredData.value.find(app => app.id === applicationId)
  if (!application) return
  
  // 防止重复提交
  if (processingIds.value.has(applicationId)) {
    return
  }
  
  // 确认操作
  const actionText = action === 'approve' ? '同意' : '拒绝'
  const confirmText = action === 'approve' ? '确定要同意此VIP申请吗？' : '确定要拒绝此VIP申请吗？'
  
  try {
    await ElMessageBox.confirm(
      confirmText,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: action === 'approve' ? 'success' : 'warning',
      }
    )
  } catch {
    // 用户取消操作
    return
  }
  
  // 添加到处理中状态
  processingIds.value.add(applicationId)
  
  try {
    const data = {
      uuid: application.uuid,
      is_pass: action === 'approve'
    }
    
    const res = await approvingForVip(data)
    
    if (res.code === 0) {
      ElMessage.success(`${actionText}成功！`)
      // 审批成功后重新加载列表
      fetchApplicationList()
    } else {
      ElMessage.error(`${actionText}失败: ${res.msg || '未知错误'}`)
    }
  } catch (error) {
    console.error('审批请求出错:', error)
    ElMessage.error(`${actionText}失败: 网络错误`)
  } finally {
    // 移除处理中状态
    processingIds.value.delete(applicationId)
  }
}

// 初始化加载
onMounted(() => {
  fetchApplicationList()
})
</script>

<style lang="css" scoped>
.ask-for-vip-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20px;
  box-sizing: border-box;
}

.application-list {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.application-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.applicant-info,
.application-time {
  margin-bottom: 15px;
  font-size: 14px;
}

.label {
  color: #666;
  margin-right: 8px;
}

.value {
  color: #333;
  font-weight: 500;
}

.application-content {
  margin-bottom: 20px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
}

.content-label {
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
  text-align: center;
}

.content-text {
  color: #555;
  line-height: 1.6;
  font-size: 14px;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  padding-top: 15px;
  border-top: 1px solid #e8e8e8;
}

.btn {
  padding: 8px 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  min-width: 80px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-agree {
  background: #f0f9ff;
  color: #1890ff;
  border-color: #1890ff;
}

.btn-agree:hover {
  background: #1890ff;
  color: white;
}

.btn-disagree {
  background: #fff2f0;
  color: #ff4d4f;
  border-color: #ff4d4f;
}

.btn-disagree:hover {
  background: #ff4d4f;
  color: white;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

/* Element Plus 分页组件样式调整 */
:deep(.el-pagination .el-pager li.is-active) {
  color: #409eff;
}

:deep(.el-pagination button),
:deep(.el-pagination .el-pager li) {
  background-color: white;
  color: #333;
  border: 1px solid #ddd;
}

:deep(.el-pagination button:hover),
:deep(.el-pagination .el-pager li:hover) {
  background-color: #f5f5f5;
  border-color: #409eff;
  color: #409eff;
}

:deep(.el-pagination button.is-disabled) {
  color: #c0c4cc !important;
  border-color: #ebeef5 !important;
}

:deep(.el-pagination .el-input__wrapper) {
  background: white !important;
  border: 1px solid #ddd !important;
}

:deep(.el-pagination .el-input__inner) {
  color: #333 !important;
}

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

@media (min-width: 768px) {
  .ask-for-vip-container {
    padding: 30px;
  }
  
  .application-list {
    max-width: 900px;
  }
}
</style>