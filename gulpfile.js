var gulp = require('gulp'),
	uglify = require('gulp-uglify');

gulp.task('default', function() {
	return gulp.src('./wallid.js')
		.pipe(uglify())
		.pipe(gulp.dest('./wallid.min.js'));
});	