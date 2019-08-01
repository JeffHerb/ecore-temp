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
                styles: {
                    expand: true,
                    cwd: 'src/css',
                    src: ['**/*.*'],
                    dest: 'dist/css',
                    filter: 'isFile',
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
                    sourceMap: true,
                    outputStyle: 'nested', // Options: nested, compressed
                },
    
                cui: {
                    files: {
                        'dist/css/quill.scss': ['src/scss/quill.scss']
                    },
                },
            },
    
            watch: {
                options: {
                    livereload: 35728,
                    interrupt: true,
                },

                styles: {
                    files: [
                        'src/**/*.scss',
                    ],
                    tasks: [
                        'sass'
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
            },
    
        });
    
        // Load all grunt tasks.
        require('load-grunt-tasks')(grunt);
    
        // Load local tasks in the task folder.
        grunt.loadTasks('tasks');
    
        // Default task(s)
        grunt.registerTask('default', ['clean', 'sass' 'copy']);
    
        // Development
        grunt.registerTask('dev', ['default', 'watch']);
    };
    