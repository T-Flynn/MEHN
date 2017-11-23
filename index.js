//{{------引入相关依赖模块（库）部分
var express = require('express');
//跨域资源共享
var cors = require('cors');
var path = require('path');


var favicon = require('serve-favicon');
var bodyParser = require('body-parser');


var credentials = require('./credentials.js');


var index = require('./routes/index');
var users = require('./routes/users');
var admin = require('./routes/admin');
var api = require('./routes/api');
var blog = require('./routes/blog');

//------引入相关依赖模块（库）部分}}


//{{------实例化（将相关依赖模块实例化）部分
var app = express();

//------实例化（将相关依赖模块实例化）部分}}


//{{------设置环境变量部分
app.set('port', process.env.PORT || 3009);

//------设置环境变量部分}}


//{{------调中间件部分
// cookie-parser configuration
app.use(require('cookie-parser')(credentials.cookieSecret));

// express-session configuration
app.use(require('express-session')({
    resave: false,
    saveUninitialized: false,
    secret: credentials.cookieSecret,
}));


// database configuration MongoDB数据库连接设置
var mongoose = require('mongoose');
var options = {
    server: {
        socketOptions: {keepAlive: 1}
    }
};
switch (app.get('env')) {
    case 'development':
        mongoose.connect(credentials.mongo.development.connectionString, options);
        break;
    case 'production':
        mongoose.connect(credentials.mongo.production.connectionString, options);
        break;
    default:
        throw new Error('Unknown execution environment: ' + app.get('env'));
}
//设置handlebars 视图引擎及视图目录和视图文件扩展名
var handlebars = require('express-handlebars')
    .create({
        defaultLayout: 'main', // 设置默认布局为main
        extname: '.hbs', // 设置模板引擎文件后缀为.hbs
        //创建一个Handlebars 辅助函数，让它给出一个到静态资源的链接：
        helpers: {
            static: function (name) {
                return require('./lib/static.js').map(name);
            },
            section: function (name, options) {
                if (!this._sections) this._sections = {};
                this._sections[name] = options.fn(this);
                return null;
            }
        }
    });
app.engine('hbs', handlebars.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
//设置静态资源
app.use(express.static(__dirname + '/public'));

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//Handlebars中引用局部文件 中间件设置
app.use(function (req, res, next) {
    if (!res.locals.partials) res.locals.partials = {};
    res.locals.partials.discountContext = {
        locations: [{product: 'book', price: '99.00'}]
    };
    var Loginname = '';
    if (req.session.loginName) {
        Loginname = req.session.loginName;
    }
    res.locals.partials.navigationContext = {
        locations: [{Loginname: Loginname}]
    };
    next();
});


app.use('/', index);
app.use('/users', users);
app.use('/admin', admin);
app.use('/api', cors(), api);
app.use('/blog', blog);
//------调中间件部分}}

/* 测试部分 */
/*app.get('/', function(req, res){
    res.type('text/html');
    res.send('<span style="color:green">Welcome to My Site.</span>');
});
app.get('/about', function(req, res){
    res.type('text/html');
    res.send('<span style="color:green">About My WebSite.</span>');
});*/
app.get('/', function (req, res) {
    res.render('home');
});
app.get('/about', function (req, res) {
    res.render('about');
});
app.get('/contact', function (req, res) {
    res.render('contact');
});


//{{------定制错误部分

// 定制404 页面（所有的确404错误，都是找不到页面或
// 文件或路由错误---原因有两个，1、用户访问时在浏览
// 器中输入错误，2、开发者引用文件或路由错误）
app.use(function (req, res) {
    res.render('404')
});

// 定制500 页面（所有的500错误都是服务器端代码错识）
app.use(function (err, req, res, next) {
    res.render('500')
});

//-----定制错误部分}}


//在指定端口上启动应用

app.listen(app.get('port'), function () {
    console.log('Express 已启动在 http://localhost:' +
        app.get('port') + '; 若要终止运行请按组合键 Ctrl-C .');
});