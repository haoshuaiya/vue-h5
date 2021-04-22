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
