import axios from "axios";

// 请求拦截  设置统一header
axios.interceptors.request.use(
    config => {
        // if (localStorage.eleToken)
        //     config.headers.Authorization = localStorage.eleToken;
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// 响应拦截  401 token过期处理
axios.interceptors.response.use(
    response => {
        if (!response.data.success) {
            return Promise.reject(response.data)
        }
        return response.data;
    },
    error => {
        console.log('error: ', error)

        // const { status } = error.response;
        // if (status == 401) {
        //     ElMessage.error("token值无效，请重新登录");
        //     // 清除token
        //     localStorage.removeItem("eleToken");
        //     // 页面跳转
        //     router.push("/login");
        // }

        return Promise.reject(error);
    }
);

export default axios;
