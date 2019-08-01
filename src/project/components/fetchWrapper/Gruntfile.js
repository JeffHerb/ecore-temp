module.exports = function (grunt) {

    //conf
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        clean: {
            dist: ["dist"]
        },

        copy: {
            scripts: {
                expand: true,
                cwd: 'src/js',
                src: ['**.js'],
                dest: 'dist/js',
                filter: 'isFile',
                flatten: true
            },

            tests: {
                expand: true,
                cwd: 'src/tests',
                src: ['**/*.*'],
                dest: 'dist/tests',
                filter: 'isFile',
            }
        },

        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                browser: true,
                unused: 'vars',
                loopfunc: true,
            },
            files: [
                'src/js/**/*.js'
            ],
        },

        // "intern": {
        //     functional: {
        //         options: {
        //             cwd: './',
        //             runType: 'runner',
        //             config: 'tests/intern',
        //             reporters: ['Console'],
        //             basePath: './tests/errorReportIframe/functional/',
        //             functionalSuites: [
        //                 'composite-iframe'
        //             ],
        //             tunnel: 'NullTunnel',
        //             environmnents: [{ browser: 'chrome' }]
        //         }
        //     }
        // }

    });

    //load grunt tasks
    require('load-grunt-tasks')(grunt);

    //load local tasks
    grunt.loadTasks('tasks');

    //default tasks
    grunt.registerTask('default', ['jshint', 'clean', 'copy']);
}
