const gulp = require('gulp');
const path = require('path');
const fs = require('fs');
const versions = require('../config/versions.json');
const map = require('map-stream');
const gutil = require('gulp-util');
const indexFile = 'index.html';

const injectMetadata = function(v) {
  return gulp.src(['config/**/*.json'])
    .pipe(map(function(file, cb) {
      v = v || 'development';
      const buildVersion = versions[v];
      if (path.basename(file.path, '.json') !== buildVersion) {
        return cb();
      }

      fs.readFile(file.path, 'utf-8', function(err, data) {
        try {
          if (err) throw err;
          // console.log(data)
          const json = JSON.parse(data)

          // TITLE
          const metadata = {
            title: {
              titleTag: {
                start: "<!-- TITLE START HERE -->",
                end: "<!-- TITLE END HERE -->",
                tagStart: '<title>',
                tagEnd: '</title>'
              },
              ogTitle: {
                start: '<!-- OG TITLE START HERE -->',
                end: '<!-- OG TITLE END HERE -->',
                tagStart: '<meta property="og:title" content="',
                tagEnd: '" />'
              }
            }
          };

          // OTHERS

          fs.readFile(indexFile, 'utf-8', function(err, content) {
            if (err || !content) {
              console.log(err);
              return cb();
            }

            for (var j in metadata) {
              for (var i in metadata[j]) {
                if (metadata[j][i].start && metadata[j][i].end) {
                  metadata[j][i].regEx = new RegExp(metadata[j][i].start+"[\\s\\S]*"+metadata[j][i].end, "g");
                  if (metadata[j][i].regEx.test(content)) {
                    content = content.replace(metadata[j][i].regEx, metadata[j][i].start + metadata[j][i].tagStart + json.metadata[j] + metadata[j][i].tagEnd + metadata[j][i].end);
                  }
                }
              }
            }

            fs.writeFile(indexFile, content, 'utf-8', function(err) {
              if (err) {
                console.log(err)
              }
              return cb();
            })

          })

        } catch (e) {
          gutil.log(e.message);
          console.log(e);
          return cb(e)
        }
      })

    }));
}

module.exports = injectMetadata;