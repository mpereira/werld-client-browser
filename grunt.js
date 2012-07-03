module.exports = function(grunt) {
  grunt.loadNpmTasks('bbb');

  grunt.initConfig({
    pkg: '<json:package.json>',
    meta: {
      banner: '// <%= pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? "// " + pkg.homepage + "\n" : "" %>' +
        '// Copyright (c) <%= grunt.template.today("yyyy") %> ' +
        ' <%= pkg.author %>.\n' +
        '// All rights reserved.\n' +
        '// Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %>.',
      libs: [
        'vendor/javascripts/jquery-*.js',
        'vendor/javascripts/underscore-*.js',
        'vendor/javascripts/underscore.string-*.js',
        'vendor/javascripts/backbone-*.js',
        'vendor/javascripts/easel-*.js',
        'vendor/javascripts/tween-*.js',
        'vendor/javascripts/preload-*.js',
        'vendor/javascripts/stats-*.js'
      ],
      src: [
        'src/werld.js',
        'src/gumps.js',
        'src/items.js',
        'src/creatures.js',
        'src/images.js',
        'src/collections/creatures.js',
        'src/collections/threateners.js',
        'src/collections/messages.js',
        'src/collections/ephemeral_messages.js',
        'src/**/base/*.js',
        'src/**/*.js'
      ],
      stylesheets: ['assets/stylesheets/**/*.less']
    },
    lint: {
      grunt: ['grunt.js'],
      scripts: ['scripts/*.js'],
      src: '<config:meta.src>'
    },
    less: {
      style: {
        files: {
          'build/stylesheets/style.css': 'assets/stylesheets/style.less',
        },
        options: {
          compress: true
        }
      }
    },
    min: {
      src: {
        src: ['<banner:meta.banner>', '<config:meta.src>'],
        dest: 'build/javascripts/werld.js'
      },
      libs: {
        src: '<config:meta.libs>',
        dest: 'build/javascripts/libs.js'
      }
    },
    watch: {
      grunt: {
        files: '<config:lint.grunt>',
        tasks: 'lint:grunt'
      },
      scripts: {
        files: '<config:lint.scripts>',
        tasks: 'lint:scripts'
      },
      src: {
        files: '<config:meta.src>',
        tasks: 'lint:src'
      },
      ejs: {
        files: 'templates/**/*.ejs',
        tasks: 'ejs'
      }
    },
    ejs: {
      index: {
        src: 'templates/index.html.ejs',
        dest: 'build/index.html',
        locals: {
          src: '<config:meta.src>',
          libs: '<config:meta.libs>',
          stylesheets: '<config:meta.stylesheets>'
        }
      }
    },
    clean: ['build'],
    jshint: {
      options: {
        boss: true,
        browser: true,
        curly: true,
        eqeqeq: true,
        eqnull: true,
        es5: true,
        expr: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        node: true,
        sub: true,
        undef: true
      },
      globals: {
        '$': true,
        '_': true,
        Backbone: true,
        FB: true,
        Werld: true,
        // PreloadJS.
        AbtractLoader: true,
        PreloadJS: true,
        TagLoader: true,
        XHRLoader: true,
        // TweenJS.
        Tween: true,
        Ease: true,
        // EaselJS.
        Bitmap: true,
        BitmapAnimation: true,
        Container: true,
        Graphics: true,
        Rectangle: true,
        Shadow: true,
        Shape: true,
        SpriteSheet: true,
        Stage: true,
        Stats: true,
        Text: true,
        Ticker: true
      }
    }
  });

  grunt.registerTask('build', 'lint clean min ejs less');

  grunt.registerMultiTask('ejs', 'Compile EJS templates', function() {
    var _ = grunt.utils._;
    var environment = process.env.NODE_ENV || 'development';
    var data = require('fs').readFileSync(this.data.src, 'utf-8');
    var locals = _(this.data.locals).reduce(function(memo, value, key, object) {
      object[key] = grunt.file.expand(value);
      _(memo).extend(object);
      return(memo);
    }, {});
    var config = _({
      environment: environment
    }).extend(require('./config/environments.js')[environment]);

    grunt.file.write(this.data.dest, require('ejs').render(data, {
      locals: _({ '_': _, Werld: { Config: config } }).extend(locals)
    }));

    grunt.log.writeln('File "' + this.data.dest + '" created.');
  });
};
