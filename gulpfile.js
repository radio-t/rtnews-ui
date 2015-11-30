/* requires */

var	gulp		= require('gulp'),
	ifelse 		= require('gulp-if'),
	util		= require('gulp-util'),
	browserSync	= require('browser-sync'),
	cache 		= require('gulp-cached'),
	concat 		= require('gulp-concat'),
	fileinclude	= require('gulp-file-include'),
	filter 		= require('gulp-filter'),
	rename 		= require('gulp-rename'),
	uglify 		= require('gulp-uglify'),
	url 		= require('gulp-css-url-adjuster'),
	combinemq 	= require('gulp-combine-mq'),
	imagemin 	= require('gulp-imagemin'),
	pngquant 	= require('imagemin-pngquant'),
	del 		= require('del'),

	// compass  	= require('gulp-compass'),
	sass 	 	= require('gulp-sass'),
	autoprefixr	= require('autoprefixer-core'),
	postcss 	= require('gulp-postcss'),
	minifyCSS	= require('gulp-minify-css');

/* paths */

var mask = {
		html: 'dev/**/*.html',
		scss: 'dev/**/*.scss',
		css: 'dev/css/**/*.css',
		js_f: 'dev/js/**/*', 
		js_b: 'dev/blocks/**/*.js',
		images: 'dev/blocks/**/*.{jpg,png,gif,svg}',
		files: 'dev/files/**/*',
		fonts: 'dev/fonts/**/*.{eot,svg,ttf,woff,woff2}',
		main: ['public/**', '!public']
	},
	input = {
		css: 'dev/css',
		scss: 'dev/blocks/main.scss'
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
	isDeploy = (util.env.type == 'deploy');

gulp.task('default', ['build', 'server', 'watch']);

gulp.task('offline', ['build', 'serverOffline', 'watch']);

gulp.task('build', ['html', 'scss', 'css', 'js', 'images', 'files', 'fonts']);

gulp.task('html', function() {
	gulp.src(mask.html)
		.pipe(fileinclude())
		.on('error', util.log)
		.pipe(cache('htmling'))
		.pipe(filter(['*', '!dev/blocks', '!dev/includes']))
		.pipe(gulp.dest(output.main))
		.pipe(browserSync.stream());
});

gulp.task('scss', function() {
	gulp.src(input.scss)
		.pipe(sass().on('error', util.log))
		.pipe(gulp.dest(input.css))
});

gulp.task('css', function() {
	gulp.src(mask.css)
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
	gulp.src(mask.images)
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
	gulp.src(mask.files) 
		.pipe(gulp.dest(output.files))
		.pipe(browserSync.stream());
});

gulp.task('js', function() {
	gulp.src(mask.js_f)
		.pipe(cache('jsfing'))
		.pipe(ifelse(isProduction || isDeploy, uglify()))
		.pipe(gulp.dest(output.js))
		.pipe(browserSync.stream());

	gulp.src(mask.js_b) 
		.pipe(concat('main.js'))
		.pipe(ifelse(isProduction || isDeploy, uglify()))
		.pipe(gulp.dest(output.js))
		.pipe(browserSync.stream());
});

gulp.task('fonts', function() {
	gulp.src(mask.fonts) 
		.pipe(rename({dirname: ''}))
		.pipe(gulp.dest(output.fonts))
		.pipe(browserSync.stream());
});

gulp.task('server', function() {
	browserSync.init({
		server: output.main,
		open: false,
		browser: "browser",
		reloadOnRestart: true,
		online: true
	});
});

gulp.task('serverOffline', function() {
	browserSync.init({
		server: output.main,
		open: false,
		browser: "browser",
		reloadOnRestart: true,
		online: false
	});
});

gulp.task('watch', function() {
	gulp.watch(mask.html, ['html']);
	gulp.watch(mask.scss, ['scss']);
	gulp.watch(mask.css, ['css']);
	gulp.watch([mask.js_f, mask.js_b], ['js']);
	gulp.watch(mask.images, ['images']);
	gulp.watch(mask.files, ['files']);
	gulp.watch(mask.fonts, ['fonts']);
});

gulp.task('clean', function(cb) {
	del(mask.main);
});