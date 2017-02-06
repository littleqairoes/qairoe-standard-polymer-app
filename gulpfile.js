const gulp = require('gulp');
const gulpif = require('gulp-if');
const watch = require('gulp-watch');
const path = require('path');
const injectSass = require('./gulp-tasks/inject-sass.js');
const injectMetadata = require('./gulp-tasks/inject-metadata.js');
/**
 * This is a three part gulpfile.
 *
 * 1. SASS Strategy
 * 2. Page Building Strategy
 * 3. Production Building Strategy
 */

/**
 * SASS STRATEGY
 */

gulp.task('watch-all', function(){
  injectSass();
  injectMetadata();
  watch(['pages/**/*.scss', 'web-components/**/*.scss', 'styles/**/*.scss', 'config/**/*.json'], function() {
    injectSass();
    injectMetadata();
  });
});

gulp.task('inject-metadata', injectMetadata);
gulp.task('inject-sass', injectSass);
