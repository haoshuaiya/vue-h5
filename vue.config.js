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
