const sass = require('sass');

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        clean: {
            dist: ["dist"]
        },

        copy: {
            // Copy rule handes modules that do now have dist folders
            // empireObject: {
            //     expand: true,
            //     cwd: 'src/js',
            //     src: ['**.js'],
            //     dest: 'dist/js',
            //     filter: 'isFile',
            //     flatten: true
            // },

            empireStyles: {
                expand: true,
                cwd: 'src/scss',
                src: ['**.scss'],
                dest: 'dist/scss',
                filter: 'isFile',
                flatten: true
            },

            tests: {
                expand: true,
                cwd: 'src/tests',
                src: ['**/*.*'],
                dest: 'dist/tests',
                filter: 'isFile'
            }
        },

        requirejs: {
            compile: {
                options: {
                    baseUrl: 'src/js',
                    name: 'emp',
                    paths: {
                        'getCookie': 'plugins/getCookie',
                        'expandingTextArea': 'plugins/expandingTextArea',
                        'process': 'plugins/processMaps',
                        'forms': 'plugins/forms',
                        'utils': "plugins/utils",
                        'empMessage': 'plugins/message',
                        'selectionPopup': 'plugins/selectionPopup',
                        'refresh': 'plugins/refreshSession',
                        'windows': 'plugins/windows',
                        'uiPopup': 'plugins/uiPopup',
                        'events': 'plugins/events',
                        'keepAlive': 'plugins/keepAlive',
                        'externalApp': 'plugins/externalApp',
                        'expandables': 'plugins/expandables',
                        'session': 'plugins/session',
                        'showHidePassword': 'plugins/showHidePassword',
                        'dynamicDropDown': 'plugins/dynamicDropDown',
                        'findParent': 'plugins/findParent',
                        'errorPage': 'plugins/errorPage',
                        'tooltip': 'empty:',
                        'addRemove': 'empty:',
                        'guid': 'empty:',
                        'jquery': 'empty:',
                        'render': 'empty:',
                        'stylesheet': 'empty:',
                        'dataStore': 'empty:',
                        'store': 'empty:',
                        'spin': 'empty:',
                        'detectZoom': 'empty:',
                        'cui': 'empty:',
                        'table': 'empty:',
                        'tabs': 'empty:',
                        'rating': 'empty:',
                        'datepicker': 'empty:',
                        'validation': 'empty:',
                        'kind': 'empty:',
                        'external-menu': 'empty:',
                        'spin': 'empty:',
                        'detectIE': 'empty:',
                        'clickblocker': 'empty:',
                        'message': 'empty:',
                        'badge': 'empty:',
                        'getCursorPosition': 'empty:',
                        'fastdom': 'empty:',
                        'journal': 'empty:',
                        'fetchWrapper': 'empty:',
                        'deepmerge': 'empty:',
                        'staticTree': 'empty:',
                        'analytics': 'empty:',
                        'fileUploadProgressModal': 'empty:'
                    },
                    optimize: 'none',
                    out: 'dist/js/emp.js',
                },
            },
        },

        sass: {
            options: {
                implementation: sass,
                sourceMap: true,
                outputStyle: 'compressed', // Options: nested, compressed
            },

            cui: {
                files: {
                    'dist/css/emp.css': ['src/scss/emp.scss']
                },
            },
        },

        // https://github.com/gruntjs/grunt-contrib-jshint
        // Supported options: http://jshint.com/docs/
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                browser: true,
                unused: 'vars',
                loopfunc: true,
            },
            files: [
                'src/js/**/*.js',
            ],
        }

    });

    // Load all grunt tasks.
    require('load-grunt-tasks')(grunt);

    // Load local tasks in the task folder.
    grunt.loadTasks('tasks');

    // Default task(s).
    grunt.registerTask('default', ['jshint', 'clean', 'requirejs', 'copy', 'sass']);

};
