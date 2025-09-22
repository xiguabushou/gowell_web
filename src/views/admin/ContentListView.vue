<template>
  <div class="content-management-container">
    <!-- 搜索与筛选模块 -->
    <div class="search-module">
      <div class="search-container">
        <!-- 类别筛选 -->
        <div class="filter-group">
          <label class="filter-label">类别:</label>
          <el-select
            v-model="selectedCategory"
            class="filter-select"
            placeholder="全部"
            @change="handleSearch"
          >
            <el-option label="全部" value="" />
            <el-option label="视频" value="video" />
            <el-option label="图片" value="photo" />
          </el-select>
        </div>

        <!-- 状态筛选 -->
        <div class="filter-group">
          <label class="filter-label">状态:</label>
          <el-select
            v-model="selectedStatus"
            class="filter-select"
            placeholder="全部"
            @change="handleSearch"
          >
            <el-option label="全部" value="" />
            <el-option label="正常" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </div>

        <!-- 搜索框 -->
        <div class="search-group">
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="请输入标题关键词..."
            class="search-input"
            @keyup.enter="handleSearch"
          />
          <button class="btn btn-search" @click="handleSearch">
            <i class="icon-search"></i>
            搜索
          </button>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-wrapper">
      <div class="loading-text">加载中...</div>
    </div>

    <!-- 空数据状态 -->
    <div v-else-if="contentList.length === 0" class="empty-wrapper">
      <div class="empty-text">暂无内容</div>
    </div>

    <!-- 表格 -->
    <div v-else class="content-table-container">
      <div class="table-wrapper">
        <table class="content-table">
          <thead>
            <tr>
              <th class="col-id">编号</th>
              <th class="col-title">标题</th>
              <th class="col-uid">UID</th>
              <th class="col-category">类别</th>
              <th class="col-status">状态</th>
              <th class="col-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in contentList"
              :key="item.uid || index"
              class="table-row"
            >
              <td class="col-id">{{ index + 1 }}</td>
              <td class="col-title">{{ item.title }}</td>
              <td class="col-uid">{{ item.uid }}</td>
              <td class="col-category">
                <span :class="['badge', getCategoryClass(item.category)]">
                  {{ getCategoryText(item.category) }}
                </span>
              </td>
              <td class="col-status">
                <span :class="['badge', item.status === 'active' ? 'status-active' : 'status-inactive']">
                  {{ item.status === 'active' ? '正常' : '禁用' }}
                </span>
              </td>
              <td class="col-actions">
                <div class="action-buttons">
                  <button class="btn btn-sm btn-edit" @click="doEdit(item)" title="编辑">编辑</button>
                  <button class="btn btn-sm btn-delete" @click="doDelete(item)" title="删除">删除</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 分页 -->
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
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getListByAdmin, deleteContent } from '@/api/content'
import http from '@/request/request'

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const contentList = ref([])
const loading = ref(false)

const selectedCategory = ref('') // '' | 'video' | 'photo'
const selectedStatus = ref('') // '' | 'active' | 'inactive'
const searchKeyword = ref('')

// 已去掉编辑弹窗与提交逻辑

const getCategoryText = (category) => {
  const map = { video: '视频', photo: '图片' }
  return map[category] || '未知'
}

const getCategoryClass = (category) => {
  const map = { video: 'category-video', photo: 'category-photo' }
  return map[category] || 'category-unknown'
}

async function fetchContentList() {
  loading.value = true
  try {
    const typeMap = { '': 0, video: 1, photo: 2 }
    const statusMap = { '': 9, active: 0, inactive: 1 }
    const data = {
      page: currentPage.value,
      page_size: pageSize.value,
      type_id: typeMap[selectedCategory.value] ?? 0,
      freeze: statusMap[selectedStatus.value] ?? 9,
      keyword: searchKeyword.value || '',
    }
    const res = await getListByAdmin(data)
    const apiList = Array.isArray(res?.data?.list) ? res.data.list : []
    contentList.value = apiList.map((item) => {
      const category = item.content_type === '视频' ? 'video' : item.content_type === '图片' ? 'photo' : (typeMap[selectedCategory.value] === 1 ? 'video' : typeMap[selectedCategory.value] === 2 ? 'photo' : '')
      return {
        uid: item.uid || item.uuid || '',
        title: item.title || '',
        category: category || 'video',
        status: item.freeze ? 'inactive' : 'active',
      }
    })
    total.value = Number(res?.data?.total || 0)
  } catch (e) {
    console.error('获取内容列表失败:', e)
    contentList.value = []
    total.value = 0
    ElMessage.error('获取内容列表失败')
  } finally {
    loading.value = false
  }
}

const onPageChange = (newPage) => {
  currentPage.value = newPage
  fetchContentList()
}

const handleSearch = () => {
  currentPage.value = 1
  fetchContentList()
}

const doEdit = (row) => {
  // 仅打印相关信息到控制台
  // 包含：uid、标题、类别、状态
  // 不触发任何编辑弹窗或接口
  // eslint-disable-next-line no-console
  console.log('编辑内容信息：', {
    uid: row.uid,
    title: row.title,
    category: row.category,
    status: row.status,
  })
}

// 已移除提交编辑逻辑

const doDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除内容 "${row.title}" 吗？此操作不可恢复！`,
      '确认删除',
      { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' }
    )
    const res = await deleteContent({ uid: row.uid })
    if (res?.code === 0) {
      ElMessage.success('删除成功！')
    } else {
      ElMessage.error(res?.msg || '删除失败！')
    }
    fetchContentList()
  } catch (e) {
    // 用户取消或异常
  }
}

onMounted(() => {
  fetchContentList()
})
</script>

<style lang="css" scoped>
/* 主容器 */
.content-management-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20px;
  box-sizing: border-box;
}

/* 搜索模块 */
.search-module {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-container {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  white-space: nowrap;
}

.filter-select {
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  background: white;
  cursor: pointer;
  min-width: 120px;
}

.filter-select:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.search-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 300px;
}

.search-input {
  flex: 1;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  border: 1px solid #ddd;
}

.search-input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.btn-search {
  background: #1890ff;
  color: white;
  border-color: #1890ff;
  padding: 8px 16px;
  font-size: 14px;
}

.btn-search:hover {
  background: #40a9ff;
  border-color: #40a9ff;
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

/* 表格容器 */
.content-table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-wrapper {
  overflow-x: auto;
}

.content-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.content-table thead {
  background: #f8f9fa;
}

.content-table th {
  padding: 15px 12px;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #e8e8e8;
  white-space: nowrap;
}

.content-table tbody tr {
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s ease;
}

.content-table tbody tr:hover {
  background-color: #f8f9fa;
}

.content-table td {
  padding: 15px 12px;
  vertical-align: middle;
  border-bottom: 1px solid #f0f0f0;
}

/* 列宽 */
.col-id { width: 80px; }
.col-title { width: 40%; }
.col-uid { width: 40%; }
.col-category { width: 120px; }
.col-status { width: 120px; }
.col-actions { width: 160px; }

/* 徽章 */
.badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.category-video {
  background: #e6f7ff;
  color: #1890ff;
  border: 1px solid #91d5ff;
}

.category-photo {
  background: #fff2e8;
  color: #fa8c16;
  border: 1px solid #ffd591;
}

.category-unknown {
  background: #f5f5f5;
  color: #999;
  border: 1px solid #d9d9d9;
}

.status-active {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.status-inactive {
  background: #fff2f0;
  color: #ff4d4f;
  border: 1px solid #ffccc7;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-primary {
  background: #1890ff;
  color: white;
  border-color: #1890ff;
}

.btn-primary:hover {
  background: #40a9ff;
  border-color: #40a9ff;
}

.btn-sm { padding: 4px 8px; font-size: 11px; }

.btn-edit {
  background: #f0f9ff;
  color: #1890ff;
  border-color: #1890ff;
}

.btn-edit:hover { background: #1890ff; color: white; }

.btn-delete {
  background: #fff2f0;
  color: #ff4d4f;
  border-color: #ff4d4f;
}

.btn-delete:hover { background: #ff4d4f; color: white; }

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  padding: 20px;
  border-radius: 8px;
}

/* Element Plus 分页样式微调 */
::deep(.el-pagination .el-pager li.is-active) { color: #409eff; }
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
::deep(.el-pagination button.is-disabled) { color: #c0c4cc !important; border-color: #ebeef5 !important; }
::deep(.el-pagination .el-input__wrapper) { background: white !important; border: 1px solid #ddd !important; }
::deep(.el-pagination .el-input__inner) { color: #333 !important; }

/* 弹窗 */
.edit-form { padding: 10px 0; }
.form-item { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.form-label { width: 100px; color: #333; font-weight: 500; text-align: right; }
.form-value { flex: 1; color: #333; }
.dialog-select, .dialog-input { flex: 1; padding: 8px 12px; border-radius: 4px; font-size: 14px; color: #333; }
.dialog-input { border: 1px solid #ddd; }
.dialog-footer { display: flex; justify-content: space-between; }

::deep(.centered-dialog-overlay) { display: flex; align-items: center; justify-content: center; }

/* 响应式 */
@media (max-width: 768px) {
  .content-management-container { padding: 10px; }
  .search-container { flex-direction: column; align-items: stretch; gap: 15px; }
  .search-group { min-width: auto; }
  .content-table { font-size: 12px; }
  .content-table th, .content-table td { padding: 10px 8px; }
  .action-buttons { flex-direction: column; gap: 4px; }
  :deep(.el-dialog) { width: 92vw; margin: 0 auto; }
  .form-label { width: 80px; }
}
</style>