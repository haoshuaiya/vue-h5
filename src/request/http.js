import axios from "axios";
import QS from "qs";
import pSettings from "../settings";

// 实例化axios
const instance = axios.create({
	baseURL: pSettings.baseUrl,
	timeout: pSettings.timeout,
});

// 返回拦截
instance.interceptors.response.use(
	(response) => {
		// fulfilled状态
		// 一些自定义事件
		return Promise.resolve(response);
	},
	(error) => {
		// reject状态
		return Promise.reject(error.response);
	}
);

/**
 * get方法封装
 * @param  {String} url [请求的url地址]
 * @param {Object} params [请求携带的参数]
 **/

export function get(url, params = {}) {
	return new Promise((resolve, reject) => {
		instance
			.get(url, {
				params,
			})
			.then((res) => {
				resolve(res);
			})
			.catch((err) => {
				reject(err);
			});
	});
}


/**
 * post方法封装
 * @param {String} url [请求的url地址]
 * @param {Object} params [请求携带的参数]
 * **/

export default postMessage(url,params={}){
    return new Promise((resolve,reject)=>{
        let data= QS.stringify(params)
        instance
			.post(url, data)
			.then(res => {	
				resolve(res.data);
			})
			.catch(err => {	
				reject(err.data);
			});
        
    })
}
