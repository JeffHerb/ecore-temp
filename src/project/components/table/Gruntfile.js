module.exports = function (grunt) {
    // Project configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        clean: {
            dist: ['dist/**/*.*'],
        },

        copy: {
            testPages: {
                expand: true,
                cwd: 'src/tests',
                src: ['**/*.*'],
                dest: 'dist/tests',
                filter: 'isFile',
            },
            tableStyles: {
                expand: true,
                cwd: 'src/scss',
                src: ['**/*.*'],
                dest: 'dist/scss',
                filter: 'isFile',
            },
        },

        requirejs: {
            compile: {
                options: {
                    baseUrl: 'src/js',
                    name: 'table',
                    paths: {
                        'tableBase': 'plugins/base',
                        'tableSort': 'plugins/sort',
                        'tableSelection': 'plugins/selection',
                        'tableResponsive': 'plugins/responsive',
                        'tableFilter': 'plugins/filters',
                        'tableChangeReturn': 'plugins/changeReturn',
                        'tableError': 'plugins/error',
                        'tableMobile': 'plugins/mobile',
                        'tableMenuButton': 'plugins/menuButton',
                        'tableBreakout': 'plugins/breakout',
                        'tablePivot': 'plugins/pivot',
                        'emp': 'empty:',
                        'guid': 'empty:',
                        'jquery': 'empty:',
                        'render': 'empty:',
                        'stylesheet': 'empty:',
                        'dataStore': 'empty:',
                        'spin': 'empty:',
                        'detectZoom': 'empty:'
                    },
                    optimize: 'none',
                    out: 'dist/js/table.js',
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
            },
            files: [
                'src/js/**/*.js',
            ],
        }

    });

    // Load the plugin that provides the 'uglify' task.
    require('load-grunt-tasks')(grunt);

    // Load local tasks in the task folder.
    grunt.loadTasks('tasks');

    // Default task(s).
    grunt.registerTask('default', ['jshint', 'clean', 'copy', 'requirejs']);

};
