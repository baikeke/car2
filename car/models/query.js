var mongoose = require('mongoose');

var querySchema = mongoose.Schema({
        sid:Number,
        name:String,
        tel:Number,
        address:String,
        card:Number,
        driving:String
});

querySchema.statics.addCard =function (json, callback) {
    query.checkSid(json.sid,function (torf) {
        if (torf){
            var s= new query(json);

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

querySchema.statics.checkSid = function (sid, callback) {
    this.find({'sid':sid},function (err, results) {
        callback(results.length == 0);
    })
}


var query = mongoose.model('query', querySchema);

module.exports =query;