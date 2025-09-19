import http from "@/request/request";

// 登录
function login(data) {
  return http.post("/api/user/login", data);
}

function register(data) {
  return http.post("/api/user/register", data);
}

function forgotPassword(data) {
  return http.post("/api/user/forgotPassword", data);
}

function resetForgotPassword(data) {
  return http.post("/api/user/resetForgotPassword", data);
}

function logout() {
  return http.post("/api/user/logout");
}

// 获取申请VIP列表
function getListAboutAskForVip(params) {
  return http.get("/api/user/getListAboutAskForVip", { params });
}

// 审批VIP申请
function approvingForVip(data) {
  return http.post("/api/user/approvingForVip", data);
}

// 获取用户列表
function getUserList(params) {
  // 直接透传查询参数
  return http.get("/api/user/list", { params });
}

function deleteUser(data) {
  return http.post("/api/user/delete", data);
}

function editUser(data) {
  return http.post("/api/user/edit", data);
}

export {
  login,
  register,
  forgotPassword,
  resetForgotPassword,
  logout,
  getListAboutAskForVip,
  approvingForVip,
  getUserList,
  deleteUser,
  editUser,
};
