'use strict';

var gulp = require('gulp'),
	sass = require('gulp-sass'),//sass compiler
	autoprefixer = require('gulp-autoprefixer'),//https://www.npmjs.org/package/gulp-autoprefixer
	minifycss = require('gulp-minify-css'),//https://www.npmjs.org/package/gulp-minify-css
	rename = require('gulp-rename'),//https://www.npmjs.org/package/gulp-rename
	browserSync = require('browser-sync').create(),
	uglify = require('gulp-uglify'),
	// The gulp task system provides a gulp task 
	// with a callback, which can signal successful
	// task completion (being called with no arguments),
	// or a task failure (being called with an Error 
	// argument). 
	// Fortunately, this is the exact same format pump uses!
	pump = require('pump');


//Sass
// Because Browsersync only cares 
// about your CSS when it's finished compiling
// - make sure you call .stream() after gulp.dest
gulp.task('sass', function() {  
    gulp.src('sass/style.scss')
        .pipe(sass({includePaths: ['scss'], style: 'expanded' }))
        .pipe(autoprefixer("last 3 version","safari 5", "ie 8", "ie 9"))
		.pipe(gulp.dest("css"))
		.pipe(rename({suffix: '.min'}))
		.pipe(minifycss())
		.pipe(gulp.dest('css'))
		.pipe(browserSync.stream());
    gulp.watch("sass/style.scss").on('change', browserSync.reload);
});

//JS Watch and Compress
gulp.task('JS', function(){
	pump([
		gulp.src('js/main.js'),
		uglify(),
		rename({suffix: '.min'}),
		gulp.dest('js'),
		browserSync.stream()
	]);
	/*gulp.src('js/main.js')
	.pipe(uglify())
	.pipe(rename({suffix: '.min'}))
	.pipe(gulp.dest('js'));*/
	gulp.watch("js/main.js").on('change', browserSync.reload);
})


//Browser Synch - Static
// ***can use 'serve' where 'browser-sync' is used***
gulp.task('browser-sync', function() {  
    browserSync.init(["css/*.css", "js/*.js"], {
        server: {
            baseDir: "./"
        }
    });
    gulp.watch("*.html").on('change', browserSync.reload);
});

//Default tasks
gulp.task('default', ['sass', 'browser-sync', 'JS'], function () {  
    gulp.watch("sass/style.scss", ['sass']);
    gulp.watch("js/main.js", ['JS']);//insures that the .min js file reloads on live reload
});