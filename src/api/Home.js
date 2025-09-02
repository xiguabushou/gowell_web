import http from "@/request/request";

function getUserInfo(params){
    return http.get('/api/user/info',{params})
}

export { getUserInfo }