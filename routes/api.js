var express = require('express');
var blogModel = require('../models/blog');
var userModel = require('../models/users');
var captchaModel = require('../models/captcha');
var svgCaptcha = require('svg-captcha');
var validator = require('validator');
var pubfun    = require('../lib/common.model.js');
var formidable = require('formidable');


var fs = require('fs');
const  AVATAR_UPLOAD_FOLDER = '/avatar/';



var router = express.Router();

router.get('/blogs', function(req, res) {
    res.render("blogs/blogs");
});
router.get('/captcha', getCaptcha);
router.post('/signup', checkPhone, checkPwd, checkRePwd, checkCaptcha, signup);
router.post('/signin',checkPhone,checkPwd,checkCaptcha, signIn);
router.get('/merchant-list',getUsers);
router.get('/get-blog-list', getBlogs);
router.get('/profile/:phone', getProfile);
router.post('/save-profile',saveprofile);
router.post('/upload-profile/:UID/:year/:month/:timestr',uploadProfile);







function getUsers(req,res) {
	var data = {};
	userModel.find({},function(err,users) {
		if(err) {
			data = {
				code:0,
                msg:err
			};
			console.log(err);
		}
		else {
			data = {
				code:1,
				users:users
			};
			return res.send(data);
		}
	})
}


function getBlogs(req, res) {
    var data = {};
    blogModel.find({}, function (err, blog) {
        if(err) {
            data = {
                code: 0,
                msg: err
            };
        }
        else {
            data = {
                code: 1,
                blog: blog
            };
        }
        return res.send(data);
    });
}

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
    console.log(req.body.pwd);
    console.log(req.body.repwd);
    if(req.body.repwd !== req.body.pwd) {
        retData.code = 0;
        retData.msg = "确认密码不一致";
        return res.send(retData);
    }
    next();
}
function checkCaptcha(req, res, next) {
    captchaModel.findOne(
        {captcha: req.body.captcha.trim().toLowerCase()} 
        ,function(err,data){
           if(err){
               console.log(err);
           }
           else
           {
              var retData = {};
              if(data){
                   if( (data.captcha.trim().toLowerCase()) !== 
                       (req.body.captcha.trim().toLowerCase()))
                   {
                       console.log("=====checkeCaptcha===000000");
                       retData.code = 0;
                       retData.msg = '请检查验证码是否正确！';
                       return res.send(retData);
                   }
                   else{
                       console.log("=====checkeCaptcha===1111111");
                       retData.code = 1;
                       retData.msg = '验证码正确！';
                       next();
                   }
              }
              else
              {
                  console.log("=====checkeCaptcha===22222");
                  retData.code = 0;
                  retData.msg = '请检查验证码是否正确！或你的验证码过期，请点击验证码图片重新获取！';
                  return res.send(retData); 
              }          
           }
        });   
}
function signup(req, res){
    var user = new userModel({phone:req.body.phone});
    console.log("====",user);
    user.set('hashed_password',pubfun.hashPW(req.body.pwd));
    user.set('email', req.body.phone+"@xxx.com");
    console.log(user);
    user.save(function (err) {
        if(err) {
            console.log(err);
        }
        else {
            let retData = {
                code :1,
                msg:"success",
                url:'/users/profile',
                data:{phone:req.body.phone}
            };
            req.session.phone = req.body.phone;
            delCaptcha();
            return res.send(retData);
        }
    });
}

//删除之前的验证码
function delCaptcha(){
    captchaModel.remove(
        {createdAt: { $lt : Date.parse(new Date())} },
     function(err){
      if(err)
        {
            console.log(err);
            return  res.send();
        }
    })
}

//验证码路由回调函数
function getCaptcha(req,res){
    var text = svgCaptcha.randomText();
    req.session.captcha = text;
    var captcha = svgCaptcha(text);

     var _captcha = new captchaModel({captcha: text.trim().toLowerCase()});

        _captcha.save( function(err,data) {
            if(err)
            {
               //console.log(err); 
            }
            else{
               // console.log("data------",data); 
            }
        }); 

    res.set('Content-Type', 'image/svg+xml');
    res.status(200).send(captcha);
}
function signIn(req, res) {
    userModel.find({phone:req.body.phone,hashed_password:pubfun.hashPW(req.body.pwd)},
        function (err, data) {
            let retData = {};
            if(err) {
                retData.code = 0;
                console.log(err);
            }
            else {
                retData = {
                    code :1,
                    msg:"success",
                    url:'/users/profile',
                    data:{
                        phone:req.body.phone
                    }
                };
                req.session.phone = req.body.phone;
                delCaptcha();
                return res.send(retData);
            }
        });
 }
 function getProfile(req, res) {
     userModel.findOne({phone:req.params.phone},function(err,users){
        var data = {};
        if(err) {
            data.code = 0;
            console.log(err);
        }
        else {
            data = {
                code :1,
                data:users
            }
            return res.send(data);
        }
     })
 }
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
        
        var data = {code:1,imgpath:imgpath};
        //return  res.redirect('/users/profile?imgpath='+imgpath);
        return  res.send(data);
        
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


module.exports = router;