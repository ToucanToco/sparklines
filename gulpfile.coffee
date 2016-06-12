gulp = require 'gulp'
coffee = require 'gulp-coffee'
sass = require 'gulp-sass'
webserver = require 'gulp-webserver'

srcDir = 'src'
testDir = 'test'
srcScriptsFiles = "#{srcDir}/**/*.coffee"
testScriptsFiles = "#{testDir}/**/*.coffee"
srcStylesFiles = "#{srcDir}/**/*.scss"

distDir = 'dist'

gulp.task 'tests:compile', ->
  gulp.src testScriptsFiles
  .pipe coffee()
  .pipe gulp.dest testDir

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
  'tests:compile'
]

gulp.task 'src:watch', ['src:compile'], ->
  gulp.watch srcScriptsFiles, ['scripts:compile']
  gulp.watch srcStylesFiles, ['styles:compile']
  gulp.watch testScriptsFiles, ['tests:compile']

  gulp.src '.'
  .pipe webserver port: 8002
