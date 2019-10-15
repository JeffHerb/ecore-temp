const sass = require('node-sass');
module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        clean: {
            dist: ['dist/**/*.*'],
        },

        copy: {
            scripts: {
                expand: true,
                cwd: 'src/js',
                src: ['**/*.*'],
                dest: 'dist/js',
                filter: 'isFile',
                flatten: true,
            },
            tests: {
                expand: true,
                cwd: 'src/tests',
                src: ['**/*.*'],
                dest: 'dist/tests',
                filter: 'isFile',
            },
        },

        sass: {
            options: {
                implementation: sass,
                sourceMap: true,
                outputStyle: 'nested', // Options: nested, compressed
            },

            main: {
                files: {
                    'dist/scss/external-menu.scss': ['src/scss/external-menu.scss']
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
        },

        watch: {
            options: {
                livereload: 35728,
                interrupt: true,
            },

            styles: {
                files: [
                    '*.scss', // Settings file
                    'src/**/*.scss',
                ],
                tasks: [
                    'sass',
                    'copy',
                ],
            },

            scripts: {
                files: [
                    'src/**/*.js',
                ],
                tasks: [
                    'jshint',
                    'copy',
                ],
            }
        },

    });

    // Load all grunt tasks
    require('load-grunt-tasks')(grunt);

    // Load local tasks in the task folder
    grunt.loadTasks('tasks');

    // Default task(s)
    grunt.registerTask('default', ['jshint', 'clean', 'sass', 'markdown', 'copy']);

    // Development
    grunt.registerTask('dev', ['default', 'watch']);
};
