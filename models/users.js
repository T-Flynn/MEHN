var mongoose = require('mongoose');
var Schema      = mongoose.Schema;

var userSchema = new Schema({
    phone: {type: Number,required: true,unique: true},
    hashed_password: {type: String, required: true},
    email: {type:String,required: true,unique: true},
    age: {type: Number},
    picture: {type: String},
    gender: {type: Number},
    nickName: {type: String},
    realName: {type: String},
    address: {type: String},
    createdAt: {type: Date, default: Date.now},
    comment: {type:Object,default:{num:0,comment:[]}}
});

var User = mongoose.model('User', userSchema);
module.exports = User;