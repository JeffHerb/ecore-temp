module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        bake: {
            index: {
                files: {
                    "dist/docs/index.html": "src/docs/index.html"
                }
            },
            // Common Attributes
            attributes: {
                files: {
                    "dist/docs/common/attributes/accessKey.html": 'src/docs/common/attributes/accessKey.html',
                    "dist/docs/common/attributes/eventScript.html": 'src/docs/common/attributes/eventScript.html',
                    "dist/docs/common/attributes/format.html": 'src/docs/common/attributes/format.html',
                    "dist/docs/common/attributes/htmlAttribute.html": 'src/docs/common/attributes/htmlAttribute.html',
                    "dist/docs/common/attributes/message.html": 'src/docs/common/attributes/message.html',
                    "dist/docs/common/attributes/preSubmitScript.html": 'src/docs/common/attributes/preSubmitScript.html',
                    "dist/docs/common/attributes/readOnly.html": 'src/docs/common/attributes/readOnly.html',
                    "dist/docs/common/attributes/required.html": 'src/docs/common/attributes/required.html',
                    "dist/docs/common/attributes/style.html": 'src/docs/common/attributes/style.html',
                    "dist/docs/common/attributes/visibility.html": 'src/docs/common/attributes/visibility.html'
                }
            },
            global: {
                files: {
                    "dist/docs/common/global/PageHeader.html": 'src/docs/common/global/PageHeader.html',
                }
            },
            tags: {
                files: {
                    "dist/docs/tags/button.html": 'src/docs/tags/button.html',
                    "dist/docs/tags/buttonGroup.html": 'src/docs/tags/buttonGroup.html',
                    "dist/docs/tags/checkbox.html": 'src/docs/tags/checkbox.html',
                    "dist/docs/tags/checkBoxGroup.html": 'src/docs/tags/checkBoxGroup.html',
                    "dist/docs/tags/col.html": 'src/docs/tags/col.html',
                    "dist/docs/tags/composite.html": 'src/docs/tags/composite.html',
                    "dist/docs/tags/date.html": 'src/docs/tags/date.html',
                    "dist/docs/tags/form.html": 'src/docs/tags/form.html',
                    "dist/docs/tags/hiddenField.html": 'src/docs/tags/hiddenField.html',
                    "dist/docs/tags/icon.html": 'src/docs/tags/icon.html',
                    "dist/docs/tags/inputGroup.html": 'src/docs/tags/inputGroup.html',
                    "dist/docs/tags/label.html": 'src/docs/tags/label.html',
                    "dist/docs/tags/message.html": 'src/docs/tags/message.html',
                    "dist/docs/tags/link.html": 'src/docs/tags/link.html',
                    "dist/docs/tags/notifier.html": 'src/docs/tags/notifier.html',
                    "dist/docs/tags/notifierGroup.html": 'src/docs/tags/notifierGroup.html',
                    "dist/docs/tags/selectBox.html": 'src/docs/tags/selectBox.html',
                    "dist/docs/tags/output.html": 'src/docs/tags/output.html',
                    "dist/docs/tags/pageBody.html": 'src/docs/tags/pageBody.html',
                    "dist/docs/tags/pageTitle.html": 'src/docs/tags/pageTitle.html',
                    "dist/docs/tags/passwordField.html": 'src/docs/tags/passwordField.html',
                    "dist/docs/tags/radio.html": 'src/docs/tags/radio.html',
                    "dist/docs/tags/radioGroup.html": 'src/docs/tags/radioGroup.html',
                    "dist/docs/tags/row.html": 'src/docs/tags/row.html',
                    "dist/docs/tags/selectionPopup.html": 'src/docs/tags/selectionPopup.html',
                    "dist/docs/tags/group.html": 'src/docs/tags/group.html',
                    "dist/docs/tags/tableColumn.html": "src/docs/tags/tableColumn.html",
                    "dist/docs/tags/tableControls.html": "src/docs/tags/tableControls.html",
                    "dist/docs/tags/table.html": "src/docs/tags/table.html",
                    "dist/docs/tags/tag.html": "src/docs/tags/tag.html",
                    "dist/docs/tags/text.html": 'src/docs/tags/text.html',
                    "dist/docs/tags/textArea.html": 'src/docs/tags/textArea.html',
                    "dist/docs/tags/score.html": 'src/docs/tags/score.html',
                }
            },
            reference: {
                files: {
                    "dist/docs/reference/deprecated.html": 'src/docs/reference/deprecated.html'
                }
            },
        },

        clean: {
            dist: ["dist"]
        },

        copy: {
            // Copy rule handes modules that do now have dist folders
            docStyles: {
                expand: true,
                cwd: 'src/docs/css',
                src: ['**.css'],
                dest: 'dist/docs/css',
                filter: 'isFile',
                flatten: true
            },
            testPages: {
                expand: true,
                cwd: 'src/tests',
                src: ['**/*.*'],
                dest: 'dist/tests',
                filter: 'isFile'
            },
            data: {
                expand: true,
                cwd: 'src/data',
                src: ['**/*.*'],
                dest: 'dist/data',
                filter: 'isFile'
            }
        },

        concat: {
            helpers: {
                options: {
                    separator: ';',
                    banner: "define(['handlebars'], function(Handlebars) {\n",
                    footer: "\n});"
                },
                src: ['src/templates/helpers/*.js'],
                dest: 'dist/js/helpers.js',
            }
        },

        requirejs: {
            compile: {
                options: {
                    baseUrl:'src/js',
                    name: 'render',
                    paths: {
                        'processTemplates': 'plugins/processTemplates',
                        'tableShiv': 'shivs/templates/table',
                        'sectionShiv': 'shivs/templates/section',
                        'fieldEvent': 'shivs/event/field',
                        'compositeEvent': 'shivs/event/composite',
                        'handlebars': 'empty:',
                        'handlebars-templates': 'empty:',
                        'handlebars-partials': 'empty:',
                        'handlebars-helpers': 'empty:',
                        'dataStore': 'empty:'
                    },
                    optimize: 'none',
                    out: 'dist/js/render.js'
                }
            }
        },

        handlebars: {
            templates: {
                options: {
                    processName: function(filePath) {
                        return filePath.replace(/.+?src\/templates\/|src\/templates\//, '').replace('.hbs', '');
                    },
                    amd: ['handlebars'],
                    partialsUseNamespace: true,
                    partialsPathRegex: /.+?src\/templates\/partials\/|src\/templates\/partials\//,
                    processPartialName: function(filePath) {
                        var pieces = filePath.replace('.hbs','').split("/");
                        return pieces[pieces.length - 1];
                    }
                },
                files: {
                    'dist/js/templates.js' : [ 'src/templates/*.hbs'],
                    'dist/js/partials.js': ['src/templates/partials/*.hbs']
                }
            }
        },

        "intern": {
            functional: {
                options: {
                    runType: 'runner',
                    config: './tests/intern',
                    reporters: [ 'Console' ],
                    basePath: './tests/render/functional/',
                    functionalSuites: [
                        'button',
                        'buttonGroup',
                        'checkbox',
                        'checkboxGroup',
                        'col',
                        'composite-asof',
                        'composite-search',
                        'date',
                        'group',
                        'form',
                        'frameworkError',
                        'selectbox',
                        'table',
                        'text',
                        'textarea'
                    ],
                    tunnel: 'NullTunnel',
                    environments: [{ browserName: 'chrome'}]
                }
            }
        }

    });

    // Load all grunt tasks.
    require('load-grunt-tasks')(grunt);

    // Load local tasks in the task folder.
    grunt.loadTasks('tasks');

    // Default task(s).
    grunt.registerTask('default', ['clean', 'bake', 'requirejs', 'copy', 'concat', 'handlebars']);

};
