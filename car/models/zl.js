var mongoose = require('mongoose');

var zlSchema = mongoose.Schema({
    kehu:String,
    carname:String,
    zhifu:Number,
    allmoney:Number
});

exports.counts = function(carname , callback){
     zl.count({"carname":carname},function (err,data) {
         callback(err,data)
     });
}



var zl = mongoose.model('zl', zlSchema);

module.exports =zl;