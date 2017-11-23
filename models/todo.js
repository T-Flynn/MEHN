
var mongoose = require('mongoose');
var Schema      = mongoose.Schema;

var todoSchema = new Schema({
    author: {type: String,required: true,unique: true},
    title: {type:String,required: true,unique: true},
    content: {type:String,required: true,unique: true},
    createdAt: {type: Date, default: Date.now},
    view: {type:Number,default:0},
    comment: {type:Number,default:0},
    picture: {type:String}
});

var Todo = mongoose.model('Todo', todoSchema);
module.exports = Todo;