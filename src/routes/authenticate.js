const express = require("express");
const router = express.Router();
const db = require("../db/db");
var crypto = require('crypto');
const jwt = require('jsonwebtoken');



// var user;
// const auth = () => {
//     return (req, res, next) => {
//         next()
//     }
// }

let secret = 'prnv';
router.post('/UserLogin', (req, res, next) => {
    console.log(req.body, "hello  im here");
    const body = req.body;
    var salt = '7fa73b47df808d36c5fe328546ddef8b9011b2c6';
    var repass = salt + '' + body.pass;
    var encPassword = crypto.createHash('sha1').update(repass).digest('hex');
    console.log(encPassword);
    db.executeSql("select * from institute where email='" + req.body.email + "' and id='" + req.body.instituteId + "';", function (data, err) {
        if (data.length > 0) {
            db.executeSql("select * from institute where email='" + req.body.email + "' and password='" + encPassword + "' and id='" + req.body.instituteId + "' ;", function (data, err) {
                console.log(data, 'Output');
                if (data.length > 0) {
                    module.exports.user = {
                        username: data[0].email, password: data[0].password
                    }
                    let token = jwt.sign({ username: data[0].email, password: data[0].password },
                        secret,
                        {
                            expiresIn: '1h' // expires in 24 hours
                        }
                    );
                    console.log("token=", token);
                    data[0].token = token;
                    db.executeSql("UPDATE `institute` SET `updatedSite`=CURRENT_TIMESTAMP WHERE id=" + data[0].id + ";", function (data, err) {
                        if (err) {
                            console.log("Error in store.js", err);
                        } else {
                            console.log('Site Updated Status..')
                        }
                    });
                    res.cookie('auth', token);
                    res.json(data);
                }
                else {
                    return res.json(2);
                }
            });
        }
        else {
            return res.json(1);
        }
    });
});

router.post('/adminLogin', (req, res, next) => {
    console.log("hello  im here admin");
    const body = req.body;
    var salt = '7fa73b47df808d36c5fe328546ddef8b9011b2c6';
    var repass = salt + '' + body.pass;
    var encPassword = crypto.createHash('sha1').update(repass).digest('hex');
    console.log(body);
    db.executeSql("select * from admin where email='" + body.email + "';", function (data, err) {
        console.log(data);
        if (data.length > 0) {
            db.executeSql("select * from admin where email='" + body.email + "' and password='" + encPassword + "';", function (data, err) {
                console.log(data);
                if (data.length > 0) {
                    module.exports.user = {
                        username: data[0].email, password: data[0].password
                    }
                    let token = jwt.sign({ username: data[0].email, password: data[0].password },
                        secret,
                        {
                            expiresIn: '1h' // expires in 24 hours
                        }
                    );
                    console.log("token=", token);
                    data[0].token = token;

                    res.cookie('auth', token);
                    res.json(data);
                }
                else {
                    return res.json(2);
                }
            });
        }
        else {
            return res.json(1);
        }
    });
});

router.post('/OrganizationLogin', (req, res, next) => {
    console.log("hello im here Organization admin");
    const body = req.body;
    var salt = '7fa73b47df808d36c5fe328546ddef8b9011b2c6';
    var repass = salt + '' + body.pass;
    var encPassword = crypto.createHash('sha1').update(repass).digest('hex');
    console.log(body);
    db.executeSql("select * from company where email='" + body.email + "';", function (data, err) {
        console.log(data);
        if (data.length > 0) {
            db.executeSql("select * from company where email='" + body.email + "' and password='" + encPassword + "';", function (data, err) {
                console.log(data);
                if (data.length > 0) {
                    module.exports.user = {
                        username: data[0].email, password: data[0].password
                    }
                    let token = jwt.sign({ username: data[0].email, password: data[0].password },
                        secret,
                        {
                            expiresIn: '1h' // expires in 24 hours
                        }
                    );
                    console.log("token=", token);
                    data[0].token = token;

                    res.cookie('auth', token);
                    res.json(data);
                }
                else {
                    return res.json(2);
                }
            });
        }
        else {
            return res.json(1);
        }
    });
});

module.exports = router;