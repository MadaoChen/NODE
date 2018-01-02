"use strict";

// 模块依赖
var gulp = require('gulp'); //gulp
var gutil = require('gulp-util'); //gulp工具
var sourcemaps = require('gulp-sourcemaps'); //map插件
var addsrc = require('gulp-add-src'); //追加js文件插件
var coffee = require('gulp-coffee'); //coffeescritp插件
var sass = require('gulp-sass'); //sass插件
var htmlmin = require('gulp-htmlmin'); //html压缩
var imagemin = require('gulp-imagemin'); //图片压缩
var pngcrush = require('imagemin-pngcrush');
var minifycss = require('gulp-minify-css'); //css压缩
var uglify = require('gulp-uglify'); //js压缩
var concat = require('gulp-concat'); //文件合并
var rename = require('gulp-rename'); //文件更名
var cssUrlVersion = require('gulp-make-css-url-version'); //css文件里引用url加版本号（根据引用文件的md5生产版本号）
var notify = require('gulp-notify'); //提示信息
var fs = require('fs-extra'); //fs 工具
var async = require('async'); // 异步工具
var run = require('run-sequence'); //按顺序运行插件
var del = require('del'); //删除工具
var path = require('path');
var nodemon = require('gulp-nodemon');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;


// 启动node服务 nodemon的作用类似于node，不同的是，nodemon能够检测 app.js 所在目录下的文件，如果有改变，就会自动重新启动 app.js
gulp.task('nodemon', function() {
    return nodemon({
        script: path.join(__dirname, 'bin/www'),
        ignore: [
            "/.idea",
            "/node_modules",
            "/dist",
            "/.git"
        ],
        env: {
            "NODE_ENV": "development"
        }
    });
});

// 架设browserSync服务器
gulp.task('server', ['nodemon', 'sass : watch'],function () {
    browserSync.init({
        files: ['static/dist/plugin.min.css', 'views/**/*.*'],
        browser: 'chrome',
        proxy: 'http://localhost:3030',
        port:3010  // 指定访问服务器的端口号
    });
});

//监听sass
gulp.task('sass : watch', function() {
    run('sass : emptyDir', 'sass : build', 'sass : min', "common : cssConcat")
    gulp.watch('static/sass/**/*.scss', function(e) {
        run('sass : emptyDir', 'sass : build', 'sass : min', "common : cssConcat")
    });
});
//清空sass目录
gulp.task('sass : emptyDir', function() {
    return del(['static/css/**']);
});
//编译sass
gulp.task('sass : build', function() {
    return gulp.src('static/sass/**/*.scss')
        .pipe(sourcemaps.init()) // sass文件和css文件代码的映射，可用于浏览器调试找寻sass源码
        .pipe(sass())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(minifycss())
        .pipe(sourcemaps.write('./')) // 生成sourcemap文件，路径为./
        .pipe(gulp.dest('static/css')); // 生成css文件
});
//压缩所有css成单一文件 和 加版本号
gulp.task('sass : min', function() {
    return gulp.src('static/css/*.css')
        .pipe(concat('itas.css'))
        .pipe(gulp.dest('static/css'))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(cssUrlVersion()) // 加版本号，但有些代理服务器不会缓存地址？后面的内容，所以会失效
        .pipe(minifycss({
            advanced: true, //类型：Boolean 默认：true [是否开启高级优化（合并选择器等）]
            compatibility: '*', //保留ie7及以下兼容写法 类型：String 默认：''or'*' [启用兼容模式； 'ie7'：IE7兼容模式，'ie8'：IE8兼容模式，'*'：IE9+兼容模式]
            keepBreaks: false //类型：Boolean 默认：false [是否保留换行]
        }))
        .pipe(gulp.dest('static/css'));
});
// 合并第三方插件CSS
gulp.task('common : cssConcat', function() {
    return gulp.src([
        'static/css/itas.min.css'
    ])
        .pipe(minifycss())
        .pipe(concat('plugin.min.css'))
        .pipe(gulp.dest('static/dist'));
});

