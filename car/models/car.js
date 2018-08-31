var mongoose = require('mongoose');

var carSchema = mongoose.Schema({
    sid:Number,
    name:String,
    category:String,
    price:Number,
    day:String,
    state:Boolean
});

carSchema.statics.addCard =function (json, callback) {
    car.checkSid(json.sid,function (torf) {
        if (torf){
            var s= new car(json);

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

carSchema.statics.checkSid = function (sid, callback) {
    this.find({'sid':sid},function (err, results) {
        callback(results.length==0);
    })
}

carSchema.statics.findAll = function (callback) {
    this.find({},function (err, results) {
        callback(results);
    })
};


carSchema.statics.getAttr = function (names,callback) {

    this.find(names,function (err, data) {
        // console.log(data);
        callback(err,data);
    })
};


var car = mongoose.model('car', carSchema);

module.exports =car;