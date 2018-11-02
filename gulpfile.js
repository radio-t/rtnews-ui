const gulp = require("gulp4");
const ifelse = require("gulp-if");
const minimist = require("minimist");
const browserSync = require("browser-sync");
const cache = require("gulp-cached");
const concat = require("gulp-concat");
const svgstore = require("gulp-svgstore");
const inject = require("gulp-inject");
const fileinclude = require("gulp-file-include");
const rename = require("gulp-rename");
const uglify = require("gulp-uglify");
const url = require("gulp-css-url-adjuster");
const combinemq = require("gulp-combine-mq");
const imagemin = require("gulp-imagemin");
const pngquant = require("imagemin-pngquant");
const del = require("del");
const addsrc = require("gulp-add-src");
const sass = require("gulp-sass");
const importOnce = require("node-sass-import-once");
const autoprefixr = require("autoprefixer");
const postcss = require("gulp-postcss");
const minifyCSS = require("gulp-minify-css");
const modRewrite = require("connect-modrewrite");
const log = require("fancy-log");

/* misc */

const argv = {
	buildtype: "development",
	...minimist(process.argv.slice(3)),
};

/* paths */

const mask = {
		html: ["dev/html/**/*", "dev/includes/*.html", "dev/blocks/**/*.html"],
		scss: "dev/blocks/**/*.scss",
		css: "dev/css/**/*.css",
		js_f: "dev/js/**/*",
		js_b: "dev/blocks/**/*.js",
		images: "dev/blocks/**/*.{jpg,png,gif,svg}",
		files: "dev/files/**/*",
		fonts: "dev/fonts/**/*.{eot,svg,ttf,woff,woff2}",
		main: ["public/**", "!public"],
		svg: "dev/svg/**/*",
	},
	input = {
		html: "dev/html/**/*.html",
		css: "dev/css",
		scss: "dev/blocks/main.scss",
	},
	output = {
		main: "public",
		js: "public/js",
		css: "public/css",
		images: "public/images",
		files: "public/files",
		fonts: "public/fonts",
	},
	isProduction = argv.buildtype == "production",
	isDeploy = argv.buildtype == "deploy",
	serverConf = {
		baseDir: output.main,
		middleware: [modRewrite(["^/post/(.*)$ /post/index.html [L]"])],
	};

gulp.task("html", function() {
	return gulp
		.src(input.html)
		.pipe(fileinclude())
		.on("error", log.error)
		.pipe(cache("htmling"))
		.pipe(gulp.dest(output.main))
		.pipe(browserSync.stream());
});

gulp.task("scss", function() {
	return gulp
		.src(input.scss)
		.pipe(
			sass({
				importer: importOnce,
			}).on("error", log.error)
		)
		.pipe(gulp.dest(input.css));
});

gulp.task("css", function() {
	return gulp
		.src(mask.css)
		.pipe(cache("cssing"))
		.pipe(postcss([autoprefixr({ browsers: ["> 1%"] })]))
		.pipe(url({ replace: [/^i-/, "../images/i-"] }))
		.pipe(url({ replace: [/^f-/, "../fonts/f-"] }))
		.pipe(
			ifelse(
				isProduction || isDeploy,
				combinemq({
					beautify: false,
				})
			)
		)
		.pipe(
			ifelse(
				isProduction,
				minifyCSS({
					processImportFrom: ["local"],
				})
			)
		)
		.pipe(gulp.dest(output.css))
		.pipe(browserSync.stream());
});

gulp.task("images", function() {
	return gulp
		.src(mask.images)
		.pipe(cache("imaging"))
		.pipe(rename({ dirname: "" }))
		.pipe(
			ifelse(
				isProduction || isDeploy,
				imagemin({
					progressive: true,
					svgoPlugins: [{ removeViewBox: false }],
					use: [pngquant()],
					interlaced: true,
				})
			)
		)
		.pipe(gulp.dest(output.images))
		.pipe(browserSync.stream());
});

gulp.task("files", function() {
	return gulp
		.src(mask.files)
		.pipe(gulp.dest(output.files))
		.pipe(browserSync.stream());
});

gulp.task("js", function() {
	return gulp
		.src(mask.js_f)
		.pipe(concat("main.js"))
		.pipe(addsrc(mask.js_b))
		.pipe(concat("main.js"))
		.pipe(cache("jsing"))
		.pipe(ifelse(isProduction || isDeploy, uglify()))
		.pipe(gulp.dest(output.js))
		.pipe(browserSync.stream());
});

gulp.task("svg", function() {
	var svgs = gulp.src(mask.svg).pipe(svgstore({ inlineSvg: true }));

	return gulp
		.src("dev/includes/svg.html")
		.pipe(
			inject(svgs, {
				transform: function(filePath, file) {
					return file.contents.toString();
				},
			})
		)
		.pipe(gulp.dest("dev/includes"));
});

gulp.task("fonts", function() {
	return gulp
		.src(mask.fonts)
		.pipe(rename({ dirname: "" }))
		.pipe(gulp.dest(output.fonts))
		.pipe(browserSync.stream());
});

gulp.task("server", function() {
	browserSync.init({
		server: serverConf,
		open: false,
		browser: "browser",
		reloadOnRestart: true,
		online: true,
	});
});

gulp.task("serverOffline", function() {
	browserSync.init({
		server: serverConf,
		open: false,
		browser: "browser",
		reloadOnRestart: true,
		online: false,
	});
});

gulp.task("watch", function() {
	gulp.watch(mask.html, gulp.series("html"));
	gulp.watch(mask.scss, gulp.series("scss"));
	gulp.watch(mask.css, gulp.series("css"));
	gulp.watch([mask.js_f, mask.js_b], gulp.series("js"));
	gulp.watch(mask.images, gulp.series("images"));
	gulp.watch(mask.files, gulp.series("files"));
	gulp.watch(mask.fonts, gulp.series("fonts"));
	gulp.watch(mask.svg, gulp.series("svg"));
});

gulp.task(
	"build",
	gulp.series("svg", "html", "scss", "css", "js", "images", "files", "fonts")
);

gulp.task("default", gulp.series("build", gulp.parallel("server", "watch")));

gulp.task(
	"offline",
	gulp.series("build", gulp.parallel("serverOffline", "watch"))
);

gulp.task("clean", function() {
	return del(mask.main);
});
