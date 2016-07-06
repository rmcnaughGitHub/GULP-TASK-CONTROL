//'use strict';

var gulp = require('gulp'),
	sass = require('gulp-sass'),//sass compiler
	autoprefixer = require('gulp-autoprefixer'),//https://www.npmjs.org/package/gulp-autoprefixer
	minifycss = require('gulp-minify-css'),//https://www.npmjs.org/package/gulp-minify-css
	rename = require('gulp-rename'),//https://www.npmjs.org/package/gulp-rename
	browserSync = require('browser-sync').create(),
	uglify = require('gulp-uglify'),//minify js
	jshint = require('gulp-jshint'),//js hint
	imagemin = require('gulp-imagemin'),//https://www.npmjs.com/package/gulp-imagemin
	/* The gulp task system provides a gulp task 
	with a callback, which can signal successful
	task completion (being called with no arguments),
	or a task failure (being called with an Error 
	argument). 
	Fortunately, this is the exact same format pump uses!*/
	pump = require('pump');


//PATHS
var paths = {
	base: {
		src: './app',
		html: 'app/*.html',
		css: 'app/css/*.css',
		js: 'js/*.js'
	}, 
	html: {
		src: 'app/index.html',
		main: './',
		dist: 'dist'
	},
	styles: {
		src: 'app/scss/style.scss',
		main: 'app/css',
		dist: 'dist/css'
	},
	scripts: {
		src: 'app/js/main.js',
		main: 'app/js',
		dist: 'dist/js'
	},
	images: {
		src: 'app/images/*.{png,jpg,jpeg,gif,svg}',
		main: 'app/images',
		dist: 'dist/images'
	}
};


//HTML COPY - used if compying to another directory
gulp.task('copy-html', function(){
	gulp.src(paths.html.src)
	.pipe(gulp.dest(paths.html.dist))
});


//SASS
// Because Browsersync only cares 
// about your CSS when it's finished compiling
// - make sure you call .stream() after gulp.dest
gulp.task('sass', function() {  
    gulp.src(paths.styles.src)
        .pipe(sass({includePaths: ['scss'], style: 'expanded' }))
        .pipe(autoprefixer("last 3 version","safari 5", "ie 8", "ie 9"))
		.pipe(gulp.dest(paths.styles.main))//app folder
		//.pipe(rename({suffix: '.min'})) //*rename
		.pipe(minifycss()) //*minify
		.pipe(gulp.dest(paths.styles.dist))//dist folder
		.pipe(browserSync.stream());
    gulp.watch(paths.styles.src).on('change', browserSync.reload);
});


//JAVASCRIPT WATCH {Compress}
gulp.task('JS', function(){
	pump([
		gulp.src(paths.scripts.src),
		//rename({suffix: '.min'}), //*rename
		gulp.dest(paths.scripts.main),
		uglify(), //*minify
		gulp.dest(paths.scripts.dist),
		browserSync.stream()
	]);
	gulp.watch(paths.scripts.src).on('change', browserSync.reload);
})


//BROWSER SYNC - LIVE RE-LOAD
// ***can use 'serve' where 'browser-sync' is used***
gulp.task('browser-sync', function() {  
    browserSync.init([paths.base.css, paths.base.js], {
        server: {
            baseDir: paths.base.src
        }
    });
    gulp.watch(paths.base.html).on('change', browserSync.reload);
});


//JS LINT {UNUSED}
gulp.task('jshint', function(){
	gulp.src(paths.scripts.src)
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'))
		.pipe(jshint.reporter('fail'));
	gulp.watch(paths.scripts.src).on('change', browserSync.reload);
});


//IMAGE-MINIFY
gulp.task('images', function () {
    gulp.src(paths.images.src)
        .pipe(plumber({errorHandler: onError}))
        .pipe(cached(imageMin({optimizationLevel: 3, progressive: true, interlaced: true})))
        .pipe(gulp.dest(paths.images.dist))
        .pipe(size({showFiles: true}))
        .pipe(notify('image-min is done.\n'));
    gulp.watch(paths.images.src).on('change', browserSync.reload);
});


//Default tasks
gulp.task('default', ['sass', 'browser-sync', 'JS', 'copy-html'], function () {  
    gulp.watch(paths.html.src, ['copy-html']); //* used if moving HTML file
    gulp.watch(paths.styles.src, ['sass']);// sass
    gulp.watch(paths.scripts.src, ['JS']);// insures that the .min js file reloads on live reload
    //gulp.watch(path.images.src), ['images'];// image min
    //gulp.watch(paths.scripts.src, ['jshint']);// jshint
});