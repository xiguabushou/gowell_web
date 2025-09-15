import http from "@/request/request";

function uploadPhoto(formData) {
    return http.post('/api/content/uploadPhoto', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

export { uploadPhoto }
