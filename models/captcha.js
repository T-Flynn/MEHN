var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var captchaSchema = new Schema({
    captcha: {type: String,required: true,unique: true},
    createdAt: {type: Date, default: Date.parse(new Date())}
});

var Captcha = mongoose.model('Captcha', captchaSchema);
module.exports = Captcha;