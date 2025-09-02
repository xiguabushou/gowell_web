import http from "@/request/request";


function resetForgotPassword(data) {
    return http.post('/api/user/resetForgotPassword', data)
}

export { resetForgotPassword }