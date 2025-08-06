import http from "@/request/request";

// 获取验证码
function getCaptcha(params){
    return http.get('/api/base/captcha',{params})
}

// 登录
function login(data){
    return http.post('/api/user/login',data)
}

export { getCaptcha ,login}