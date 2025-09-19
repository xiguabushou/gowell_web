<template>
  <div class="forget-container">
    <div class="forget-card">
      <h2 class="title">找回密码</h2>
      <el-form
        :model="forgetForm"
        :rules="rules"
        ref="forgetFormRef"
        class="forget-form"
        label-position="top"
      >
        <!-- 邮箱 -->
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="forgetForm.email"
            placeholder="请输入邮箱"
            clearable
            size="large"
          />
        </el-form-item>
        <!-- 图形验证码 -->
        <el-form-item label="图形验证码" prop="captcha">
          <div class="captcha-wrapper">
            <el-input
              v-model="forgetForm.captcha"
              placeholder="请输入图形验证码"
              clearable
              size="large"
            />
            <img
              :src="captchaUrl"
              alt="验证码"
              class="captcha-image"
              @click="refreshCaptcha"
            />
          </div>
        </el-form-item>
        <!-- 修改密码按钮 -->
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            @click="handleForgetPassword"
            class="forget-btn"
            :loading="loading"
          >
            修改密码
          </el-button>
        </el-form-item>
      </el-form>

            <!-- 其他链接 -->
      <div class="extra-links">
        <span @click="goToLogin">回到登录</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { forgotPassword } from '@/api/user';
import { getCaptcha } from '@/api/base';
import { useRouter } from 'vue-router';

const router = useRouter()

const forgetFormRef = ref();
const forgetForm = reactive({
  email: '',
  captcha: '',
  captchaId: '',
});
const captchaUrl = ref();
const loading = ref(false);

const refreshCaptcha = () => {
  getCaptcha().then(res => {
    if (res.code == "0") {
      captchaUrl.value = res.data.pic_path;
      forgetForm.captchaId = res.data.captcha_id;
    }
  });
};

// 跳转到登录页
const goToLogin = () => {
  router.push('/login');
};

const rules = reactive({
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  captcha: [{ required: true, message: '请输入图形验证码', trigger: 'blur' }],
});

const handleForgetPassword = () => {
  forgetFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true;
      // 这里应调用找回密码的API，示例只做提示
      const data = {
        email: forgetForm.email,
        captcha: forgetForm.captcha,
        captcha_id: forgetForm.captchaId
      }
      forgotPassword(data).then(res=>{
        if (res.code == "0"){
            loading.value = false;
            ElMessage.success('请求成功，请根据邮箱指引完成密码修改');
            router.push('/login')
        }else{
            loading.value = false;
            ElMessage.error('请求失败')
            return
        }
      })
    } else {
      ElMessage.error('请检查输入信息');
    }
  });
};

onMounted(() => {
  refreshCaptcha();
});
</script>

<style scoped>
.forget-container {
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
.forget-card {
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
.forget-form .el-form-item__label {
  color: #e0e0e0 !important;
}
.forget-form .el-input__wrapper {
  background: #2d2d2d !important;
  border: 1px solid #444 !important;
  border-radius: 8px !important;
}
.forget-form .el-input__wrapper:hover,
.forget-form .el-input__wrapper:focus-within {
  box-shadow: 0 0 0 1px #409eff !important;
  border-color: #409eff !important;
}
.forget-form .el-input__inner {
  color: #e0e0e0 !important;
}
.captcha-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}
.captcha-image {
  height: 40px;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid #444;
  flex-shrink: 0;
  background-color: #e0e0e0;
}
.forget-btn {
  width: 100%;
  margin-top: 10px;
  font-size: 16px;
  font-weight: 500;
}
/* 其他链接 */
.extra-links {
  display: flex;
  justify-content: center;
  margin-top: 16px;
  font-size: 14px;
  color: #999;
}
@media (max-width: 768px) {
  .forget-container {
    padding: 15px;
  }
  .forget-card {
    padding: 24px 16px;
  }
  .title {
    font-size: 1.3em;
  }
}
</style>