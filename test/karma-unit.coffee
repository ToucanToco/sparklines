wiredep = require 'wiredep'
files = wiredep
    devDependencies: true
  .js

files.push "src/**/*.+(js|coffee)"
files.push "test/unit/add-dom-element.coffee"
files.push "test/unit/**/*.spec.coffee"
files.push 'dist/tc-sparklines.css'
files.push 'test/styles.css'
files.push
  pattern: 'test/fixtures/**/*'
  included: false

enabledCoverage = false

preprocessors =
  'test/unit/**/*.coffee': 'coffee'

if enabledCoverage
  preprocessors['src/**/*.+(js|coffee)'] = 'coverage'
else
  preprocessors['src/**/*.+(\.js|coffee)'] = 'coffee'

module.exports = (config) ->
  karmaConfig =
    basePath: '../'

    files: files

    # /!\ The order is important, and frameworks are loaded in reverse order
    frameworks: [
      'mocha'
      'chai-as-promised'
      'sinon-chai'
      'jquery-2.1.0'
      'chai'
    ]

    client:
      mocha:
        reporter: 'html'

    preprocessors: preprocessors

    reporters: [
      'dots'
      'coverage'
    ]

    coverageReporter:
      type: 'lcov'
      dir: 'test/coverage/'

    browsers: [
      'Chrome'
    ]

    logLevel: config.LOG_INFO
    autoWatch: true

    coffeePreprocessor:
      options:
        bare: true

  config.set karmaConfig
