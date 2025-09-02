<template>
    <div class="reset-container">
        <div v-if="!passwordResetSuccess" class="reset-card">
            <h2 class="title">修改密码</h2>
            <el-form :model="resetForm" :rules="rules" ref="resetFormRef" class="reset-form" label-position="top">
                <!-- 密码 -->
                <el-form-item label="密码" prop="password">
                    <el-input v-model="resetForm.password" type="password" placeholder="请输入密码" show-password clearable
                        size="large" />
                </el-form-item>
                <!-- 确认密码 -->
                <el-form-item label="确认密码" prop="confirmPassword">
                    <el-input v-model="resetForm.confirmPassword" type="password" placeholder="请再次输入密码" show-password
                        clearable size="large" />
                </el-form-item>
                <!-- 提交按钮 -->
                <el-form-item>
                    <el-button type="primary" size="large" @click="handleResetPassword" class="reset-btn"
                        :loading="loading">
                        提交
                    </el-button>
                </el-form-item>
            </el-form>
        </div>
        <div v-else class="success-message">
            <h2>你已成功修改密码</h2>
            <p>请使用新密码登录。</p>
            <el-button type="primary" @click="goToLogin">前往登录</el-button>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';
import { resetForgotPassword } from '@/api/user/ResetForgotPassword';

const router = useRouter();
const route = useRoute();

const resetFormRef = ref();
let token = "";
const resetForm = reactive({
    password: '',
    confirmPassword: '',
});
const loading = ref(false);
const passwordResetSuccess = ref(false);

onMounted(() => {
    token = route.query.token;
    console.log('Token:', token);
});

// 密码确认验证
const validateConfirmPassword = (rule, value, callback) => {
    if (value === '') {
        callback(new Error('请再次输入密码'));
    } else if (value !== resetForm.password) {
        callback(new Error('两次输入密码不一致'));
    } else {
        callback();
    }
};

const rules = reactive({
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
    ],
    confirmPassword: [
        { required: true, validator: validateConfirmPassword, trigger: 'blur' }
    ],
});

const handleResetPassword = () => {
    resetFormRef.value.validate((valid) => {
        if (valid) {
            loading.value = true;

            const data = {
                token: token,
                new_password: resetForm.password
            };
            resetForgotPassword(data).then(res => {
                if (res.code == "0") {
                    loading.value = false;
                    ElMessage.success('密码修改成功');
                    passwordResetSuccess.value = true;
                } else {
                    loading.value = false;
                    ElMessage.error('密码修改失败，该链接可能已经失效！');
                }
            });
        } else {
            ElMessage.error('请检查输入信息');
        }
    });
};

const goToLogin = () => {
    router.push('/login');
};
</script>

<style scoped>
.reset-container {
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #121212;
    color: #e0e0e0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    padding: 20px;
    box-sizing: border-box;
}

.reset-card {
    width: 90%;
    max-width: 450px;
    padding: 30px 20px;
    background-color: #1e1e1e;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    border: 1px solid #333;
}

.title {
    text-align: center;
    margin-bottom: 24px;
    color: #bbdefb;
    font-weight: 600;
    font-size: 1.5em;
}

.reset-form .el-form-item__label {
    color: #e0e0e0 !important;
}

.reset-form .el-input__wrapper {
    background: #2d2d2d !important;
    border: 1px solid #444 !important;
    border-radius: 8px !important;
}

.reset-form .el-input__wrapper:hover,
.reset-form .el-input__wrapper:focus-within {
    box-shadow: 0 0 0 1px #409eff !important;
    border-color: #409eff !important;
}

.reset-form .el-input__inner {
    color: #e0e0e0 !important;
}

.reset-btn {
    width: 100%;
    margin-top: 10px;
    font-size: 16px;
    font-weight: 500;
}

.success-message {
    width: 90%;
    max-width: 450px;
    padding: 30px 20px;
    background-color: #1e1e1e;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    border: 1px solid #333;
    text-align: center;
}

.success-message h2 {
    color: #bbdefb;
    font-weight: 600;
    font-size: 1.5em;
    margin-bottom: 10px;
}

.success-message p {
    color: #e0e0e0;
    margin-bottom: 20px;
}

@media (max-width: 768px) {
    .reset-container {
        padding: 15px;
    }

    .reset-card, .success-message {
        padding: 24px 16px;
    }

    .title, .success-message h2 {
        font-size: 1.3em;
    }
}
</style>