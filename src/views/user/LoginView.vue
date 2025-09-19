<template>
  <div class="login-container">
    <!-- 登录卡片 -->
    <div class="login-card">
      <h2 class="title">欢迎登录</h2>

      <el-form
        :model="loginForm"
        :rules="rules"
        ref="loginFormRef"
        class="login-form"
        label-position="top"
      >
        <!-- 用户名 -->
        <el-form-item label="账户" prop="email">
          <el-input
            v-model="loginForm.email"
            placeholder="请输入邮箱"
            clearable
            size="large"
          />
        </el-form-item>

        <!-- 密码 -->
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
            clearable
            size="large"
          />
        </el-form-item>

        <!-- 验证码 -->
        <el-form-item label="验证码" prop="captcha">
          <div class="captcha-wrapper">
            <el-input
              v-model="loginForm.captcha"
              placeholder="请输入验证码"
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

        <!-- 登录按钮 -->
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            @click="handleLogin"
            class="login-btn"
            :loading="loading"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 其他链接 -->
      <div class="extra-links">
        <span @click="goToForgotPassword">忘记密码？</span>
        <span @click="goToRegister">注册账号</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter, useRoute} from 'vue-router';
import { login } from '@/api/user';
import { getCaptcha } from '@/api/base';
import { setLocalStorage,removeLocalStorage } from '@/utils/common'
import  store  from '@/store';

const router = useRouter();
const route = useRoute();


// 表单引用
const loginFormRef = ref();

// 表单数据
const loginForm = reactive({
  email: '',
  password: '',
  captcha: '',
  captchaId: '',
});

// 验证码图片 URL
const captchaUrl = ref();

// 刷新验证码
const refreshCaptcha = () => {
  getCaptcha().then(res=>{
    if(res.code == "0" ){
      captchaUrl.value = res.data.pic_path
      loginForm.captchaId = res.data.captcha_id
    }
  })
};

// 校验规则
const rules = reactive({
  email: [{ required: true, message: '请输入账户', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  captcha: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
});

// 登录处理
const loading = ref(false);
const handleLogin = () => {
  loginFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true;
      const loginInfo = {
        email: loginForm.email,
        password: loginForm.password,
        captcha: loginForm.captcha,
        captcha_id : loginForm.captchaId
      }
      login(loginInfo).then(res=>{
        if(res.code == "0" ){
          const token = res.data.access_token
          const expires_time = res.data.access_token_expires_at
          const userInfo = res.data.user
          removeLocalStorage("token")
          removeLocalStorage("expires_time")
          setLocalStorage("token",token)
          setLocalStorage("expires_time",expires_time)
          store.commit('setUserInfo',userInfo)
          
          // ✅ 登录成功后：清空表单输入
          loginForm.email = '';
          loginForm.password = '';
          loginForm.captcha = '';

          // 可选：刷新验证码（提升安全性）
          refreshCaptcha();

          loading.value = false;
          ElMessage.success('登录成功！');
          router.push('/')
        }else{
          loading.value = false;
          ElMessage.error(res.msg || "登录失败");
          refreshCaptcha();
        }
      })
    } else {
      ElMessage.error('请检查输入信息');
    }
  });
};

// 跳转到注册页
const goToRegister = () => {
  router.push('/register');
};

const goToForgotPassword = () =>{
  router.push('/forgetPassword');
}

// 初始化验证码
onMounted(() => {
  const q = route.query?.key
  if (q == "timeout"){
    ElMessage.error("登录过期")
  }

  refreshCaptcha();
});


</script>

<style>
/* 全局容器 */
.login-container {
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

/* 登录卡片 */
.login-card {
  width: 90%;
  max-width: 400px;
  padding: 30px 20px;
  background-color: #1e1e1e;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border: 1px solid #333;
}

/* 标题 */
.login-card .title {
  text-align: center;
  margin-bottom: 24px;
  color: #bbdefb;
  font-weight: 600;
  font-size: 1.5em;
}

/* 表单 */
.login-form .el-form-item__label {
  color: #e0e0e0 !important;
}

/* 输入框样式覆盖 */
.login-form .el-input__wrapper {
  background: #2d2d2d !important;
  border: 1px solid #444 !important;
  border-radius: 8px !important;
}

.login-form .el-input__wrapper:hover,
.login-form .el-input__wrapper:focus-within {
  box-shadow: 0 0 0 1px #409eff !important;
  border-color: #409eff !important;
}

/* 输入文字颜色 */
.login-form .el-input__inner {
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

/* 登录按钮 */
.login-btn {
  width: 100%;
  margin-top: 10px;
  font-size: 16px;
  font-weight: 500;
}

/* 其他链接 */
.extra-links {
  display: flex;
  justify-content: space-between;
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
  .login-container {
    padding: 15px;
  }
  .login-card {
    padding: 24px 16px;
  }
  .title {
    font-size: 1.3em;
  }
}
</style>