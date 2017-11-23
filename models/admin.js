var mongoose = require('mongoose');
var Schema      = mongoose.Schema;

var manageSchema = new Schema({
    loginname:  {type:String, required: true,unique: true},
    nicname: {type: String},
    hashed_password: {type: String, required: true},
    email: {type:String,required: true,unique: true},
    createdAt: {type: Date, default: Date.now()},
});

var Manage = mongoose.model('Manage', manageSchema);
module.exports = Manage;