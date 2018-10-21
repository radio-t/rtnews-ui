/* requires */

var	gulp		= require('gulp'),
	ifelse 		= require('gulp-if'),
	util		= require('gulp-util'),
	browserSync	= require('browser-sync'),
	cache 		= require('gulp-cached'),
	concat 		= require('gulp-concat'),
	svgstore	= require('gulp-svgstore'),
	inject 		= require('gulp-inject'),
	fileinclude	= require('gulp-file-include'),
	filter 		= require('gulp-filter'),
	rename 		= require('gulp-rename'),
	uglify 		= require('gulp-uglify'),
	url 		= require('gulp-css-url-adjuster'),
	combinemq 	= require('gulp-combine-mq'),
	imagemin 	= require('gulp-imagemin'),
	pngquant 	= require('imagemin-pngquant'),
	del 		= require('del'),
	addsrc 		= require('gulp-add-src'),

	sass 	 	= require('gulp-sass'),
	importOnce	= require('node-sass-import-once'),
	autoprefixr	= require('autoprefixer-core'),
	postcss 	= require('gulp-postcss'),
	minifyCSS	= require('gulp-minify-css'),

	modRewrite	= require('connect-modrewrite');

/* paths */

var mask = {
		html: ['dev/html/**/*', 'dev/includes/*.html', 'dev/blocks/**/*.html'],
		scss: 'dev/blocks/**/*.scss',
		css: 'dev/css/**/*.css',
		js_f: 'dev/js/**/*', 
		js_b: 'dev/blocks/**/*.js',
		images: 'dev/blocks/**/*.{jpg,png,gif,svg}',
		files: 'dev/files/**/*',
		fonts: 'dev/fonts/**/*.{eot,svg,ttf,woff,woff2}',
		main: ['public/**', '!public'],
		svg: 'dev/svg/**/*'
	},
	input = {
		html: 'dev/html/**/*.html',
		css: 'dev/css',
		scss: 'dev/blocks/main.scss',
	},
	output = {
		main: 'public',
		js: 'public/js',
		css: 'public/css',
		images: 'public/images',
		files: 'public/files',
		fonts: 'public/fonts'
	},
	isProduction = (util.env.type == 'production'),
	isDeploy = (util.env.type == 'deploy'),
	serverConf = {
		baseDir: output.main,
		middleware: [
			modRewrite([
				'^/post/(.*)$ /post/index.html [L]'
			])
		]
	};

gulp.task('html', function() {
	return gulp.src(input.html)
		.pipe(fileinclude())
		.on('error', util.log)
		.pipe(cache('htmling'))
		.pipe(gulp.dest(output.main))
		.pipe(browserSync.stream());
});

gulp.task('scss', function() {
	return gulp.src(input.scss)
		.pipe(sass({
			importer: importOnce
		}).on('error', util.log))
		.pipe(gulp.dest(input.css))
});

gulp.task('css', function() {
	return gulp.src(mask.css)
		.pipe(cache('cssing'))
		.pipe(postcss([ autoprefixr({ browsers: [ "> 1%" ] }) ]))
		.pipe(url({ replace: [/^i-/, '../images/i-'] }))
		.pipe(url({ replace: [/^f-/, '../fonts/f-'] }))
		.pipe(ifelse(isProduction || isDeploy, 
			combinemq({
				beautify: false
			})
		))
		.pipe(ifelse(isProduction, minifyCSS({
			processImportFrom: ['local']
		})))
		.pipe(gulp.dest(output.css))
		.pipe(browserSync.stream());
});

gulp.task('images', function() {
	return gulp.src(mask.images)
		.pipe(cache('imaging'))
		.pipe(rename({dirname: ''}))
		.pipe(ifelse(isProduction || isDeploy, 
			imagemin({
				progressive: true,
				svgoPlugins: [{removeViewBox: false}],
				use: [pngquant()],
				interlaced: true
	        })
		))
		.pipe(gulp.dest(output.images))
		.pipe(browserSync.stream());
});

gulp.task('files', function() {
	return gulp.src(mask.files) 
		.pipe(gulp.dest(output.files))
		.pipe(browserSync.stream());
});

gulp.task('js', function() {
	return gulp.src(mask.js_f)
		.pipe(concat('main.js'))
		.pipe(addsrc(mask.js_b))
		.pipe(concat('main.js'))
		.pipe(cache('jsing'))
		.pipe(ifelse(isProduction || isDeploy, uglify()))
		.pipe(gulp.dest(output.js))
		.pipe(browserSync.stream());
});

gulp.task('svg', function() {
	var svgs = gulp
		.src(mask.svg)
		.pipe(svgstore({ inlineSvg: true}));

	return gulp.src('dev/includes/svg.html')
		.pipe(inject(svgs, { transform: function(filePath, file) {
			return file.contents.toString();
		}}))
		.pipe(gulp.dest('dev/includes'));
});

gulp.task('fonts', function() {
	return gulp.src(mask.fonts) 
		.pipe(rename({dirname: ''}))
		.pipe(gulp.dest(output.fonts))
		.pipe(browserSync.stream());
});

gulp.task('server', function() {
	browserSync.init({
		server: serverConf,
		open: false,
		browser: "browser",
		reloadOnRestart: true,
		online: true
	});
});

gulp.task('serverOffline', function() {
	browserSync.init({
		server: serverConf,
		open: false,
		browser: "browser",
		reloadOnRestart: true,
		online: false
	});
});

gulp.task('watch', function() {
	gulp.watch(mask.html, gulp.series('html'));
	gulp.watch(mask.scss, gulp.series('scss'));
	gulp.watch(mask.css, gulp.series('css'));
	gulp.watch([mask.js_f, mask.js_b], gulp.series('js'));
	gulp.watch(mask.images, gulp.series('images'));
	gulp.watch(mask.files, gulp.series('files'));
	gulp.watch(mask.fonts, gulp.series('fonts'));
	gulp.watch(mask.svg, gulp.series('svg'));
});

gulp.task('build', gulp.series('svg', 'html', 'scss', 'css', 'js', 'images', 'files', 'fonts'));

gulp.task('default', gulp.series('build', gulp.parallel('server', 'watch')));

gulp.task('offline', gulp.series('build', gulp.parallel('serverOffline', 'watch')));

gulp.task('clean', function(cb) {
	del(mask.main);
});