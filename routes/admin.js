var express = require('express');
var pubfun    = require('../lib/common.model.js');
var manageModel = require('../models/admin');


var router = express.Router();

router.get('/',function (req, res) {
    res.render('admin/login',{layout:null});
});
router.get('/dashboard',authorize,dashboard);


function dashboard(req,res) {
    res.render('admin/dashboard',{layout:'manage'});
}
/* 权限设置 */
function authorize(req, res, next) {
    if(req.session.role)
    {return next();}
    res.redirect(303,'/unauthorized');
}

router.post('/login',function (req, res) {
    var data = {};
    manageModel.find({loginname:req.body.user,
        hashed_password:pubfun.hashPW(req.body.password)
    },function (err,manages) {
        if (err) {
            console.log(err);
        }
        else {
            if (manages.length > 0) {
                req.session.role = 'manager';
                data = {
                    layout: 'manage',
                    code: 1,
                    url: '/admin/dashboard',
                    msg: '登录成功！'
                };
                res.render('admin/dashboard',data);
            }
            else {
                data = {
                    layout:null,
                    code: 0,
                    url: '/admin/',
                    msg: '登录名或密码错误！'
                };
                res.render('admin/login',data);
            }
        }
    });
});
//退出登录
router.get('/sign-out',function(req,res){
    req.session.role = null;
    return res.redirect('/');
});

module.exports = router;