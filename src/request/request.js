import axios from "axios";
import router from '../router'

const instance = axios.create({
    baseURL: ''
});

// Add a request interceptor
instance.interceptors.request.use(function (config) {
    
    // 如果 token 存在
    // 让每个请求携带自定义 token 请根据实际情况自行修改 ['token']为自定义key 请根据实际情况自行修改
    let token=localStorage.getItem("token")
    if (token) {
        config.headers['x-access-token'] = token;
    }
    return config;
}, function (error) {
    // Do something with request error
    return Promise.reject(error);
});
// Add a response interceptor
instance.interceptors.response.use(function (response) {
    // Do something with response data
    // console.log(response)
    //如果是token出现异常，返回的登录页面
    if(response.data.code == 9 ){
        router.push("/login")
    }
   
    return response.data;
}, function (error) {
    // Do something with response error
    return Promise.reject(error);
});


export default instance