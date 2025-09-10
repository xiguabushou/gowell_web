import http from "@/request/request";

// 退出登录
function logout(){
    return http.post('/api/user/logout')
}

export { logout }