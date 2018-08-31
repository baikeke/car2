var express = require('express');
var app = express();
var router = require("./router/router");
var session = require('express-session');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/Lease');


app.use(express.static('static'));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));

app.set("view engine", "ejs");
//显示首页
app.get("/index", router.showIndex);
//注册
app.get("/reg", router.showReg);
app.get("/checkuserexist", router.checkuserexist);
app.post("/doreg", router.doreg);


//登录
app.get("/", router.showLogin);
app.post("/checklogin", router.checklogin);


//租赁
app.get('/lease/:name',router.showLease);
app.get("/readYonghu",router.readYonghu);
app.post("/zuchuAdd",router.zuchuAdd);
app.get("/updateChuzu/:id",router.updateChuzu);

//归还
app.get('/return',router.showreturn);
app.get("/readrest",router.readrest);
app.get("/guihuan/:id",router.guihuan);


//退出
app.get('/tuichu', router.tuichu);

//查询客户
app.get("/query", router.showquery);
app.post('/doadd', router.doadd);
app.get('/doadd', router.getAll);
app.propfind('/doadd/:sid', router.check);
app.delete('/doadd/:sid', router.delete);
app.get('/doadd/:sid', router.showUpdate);
app.post('/doadd/:sid', router.update);



//类别档案
app.get('/category',router.category);

//汽车档案

app.get('/car',router.car);
app.post('/doadda', router.showdoadd);
app.get('/doadda', router.showgetAll);
app.propfind('/doadda/:sid', router.showcheck);
app.delete('/doadda/:sid', router.showdelete);
app.get('/doadda/:sid', router.showUpdatea);
app.post('/doadda/:sid', router.updatea);


//统计分析

app.get('/tj',router.showtj);
app.get('/resas',router.Sreadrest);
app.get('/sread',router.Sread);
app.get('/tongj',router.tongj);

app.post('/gh',router.gh);



app.listen('3233');