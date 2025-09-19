<template>
  <div class="ask-for-vip-container">
    <div class="application-list">
      <div
        v-for="application in filteredData"
        :key="application.id"
        class="application-card"
      >
        <div class="applicant-info">
          <span class="label">申请人:</span>
          <span class="value">{{ application.applicant }}</span>
        </div>
        <div class="application-time">
          <span class="label">申请时间:</span>
          <span class="value">{{ application.applicationTime }}</span>
        </div>
        <div class="application-content">
          <div class="content-label">申请内容</div>
          <div class="content-text">{{ application.content }}</div>
        </div>
        <div class="action-buttons">
          <button 
            class="btn btn-agree" 
            @click="handleApplication(application.id, 'approve')"
          >
            同意
          </button>
          <button 
            class="btn btn-disagree" 
            @click="handleApplication(application.id, 'reject')"
          >
            不同意
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

const currentPage = ref(1)
const pageSize = ref(10) // 每页数量
const total = ref(0)
const filteredData = ref([])

// 本地mock数据
const mockApplications = [
  {
    id: 1,
    applicant: 'zhangsan@qq.com',
    applicationTime: '2025.01.21',
    content: '我希望申请VIP会员，以便享受更多高级功能和更好的服务体验。我承诺遵守平台规则，希望能获得批准。'
  },
  {
    id: 2,
    applicant: 'lisi@qq.com',
    applicationTime: '2025.01.20',
    content: '申请VIP会员，用于商业用途，希望能够获得更多存储空间和优先客服支持。'
  },
  {
    id: 3,
    applicant: 'wangwu@qq.com',
    applicationTime: '2025.01.19',
    content: '个人用户申请VIP，希望能够上传更多高清视频内容，享受无广告观看体验。'
  },
  {
    id: 4,
    applicant: 'zhaoliu@qq.com',
    applicationTime: '2025.01.18',
    content: '企业用户申请VIP，用于团队协作和内容管理，需要更高的存储配额。'
  },
  {
    id: 5,
    applicant: 'chenqi@qq.com',
    applicationTime: '2025.01.17',
    content: '申请VIP会员，希望能够享受更快的上传下载速度和更多的功能权限。'
  },
  {
    id: 6,
    applicant: 'liuba@qq.com',
    applicationTime: '2025.01.16',
    content: '内容创作者申请VIP，需要更大的存储空间和更高质量的视频处理服务。'
  },
  {
    id: 7,
    applicant: 'sunjiu@qq.com',
    applicationTime: '2025.01.15',
    content: '希望申请VIP会员，享受优先客服支持和更多高级功能的访问权限。'
  },
  {
    id: 8,
    applicant: 'zhouyi@qq.com',
    applicationTime: '2025.01.14',
    content: '个人用户申请VIP，主要用于学习和研究目的，希望能够获得更好的服务体验。'
  },
  {
    id: 9,
    applicant: 'wuer@qq.com',
    applicationTime: '2025.01.13',
    content: '申请VIP会员用于商业推广，需要更大的带宽和存储空间支持。'
  },
  {
    id: 10,
    applicant: 'zhengshi@qq.com',
    applicationTime: '2025.01.12',
    content: '内容制作团队申请VIP，需要协作功能和更高的上传限制。'
  },
  {
    id: 11,
    applicant: 'wangshi@qq.com',
    applicationTime: '2025.01.11',
    content: '教育机构申请VIP，用于在线教学和课程内容管理。'
  },
  {
    id: 12,
    applicant: 'fengshi@qq.com',
    applicationTime: '2025.01.10',
    content: '个人申请VIP会员，希望能够享受无广告观看和更快的下载速度。'
  }
]

// 获取申请列表数据
function fetchApplicationList() {
  const startIndex = (currentPage.value - 1) * pageSize.value
  const endIndex = startIndex + pageSize.value
  
  total.value = mockApplications.length
  filteredData.value = mockApplications.slice(startIndex, endIndex)
}

// 分页变化处理
const onPageChange = (newPage) => {
  currentPage.value = newPage
  fetchApplicationList()
}

// 处理申请（同意/不同意）
const handleApplication = (applicationId, action) => {
  const application = mockApplications.find(app => app.id === applicationId)
  if (!application) return
  
  if (action === 'approve') {
    console.log(`同意申请: ${application.applicant}`)
    // 这里可以调用API处理同意逻辑
    // 模拟处理成功后从列表中移除
    const index = mockApplications.findIndex(app => app.id === applicationId)
    if (index > -1) {
      mockApplications.splice(index, 1)
      fetchApplicationList()
    }
  } else if (action === 'reject') {
    console.log(`拒绝申请: ${application.applicant}`)
    // 这里可以调用API处理拒绝逻辑
    // 模拟处理成功后从列表中移除
    const index = mockApplications.findIndex(app => app.id === applicationId)
    if (index > -1) {
      mockApplications.splice(index, 1)
      fetchApplicationList()
    }
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

@media (min-width: 768px) {
  .ask-for-vip-container {
    padding: 30px;
  }
  
  .application-list {
    max-width: 900px;
  }
}
</style>