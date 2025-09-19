import http from "@/request/request";

// 登录
function login(data){
    return http.post('/api/user/login',data)
}

function register(data) {
    return http.post('/api/user/register', data)
}

function forgotPassword(data) {
    return http.post('/api/user/forgotPassword',  data )
}

function resetForgotPassword(data) {
    return http.post('/api/user/resetForgotPassword', data)
}

function logout(){
    return http.post('/api/user/logout')
}

export {login, register, forgotPassword, resetForgotPassword, logout }