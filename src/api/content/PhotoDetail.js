import http from "@/request/request";

function getInfo(params) {
    return http.get('/api/content/getInfo', { params })
}

export { getInfo }



