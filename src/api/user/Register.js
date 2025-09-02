import http from "@/request/request";

// 获取图形验证码
function getCaptcha(params) {
    return http.get('/api/base/captcha', { params })
}

// 发送邮箱验证码
function sendEmailCode(data) {
    return http.post('/api/base/sendEmailVerificationCode', data)
}

// 注册
function register(data) {
    return http.post('/api/user/register', data)
}

export { getCaptcha, sendEmailCode, register } 