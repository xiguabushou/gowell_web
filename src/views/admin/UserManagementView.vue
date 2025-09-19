<template>
  <div class="user-management-container">
    <!-- 搜索模块 -->
    <div class="search-module">
      <div class="search-container">
        <!-- 权限筛选 -->
        <div class="filter-group">
          <label class="filter-label">权限:</label>
          <el-select v-model="selectedRole" class="filter-select" placeholder="全部" @change="handleSearch">
            <el-option label="全部" value="" />
            <el-option label="用户" value="user" />
            <el-option label="会员" value="member" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </div>

        <!-- 状态筛选 -->
        <div class="filter-group">
          <label class="filter-label">状态:</label>
          <el-select v-model="selectedStatus" class="filter-select" placeholder="全部" @change="handleSearch">
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
            placeholder="请输入邮箱或用户名搜索..." 
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
    <div v-else-if="userList.length === 0" class="empty-wrapper">
      <div class="empty-text">暂无用户数据</div>
    </div>

    <!-- 主要内容：用户列表表格 -->
    <div v-else class="user-table-container">
      <!-- 用户数据表格 -->
      <div class="table-wrapper">
        <table class="user-table">
          <!-- 表格标题行 -->
          <thead>
            <tr>
              <th class="col-id">ID</th>
              <th class="col-email">邮箱</th>
              <th class="col-role">权限</th>
              <th class="col-created">注册时间</th>
              <th class="col-status">状态</th>
              <th class="col-actions">操作</th>
            </tr>
          </thead>
          <!-- 表格数据行 -->
          <tbody>
            <tr v-for="(user, index) in userList" :key="index" class="table-row">
              <td class="col-id">{{ index + 1 }}</td>
              <td class="col-email">{{ user.email }}</td>
              <td class="col-role">
                <span :class="['role-badge', getRoleClass(user.role)]">
                  {{ getRoleText(user.role) }}
                </span>
              </td>
              <td class="col-created">{{ formatDate(user.created_at) }}</td>
              <td class="col-status">
                <span :class="['status-badge', user.status === 'active' ? 'status-active' : 'status-inactive']">
                  {{ user.status === 'active' ? '正常' : '禁用' }}
                </span>
              </td>
              <td class="col-actions">
                <div class="action-buttons">
                  <button 
                    class="btn btn-sm btn-edit" 
                    @click="doEditUser(user)"
                    title="编辑用户"
                  >
                    编辑
                  </button>
                  <button 
                    class="btn btn-sm btn-delete" 
                    @click="doDeleteUser(user)"
                    title="删除用户"
                  >
                    删除
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 分页组件 -->
    <div class="pagination-wrapper">
      <el-pagination
        layout="prev, pager, next, jumper"
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        @current-change="onPageChange"
      />
    </div>

    <!-- 编辑用户弹窗 -->
    <el-dialog 
      v-model="showEditDialog" 
      title="编辑用户" 
      width="520px" 
      :close-on-click-modal="false" 
      align-center 
      append-to-body 
      modal-class="centered-dialog-overlay"
    >
      <div class="edit-form">
        <div class="form-item">
          <label class="form-label">邮箱：</label>
          <div class="form-value">{{ editForm.email }}</div>
        </div>
        <div class="form-item">
          <label class="form-label">创建时间：</label>
          <div class="form-value">{{ formatDate(editForm.created_at) }}</div>
        </div>
        <div class="form-item">
          <label class="form-label">最近更新时间：</label>
          <div class="form-value">{{ formatDate(editForm.updated_at) }}</div>
        </div>
        <div class="form-item">
          <label class="form-label">权限：</label>
          <el-select v-model="editForm.role" class="dialog-select" placeholder="请选择">
            <el-option label="用户" value="user" />
            <el-option label="会员" value="member" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </div>
        <div class="form-item">
          <label class="form-label">状态：</label>
          <el-select v-model="editForm.status" class="dialog-select" placeholder="请选择">
            <el-option label="正常" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </div>
        <div class="form-item">
          <label class="form-label">密码：</label>
          <input v-model="editForm.password" type="password" class="dialog-input" placeholder="如需重置请输入新密码" />
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <button class="btn" @click="showEditDialog = false">取消</button>
          <button class="btn btn-primary" @click="submitEdit">提交</button>
        </div>
      </template>
    </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserList, deleteUser, editUser } from '@/api/user'

// 响应式数据
const currentPage = ref(1)
const pageSize = ref(10) // 每页显示数量
const total = ref(0)
const userList = ref([])
const loading = ref(false)

// 搜索相关数据
const selectedRole = ref('') // 选中的权限
const selectedStatus = ref('') // 选中的状态
const searchKeyword = ref('') // 搜索关键词

// 编辑弹窗
const showEditDialog = ref(false)
const editForm = ref({
  uuid: '',
  email: '',
  created_at: '',
  updated_at: '',
  role: 'user',
  status: 'active',
  password: ''
})

// 格式化日期函数
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// 获取权限文本
const getRoleText = (role) => {
  const roleMap = {
    'user': '用户',
    'member': '会员',
    'admin': '管理员'
  }
  return roleMap[role] || '未知'
}

// 获取权限样式类
const getRoleClass = (role) => {
  const classMap = {
    'user': 'role-user',
    'member': 'role-member',
    'admin': 'role-admin'
  }
  return classMap[role] || 'role-unknown'
}

// 获取用户列表数据（调用后端接口）
async function fetchUserList() {
  loading.value = true
  try {
    // 将前端筛选条件映射为后端参数
    const roleMap = { '': '9', 'user': '0', 'member': '1', 'admin': '2' }
    const statusMap = { '': '9', 'active': '0', 'inactive': '1' }

    const params = {
      page: String(currentPage.value),
      page_size: String(pageSize.value),
      role_id: roleMap[selectedRole.value] ?? '9',
      is_freeze: statusMap[selectedStatus.value] ?? '9',
      search: searchKeyword.value || ''
    }

    const res = await getUserList(params)

    if (res && res.code === 0 && res.data) {
      const apiList = Array.isArray(res.data.list) ? res.data.list : []
      const mapRole = { 0: 'user', 1: 'member', 2: 'admin' }
      // 适配后端字段到表格所需字段
      userList.value = apiList.map(item => ({
        uuid: item.uuid,
        email: item.email,
        role: mapRole[item.role_id] ?? 'user',
        created_at: item.CreatedAt,
        updated_at: item.UpdatedAt,
        status: item.freeze ? 'inactive' : 'active'
      }))
      total.value = Number(res.data.total || 0)
    } else {
      console.error('获取用户列表失败:', res?.msg)
      userList.value = []
      total.value = 0
      if (res?.msg) ElMessage.error(res.msg)
    }
  } catch (error) {
    console.error('请求用户列表出错:', error)
    userList.value = []
    total.value = 0
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 分页变化处理
const onPageChange = (newPage) => {
  currentPage.value = newPage
  fetchUserList()
}

// 搜索处理函数
const handleSearch = () => {
  currentPage.value = 1 // 重置到第一页
  fetchUserList()
}

// 编辑用户
const doEditUser = (user) => {
  editForm.value = {
    uuid: user.uuid,
    email: user.email,
    created_at: user.created_at,
    updated_at: user.updated_at,
    role: user.role,
    status: user.status,
    password: ''
  }
  showEditDialog.value = true
}

const submitEdit = async () => {
  let roleId 
  let freeze 
  if (editForm.value.role == 'admin'){
    roleId = 2
  }else if(editForm.value.role == 'member'){
    roleId = 1
  }else{
    roleId = 0
  }

  if (editForm.value.status == 'active'){
    freeze = false
  }else{
    freeze = true
  }


  const data = {
    uuid: editForm.value.uuid,
    role_id:roleId,
    freeze:freeze,
    password:editForm.value.password
  }
  // try{
  const res = await editUser(data)
  if (res.code == 0){
        ElMessage.success('提交成功')
        showEditDialog.value = false
        fetchUserList()
    }else{
        ElMessage.error(res.msg)
    }
  // }catch{
  //   ElMessage.error("提交失败！")
  // }
}

// 删除用户
const doDeleteUser = async (user) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${user.email}" 吗？此操作不可恢复！`,
      '确认删除',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    const res = await deleteUser({id: user.uuid})
    if (res.code == 0){
        ElMessage.success("删除成功！")
    }else{
        ElMessage.error("删除失败！")
    }

    fetchUserList()
  } catch {
    ElMessage.error("删除失败")
  }
}

// 组件挂载时加载数据
onMounted(() => {
  fetchUserList()
})
</script>

<style lang="css" scoped>
/* 主容器样式 */
.user-management-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20px;
  box-sizing: border-box;
}

/* 搜索模块样式 */
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
  min-width: 100px;
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

/* 加载和空状态样式 */
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

/* 表格容器样式 */
.user-table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 表格头部样式已移除 */

/* 表格样式 */
.table-wrapper {
  overflow-x: auto;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

/* 表格标题行样式 */
.user-table thead {
  background: #f8f9fa;
}

.user-table th {
  padding: 15px 12px;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #e8e8e8;
  white-space: nowrap;
}

/* 表格数据行样式 */
.user-table tbody tr {
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s ease;
}

.user-table tbody tr:hover {
  background-color: #f8f9fa;
}

.user-table td {
  padding: 15px 12px;
  vertical-align: middle;
  border-bottom: 1px solid #f0f0f0;
}

/* 列宽设置 */
.col-id { width: 80px; }
.col-email { width: 200px; }
.col-username { width: 120px; }
.col-role { width: 100px; }
.col-created { width: 150px; }
.col-status { width: 100px; }
.col-actions { width: 150px; }

/* 徽章样式 */
.role-badge,
.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

/* 权限徽章样式 */
.role-user {
  background: #f5f5f5;
  color: #666;
  border: 1px solid #d9d9d9;
}

.role-member {
  background: #e6f7ff;
  color: #1890ff;
  border: 1px solid #91d5ff;
}

.role-admin {
  background: #fff2e8;
  color: #fa8c16;
  border: 1px solid #ffd591;
}

.role-unknown {
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

/* 操作按钮样式 */
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

.btn-sm {
  padding: 4px 8px;
  font-size: 11px;
}

.btn-edit {
  background: #f0f9ff;
  color: #1890ff;
  border-color: #1890ff;
}

.btn-edit:hover {
  background: #1890ff;
  color: white;
}

.btn-delete {
  background: #fff2f0;
  color: #ff4d4f;
  border-color: #ff4d4f;
}

.btn-delete:hover {
  background: #ff4d4f;
  color: white;
}

/* 分页样式 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  padding: 20px;
  border-radius: 8px;
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

/* 编辑弹窗样式 */
.edit-form {
  padding: 10px 0;
}

.form-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.form-label {
  width: 100px;
  color: #333;
  font-weight: 500;
  text-align: right;
}

.form-value {
  flex: 1;
  color: #333;
}

.dialog-select {
  flex: 1;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
}

.dialog-input{
    flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  color: #333;  
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
}

/* 弹窗通用适配 */
:deep(.el-dialog) {
  width: min(520px, 92vw) !important;
  max-width: 92vw;
}

:deep(.el-dialog__body) {
  max-height: 70vh;
  overflow: auto;
}

/* 覆盖层改为Flex居中，确保移动端垂直居中 */
:deep(.centered-dialog-overlay) {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-management-container {
    padding: 10px;
  }
  
  .search-container {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
  
  .filter-group {
    justify-content: space-between;
  }
  
  .search-group {
    min-width: auto;
  }
  
  .user-table {
    font-size: 12px;
  }
  
  .user-table th,
  .user-table td {
    padding: 10px 8px;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }

  /* 弹窗在移动端的自适配 */
  :deep(.el-dialog) {
    width: 92vw !important;
    margin: 0 auto;
  }

  .form-item {
    align-items: stretch;
  }

  .form-label {
    width: 80px;
  }

  .dialog-select, .dialog-input, .form-value {
    width: 100%;
  }
}
</style>