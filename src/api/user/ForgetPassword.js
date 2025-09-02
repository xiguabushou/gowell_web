import http from "@/request/request";

// 获取图形验证码
function getCaptcha(params) {
    return http.get('/api/base/captcha', { params })
}

function forgotPassword(data) {
    return http.post('/api/user/forgotPassword',  data )
}

export { getCaptcha,forgotPassword }