var user = require("../models/user.js");
var query = require("../models/query.js");
var car = require("../models/car.js");
var gh = require("../models/zulin.js");
var zl = require("../models/zl.js");
var url = require("url");
var formidable = require("formidable");
var fs = require("fs");
//加密模块
var crypto = require('crypto');


//显示首页
exports.showIndex = function (req, res, next) {
    var login = req.session.login == 1 ? true : false;
    var yonghuming = login ? req.session.yonghuming : "";
    if (yonghuming) {
        user.getK(yonghuming, "touxiang", function (err, v) {
            res.render("index", {
                "login": login,
                "yonghuming": yonghuming,
                "touxiang": v
            });
        });
    } else {
        res.render("index", {
            "login": login,
            "yonghuming": "",
            "touxiang": ""
        });
    }

};
exports.showLogin = function (req, res, next) {
    res.render("login");
};
exports.showReg = function (req, res, next) {
    res.render("reg");
};

//显示租赁
exports.showLease = function (req, res, next) {
    var login = req.session.login == 1 ? true : false;
    var yonghuming = login ? req.session.yonghuming : "";
    if (yonghuming) {
        //得到头像
        user.getK(yonghuming, "touxiang", function (err, v) {

            car.findAll(function (results) {
                // console.log(results);
                var json = {};
                var classarr = [];
                for (var i = 0; i < results.length; i++) {
                    var key = results[i].category;

                    if (json[key]) {
                        json[key]++;
                    } else {
                        json[key] = 1;
                    }

                }
                // console.log(json);

                for (var key in json) {
                    classarr.push(key);
                }
                // console.log(classarr);
                var names = req.params.name;
                // console.log(names);
                car.getAttr({"category": names}, function (err, data) {
                    // console.log(data);
                    res.render('Lease', {
                        'data': data,
                        "result": classarr, "login": login,
                        "yonghuming": yonghuming,
                        "touxiang": v
                    });
                })
            });
        })
    } else {
        res.render("Lease", {
            'data': "",
            "result": "",
            "login": login,
            "yonghuming": "",
            "touxiang": ""
        });
    }

};
//在租赁个页获取客户
exports.readYonghu = function (req, res) {
    query.find({}, function (err, data) {
        res.json({"s": data})
    })
};
//确认租车
exports.zuchuAdd = function (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields) {
        var json = new gh(fields)
        json.save(function (err) {
            if (err) {
                res.json({"s": -1});
                return;
            } else {
                res.json({"s": 1});
                return;
            }
        })
    })
};
//更改出租车状态
exports.updateChuzu = function (req, res) {
    var id = req.params.id;
    car.find({"_id": id}, function (err, data) {
        var result = data[0];
        result.sid = result.sid;
        result.name = result.name;
        result.category = result.category;
        result.price = result.price;
        result.day = result.day;
        result.state = true;
        result.save(function (err) {
            if (err) {
                res.json({"s": -1})
                return;
            }
            res.json({"s": 1})
        })
    })
};
//归还页面
exports.showreturn = function (req, res, next) {
    res.render('return')
};
exports.readrest = function (req, res) {
    gh.find({}, function (err, data) {
        res.json({"s": data})
    })
};
//归还
exports.guihuan = function (req, res, next) {
    var id = req.params.id;
    car.find({"name": id}, function (err, data) {
        // console.log(data);
        var result = data[0];

        result.sid = result.sid;
        result.name = result.name;
        result.category = result.category;
        result.price = result.price;
        result.day = result.day;
        result.state = false;
        result.save(function (err) {
            if (err) {
                res.json({"s": -1})
                return;
            }
            res.json({"s": 1})
        })
    });

    gh.find({"carname":id},function (err, results) {
        if (err||results.length==0){
            res.json({"result":-1});
            return;
        }

        results[0].remove(function (err) {
            if (err){
                res.json({'result':-1});
                return;
            }

            // res.json({'result':1})
        })
    })
};


//验证用户名是否存在
exports.checkuserexist = function (req, res, next) {
    var queryobj = url.parse(req.url, true).query;
    if (!queryobj.yonghuming) {
        res.send("请提供yonghuming参数！");
        return;
    }
    //查询数据库中，用户是否存在，如果存在输出-1，不存在输出0
    user.findUserByName(queryobj.yonghuming, function (err, doc) {
        if (doc) {
            res.json({"result": -1});
        } else {
            res.json({"result": 0});
        }
    });
};

//执行注册，在真正执行注册的时候也要后台验证一下用户名是否占用
exports.doreg = function (req, res, next) {
    var form = new formidable.IncomingForm();

    form.parse(req, function (err, fields, files) {
        var yonghuming = fields.yonghuming;
        var mima = fields.mima;
        //在提交的时候再次检查用户名是否重复了
        user.findUserByName(yonghuming, function (err, doc) {
            if (doc) {
                //-1就是用户名存在
                res.json({"result": -1});
                return;
            }
            //在数据库中添加一个user
            user.adduser(yonghuming, mima, function (err, doc) {
                if (err) {
                    //-2就是服务器错误
                    res.json({"result": -2})
                    return;
                }
                //注册成功！！
                req.session.login = 1;
                req.session.yonghuming = yonghuming;

                res.json({"result": 1})
            });
        });
    });
};

//检查用户登陆用户名、密码是否正确
exports.checklogin = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var yonghuming = fields.yonghuming;
        var mima = fields.mima;
        //先来检查用户名是否存在
        user.findUserByName(yonghuming, function (err, doc) {
            if (!doc) {
                //-1用户名不存在！！！
                res.json({"result": -1});
                return;
            }
            //密码和密码进行加密比对
            if (crypto.createHmac('sha256', mima).digest('hex') === doc.mima) {
                //写session
                req.session.login = 1;
                req.session.yonghuming = yonghuming;
                //比较密码的正确性，加密的和加密的比较
                res.json({"result": 1});
                //跳转
                return;
            } else {
                res.json({"result": -2});
                return;
            }
        });
    });
};
//退出
exports.tuichu = function (req, res) {
    var login = req.session.login = 0;

    var yonghuming = req.session.yonghuming = '';

    if (yonghuming) {
        user.getK(yonghuming, 'touxiang', function (err, v) {
            res.render('index', {
                'login': login,
                'yonghuming': '',
                'touxiang': ''
            })
        })
    } else {
        res.render('index', {
            'login': login,
            'yonghuming': '',
            'touxiang': ''
        })
    }
};


//查询客户
exports.showquery = function (req, res, next) {
    res.render("query");
};
exports.doadd = function (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        query.addCard(fields, function (result) {
            res.json({"result": result});
        });
    });
};
exports.getAll = function (req, res) {
    var page = url.parse(req.url, true).query.page - 1 || 0;
    var pagesize = 3;
    query.count({}, function (err, count) {
        query.find({}).limit(pagesize).skip(pagesize * page).exec(function (err, results) {
            res.json({
                "pageAmount": Math.ceil(count / pagesize),
                "results": results
            });
        });
    });
};
exports.check = function (req, res) {
    var sid = req.params.sid;

    query.checkSid(sid, function (torf) {
        res.json({"result": torf});
    });
};
exports.delete = function (req, res) {
    var sid = req.params.sid;

    query.find({'sid': sid}, function (err, results) {
        if (err || results.length == 0) {
            res.json({"result": -1});
            return;
        }

        results[0].remove(function (err) {
            if (err) {
                res.json({'result': -1});
                return;
            }

            res.json({'result': 1})
        })
    })
};
exports.showUpdate = function (req, res) {

    var sid = req.params.sid;

    //直接用类名打点调用find，不需要再Student类里面增加一个findStudentBySid的方法。
    query.find({"sid": sid}, function (err, results) {
        if (results.length == 0) {
            res.json({'result': -1});
            return;
        }
        //呈递页面
        res.json({'update': results})
    });
};
exports.update = function (req, res) {
    var sid = req.params.sid;
    if (!sid) {
        return;
    }

    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        query.find({"sid": sid}, function (err, results) {
            if (results.length == 0) {
                res.json({"result": -1});
                return;
            }

            var thestudent = results[0];

            //更改属性
            thestudent.name = fields.name;
            thestudent.tel = fields.tel;
            thestudent.address = fields.address;
            thestudent.card = fields.card;
            thestudent.driving = fields.driving;


            //持久化
            thestudent.save(function (err) {
                if (err) {
                    res.json({"result": -1});
                } else {
                    res.json({"result": 1});
                }
            });
        });
    });
};


//类别档案

exports.category = function (req, res) {
    // res.render('category');
    car.findAll(function (results) {
        // console.log(results);
        var json = {};
        var classarr = [];
        for (var i = 0; i < results.length; i++) {
            var key = results[i].category;

            if (json[key]) {
                json[key]++;
            } else {
                json[key] = 1;
            }

        }
        // console.log(json);

        for (var key in json) {
            classarr.push(key);
        }
        // console.log(classarr);
        res.render("category", {"result": classarr});
    })
};
//汽车档案
exports.car = function (req, res, next) {
    res.render("car");
};
exports.showdoadd = function (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        fields.state = false;
        car.addCard(fields, function (result) {
            res.json({"result": result});
        });
    });
};

exports.showgetAll = function (req, res) {
    var page = url.parse(req.url, true).query.page - 1 || 0;
    var pagesize = 10;
    car.count({}, function (err, count) {
        car.find({}).limit(pagesize).skip(pagesize * page).exec(function (err, results) {
            res.json({
                "pageAmount": Math.ceil(count / pagesize),
                "results": results
            });
        });
    });
};
exports.showcheck = function (req, res) {
    var sid = req.params.sid;

    car.checkSid(sid, function (torf) {
        res.json({"result": torf});
    });
};
exports.showdelete = function (req, res) {
    var sid = req.params.sid;

    car.find({'sid': sid}, function (err, results) {
        if (err || results.length == 0) {
            res.json({"result": -1});
            return;
        }

        results[0].remove(function (err) {
            if (err) {
                res.json({'result': -1});
                return;
            }

            res.json({'result': 1})
        })
    })
};
exports.showUpdatea = function (req, res) {
    //拿到学号
    var sid = req.params.sid;

    //直接用类名打点调用find，不需要再Student类里面增加一个findStudentBySid的方法。
    car.find({"sid": sid}, function (err, results) {
        if (results.length == 0) {
            res.json({'result': -1});
            return;
        }
        //呈递页面
        res.json({'update': results})
    });
};
exports.updatea = function (req, res) {
    var sid = req.params.sid;
    if (!sid) {
        return;
    }

    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        //更改学生
        car.find({"sid": sid}, function (err, results) {
            if (results.length == 0) {
                res.json({"result": -1});
                return;
            }

            var thestudent = results[0];

            //更改属性
            thestudent.name = fields.name;
            thestudent.category = fields.category;
            thestudent.price = fields.price;



            //持久化
            thestudent.save(function (err) {
                if (err) {
                    res.json({"result": -1});
                } else {
                    res.json({"result": 1});
                }
            });
        });
    });
};




//统计分析

exports.showtj = function (req, res) {
    res.render('tj')
};

exports.Sreadrest = function (req, res) {
    gh.find({}, function (err, data) {
        res.json({"s": data})
    })
};




exports.gh = function (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields) {
        var json = new zl(fields);
        json.save(function (err) {
            if (err) {
                res.json({"s": -1});
                return;
            } else {
                res.json({"s": 1});
                return;
            }
        })
    })
};
exports.Sread = function (req, res) {
    zl.find({}, function (err, result) {
        res.json({"result": result})
    })
};

exports.tongj = function (req, res) {
    zl.find({}, function (err, result) {
        var arr=result;
        var map = {},
            dest = [];
        for(var i = 0; i < arr.length; i++){
            var ai = arr[i];
            if(!map[ai.carname]){
                dest.push({
                    // id: ai.id,
                    carname: ai.carname,
                    data: [ai]
                });
                map[ai.carname] = ai;
            }else{
                for(var j = 0; j < dest.length; j++){
                    var dj = dest[j];
                    if(dj.carname == ai.carname){
                        dj.data.push(ai);
                        break;
                    }
                }
            }
        }

        console.log(dest);
        var carn = [];
        var carcount = [];
        for (var i=0;i<dest.length;i++){
            var d=dest[i];
            var dd=d.data;
            carn.push(d.carname);
            carcount.push(dd.length)
        }
        console.log(carn,carcount);
        res.json({
            "carn":carn,
            "carcount":carcount
        })
    })
};