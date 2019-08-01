module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        clean: {
            dist: ["dist"]
        },

        copy: {
            // Copy rule handes modules that do now have dist folders
            empireObject: {
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
                filter: 'isFile'
            }
        },

        // https://github.com/gruntjs/grunt-contrib-jshint
        // Supported options: http://jshint.com/docs/
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                browser: true,
                unused: 'vars',
                sub: true,
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
    grunt.registerTask('default', ['jshint', 'clean', 'copy']);

};
