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
        },

        sass: {
            options: {
                sourceMap: true,
                outputStyle: 'nested', // Options: nested, compressed
            },

            cui: {
                files: {
                    'dist/css/menujs.css': ['src/scss/menujs.scss']
                },
            },
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

    });

    // Load all grunt tasks
    require('load-grunt-tasks')(grunt);

    // Load local tasks in the task folder
    grunt.loadTasks('tasks');

    // Default task(s)
    grunt.registerTask('default', ['clean', 'sass', 'markdown', 'copy']);

};
