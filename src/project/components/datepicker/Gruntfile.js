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
            scripts: {
                expand: true,
                cwd: 'src/js',
                src: ['**.js'],
                dest: 'dist/js',
                filter: 'isFile',
                flatten: true
            },
            scriptsMain: {
                expand: true,
                cwd: 'src/js',
                src: ['**/*.*'],
                dest: '../../../../dist/js/components',
                filter: 'isFile'
            },
            stylesMain: {
                expand: true,
                cwd: 'dist/css',
                src: ['**/*.*'],
                dest: '../../../../dist/css/components',
                filter: 'isFile'
            },
            docs: {
                expand: true,
                cwd: 'src/docs',
                src: ['**/*.{js,html}'],
                dest: 'dist/docs',
                filter: 'isFile'
            },
            tests: {
                expand: true,
                cwd: 'src/tests',
                src: ['**/*.{js,html}'],
                dest: 'dist/tests',
                filter: 'isFile'
            },
        },

        sass: {
            options: {
                implementation: sass,
                sourceMap: true,
                outputStyle: 'compressed', // Options: nested, compressed
            },

            main: {
                files: {
                    'dist/scss/datepicker.scss': ['src/scss/datepicker.scss']
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
        },

        // https://github.com/treasonx/grunt-markdown
        markdown: {
            options: {
                highlight: 'auto',
                template: '../../docs/src/assets/templates/default.html',
                markdownOptions: {
                    highlight: 'manual', // Other options: 'auto'
                    gfm: true,
                },
            },
            docs: {
                files: [{
                    expand: true,
                    cwd: 'src/docs/',
                    src: ['**/*.md'],
                    dest: 'dist/docs',
                    ext: '.html',
                }],
            },
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
            },
        }

    });

    // Load all grunt tasks.
    require('load-grunt-tasks')(grunt);

    // Load local tasks in the task folder.
    grunt.loadTasks('tasks');

    // Default task(s)
    grunt.registerTask('default', ['clean', 'sass', 'jshint', /*'markdown',*/ 'copy']);

    // Development
    grunt.registerTask('dev', ['default', 'watch']);
};
