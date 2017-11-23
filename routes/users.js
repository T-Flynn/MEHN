/* 导入 */
var express = require('express');
var formidable = require('formidable');
var mongoose = require('mongoose');
var validator = require('validator');
var pubfun    = require('../lib/common.model.js');
var credentials = require('../credentials.js');
var emailService = require('../lib/email.js')(credentials);
var userModel = require('../models/users.js');
var cmsModel = require('../models/cms.js');

var fs = require('fs');
const  AVATAR_UPLOAD_FOLDER = '/avatar/';

/* 实例化 */
var router = express.Router();

router.get('/signin', function (req,res) {
    res.render("users/signin");
});
router.post('/signin', checkCaptcha, signIn);
router.get('/signup', function (req,res) {
    res.render("users/signup");
});
router.post('/signup', checkPhone, checkPwd, checkRePwd, checkCaptcha, signup);
router.get('/list',function (req,res) {
    if (req.session.role === "manager") {
        res.render("users/list", {layout:"manage"});
    }
    else {
        res.render("users/list");
    }
});
router.post('/get-users-list',getUsersList);
router.get('/profile', getProfile);
router.post('/upload-profile/:UID/:year/:month/:timestr',uploadProfile);
router.post('/save-profile',saveprofile);
router.get('/show-user/:id',showUser);
router.post('/delete-profile/:id',deleteProfile);
router.get('/list-2',function (req, res) {
    if (req.session.role === "manager") {
        res.render("users/list-2", {layout:"manage"});
    }
    else {
        res.render("users/list-2");
    }
});
router.post('/get-users-list-2',getUsersList2);
router.post('/save-cms',saveCms);
router.post('/cms',cms);
router.get('/show-cms/:id',showCms);
router.post('/delete-cms/:id',deleteCms);
//退出登录
router.get('/sign-out',function(req,res){
    req.session.loginName = null;
    return res.redirect('/');
});


function checkPhone(req, res, next) {
    let retData = {};
    if(!validator.isMobilePhone(req.body.phone,"zh-CN")) {
        retData.code = 0;
        retData.msg = "请输入正确的电话号码";
        return res.send(retData);
    }
    next();
}
function checkPwd(req, res, next) {
    let retData = {};
    if(!validator.isLength(req.body.pwd,{min: 6, max: 20})) {
        retData.code = 0;
        retData.msg = "请输入正确的密码格式";
        return res.send(retData);
    }
    next();
}
function checkRePwd(req, res, next) {
    let retData = {};
    if(req.body.repwd !== req.body.pwd) {
        retData.code = 0;
        retData.msg = "确认密码不一致";
        return res.send(retData);
    }
    next();
}
function checkCaptcha(req, res, next) {
    let retData = {};
    if(req.body.captcha.toLowerCase() !== req.session.captcha.toLowerCase()) {
        retData.code = 0;
        retData.msg = "验证码不一致";
        return res.send(retData);
    }
    next();
}
function signup(req, res){
    var user = new userModel({phone:req.body.phone});
    user.set('hashed_password',pubfun.hashPW(req.body.pwd));
    user.set('email', req.body.phone+"@xxx.com");
    user.save(function (err) {
        if(err) {
        
        }
        else {
            let retData = {
                code :1,
                msg:"success",
                url:'/users/profile'
            };
            req.session.phone = req.body.phone;
            return res.send(retData);
        }
    });
}
function cms(req, res) {
    var cms = new cmsModel({url:req.body.url});
    cms.set('classTitle',req.body.classTitle);
    cms.set('title',req.body.title);
    cms.set('content',req.body.content);
    cms.set('author',req.body.author);
    cms.set('isShow',req.body.isShow);
    cms.save(function (err) {
        if(err) {
            console.log(err);
        }
        else {
            let retData = {
                code :1,
                msg:"success",
                url:'/users/list-2'
            };
            req.session.url = req.body.url;
            return res.send(retData);
        }
    });
}

function getUsersList(req,res) {
    var data = {};
    userModel.find({},function (err,users) {
        if(err) {
            console.log(err);
        }
        else {
            data = {
                url: 'users/profile',
                code: 1,
                users: users
            };
            if(req.session.role) {
                data.role = req.session.role;
            }
            return res.send(data);
        }
    });
}
function getUsersList2(req,res) {
    var data = {};
    cmsModel.find({},function (err,cms) {
        if(err) {
            console.log(err);
        }
        else {
            data = {
                code: 1,
                cms: cms
            };
            if(req.session.role) {
                data.role = req.session.role;
            }
            return res.send(data);
        }
    });
}
function signIn(req, res) {
   userModel.find({phone:req.body.phone,hashed_password:pubfun.hashPW(req.body.pwd)},
       function (err, users) {
       let retData = {};
           if(err) {
                console.log(err);
           }
           else {
               if(users.length > 0) {
                   retData = {
                       code :1,
                       msg:"success",
                       url:'/users/profile',
                   };
                   req.session.loginName = users[0].nickName?users[0].nickName:req.body.phone;
                   req.session.phone = req.body.phone;
               }
               else  {
                   retData = {
                       code :0,
                       msg:"密码或用户名错误"
                   };
               }
               return res.send(retData);
           }
       });
}

function getProfile(req,res){
    if(req.session.phone)
    {
        userModel.find({phone:req.session.phone},
            function (err,users) {
                if(err){console.log(err);}
                else{
                    var retData = {users:users};
                    var now         = new Date();
                    retData.UID     = req.session.phone;
                    retData.year    = now.getFullYear();
                    retData.month   = now.getMonth();
                    retData.timestr = Date.now();
                    if(req.xhr) {
                        res.send(retData);
                    }
                    else {
                        res.render("users/profile",retData);
                    }
                }
            });
    }
}
//处理上传文件
function uploadProfile(req,res) {
    console.log(req.body);
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';		//设置编辑
    form.uploadDir = 'public' + AVATAR_UPLOAD_FOLDER;	 //设置上传目录
    form.keepExtensions = true;	 //保留后缀
    form.parse(req, function(err, fields, files){
        if(err) return res.redirect(303, '/error');
        
        var extName = '';  //后缀名
        switch (files.photo.type) {
            case 'image/pjpeg':
                extName = 'jpg';
                break;
            case 'image/jpeg':
                extName = 'jpg';
                break;
            case 'image/png':
                extName = 'png';
                break;
            case 'image/x-png':
                extName = 'png';
                break;
        }
        console.log(files);
        //req.params.timestr
        var newPath = 'public/avatar_2/'+req.params.timestr+"."+extName;
        
        fs.renameSync(files.photo.path, newPath);  //重命名
        //console.log(files.photo.path+"-----"+files.photo.name +"###"+ extName +"==="+req.params.year);
        //console.log('received fields:');
        var imgpath='/avatar_2/'+req.params.timestr+"."+extName;
        updateProfilePicture (req.params.UID,imgpath);
        
        //var data = {imgpath:imgpath};
        return  res.redirect('/users/profile?imgpath='+imgpath);
        // return  res.send(data);
        
    });
}

//更新个人肖像
function updateProfilePicture (UID,imgpath) {
    var data = {};
    
    userModel.update({phone:UID},
        {$set:{picture:imgpath,
            update:true}},
        {upsert:false,multi:false})
        .exec(function (err,users) {
            if(err){
                data = {msg: 'Update failure for '
                + UID,code:'0'};
            }else {
                data = {msg: 'Update successful for '
                + UID,code:'1'};
            }
            // res.send(data);
        });
}

//保存资料
function saveprofile(req, res) {
    userModel.update({phone:  req.body.phone},
        {$set:
            {
                gender: req.body.gender,
                realName: req.body.realName,
                nickName: req.body.nickName,
                age: req.body.age,
                address: req.body.address,
                email:req.body.email,
                update: true
            }
        },
        {upsert:false,multi:false})
        .exec(function (err, users) {
            if(err) {
                console.log(err);
            }
            else {
                let retData = {
                    code: 1,
                    url:"/users/profile",
                    users:users
                };
                return res.send(retData);
            }
    });
}
function saveCms(req, res) {
    cmsModel.update({url: req.body.url},
        {$set:
            {
                classTitle: req.body.classTitle,
                title: req.body.title,
                content: req.body.content,
                author: req.body.author,
                isShow: req.body.isShow,
                update: true
            }
        },
        {upsert:false,multi:false})
        .exec(function (err, cms) {
            if(err) {
                console.log(err);
            }
            else {
                let retData = {
                    code: 1,
                    url:"/users/list-2",
                    cms:cms
                };
                return res.send(retData);
            }
        });
}
/* 获取数据 */
function showUser(req, res) {
    let retData = {};
    userModel.find({_id: req.params.id},
        function (err, users) {
            if(err) {
                retData.code = 0;
                retData.msg = err;
            }
            else {
                retData.code = 1;
                retData.msg = "success";
                retData.users = users;
                retData.url = "/users/list";
            }
            return res.send(retData);
        });
}
function showCms(req, res) {
    let retData = {};
    cmsModel.find({_id: req.params.id},
        function (err, cms) {
            if(err) {
                retData.code = 0;
                retData.msg = err;
            }
            else {
                retData.code = 1;
                retData.msg = "success";
                retData.cms = cms;
                retData.url = "/users/list-2";
            }
            return res.send(retData);
        });
}
function deleteProfile(req, res) {
    let retData = {};
    userModel.remove({_id: req.params.id},
        function (err, users) {
        if(err) {
            console.log(err);
        }
        else {
            let retData = {
                code: 1,
                url:"/users/list"
            };
            return res.send(retData);
        }
    });
}
function deleteCms(req, res) {
    let retData = {};
    cmsModel.remove({_id: req.params.id},
        function (err, cms) {
            if(err) {
                console.log(err);
            }
            else {
                let retData = {
                    code: 1,
                    url:"/users/list-2"
                };
                return res.send(retData);
            }
        });
}
/* 导出 */


module.exports = router;