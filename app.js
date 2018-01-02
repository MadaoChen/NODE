// 模块依赖
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ejs = require('ejs');

var main = require('./routers/main');

var http = require('http');
var app = express();

var port = 3030;

// 设置端口号
app.set('port', port);

// 视图引擎设置
app.set('views', path.join(__dirname, 'views'));
app.engine('html', ejs.__express);
app.set('view engine', 'html');

// 资源路径设置
app.use('/static', express.static(path.join(__dirname, 'static')));

// 加载环境变量
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'static')));

// 加载路由
app.use('/main', main);

// 启动服务器
//http.createServer(app).listen(app.get('port'), function() {
    //console.log('Express server listening on port ' + app.get('port'));
//});

// 加载错误处理解决方法 比普通的中间件多一个err 在前面的中间件中使用next(err对象)可以进去
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

//导出app对象
module.exports = app;