const path = require("path");
const webpack = require("webpack");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const babelLoader = {
	loader: "babel-loader",
	options: {
		plugins: ["@babel/plugin-syntax-dynamic-import"],
		presets: [
			[
				"@babel/preset-env",
				{
					useBuiltIns: "usage",
					modules: false,
					targets: {
						ie: "11",
					},
					corejs: 3,
				},
			],
			[
				"@babel/preset-react",
				{
					pragma: "createElement",
					pragmaFrag: '"div"',
				},
			],
		],
	},
};

module.exports = (a, args) => {
	const APIROOT =
		process.env.RTHOST ||
		(args.mode === "development"
			? "http://jess.umputun.com:8780/api/v1"
			: "https://news.radio-t.com/api/v1");

	return {
		entry: "./main.tsx",
		context: path.resolve(__dirname, "src"),
		output: {
			path: path.resolve(__dirname, "public"),
			filename: "[name].js",
			chunkFilename: "[name].component.js",
			publicPath: "/",
		},
		mode: args.mode || "production",
		module: {
			rules: [
				{
					test: /\.jsx?$/,
					exclude: /node_modules/,
					use: babelLoader,
				},
				{
					test: /\.tsx?$/,
					exclude: /node_modules/,
					use: [babelLoader, "ts-loader"],
				},
				{
					test: /\.css$/,
					use: [
						{
							loader: MiniCssExtractPlugin.loader,
						},
						"css-loader",
					],
				},
				{
					test: /\.scss$/,
					use: [
						{
							loader: MiniCssExtractPlugin.loader,
						},
						"css-loader",
						"sass-loader",
					],
				},
				{
					test: /\.svg$/,
					use: {
						loader: "svg-inline-loader",
						options: {
							classPrefix: "icon",
						},
					},
				},
			],
		},
		watchOptions: {
			ignored: /node_modules/,
		},
		plugins: [
			new HtmlWebPackPlugin({
				template: "./index.html",
				filename: "index.html",
				hash: true,
				APIROOT,
			}),
			new MiniCssExtractPlugin({
				filename: "[name].css",
				chunkFilename: "[name].css",
			}),
			new webpack.ProvidePlugin({
				createElement: ["react", "createElement"],
			}),
			new CopyWebpackPlugin([{ from: "./static", to: "static" }]),
			new webpack.DefinePlugin({
				BUILDTIME: JSON.stringify(new Date().toUTCString()),
				"process.env.NODE_ENV": JSON.stringify(
					args.mode === "development" ? "development" : "production"
				),
				__REACT_DEVTOOLS_GLOBAL_HOOK__: "({ isDisabled: true })",
				ENV: JSON.stringify(
					args.mode === "development" ? "development" : "production"
				),
				APIROOT: JSON.stringify(APIROOT),
			}),
		],
		devServer: {
			compress: true,
			port: 9000,
			historyApiFallback: true,
			host: args.remote && args.remote === true ? "0.0.0.0" : null,
		},
		resolve: {
			alias: {
				react: "preact-compat",
				"react-dom": "preact-compat",
			},
			extensions: [".tsx", ".ts", ".jsx", ".js"],
		},
		optimization: {
			minimize: !(args.hasOwnProperty("mode") && args.mode === "development"),
			runtimeChunk: "single",
			splitChunks: {
				cacheGroups: {
					vendors: {
						test: /[\\/]node_modules[\\/]/,
						name: "vendors",
						enforce: true,
						chunks: "initial",
					},
				},
			},
		},
		devtool: "source-map",
	};
};
