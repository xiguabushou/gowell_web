import http from "@/request/request";

function getList(params ){
    return http.get('/api/content/getList',{params})
}

export { getList }