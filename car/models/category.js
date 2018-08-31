var mongoose = require('mongoose');

var categorySchema = mongoose.Schema({
    sid:Number,
    name:String
});

categorySchema.statics.addCard =function (json, callback) {
    category.checkSid(json.sid,function (torf) {
        if (torf){
            var s= new category(json);

            s.save(function (err) {
                if (err){
                    callback(-2);
                    return;
                }

                callback(1);
            })
        } else{
            callback(-1);
        }
    })
};

categorySchema.statics.checkSid = function (sid, callback) {
    this.find({'sid':sid},function (err, results) {
        callback(results.length == 0);
    })
}


var category = mongoose.model('category', categorySchema);

module.exports =category;