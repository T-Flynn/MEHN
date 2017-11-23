//此文件定义一些后端公共的方法

const crypto = require('crypto');

const pubfun = {
//密码加密
    hashPW:function(pwd){
        return crypto.createHash('sha256').update(pwd).
        digest('base64').toString();
    },
    
    
    
    
};
module.exports=pubfun;