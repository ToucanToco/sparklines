(function() {
  var enabledCoverage, files, preprocessors, wiredep;

  wiredep = require('wiredep');

  files = wiredep({
    devDependencies: true
  }).js;

  files.push("src/**/*.+(js|coffee)");

  files.push("test/unit/add-dom-element.coffee");

  files.push("test/unit/**/*.spec.coffee");

  files.push({
    pattern: 'test/fixtures/**/*',
    included: false
  });

  enabledCoverage = false;

  preprocessors = {
    'test/unit/**/*.coffee': 'coffee'
  };

  if (enabledCoverage) {
    preprocessors['src/**/*.+(js|coffee)'] = 'coverage';
  } else {
    preprocessors['src/**/*.+(\.js|coffee)'] = 'coffee';
  }

  module.exports = function(config) {
    var karmaConfig;
    karmaConfig = {
      basePath: '../',
      files: files,
      frameworks: ['mocha', 'chai-as-promised', 'sinon-chai', 'jquery-2.1.0', 'chai'],
      client: {
        mocha: {
          reporter: 'html'
        }
      },
      preprocessors: preprocessors,
      reporters: ['dots', 'coverage'],
      coverageReporter: {
        type: 'lcov',
        dir: 'test/coverage/'
      },
      browsers: ['Chrome'],
      logLevel: config.LOG_INFO,
      autoWatch: true,
      coffeePreprocessor: {
        options: {
          bare: true
        }
      }
    };
    return config.set(karmaConfig);
  };

}).call(this);
