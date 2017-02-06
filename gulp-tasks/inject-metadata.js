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
              },
              twitterTitle: {
                start: '<!-- TWITTER TITLE START HERE -->',
                end: '<!-- TWITTER TITLE END HERE -->',
                tagStart: '<meta property="twitter:title" content="',
                tagEnd: '" />'
              },
              chromeTitle: {
                start: '<!-- CHROME TITLE STARTS -->',
                end: '<!-- CHROME TITLE ENDS -->',
                tagStart: '<meta name="application-name" content="',
                tagEnd: '" />',
              },
              iosTitle: {
                start: '<!-- IOS TITLE STARTS -->',
                end: '<!-- IOS TITLE ENDS -->',
                tagStart: '<meta name="apple-mobile-web-app-title" content="',
                tagEnd: '" />'
              }
            },
            description: {
              descriptionTag: {
                start: '<!-- DESCRIPTION START -->',
                end: '<!-- DESCRIPTION END -->',
                tagStart: '<meta name="description" content="',
                tagEnd: '" />'
              },
              ogDescription: {
                start: '<!-- OG DESC START HERE -->',
                end: '<!-- OG DESC END HERE -->',
                tagStart: '<meta property="og:description" content="',
                tagEnd: '" />'
              },
              twitterDescription: {
                start: '<!-- TWITTER DESC START HERE -->',
                end: '<!-- TWITTER DESC END HERE -->',
                tagStart: '<meta name="twitter:description" content="',
                tagEnd: '" />'
              }
            },
            type: {
              ogType: {
                start: '<!-- OG TYPE START HERE -->',
                end: '<!-- OG TYPE END HERE -->',
                tagStart: '<meta property="og:type" content="',
                tagEnd: '" />'
              }
            },
            image: {
              ogImage: {
                start: '<!-- OG IMG START HERE -->',
                end: '<!-- OG IMG END HERE -->',
                tagStart: '<meta property="og:image" content="',
                tagEnd: '" />'
              },
              twitterImage: {
                start: '<!-- TWITTER IMG START HERE -->',
                end: '<!-- TWITTER IMG END HERE -->',
                tagStart: '<meta name="twitter:image" content="',
                tagEnd: '" />'
              }
            },
            card: {
              twitterCard: {
                start: '<!-- TWITTER CARD START HERE -->',
                end: '<!-- TWITTER CARD END HERE -->',
                tagStart: '<meta name="twitter:card" content="',
                tagEnd: '" />'
              }
            },
            site: {
              twitterSite: {
                start: '<!-- TWITTER SITE START HERE -->',
                end: '<!-- TWITTER SITE END HERE -->',
                tagStart: '<meta name="twitter:site" content="',
                tagEnd: '" />'
              }
            },
            creator: {
              twitterCreator: {
                start: '<!-- TWITTER CREATOR START HERE -->',
                end: '<!-- TWITTER CREATOR END HERE -->',
                tagStart: '<meta name="twitter:creator" content="',
                tagEnd: '" />'
              }
            },
            themeColor: {
              themeColorTag: {
                start: '<!-- THEME COLOR START HERE -->',
                end: '<!-- THEME COLOR END HERE -->',
                tagStart: '<meta name="theme-color" content="',
                tagEnd: '" />'
              },
              msThemeColor: {
                start: '<!-- MSTHEME COLOR START HERE -->',
                end: '<!-- MSTHEME COLOR END HERE -->',
                tagStart: '<meta name="msapplication-TileColor" content="',
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