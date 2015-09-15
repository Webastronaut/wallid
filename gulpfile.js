var gulp = require('gulp'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename');

gulp.task('default', function() {
	return gulp.src('./wallid.js')
		.pipe(uglify())
		.pipe(rename('wallid.min.js'))
		.pipe(gulp.dest('./'));
});	