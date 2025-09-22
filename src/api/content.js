import http from "@/request/request";

function getList(params) {
  return http.get("/api/content/getList", { params });
}

function getInfo(params) {
  return http.get("/api/content/getInfo", { params });
}

function uploadPhoto(formData) {
  return http.post("/api/content/uploadPhoto", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

function uploadVideo(formData) {
  return http.post("/api/content/uploadVideo", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

function getListByAdmin(data) {
  return http.post("/api/content/listByAdmin", data);
}

function deleteContent(data) {
  return http.post("/api/content/delete", data);
}

export {
  getList,
  getInfo,
  uploadPhoto,
  uploadVideo,
  getListByAdmin,
  deleteContent,
};
