module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        clean: {
            dist: ['dist']
        },

        copy: {
            scripts: {
                expand: true,
                cwd: 'src/js',
                src: ['**.js'],
                dest: 'dist/js',
                filter: 'isFile',
                flatten: true
            }
        },

        // https://github.com/gruntjs/grunt-contrib-jshint
        // Supported options: http://jshint.com/docs/
        // jshint: {
        //     options: {
        //         curly: true,
        //         eqeqeq: true,
        //         browser: true,
        //         unused: 'vars',
        //     },
        //     files: [
        //         'src/js/**/*.js',
        //     ],
        // },

    });

    // Load all grunt tasks
    require('load-grunt-tasks')(grunt);

    // Load local tasks in the task folder
    grunt.loadTasks('tasks');

    // Default task(s)
    grunt.registerTask('default', ['clean', 'copy']);
};
