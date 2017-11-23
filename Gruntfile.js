module.exports = function(grunt) {
    // 加载插件
    [
        'grunt-contrib-copy',
		'grunt-contrib-concat',
        'grunt-contrib-cssmin',
        'grunt-contrib-uglify',
        'grunt-contrib-jshint',
        'grunt-contrib-csslint',
        'grunt-contrib-imagemin',
        'grunt-contrib-less',
        'grunt-contrib-watch'
    ].forEach(function (task) {
       grunt.loadNpmTasks(task);
    });
    // 配置
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        //复制用包管理工具安装的库或文件到vendor目录下
        copy: {
            main: {
                files: [
                    //copy bootstrap
                    {
                        expand: true,flatten: true,
                        src: ['bower_components/bootstrap/dist/css/bootstrap.min.css'],
                        dest: 'public/vendor/bootstrap/dist/css/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,flatten: true,
                        src: ['bower_components/bootstrap/dist/js/bootstrap.min.js'],
                        dest: 'public/vendor/bootstrap/dist/js/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,flatten: true,
                        src: ['bower_components/bootstrap/dist/fonts/*.*'],
                        dest: 'public/vendor/bootstrap/dist/fonts/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,flatten: true,
                        src: ['bower_components/jquery/dist/jquery.min.js'],
                        dest: 'public/vendor/jquery/dist/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,flatten: true,
                        src: ['node_modules/validator/validator.min.js'],
                        dest: 'public/vendor/validator/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,flatten: true,
                        src: ['bower_components/datatables.net-bs/css/dataTables.bootstrap.min.css'],
                        dest: 'public/vendor/datatables.net-bs/css/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,flatten: true,
                        src: ['bower_components/datatables.net-bs/js/dataTables.bootstrap.min.js'],
                        dest: 'public/vendor/datatables.net-bs/js/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,flatten: true,
                        src: ['bower_components/datatables.net/js/jquery.dataTables.min.js'],
                        dest: 'public/vendor/datatables.net/js/',
                        filter: 'isFile'
                    }
                    
                ]
            }
        },
		/* 合并CSS和JS文件 */
		concat: {
			css: {
				src: ['public/stylesheets/*.css','less/main.css'],
				dest: 'public/stylesheets/dist/<%= pkg.name %>.css'
			},
            scripts: {
                src: ['public/javascripts/*.js'],
                dest: 'public/javascripts/dist/<%= pkg.name %>.js'
            }
		},
        /* 压缩css */
        cssmin: {
            options: {
                // 移除 CSS 文件中的所有注释
                keepSpecialComments: 0
            },
            minify: {
                expand: true,
                cwd: 'public/stylesheets/dist/',
                src: ['<%= pkg.name %>.css'],
                dest: 'public/stylesheets/dist/',
                ext: '.min.css'
            }
        },
        // 最小化、混淆、合并 JavaScript 文件
        uglify: {
            build: {
                //src: 'src/<%= pkg.name %>.js',
                src: 'public/javascripts/dist/<%= pkg.name %>.js',
                dest: 'public/javascripts/dist/<%= pkg.name %>.min.js'
            }
        },
        //检查Style CSS 语法
        csslint: {
            src: ['public/stylesheets/*.css']
        },
        //检查javascript语法
        jshint: {
            all: ['Gruntfile.js',
                'public/javascripts/*.js'
            ]
        },
        //压缩优化图片大小
        imagemin: {
            dist: {
                options: {
                    optimizationLevel: 3
                },
                files: [
                    {
                        expand: true,
                        cwd: 'public/images/',
                        src: ['**/*.{png,jpg,jpeg}'], // 优化 img 目录下所有 png/jpg/jpeg 图片
                        dest: 'public/images/' // 优化后的图片保存位置，默认覆盖
                    }
                ]
            }
        },
        //将less文件编译成css文件
        less: {
            development: {
                files: {
                    'less/main.css': 'less/main.less',
                }
            }
        },
        //监控CSS和js文件的变化，只要有修改就检查语法
        watch: {
            css: {
                files: 'public/stylesheets/*.css',
                tasks: ['csslint'],
                options: {
                    //livereload: true,
                    spawn: false,
                }
            },
            scripts: {
                files: 'public/javascripts/*.js',
                tasks: ['jshint'],
                options: {
                    spawn: false,
                },
            }
        }
    });
    // 默认任务
    grunt.registerTask('default',
        ['copy','less','concat','cssmin','uglify','imagemin']);
};