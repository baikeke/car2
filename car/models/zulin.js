var mongoose =require("mongoose");
var Gh=new mongoose.Schema({
    "shichang":Number,
    "dayzujin":Number,
    "zong":Number,
    "kehu":String,
    "zhifu":Number,
    "carname":String,
    "guanliyuan":String,
    "date":String,
    'allmoney':Number
});

var gh=mongoose.model("gh",Gh);

module.exports=gh;