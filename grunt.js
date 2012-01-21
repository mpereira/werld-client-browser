var cleanCSS = require('clean-css');
var fs = require('fs');
var grunt = require('grunt');
var path = require('path');
var rimraf = require('rimraf');

config.init({
  meta: {
    dist: {
      production: {
        directory: './dist/production/'
      },

      development: {
        directory: './dist/development/'
      }
    }
  },

  lint: {
    files: [
      'grunt.js',
      'src/**/*.js'
    ]
  },

  concat: {
    'dist/development/javascripts/libs.js': [
      'vendor/javascripts/underscore-*.js',
      'vendor/javascripts/jquery-*.js',
      'vendor/javascripts/backbone-*.js',
      'vendor/javascripts/jquery.cross-slide-*.js'
    ],
    'dist/development/javascripts/play.js': [
      'src/werld.js',
      'src/canvas.js',
      'src/util.js',
      'src/models/*.js',
      'src/collections/*.js',
      'src/views/*.js'
    ],
    'dist/development/javascripts/index.js': [
      'src/index.js',
      'src/screenshot_slides.js',
      'src/facebook.js'
    ],
    'dist/development/stylesheets/index.css': [
      'vendor/stylesheets/*.css',
      'assets/stylesheets/webfonts.css',
      'assets/stylesheets/style.css'
    ],
    'dist/development/stylesheets/play.css': [
      'vendor/stylesheets/*.css',
      'assets/stylesheets/webfonts.css',
      'assets/stylesheets/canvas.css'
    ]
  },

  jst: {
    'dist/development/javascripts/templates.js': ['src/templates/*.html']
  },

  min: {
    'dist/production/javascripts/libs.js': ['dist/development/javascripts/libs.js'],
    'dist/production/javascripts/play.js': ['dist/development/javascripts/play.js'],
    'dist/production/javascripts/index.js': ['dist/development/javascripts/index.js'],
    'dist/production/javascripts/templates.js': ['dist/development/javascripts/templates.js']
  },

  mincss: {
    'dist/production/stylesheets/index.css': ['dist/development/stylesheets/index.css'],
    'dist/production/stylesheets/play.css': ['dist/development/stylesheets/play.css']
  },

  watch: {
    files: ['assets/**/*', 'src/**/*.js'],
    tasks: 'clean lint:files concat jst',

    min: {
      files: ['assets/**/*', 'src/**/*'],
      tasks: 'default'
    }
  },

  clean: {
    folder: 'dist/'
  }
});

task.registerBasicTask('clean', 'Deletes out all contents in a directory', function(data, name) {
  var errorcount = fail.errorcount;
  var folder = path.resolve(data);

  // Delete all files inside the folder
  task.helper('clean', folder);
});

task.registerHelper('clean', function(folder) {
  rimraf.sync(folder);
});

task.registerBasicTask('jst', 'Compile underscore templates to JST file', function(data, name) {
  // If namespace is specified use that, otherwise fallback
  var namespace = config('jst.namespace') || 'JST';
  // If template settings are available use those
  var templateSettings = config('jst.templateSettings') || null;

  // Create JST file.
  var errorcount = fail.errorcount;
  var files = file.expand(data);
  file.write(name, task.helper('jst', files, namespace, templateSettings));

  // Fail task if there were errors.
  if (fail.errorcount > errorcount) { return(false); }

  // Otherwise, print a success message.
  log.writeln('File "' + name + '" created.');
});

task.registerHelper('jst', function(files, namespace, templateSettings) {
  // Pulled from underscore 1.2.4
  function underscoreTemplating(str) {
      // Merge in the templateSettings that may be passed
      var c  = _.extend({}, _.templateSettings, templateSettings) ||
        _.templateSettings;

      var tmpl = 'var __p=[],print=function(){__p.push.apply(__p,arguments);};' +
        'with(obj||{}){__p.push(\'' +
        str.replace(/\\/g, '\\\\')
           .replace(/'/g, '\\\'')
           .replace(c.escape || noMatch, function(match, code) {
             return("',_.escape(" + code.replace(/\\'/g, "'") + "),'");
           })
           .replace(c.interpolate || noMatch, function(match, code) {
             return("'," + code.replace(/\\'/g, "'") + ",'");
           })
           .replace(c.evaluate || noMatch, function(match, code) {
             return("');" + code.replace(/\\'/g, "'")
                                .replace(/[\r\n\t]/g, ' ')
                                .replace(/\\\\/g, '\\') + ";__p.push('");
           })
           .replace(/\r/g, '\\r')
           .replace(/\n/g, '\\n')
           .replace(/\t/g, '\\t')
           + "');}return(__p.join(''));";

      return(new Function('obj', '_', tmpl).toString());
  };

  namespace = "this['" + namespace + "']";

  // Comes out looking like this["JST"] = this["JST"] || {};
  var contents = namespace + " = " + namespace + " || {};\n\n";

  // Compile the template and get the function source
  contents += files ? files.map(function(filepath) {
    var templateFunction = [
      "function(data) { ",
        "return ",
        underscoreTemplating(file.read(filepath)).replace("anonymous", ""),
        "(data, _)",
      "};"].join("");

    return(namespace + "['" + filepath + "'] = " + templateFunction);
  }).join("\n\n") : "";

  return(contents);
});

task.registerBasicTask('mincss', 'Compress down CSS files cleanly.', function(data, name) {
  // Minify CSS.
  var errorcount = fail.errorcount;
  var files = file.expand(data);
  file.write(name, task.helper('mincss', files));

  // Fail task if there were errors.
  if (fail.errorcount > errorcount) { return(false); }

  // Otherwise, print a success message.
  log.writeln('File \'' + name + '\' created.');
});

task.registerHelper('mincss', function(files) {
  // Minify and combine all CSS
  return(files ? files.map(function(filepath) {
    return(cleanCSS.process(file.read(filepath)));
  }).join('') : '');
});

task.registerTask('default', 'clean lint:files concat jst min mincss');
