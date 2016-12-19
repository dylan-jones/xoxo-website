// Include Gulp
var gulp = require("gulp");

// Include Plugins
var browserSync = require('browser-sync').create();
	autoprefixer = require('gulp-autoprefixer');
	runSequence = require('run-sequence');
	imagemin = require('gulp-imagemin');
	notifier = require('node-notifier');
	cssnano = require('gulp-cssnano');
	useref = require('gulp-useref');
	uglify = require('gulp-uglify');
	rename = require("gulp-rename");
	cache = require('gulp-cache');
	sass = require("gulp-sass");	
	gulpIf = require('gulp-if');
	del = require('del');

// Cleans up useless files
gulp.task('clean:dist', function() {
	return del.sync('dist');
})

// Move & Hot Reload HTML
gulp.task('html', function() {
  gulp.src('app/*.html')
    .pipe(gulp.dest('dist/'))
    .pipe(browserSync.reload({ stream: true }));
});

// Copy bower dependencies
gulp.task('bower', function() {
  gulp.src('app/bower_components/**/*')
    .pipe(gulp.dest('dist/bower_components'));
});

// Optimize Images
gulp.task('images', function() {
  return gulp.src('app/images/**/*')
    .pipe(cache(imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/images'));
});

//Copy fonts to Dist
gulp.task('fonts', function() {
	return gulp.src('app/fonts/**/*')
	.pipe(gulp.dest('dist/fonts'))
})
	
// Compile SASS
gulp.task('sass', function() {
  return gulp.src('app/scss/styles.scss')
    .pipe(sass({
        outputStyle: 'expanded'
      })
      .on('error', sass.logError))
    .pipe(autoprefixer({ browsers: ['last 2 versions'] }))
    .pipe(rename('styles.css'))
    .pipe(gulp.dest('dist/css'))
    .pipe(browserSync.reload({ stream: true }));
});

// Spins up localhost & watches for changes
gulp.task('serve', function() {
  browserSync.init({
    server: { baseDir: 'dist' },
    logFileChanges: false,
    injectChanges: true,
    port: 3000
  });
  notifier.notify({
    title: 'Watching for changes in \'src\'',
    message: 'Starting Server on localhost:3000',
    sound: 'Hero'
  });
});

// Watch for any file updates
gulp.task('watch', function(){
	gulp.watch('app/scss/**/*.scss', ['sass']);
	gulp.watch('app/*.html', ['html']).on('change', function() {
		browserSync.reload();
	});
	gulp.watch('app/images/**/*', ['images']).on('change', function() {
		browserSync.reload();
	});
	gulp.watch('app/fonts/**/*', ['fonts']).on('change', function() {
		browserSync.reload();
	});
	// Who watches the watchmen?
});

// Useref - Compiles everything in a build together
gulp.task('useref', function(){
  return gulp.src('app/*.html')
    .pipe(useref())
    // Minifies only if it's a JavaScript file
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulp.dest('dist'))
    // Minifies only if it's a CSS file
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulp.dest('dist'))
});

gulp.task('default', ['clean:dist'], function() {
  gulp.start('images', 'fonts', 'useref', 'bower', 'html', 'sass', 'serve', 'watch');
});
