const sass = require('sass');

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
            },
            tests: {
                expand: true,
                cwd: 'src/tests',
                src: ['**/*.*'],
                dest: 'dist/tests',
                filter: 'isFile',
            },
        }

    });

    // Load all grunt tasks
    require('load-grunt-tasks')(grunt);

    // Load local tasks in the task folder
    grunt.loadTasks('tasks');

    // Default task(s)
    grunt.registerTask('default', ['clean', 'copy']);

};
