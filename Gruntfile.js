
module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt); // npm install --save-dev load-grunt-tasks

  grunt.loadNpmTasks('grunt-tizen');
  grunt.loadNpmTasks('grunt-crosswalk');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-postcss');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-release');
  grunt.loadTasks('tools/grunt-tasks');

  grunt.initConfig({
    packageInfo: grunt.file.readJSON('package.json'),
    chromeInfo: grunt.file.readJSON('platforms/chrome-crx/manifest.json'),

    crosswalk: {
      options: {
        verbose: true, // informative output, otherwise quiet
        debug: false, // includes output of rm and cp commands (-v option)
        version: '<%= packageInfo.version %>',
        name: '<%= packageInfo.name %>',
        pkg: 'org.org01.webapps.<%= packageInfo.name.toLowerCase() %>',
        icon: 'icon_128.png',
        appRoot: 'build/apk',
      },
      'default': {}
    },

    clean: ['babel/', 'build/'],

    release: {
      options: {
        npm: false,
        npmtag: false,
        tagName: 'v<%= version %>'
      }
    },

	  babel: {
		  options: {
			  sourceMap: true,
			  presets: ['babel-preset-es2015']
		  },
		  dist: {
			  files: [{
				  "expand": true,
				  "cwd": ".",
				  "src": ["app/js/*.js"],
				  "dest": "babel/",
				  "ext": ".js"
			  }]
		  }
	  },

    postcss: {
      dist: {
        options: {
          map: true, // inline sourcemaps
          processors: [
            require('postcss-cssnext')({warnForDuplicates: false}), // cssnano also includes autoprefixer
            require('cssnano')() // minify the result
          ]
        },
        files: [
          { expand: true, cwd: '.', src: 'app/css/*.css', dest: 'build/' }
        ]
      },
      debug: {
        options: {
          map: true, // inline sourcemaps
          processors: [
            require('postcss-cssnext')()
          ]
        },
        files: [
          { expand: true, cwd: '.', src: 'app/css/*.css', dest: 'build/' }
        ]
      }
    },


    eslint: {
      /* see .eslintrc */
      target: ['app/js/*.js']
    },

    tizen_configuration: {
      // location on the device to install the tizen-app.sh script to
      // (default: '/tmp')
      tizenAppScriptDir: '/home/developer/',

      // path to the config.xml file for the Tizen wgt file - post templating
      // (default: 'config.xml')
      configFile: 'build/wgt/config.xml',

      // path to the sdb command (default: process.env.SDB or 'sdb')
      sdbCmd: 'sdb'
    },

    // minify JS
    uglify: {
      options: {
        sourceMap: true
      },
      dist: {
        files: [
          { expand: true, cwd: 'babel', src: 'app/js/*.js', dest: 'build/' }
        ]
      }
    },

    copy: {
      common: {
        files: [
          { expand: true, cwd: '.', src: ['app/sw-import.js'], dest: 'build/' },
          { expand: true, cwd: '.', src: ['app/lib/**'], dest: 'build/' },
          { expand: true, cwd: '.', src: ['app/audio/**'], dest: 'build/' },
          { expand: true, cwd: '.', src: ['app/data/**'], dest: 'build/' },
          { expand: true, cwd: '.', src: ['LICENSE'], dest: 'build/app/' },
          { expand: true, cwd: '.', src: ['app/README.txt'], dest: 'build/' },
          { expand: true, cwd: '.', src: ['app/_locales/**'], dest: 'build/' }
        ]
      },

      babel_js: {
        files: [
          { expand: true, cwd: 'babel', src: ['app/js/*'], dest: 'build/' },
        ],
      },

      image: {
       files: [
         { expand: true, cwd: '.', src: ['app/images/**'], dest: 'build/' },
         { expand: true, cwd: '.', src: ['app/css/images/**'], dest: 'build/' }
       ]
      },
      html: {
        files: [
          { expand: true, cwd: '.', src: ['app/*.html'], dest: 'build/' },
          { expand: true, cwd: '.', src: ['app/html/*.html'], dest: 'build/' }
        ],
      },
      css: {
        files: [
          { expand: true, cwd: '.', src: ['app/css/**'], dest: 'build/' }
        ]
      },
      js: {
        files: [
          { expand: true, cwd: '.', src: ['app/js/**'], dest: 'build/' }
        ]
      },

      wgt: {
        files: [
          { expand: true, cwd: 'build/app/', src: ['**'], dest: 'build/wgt/' },
          { expand: true, cwd: '.', src: ['icon_128.png'], dest: 'build/wgt/' }
        ]
      },

      wgt_config: {
        files: [
          { expand: true, cwd: 'platforms/tizen-wgt/', src: ['config.xml'], dest: 'build/wgt/' }
        ],
        options:
        {
          processContent: function(content, srcpath)
          {
            return grunt.template.process(content);
          }
        }
      },

      crx: {
        files: [
          { expand: true, cwd: 'build/app/', src: ['**'], dest: 'build/crx/' },
          { expand: true, cwd: '.', src: ['icon*.png'], dest: 'build/crx/' }
        ]
      },

      crx_unpacked: {
        files: [
          { expand: true, cwd: 'build/app/', src: ['**'], dest: 'build/crx/' },
          { expand: true, cwd: 'app/', src: ['js/**'], dest: 'build/crx/' },
          { expand: true, cwd: 'app/', src: ['css/**'], dest: 'build/crx/' },
          { expand: true, cwd: 'app/', src: ['*.html'], dest: 'build/crx/' },
          { expand: true, cwd: '.', src: ['icon*.png'], dest: 'build/crx/' }
        ]
      },

      crx_manifest:
      {
        files: [
          { expand: true, cwd: 'platforms/chrome-crx/', src: ['manifest.json'], dest: 'build/crx/' }
        ],

        options:
        {
          processContent: function(content, srcpath)
          {
            return grunt.template.process(content);
          }
        }

      },

      xpk: {
        files: [
          { expand: true, cwd: 'build/app/', src: ['**'], dest: 'build/xpk/' },
          { expand: true, cwd: '.', src: ['icon*.png'], dest: 'build/xpk/' }
        ]
      },

      xpk_manifest:
      {
        files: [
          { expand: true, cwd: 'platforms/tizen-xpk/', src: ['manifest.json'], dest: 'build/xpk/' }
        ],

        options:
        {
          processContent: function(content, srcpath)
          {
            return grunt.template.process(content);
          }
        }

      },

      apk: {
        files: [
          { expand: true, cwd: 'build/app/', src: ['**'], dest: 'build/apk/' },
          { expand: true, cwd: '.', src: ['icon*.png'], dest: 'build/apk/' }
        ]
      },

      apk_manifest:
      {
        files: [
          { expand: true, cwd: 'platforms/android-apk/', src: ['manifest.json'], dest: 'build/apk/' }
        ],

        options:
        {
          processContent: function(content, srcpath)
          {
            return grunt.template.process(content);
          }
        }

      },

      sdk: {
        files: [
          { expand: true, cwd: 'build/app/', src: ['**'], dest: 'build/sdk/' },
          { expand: true, cwd: 'app/', src: ['js/**'], dest: 'build/sdk/' },
          { expand: true, cwd: 'app/', src: ['css/**'], dest: 'build/sdk/' },
          { expand: true, cwd: 'app/', src: ['*.html'], dest: 'build/sdk/' },
          { expand: true, cwd: '.', src: ['icon*.png'], dest: 'build/sdk/' }
        ]
      },

      sdk_platform:
      {
        files: [
          { expand: true, cwd: 'platforms/tizen-sdk/', src: ['.project'], dest: 'build/sdk/' },
          { expand: true, cwd: 'platforms/tizen-wgt/', src: ['config.xml'], dest: 'build/sdk/' }
        ],

        options:
        {
          processContent: function(content, srcpath)
          {
            return grunt.template.process(content);
          }
        }

      },

    },

    htmlmin: {
      dist: {
        files: [
          { expand: true, cwd: '.', src: ['app/*.html'], dest: 'build/' },
          { expand: true, cwd: '.', src: ['app/html/*.html'], dest: 'build/' }
        ],
        options: {
          removeComments: true,
          collapseWhitespace: true,
          removeCommentsFromCDATA: false,
          removeCDATASectionsFromCDATA: false,
          removeEmptyAttributes: true,
          removeEmptyElements: false
        }
      }
    },

    imagemin: {
      dist: {
        options: {
          optimizationLevel: 3,
          progressive: true
        },
        files: [
          { expand: true, cwd: '.', src: ['app/images/**'], dest: 'build/' },
          { expand: true, cwd: '.', src: ['app/css/images/**'], dest: 'build/' }
        ]
      }
    },

    // make wgt package in build/ directory
    package: {
      wgt: {
        appName: '<%= packageInfo.name %>',
        version: '<%= packageInfo.version %>',
        files: 'build/wgt/**',
        stripPrefix: 'build/wgt/',
        outDir: 'build',
        suffix: '.wgt',
        addGitCommitId: false
      },
      sdk: {
        appName: '<%= packageInfo.name %>',
        version: '<%= packageInfo.version %>',
        files: 'build/sdk/**',
        stripPrefix: 'build/sdk/',
        outDir: 'build',
        suffix: '.zip'
      },
      'crx_zip': {
        appName: '<%= packageInfo.name %>-crx',
        version: '<%= packageInfo.version %>',
        files: 'build/crx/**',
        stripPrefix: 'build/crx/',
        outDir: 'build',
        suffix: '.zip'
      }
    },

    connect: {
      server: {
        options: {
          protocol: 'http',
          //protocol: 'https',
          //hostname: 'maxw-xps-8300.isw.intel.com',
          base: 'build/app/',
          keepalive: true
        }
      }
    },

    tizen: {
      push: {
        action: 'push',
        localFiles: {
          pattern: 'build/*.wgt',
          filter: 'latest'
        },
        remoteDir: '/home/developer/'
      },

      install: {
        action: 'install',
        remoteFiles: {
          pattern: '/home/developer/<%= packageInfo.name %>*.wgt',
          filter: 'latest'
        }
      },

      uninstall: {
        action: 'uninstall'
      },

      start: {
        action: 'start',
        stopOnFailure: true
      },

      stop: {
        action: 'stop',
        stopOnFailure: false
      },

      debug: {
        action: 'debug',
        browserCmd: 'google-chrome %URL%',
        localPort: 9090,
        stopOnFailure: true
      }
    }
  });

  grunt.registerTask('dist', [
    'clean', // clean babel/ and build/
    'babel', // babelify app/js -> babel/app/js
    'uglify:dist', // uglify babel/app/js -> build/app/js
    'imagemin:dist', // minify app/images -> build/app/images
    'postcss:dist', // preprocess css build/app/css -> build/app/css
    'htmlmin:dist', // minify app/html -> build/app/html
    'copy:common' // copy other stuff
  ]);

  grunt.registerTask('dist:debug', [
    'clean', // clean babel/ and build/
    'babel', // babelify app/js -> babel/app/js
    'copy:babel_js', // copy babel/app/js -> build/app/js
    'copy:image', // copy app/images -> build/app/images
    'postcss:debug', // preprocess css build/app/css -> build/app/css
    'copy:html', // copy app/html -> build/app/html
    'copy:common' // copy other stuff
  ]);

  grunt.registerTask('crx', ['dist', 'copy:crx', 'copy:crx_manifest']);
  grunt.registerTask('crx_unpacked', [
    'clean',
    'imagemin:dist',
    'copy:common',
    'copy:crx_unpacked',
    'copy:crx_manifest',
    'package:crx_zip'
  ]);
  grunt.registerTask('wgt', ['dist', 'copy:wgt', 'copy:wgt_config', 'package:wgt']);
  grunt.registerTask('xpk', ['dist', 'copy:xpk', 'copy:xpk_manifest']);
  grunt.registerTask('apk', ['dist', 'copy:apk', 'copy:apk_manifest']);
  grunt.registerTask('sdk', [
    'clean',
    'imagemin:dist',
    'copy:common',
    'copy:sdk',
    'copy:sdk_platform',
    'package:sdk'
  ]);

  grunt.registerTask('perf', [
    'dist',
    'uglify:perf',
    'inline',
    'copy:wgt',
    'copy:wgt_config',
    'package:wgt'
  ]);

  grunt.registerTask('install', [
    'tizen:push',
    'tizen:stop',
    'tizen:uninstall',
    'tizen:install',
    'tizen:start'
  ]);

  grunt.registerTask('wait', function () {
    var done = this.async();
    setTimeout(function () {
      done();
    }, 10000);
  });

  grunt.registerTask('restart', ['tizen:stop', 'tizen:start']);

  grunt.registerTask('pwa', ['dist']);

  grunt.registerTask('server', ['pwa', 'connect']);

  grunt.registerTask('wgt-install', ['wgt', 'install']);
  grunt.registerTask('sdk-install', ['sdk', 'install']);

  grunt.registerTask('default', 'pwa');
};
