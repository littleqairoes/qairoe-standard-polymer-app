const gulp = require('gulp');
const nodeSass = require('node-sass');
const path = require('path');
const fs = require('fs');
const map = require('map-stream');
const gutil = require('gulp-util');
const basePath = "";
const excludeDir = basePath+"bower_components/";
const ext = "**/*.scss";
const polymerPath = 'bower_components/polymer/polymer.html';
const indexFile = 'index.html';

/**
 * We need to specify to nodeSass the include paths for Sass' @import
 * command. These are all the paths that it will look for it.
 *
 * Failing to specify this, will NOT Compile your scss and inject it to
 * your .html file.
 *
 */

const includePaths = ['template_components/**/', 'project_components/**/', 'styles/**/'];

const injectSass = function () {
  /* Original creator: David Vega. I just modified
  * it to take advantage of the Polymer 1.1's shared styles.
  *
  * This will look all the files that are inside:
  * app/elements folder. You can change this to match
  * your structure.  Note, this gulp script uses convention
  * over configuration. This means that if you have a file called
  * my-element-styles.html you should have a file called
  * my-element-styles.scss
  *
  * Note #2:
  * We use "!" (Exclamation Mark) to exclude gulp from searching these paths.
  * What I'm doing here, is that Polymer Starter Kit has inside its app folder
  * all the bower dependencies (bower_components). If we don't specify it to
  * exclude this path, this will look inside bower_components and will take a long time
  * (around 7.4 seconds in my machine) to replace all the files.
  */

  gutil.log('Restarting SASS');

  return gulp.src([
    // basePath + 'core/' + ext,
    basePath + 'project_components/' + ext,
    basePath + 'styles/' + ext,
    basePath + 'template_components/' + ext, '!'+excludeDir+ext])
    .pipe(map(function(file, cb) {
      if (path.basename(file.path, '.scss').indexOf('_') === 0 && path.basename(file.path, '.scss') !== '_index') {
        return cb();
      }

      const styleName = path.basename(file.path, '.scss');

      fs.readFile(file.path, function(err, data) {
        if (err || !data) {
          console.log(err);
          return cb();
        }

        nodeSass.render({
          data: data.toString(),
          includePaths: includePaths
        }, function(err, compiledScss) {
          if (err || !compiledScss) {
            console.log(err);
            return cb();
          }

          if (path.basename(file.path, '.scss') === '_index') {
            //This will match anything between the Start Style and End Style HTML comments.
            const startStyle = "<!-- INDEX STYLE START HERE -->";
            const endStyle = "<!-- INDEX STYLE END HERE -->";
            //Creates the regEx this ways so I can pass the constiables.
            const regEx = new RegExp(startStyle+"[\\s\\S]*"+endStyle, "g");

            fs.readFile(indexFile, 'utf-8', function(err, content) {
              if (err || !content) {
                console.log(err);
                return cb();
              }

              if (!regEx.test(content)) {
                //Return empty. if we return cb(null, file). It will add
                //the file that we do not want to the pipeline!!
                return cb();
              }

              var injectSassContent = startStyle +
                  "\n<style>\n" +
                  compiledScss.css.toString() +
                  "\n</style>\n" +
                  endStyle;

              content = content.replace(regEx, injectSassContent);

              fs.writeFile(indexFile, content, 'utf-8', function(err) {
                if (err) {
                  console.log(err)
                }
                return cb();
              })
            })
            // return cb();
          } else {
            const newPolymerPath = (path.relative(path.dirname(file.path), path.resolve(polymerPath)));

            if (styleName !== 'index') {
              const string = `<link rel="import" href="${newPolymerPath}">\n<dom-module id="${styleName}">\n<template>\n<style>\n` +
                compiledScss.css.toString() +
                '\n</style>\n</template>\n</dom-module>';

              fs.writeFile(path.join(path.dirname(file.path), styleName + '.html'), string, 'utf8', function(err) {
                if (err) {
                  console.log(err);
                }
                return cb();
              });
            }
          }
        });
      });
    }));
};

module.exports = injectSass;