/* 预置Cms信息，
  //集合名默认是带s的，
    但cms这个model已有s所
	以如果手动插入时不能再
	加s(也就是说不能是cmss)
	
  use admin
  db.cms.insert(
      {
       classTitle: '公司信息',
       title: '关于我们',
       content: '====关于我们=====',
       author:"admin",
       url: '/about'
      }
  )
 */

var mongoose = require('mongoose');
var Schema      = mongoose.Schema;

var cmsSchema = new Schema({
    classTitle: {type: String, required: true},
    title: {type: String, required: true},
    content: {type:String},
    author:{type: String, required: true},
    isShow: {type:Number,default:0},
    url: {type:String,required: true,unique: true},
    createdAt: {type: Date, default:  Date.now()},
});

var Cms = mongoose.model('Cms', cmsSchema);
module.exports = Cms;
