const Setting = {
	devServer: {},
	devPublicPath: "",
	// 生产环境区分测试和正式进行打包
	proPublicPath: process.env.VUE_APP_TYPE === "test" ? "" : "",
	globalSassVarFile: "src/styles/var.scss",
	sourceMap: true,
};

module.exports = Setting;
