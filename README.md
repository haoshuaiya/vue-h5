<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

-   [基于 vue 的 h5 前端架构设计](#%E5%9F%BA%E4%BA%8E-vue-%E7%9A%84-h5-%E5%89%8D%E7%AB%AF%E6%9E%B6%E6%9E%84%E8%AE%BE%E8%AE%A1)
    -   [1.响应式布局实现](#1%E5%93%8D%E5%BA%94%E5%BC%8F%E5%B8%83%E5%B1%80%E5%AE%9E%E7%8E%B0)
    -   [2.自定义设置中心：](#2%E8%87%AA%E5%AE%9A%E4%B9%89%E8%AE%BE%E7%BD%AE%E4%B8%AD%E5%BF%83)
    -   [3. vue.config.js 自定义配置](#3-vueconfigjs-%E8%87%AA%E5%AE%9A%E4%B9%89%E9%85%8D%E7%BD%AE)
    -   [4.axios 封装](#4axios-%E5%B0%81%E8%A3%85)
    -   [5.打包到不同的环境](#5%E6%89%93%E5%8C%85%E5%88%B0%E4%B8%8D%E5%90%8C%E7%9A%84%E7%8E%AF%E5%A2%83)
    -   [6.全局组件](#6%E5%85%A8%E5%B1%80%E7%BB%84%E4%BB%B6)
    -   [7.实例代码链接](#7%E5%AE%9E%E4%BE%8B%E4%BB%A3%E7%A0%81%E9%93%BE%E6%8E%A5)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# 基于 vue 的 h5 前端架构设计

## 1.响应式布局实现

移动端 h5 的浏览器一般都比较新，所以可以使用比较新的属性，这里主要使用 vw、vh 的思路来实现

-   与设计协商好给的设计图大小
-   使用 postcss-px-to-viewport 实现将设计图中的 px 自动转换为代码中的 vw/vh 单位
-   在项目根目录新建文件 postcss.config.js,基础设置如下：

```
module.exports = {
	plugins: {
		"postcss-px-to-viewport": {
			viewportWidth: 750, //设计图宽度
			viewportHeight: 1334, //设计图屏幕高度
			unitPrecision: 3, // 转换后数值精度
			viewportUnit: "vw", // 转换后的单位
			selectorBlackList: [".ignore"], //不需要转换的选择器
			minPixelValue: 1, // (Number) Set the minimum pixel value to replace.
			mediaQuery: false, // (Boolean) Allow px to be converted in media queries.
		},
	},
};

```

## 2.自定义设置中心：

创建 settings.js/settings.env.js 进行自定义配置

```
//settings.env.js
const Setting = {
	devServer: {},
	devPublicPath: "",
	proPublicPath: "",
	globalSassVarFile: "src/styles/var.scss",
	sourceMap: true,
};

module.exports = Setting;

```

## 3. vue.config.js 自定义配置

```
const Setting = require("./src/setting.env");

function resolve(dir) {
	return path.resolve(__dirname, "src/" + dir);
}

module.exports = {
	devServer: Setting.devServer,
	css: {
		loaderOptions: {
			sass: {
				prependData: `@import '${Setting.globalSassVarFile}';`,
			},
		},
	},
	publicPath: process.env.NODE_ENV === "test" ? Setting.devPublicPath : Setting.proPublicPath,
	chainWebpack: (config) => {
		/**
		 * 删除懒加载模块的 prefetch preload，降低带宽压力
		 * https://cli.vuejs.org/zh/guide/html-and-static-assets.html#prefetch
		 * https://cli.vuejs.org/zh/guide/html-and-static-assets.html#preload
		 * 而且预渲染时生成的 prefetch 标签是 modern 版本的，低版本浏览器是不需要的
		 */
		config.plugins.delete("prefetch").delete("preload");
		// 解决 cli3 热更新失效 https://github.com/vuejs/vue-cli/issues/1559
		config.resolve.symlinks(true);
		// 最小化js文件
		config.optimization.minimize(true);
		// 图片压缩
		const imagesRule = config.module.rule("images");
		imagesRule
			.use("image-webpack-loader")
			.loader("image-webpack-loader")
			.options({
				bypassOnDebug: true,
			})
			.end();
	},
};


```

## 4.axios 封装

```

//http.js
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

//api.js
import { get, post } from "./http";

const api = {
	test: (p) => {
		return get("testapiUrl", p);
	},
};

export default api;

//main.js
Vue.prototype.$api = api;

//使用
this.$api.test().then(res=>{
	...
})
```

## 5.打包到不同的环境

创建文件.env.xxx(xxx 为打包环境名称),配置环境变量，在 package.json 内配置打包脚本

```
//.env.testing
VUE_APP_TYPE=test
NODE_ENV=production
BABEL_ENV=production

//.env.production
VUE_APP_TYPE=production

//package.json
"build": "vue-cli-service build",
"build:test": "vue-cli-service build --mode testing"
```

## 6.全局组件

如下示例，在当前文件夹中，以 x-开头的组件均会注册成全局组件，不需要再次引入,在 main.js 中引入即可

```
//_global.js
// Globally register all base components for convenience, because they
// will be used very frequently. Components are registered using the
// PascalCased version of their file name.

import Vue from "vue";
import upperFirst from "lodash/upperFirst";
import camelCase from "lodash/camelCase";

// https://webpack.js.org/guides/dependency-management/#require-context
const requireComponent = require.context(
	// Look for files in the current directory
	".",
	// Do not look in subdirectories
	false,
	// Only include "x-" prefixed .vue files
	/x-[\w-]+\.vue$/
);

// For each matching file name...
requireComponent.keys().forEach((fileName) => {
	// Get the component config
	const componentConfig = requireComponent(fileName);
	// Get the PascalCase version of the component name
	const componentName = upperFirst(
		camelCase(
			fileName
				// Remove the "./" from the beginning
				.replace(/^\.\//, "")
				// Remove the file extension from the end
				.replace(/\.\w+$/, "")
		)
	);
	// Globally register the component
	Vue.component(componentName, componentConfig.default || componentConfig);
});



```

## 7.实例代码链接

[基于 vue 的 h5 前端架构设计](https://github.com/haoshuaiya/vue-h5)
