<template>
    <div class="vip-apply-page">
        <div class="status-card">
            <div class="status-text">
                你还不是VIP用户
            </div>
            <button class="primary-btn"  @click="dialogVisible = true">
                申请成为VIP
            </button>
        </div>

        <el-dialog v-model="dialogVisible" title="申请信息" :width="dialogWidth" :close-on-click-modal="false" align-center
            append-to-body>
            <div class="dialog-body">
                <div class="form-item">
                    <label class="form-label">邮箱：</label>
                    <div class="form-value">{{ userEmail }}</div>
                </div>
                <div class="form-item form-item-col">
                    <label class="form-label">申请内容：</label>
                    <el-input v-model="message" type="textarea" :rows="5" maxlength="500" show-word-limit
                        placeholder="请填写申请理由（不超过500字）" />
                </div>
            </div>
            <template #footer>
                <div class="dialog-footer">
                    <button class="btn" @click="dialogVisible = false">取消</button>
                    <button class="btn btn-primary" :disabled="submitting" @click="submit">
                        {{ submitting ? '提交中...' : '提交' }}
                    </button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import store from '@/store'
import { askForVip } from '@/api/user'
import { ping } from '@/api/base'
import { ElMessage } from 'element-plus'

const dialogVisible = ref(false)
const message = ref('')
const submitting = ref(false)

const userEmail = computed(() => store.getters.userInfo?.email ?? '未知邮箱')
const userUuid = computed(() => store.getters.userInfo?.uuid ?? '')

const dialogWidth = computed(() => {
    const w = window.innerWidth
    return w < 520 ? '92%' : '480px'
})

const submit = async () => {
    if (!message.value || message.value.trim().length < 5) {
        ElMessage.warning('请至少填写5个字的申请内容')
        return
    }
    try {
        submitting.value = true
        const payload = {
            uuid: userUuid.value,
            email: store.getters.userInfo?.email ?? '',
            message: message.value.trim()
        }
        const res = await askForVip(payload)
        if (res && res.code === 0) {
            ElMessage.success('提交成功，等待管理员审核')
            dialogVisible.value = false
            message.value = ''
        } else {
            ElMessage.error(res?.msg || '提交失败')
        }
    } catch (e) {
        ElMessage.error('网络错误，稍后重试')
    } finally {
        submitting.value = false
    }
}

const doPing = async() => {
    await ping()
}

doPing()

</script>

<style lang="css" scoped>
.vip-apply-page {
    min-height: 80vh;
    display: flex;
    align-items: flex-start;
    justify-content: space-around;
    padding: 24px;
}

.status-card {
    width: 360px;
    height: 520px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 24px;
}

.status-text {
    font-size: 20px;
    color: white;
}

.primary-btn {
    padding: 10px 18px;
    border: 1px solid #333;
    border-radius: 6px;
    background: #409EFF;
    cursor: pointer;
}

.primary-btn:disabled {
    opacity: .6;
    cursor: not-allowed;
}

.dialog-body {
    padding: 8px 4px;
}

.form-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
}

.form-item-col {
    align-items: flex-start;
    flex-direction: column;
}

.form-label {
    width: 90px;
    color: #333;
}

.form-value {
    color: #333;
}

.dialog-footer {
    display: flex;
    justify-content: space-between;
}

.btn {
    padding: 6px 14px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: #fff;
    cursor: pointer;
}

.btn-primary {
    background: #1890ff;
    color: #fff;
    border-color: #1890ff;
}

@media (max-width: 768px) {
    .vip-apply-page {
        flex-direction: column;
        align-items: center;
        gap: 16px;
    }

    .status-card {
        width: 92%;
        height: 420px;
    }
}
</style>