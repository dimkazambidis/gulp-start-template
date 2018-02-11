/***************************
  Vars
***************************/
var gulp         = require('gulp'),
	util         = require('gulp-util'),
	sass         = require('gulp-sass'),
	browserSync  = require('browser-sync'),
	concat       = require('gulp-concat'),
	uglify       = require('gulp-uglify'), //For JS
	cleanCSS     = require('gulp-clean-css'),
	rename       = require('gulp-rename'),
	del          = require('del'),
	imagemin     = require('gulp-imagemin'),
	jpgmin       = require('imagemin-jpegoptim'),
	pngmin       = require('imagemin-pngquant'),
	cache        = require('gulp-cache'),
	autoprefixer = require('gulp-autoprefixer'),
	include      = require('gulp-file-include');

/***************************
  Browser Sync
***************************/
gulp.task('browser-sync', function() {
	browserSync.init({
		server: { baseDir: 'app' },
		//proxy: 'yourlocal.dev',
		notify: false
	});
});

/***************************
  JS
***************************/
gulp.task('js', function() {
	return gulp.src([
		'app/libs/jquery/dist/jquery.min.js',
		'app/js/common.js'
	])
	.pipe(concat('scripts.js'))
	//.pipe(uglify())
	.pipe(gulp.dest('app/js'))
	.pipe(browserSync.stream());
});

/***************************
  Sass
***************************/
gulp.task('sass', function() {
	return gulp.src('app/sass/**/*.sass')
	.pipe(sass({
		outputStyle: 'expanded'
	}).on('error', sass.logError))
	//.pipe(rename({suffix: '.min'}))
	.pipe(autoprefixer({
		browsers: ['last 15 versions']
	}))
	//.pipe(cleanCSS())
	.pipe(gulp.dest('app/css'))
	.pipe(browserSync.stream());
});

/***************************
  Include
***************************/
gulp.task('include', function() {
	return gulp.src(['app/include/*.html'])
	.pipe(include({
		prefix: '@',
		basepath: '@file'
	}))
	.pipe(gulp.dest('app/'))
	.pipe(browserSync.stream());
});

/***************************
  Watch
***************************/
gulp.task('watch', ['sass', 'js', 'include', 'browser-sync'], function() {
	gulp.watch('app/sass/**/*.sass', ['sass']);
	gulp.watch('app/include/**/*.html', ['include']);
	//gulp.watch('app/*.html').on('change', browserSync.reload);
	gulp.watch('app/js/**/*.js', ['js']);
});

/***************************
  Image minification
***************************/
gulp.task('imagemin', function() {
	return gulp.src('app/images/**/*')
	.pipe(cache(imagemin([
		imagemin.gifsicle({interlaced: true}),
		jpgmin({
			progressive: true,
			max: 60,
			stripAll: true
		}),
		pngmin({
			quality: '60'
		}),
		//imagemin.jpegtran({progressive: true}),
		//imagemin.optipng({optimizationLevel: 5}),
		imagemin.svgo({
			plugins: [
				{removeViewBox: true},
				{cleanupIDs: false}
			]
		})
	])))

	.pipe(gulp.dest('dist/images'));
});

/***************************
  Build
***************************/
gulp.task('build', ['imagemin', 'sass', 'js', 'removedist'], function() {

	var buildFiles = gulp.src([
		'app/*.html',
		'app/.htaccess',
		]).pipe(gulp.dest('dist'));

	var buildCss = gulp.src([
		'app/css/style.css',
		]).pipe(gulp.dest('dist/css'));

	var buildJs = gulp.src([
		'app/js/scripts.js',
		]).pipe(gulp.dest('dist/js'));

	var buildFonts = gulp.src([
		'app/fonts/**/*',
		]).pipe(gulp.dest('dist/fonts'));
});

/***************************
  Default
***************************/
gulp.task('removedist', function() {
	return del.sync('dist');
});

gulp.task('clearcache', function () {
	return cache.clearAll();
});

gulp.task('default', ['watch']);