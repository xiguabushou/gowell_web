import http from "@/request/request";

function getCaptcha(params){
    return http.get('/api/base/captcha',{params})
}

// 发送邮箱验证码
function sendEmailCode(data) {
    return http.post('/api/base/sendEmailVerificationCode', data)
}

export { getCaptcha, sendEmailCode }