gulp = require 'gulp'
coffee = require 'gulp-coffee'
sass = require 'gulp-sass'
webserver = require 'gulp-webserver'

srcDir = 'src'
srcScriptsFiles = "#{srcDir}/**/*.coffee"
srcStylesFiles = "#{srcDir}/**/*.scss"

distDir = 'dist'

gulp.task 'scripts:compile', ->
  gulp.src srcScriptsFiles
  .pipe coffee()
  .pipe gulp.dest distDir

gulp.task 'styles:compile', ->
  gulp.src srcStylesFiles
  .pipe sass()
  .pipe gulp.dest distDir

gulp.task 'src:compile', [
  'styles:compile'
  'scripts:compile'
]

gulp.task 'src:watch', ['src:compile'], ->
  gulp.watch srcScriptsFiles, ['scripts:compile']
  gulp.watch srcStylesFiles, ['styles:compile']

  gulp.src '.'
  .pipe webserver port: 8002
