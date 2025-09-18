<template>
  <div class="register-container">
    <!-- 注册卡片 -->
    <div class="register-card">
      <h2 class="title">用户注册</h2>

      <el-form
        :model="registerForm"
        :rules="rules"
        ref="registerFormRef"
        class="register-form"
        label-position="top"
      >
        <!-- 邮箱 -->
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="registerForm.email"
            placeholder="请输入邮箱"
            clearable
            size="large"
          />
        </el-form-item>

        <!-- 图形验证码 -->
        <el-form-item label="图形验证码" prop="captcha">
          <div class="captcha-wrapper">
            <el-input
              v-model="registerForm.captcha"
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

        <!-- 邮箱验证码 -->
        <el-form-item label="邮箱验证码" prop="emailCode">
          <div class="email-code-wrapper">
            <el-input
              v-model="registerForm.emailCode"
              placeholder="请输入邮箱验证码"
              clearable
              size="large"
              class="email-code-input"
            />
            <el-button
              type="primary"
              size="large"
              @click="sendEmailCodeTo"
              :disabled="!canSendEmailCode || emailCodeCountdown > 0"
              class="send-code-btn"
            >
              {{ emailCodeCountdown > 0 ? `${emailCodeCountdown}s` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>

        <!-- 密码 -->
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
            clearable
            size="large"
          />
        </el-form-item>

        <!-- 确认密码 -->
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            show-password
            clearable
            size="large"
          />
        </el-form-item>

        <!-- 注册按钮 -->
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            @click="handleRegister"
            class="register-btn"
            :loading="loading"
          >
            注册
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 其他链接 -->
      <div class="extra-links">
        <span @click="goToLogin">已有账号？立即登录</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { getCaptcha, sendEmailCode, register } from '@/api/user/Register';
import { setLocalStorage,removeLocalStorage } from '@/utils/common'

const router = useRouter();

// 表单引用
const registerFormRef = ref();

// 表单数据
const registerForm = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  captcha: '',
  emailCode: '',
  captchaId: '',
});

// 验证码图片 URL
const captchaUrl = ref();

// 邮箱验证码倒计时
const emailCodeCountdown = ref(0);

// 刷新验证码
const refreshCaptcha = () => {
  getCaptcha().then(res => {
    if (res.code == "0") {
      captchaUrl.value = res.data.pic_path
      registerForm.captchaId = res.data.captcha_id
    }
  })
};

// 检查是否可以发送邮箱验证码
const canSendEmailCode = computed(() => {
  return registerForm.email && registerForm.captcha && isValidEmail(registerForm.email);
});

// 邮箱格式验证
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 发送邮箱验证码
const sendEmailCodeTo = () => {
  if (!canSendEmailCode.value) {
    ElMessage.warning('请先填写邮箱和图形验证码');
    return;
  }

  const data = {
    email: registerForm.email,
    captcha: registerForm.captcha,
    captcha_id: registerForm.captchaId
  };

  sendEmailCode(data).then(res => {
    console.log
    if (res.code == "0") {
      ElMessage.success('验证码已发送到您的邮箱');
      // 开始倒计时
      emailCodeCountdown.value = 60;
      const timer = setInterval(() => {
        emailCodeCountdown.value--;
        if (emailCodeCountdown.value <= 0) {
          clearInterval(timer);
        }
      }, 1000);
    } else {
      ElMessage.error(res.message || '发送失败，请重试');
    }
  }).catch(err => {
    ElMessage.error('发送失败，请重试');
  });
};

// 密码确认验证
const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'));
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致'));
  } else {
    callback();
  }
};

// 校验规则
const rules = reactive({
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ],
  captcha: [{ required: true, message: '请输入图形验证码', trigger: 'blur' }],
  emailCode: [{ required: true, message: '请输入邮箱验证码', trigger: 'blur' }],
});

// 注册处理
const loading = ref(false);
const handleRegister = () => {
  registerFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true;
      const registerInfo = {
        email: registerForm.email,
        password: registerForm.password,
        verification_code: registerForm.emailCode
      }
      register(registerInfo).then(res => {
        if (res.code == "0") {
          const token = res.data.access_token
          const expires_time = res.data.access_token_expires_at
          removeLocalStorage("token")
          removeLocalStorage("expires_time")
          setLocalStorage("token",token)
          setLocalStorage("expires_time",expires_time)
          ElMessage.success('注册成功！');
          loading.value = false;
          // 注册成功后跳转到登录页
          router.push('/')
        
        } else {
          loading.value = false;
          ElMessage.error(res.msg || '注册失败，请重试');
        }
      }).catch(err => {
        console.log(err)
        loading.value = false;
        ElMessage.error('注册失败，请重试');
      })
    } else {
      ElMessage.error('请检查输入信息');
    }
  });
};

// 跳转到登录页
const goToLogin = () => {
  router.push('/login');
};

// 初始化验证码
onMounted(() => {
  refreshCaptcha();
});
</script>

<style>
/* 全局容器 */
.register-container {
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

/* 注册卡片 */
.register-card {
  width: 90%;
  max-width: 450px;
  padding: 30px 20px;
  background-color: #1e1e1e;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border: 1px solid #333;
}

/* 标题 */
.register-card .title {
  text-align: center;
  margin-bottom: 24px;
  color: #bbdefb;
  font-weight: 600;
  font-size: 1.5em;
}

/* 表单 */
.register-form .el-form-item__label {
  color: #e0e0e0 !important;
}

/* 输入框样式覆盖 */
.register-form .el-input__wrapper {
  background: #2d2d2d !important;
  border: 1px solid #444 !important;
  border-radius: 8px !important;
}

.register-form .el-input__wrapper:hover,
.register-form .el-input__wrapper:focus-within {
  box-shadow: 0 0 0 1px #409eff !important;
  border-color: #409eff !important;
}

/* 输入文字颜色 */
.register-form .el-input__inner {
  color: #e0e0e0 !important;
}

/* 验证码区域 */
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

/* 邮箱验证码区域 */
.email-code-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.email-code-input {
  flex: 1;
}

.send-code-btn {
  flex-shrink: 0;
  min-width: 120px;
  white-space: nowrap;
}

/* 注册按钮 */
.register-btn {
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

.extra-links span {
  cursor: pointer;
  transition: color 0.2s;
}

.extra-links span:hover {
  color: #409eff;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .register-container {
    padding: 15px;
  }
  .register-card {
    padding: 24px 16px;
  }
  .title {
    font-size: 1.3em;
  }
  /* 保持同一行，不设置flex-direction: column */
  .email-code-input {
    flex: 1;
    min-width: 0;
    width: auto;
  }
  .send-code-btn {
    width: auto;
    min-width: 90px;
  }
}
</style>