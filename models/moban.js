var mongoose = require('mongoose');
var Schema      = mongoose.Schema;

var cmsSchema = new Schema({

});

var Cms = mongoose.model('Cms', cmsSchema);
module.exports = Cms;