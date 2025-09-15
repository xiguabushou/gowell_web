import http from "@/request/request";

function uploadVideo(formData) {
    return http.post('/api/content/uploadVideo', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

export { uploadVideo }
