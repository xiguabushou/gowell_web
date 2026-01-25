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

function contentFreeze(data){
  return http.post("/api/content/freeze", data)
}

function getEditVideoInfo(data) {
  return http.post("/api/content/editVideo", data);
}

function UploadContentVideo(data) {
  return http.post("/api/content/uploadContentVideo", data);
}

function getEditPhotoInfo(data) {
  return http.post("/api/content/editPhoto", data);
}

function editContentPhotoInfo(formData) {
  return http.post("/api/content/editContentPhotoInfo", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

function uploadContentPhoto(formData) {
  return http.post("/api/content/uploadContentPhoto", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

function deleteContentPhoto(data) {
  return http.post("/api/content/deleteContentPhoto", data);
}

export {
  getList,
  getInfo,
  uploadPhoto,
  uploadVideo,
  getListByAdmin,
  deleteContent,
  contentFreeze,
  getEditVideoInfo,
  UploadContentVideo,
  getEditPhotoInfo,
  editContentPhotoInfo,
  uploadContentPhoto,
  deleteContentPhoto,
};
