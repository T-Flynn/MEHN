var express = require('express'),
    blogsModel = require('../models/blog'),
    usersModel = require('../models/users');


var router = express.Router();


router.get('/list',authorize,function (req, res) {
    res.render('blogs/list',{layout:"manage"});
});
router.post('/get-blogs-list',getBlogList);
router.get('/show-blogs/:id',showBlogs);
router.post('/addComment/:id',addComment);

router.get('/detail/:id',function (req, res) {
    blogsModel.find({_id: req.params.id},function (err, blogs) {
        if(err) {
            console.log(err);
        }
        else {
            var context = {
                title: blogs[0].title,
                content: blogs[0].content,
                createdAt: blogs[0].createdAt,
                id:blogs[0].id
            };
            res.render('blogs/detail',context);
        }
    });
});

function authorize(req, res, next) {
    if(req.session.role)
    {return next();}
    res.redirect(303,'/unauthorized');
}
function getBlogList(req, res ) {
    var data = {};
    blogsModel.find({},function (err, blogs) {
        if(err) {
            console.log(err);
        }
        else {
            data = {
                code:1,
                blogs:blogs
            };
            return res.send(data);
        }
    });
}
function showBlogs(res, req) {
    let data = {};
    blogsModel.find({_id: req.params.id},function (err, blogs) {
        if(err) {
            data.code = 0;
            console.log(err);
        }
        else {
            data = {
                code:1,
                msg:"success",
                blogs:blogs
            };
            console.log(res);
            return res.send(data);
        }
    });
}
function addComment(res, req) {
    let data = {};
    blogsModel.find({_id: req.body.uid},function (err, blogs) {
        if(err) {
            data.code = 0;
            console.log(err);
        }
        else {
            let commentArr = getComment(blogs[0].comment,req.body.uid,req.body.comment);
            updateComment(req.body.uid,commentArr);
            data = {
                code:1,
                blogs:blogs
            };
        }
        return res.send(data);
    });
}
function getComment(commentArr,id,newComment) {
    commentArr.comment.push(newComment);
    blogsModel.update({_id: id},function (err, blogs) {
        
    })
}
function updateComment() {
    
}



module.exports = router;