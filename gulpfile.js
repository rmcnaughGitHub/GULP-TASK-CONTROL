'use strict';

var gulp = require('gulp'),
	sass = require('gulp-sass'),//sass compiler
	autoprefixer = require('gulp-autoprefixer'),//https://www.npmjs.org/package/gulp-autoprefixer
	minifycss = require('gulp-minify-css'),//https://www.npmjs.org/package/gulp-minify-css
	rename = require('gulp-rename'),//https://www.npmjs.org/package/gulp-rename
	browserSync = require('browser-sync').create(),
	uglify = require('gulp-uglify'),//minify js
	jshint = require('gulp-jshint'),//js hint
	imagemin = require('gulp-imagemin'),//https://www.npmjs.com/package/gulp-imagemin
	cache = require('gulp-cache'),
	del = require('del'),
	runSequence = require('run-sequence'),
	concat = require('gulp-concat'),//cocatenate files
	/* The gulp task system provides a gulp task 
	with a callback, which can signal successful
	task completion (being called with no arguments),
	or a task failure (being called with an Error 
	argument). Fortunately, this is the exact same format pump uses!*/
	pump = require('pump');


//PATHS
var paths = {
	base: {
		src: './app',
		html: 'app/*.html',
		css: 'app/css/*.css',
		js: 'js/*.js',
		dist: 'dist'
	}, 
	html: {
		src: 'app/index.html',
		main: './',
		dist: 'dist'
	},
	styles: {
		src: 'app/scss/**/*.scss',
		main: 'app/css',
		dist: 'dist/css'
	},
	scripts: {
		src: 'app/js/**/*.js',
		main: 'app/js',
		dist: 'dist/js',
		compress: 'dist/js/*.js'
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
		.pipe(browserSync.stream());
    gulp.watch(paths.styles.src).on('change', browserSync.reload);
});

gulp.task('sass-build', function() {  
    gulp.src(paths.styles.src)
        .pipe(sass({includePaths: ['scss'], style: 'expanded' }))
        .pipe(autoprefixer("last 3 version","safari 5", "ie 8", "ie 9"))
        .pipe(concat('styles.css'))
		.pipe(minifycss()) //*minify
		.pipe(gulp.dest(paths.styles.dist));//dist folder
});


//JAVASCRIPT WATCH {Compress}
gulp.task('JS', function(){
	pump([
		gulp.src(paths.scripts.src),
		gulp.dest(paths.scripts.main),
		browserSync.stream()
	]);
	gulp.watch(paths.scripts.src).on('change', browserSync.reload);
});


gulp.task('JS-build', function(){
	console.log("Concating and moving all the JS files in styles folder");
	pump([
		gulp.src(paths.scripts.src),
		//rename({suffix: '.min'}), //*rename
		concat('main.js'),//*concat
		uglify(), //*minify
		gulp.dest(paths.scripts.dist)
	]);
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
gulp.task('imageMin', function () {
    gulp.src(paths.images.src)
        .pipe( cache(imagemin({
        	optimizationLevel: 6, 
        	progressive: true, 
        	interlaced: true
        })))
  		.pipe(gulp.dest(paths.images.dist));
    gulp.watch(paths.images.src,['imageMin']);
});


//CLEAN DIST FOLDER
gulp.task('clean:dist', function() {
  return del.sync(paths.base.dist);
})


//DEFAULT TASKS
gulp.task('default', function() { 
	runSequence(['sass', 'browser-sync', 'JS']) 
    gulp.watch(paths.styles.src, ['sass']);// sass
    //gulp.watch(paths.scripts.src, ['JS']);// insures that the .min js file reloads on live reload
    //gulp.watch(paths.html.src, ['copy-html']); //* used if moving HTML file
    //gulp.watch(path.images.src), ['imageMin'];// image min
    //gulp.watch(paths.scripts.src, ['jshint']);// jshint
});


//BUILD TASK
gulp.task('build', function(){
	runSequence('clean:dist',['sass-build','JS-build', 'copy-html','imageMin'])
});
