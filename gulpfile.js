var gulp = require('gulp');

var rename = require('gulp-rename');
var browserify = require('gulp-browserify');

var paths = {
    scripts: ['public/js/src/**/*.js']
};

var buildPath = 'public/js/build';


gulp.task('scripts', function () {
    gulp.src('public/js/src/main.js')
        .pipe(browserify({
            transform: ['reactify']
        }))
        .pipe(rename('bundle.js'))
        .pipe(gulp.dest(buildPath))
});

gulp.task('watch', function() {
    gulp.watch(paths.scripts, ['scripts']);
});

gulp.task('default', ['watch']);