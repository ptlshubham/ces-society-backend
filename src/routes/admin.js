const express = require("express");
const router = express.Router();
const db = require("../db/db");
const multer = require('multer');
const path = require('path');
const config = require("../../config");
var midway = require('./midway');
const jwt = require('jsonwebtoken');
var crypto = require('crypto');
const nodemailer = require('nodemailer');
var handlebars = require("handlebars");
const fs = require('fs');
const schedule = require('node-schedule');


router.post("/RegisterNewUser", (req, res, next) => {
    db.executeSql("select * from user where email="+req.body.email,function(data,err){
        if(data.length >0){
            res.json('duplicate email');
        }else{
            db.executeSql("INSERT INTO `user`(`salutation`, `firstName`, `lastName`, `phone`, `email`, `role`, `companyName`, `designation`,`avg_mnth_trade`, `GST_no`, `company_contact`, `material_quality`, `KYC_status`, `created_date`,`profileUpdation`) VALUES ('"+req.body.select+"','"+req.body.fname+"','"+req.body.lname+"','"+req.body.contact+"','"+req.body.email+"','"+req.body.regAs+"','"+req.body.companyname+"','"+req.body.designation+"','"+req.body.avg_mnth_trade+"','"+req.body.gstno+"','"+req.body.workphone+"','"+req.body.selectMaterial+"',false,CURRENT_TIMESTAMP,false)", function (data, err) {
                if (err) {
                    res.json("error");
                } else {
                    return res.json('sucess');
                }
            });
        }
    })
   
});

router.post("/RegisterNewUser", (req, res, next) => {
    console.log(req.body)
    db.executeSql("INSERT INTO `user`(`salutation`, `firstName`, `lastName`, `phone`, `email`, `role`, `companyName`, `designation`,`avg_mnth_trade`, `GST_no`, `company_contact`, `material_quality`, `KYC_status`, `created_date`) VALUES ('"+req.body.select+"','"+req.body.fname+"','"+req.body.lname+"','"+req.body.contact+"','"+req.body.email+"','"+req.body.regAs+"','"+req.body.companyname+"','"+req.body.designation+"','"+req.body.avg_mnth_trade+"','"+req.body.gstno+"','"+req.body.workphone+"','"+req.body.selectMaterial+"',false,CURRENT_TIMESTAMP)", function (data, err) {
        if (err) {
            res.json("error");
        } else {
            return res.json('sucess');
        }
    });
});


router.post("/completeProfile", midway.checkToken,(req,res,next)=>{
    console.log(req.body)
    db.executeSql("UPDATE `user` SET `firstName`='"+req.body.firstName+"',`lastName`='"+req.body.lastName+"',`phone`='"+req.body.phone+"',`email`='"+req.body.email+"',`companyName`='"+req.body.companyName+"',`designation`='"+req.body.designation+"',`avg_mnth_trade`='"+req.body.avg_mnth_trade+"',`GST_no`='"+req.body.GST_no+"',`company_contact`='"+req.body.company_contact+"',`material_quality`='"+req.body.material_quality+"',`bank_name`='"+req.body.bank_name+"',`bank_acc_no`='"+req.body.bank_acc_no+"',`acc_type`='"+req.body.acc_type+"',`acc_holder_name`='"+req.body.acc_holder_name+"',`isfc_code`='"+req.body.isfc_code+"',`branch_name`='"+req.body.branch_name+"',`cancel_cheque`='"+req.body.cancel_cheque+"',`PAN_card`='"+req.body.PAN_card+"',`updated_date`=CURRENT_TIMESTAMP,`profileUpdation`=true WHERE id="+req.body.id,function(data,err){
        if(err){
            console.log(err);
        }else{
            res.json('success');
        }
    })
})

router.get("/getUserDetailById/:id", midway.checkToken,(req,res,next)=>{
    db.executeSql("SELECT * FROM user u JOIN address a ON u.id = a.uid where u.id="+req.params.id,function(data,err){
        if(err){
            console.log(err)
        }
        else{
            res.json(data)
        }
    })
})

router.get("/getAllUser", midway.checkToken, (req, res, next) => {
    db.executeSql("SELECT * FROM user u JOIN address a ON u.id = a.uid;;", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});

router.get("/getAllBuyer", midway.checkToken, (req, res, next) => {
    db.executeSql("SELECT * FROM user u JOIN address a ON u.id = a.uid where u.role='buyer' and u.KYC_status=true;", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});

router.get("/getAllSeller", midway.checkToken, (req, res, next) => {
    db.executeSql("SELECT * FROM user u JOIN address a ON u.id = a.uid where u.role='seller' and u.KYC_status=true;", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});

router.get("/getAllKYCPendingUser", midway.checkToken, (req, res, next) => {
    db.executeSql("SELECT * FROM user u JOIN address a ON u.id = a.uid; where u.KYC_status=false;", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});

router.post("/updateKYCUser", midway.checkToken, (req, res, next) => {
    db.executeSql("update user set KYC_status=true, KYC_date=CURRENT_TIMESTAMP where id="+req.body.id, function (data, err) {
        if (err) {
            console.log(err);
        } else {
            db.executeSql("select * from user where id="+req.body.id,function(data1,err){
                if(err){
                    console.log(er);
                }else{
                    const replacements = {
                        votp: data1[0].firstName+'@123',
                        email: data1[0].firstName,
                        id:req.body.id
                    };

                    
                    mail('newpassword.html', replacements, data1[0].email, "Setting Password", "New Password for Nextgen ");
                    var salt = '7fa73b47df808d36c5fe328546ddef8b9011b2c6';
                    var repass = salt + '' + data1[0].firstName+'@123';
                    var encPassword = crypto.createHash('sha1').update(repass).digest('hex');
                    db.executeSql("UPDATE user SET password='" + encPassword + "' WHERE id=" + req.body.id + ";", function (data, err) {
                        if (err) {
                            console.log("Error in store.js", err);
                        } else {
                            return res.json('success');
                        }
                    });
                }
            })
          
            // return res.json('success');
        }
    })
});

router.post("/UploadMaterialImage", midway.checkToken, (req, res, next) => {
    var imgname = generateUUID();

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'images/material');
        },
        // By default, multer removes file extensions so let's add them back
        filename: function (req, file, cb) {

            cb(null, imgname + path.extname(file.originalname));
        }
    });
    let upload = multer({ storage: storage }).single('file');
    upload(req, res, function (err) {
        console.log("path=", config.url + 'images/material/' + req.file.filename);

        if (req.fileValidationError) {
            console.log("err1", req.fileValidationError);
            return res.json("err1", req.fileValidationError);
        } else if (!req.file) {
            console.log('Please select an image to upload');
            return res.json('Please select an image to upload');
        } else if (err instanceof multer.MulterError) {
            console.log("err3");
            return res.json("err3", err);
        } else if (err) {
            console.log("err4");
            return res.json("err4", err);
        }
        return res.json('/images/material/' + req.file.filename);


    });
});

router.post("/UploadCancelCheckImage", midway.checkToken, (req, res, next) => {
    var imgname = generateUUID();

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'images/cancelcheck');
        },
        // By default, multer removes file extensions so let's add them back
        filename: function (req, file, cb) {

            cb(null, imgname + path.extname(file.originalname));
        }
    });
    let upload = multer({ storage: storage }).single('file');
    upload(req, res, function (err) {
        console.log("path=", config.url + 'images/cancelcheck/' + req.file.filename);

        if (req.fileValidationError) {
            console.log("err1", req.fileValidationError);
            return res.json("err1", req.fileValidationError);
        } else if (!req.file) {
            console.log('Please select an image to upload');
            return res.json('Please select an image to upload');
        } else if (err instanceof multer.MulterError) {
            console.log("err3");
            return res.json("err3", err);
        } else if (err) {
            console.log("err4");
            return res.json("err4", err);
        }
        return res.json('/images/cancelcheck/' + req.file.filename);


    });
});

router.post("/UploadMaterialMultiImage", midway.checkToken, (req, res, next) => {
    var imgname = generateUUID();

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'images/material-multi');
        },
        // By default, multer removes file extensions so let's add them back
        filename: function (req, file, cb) {

            cb(null, imgname + path.extname(file.originalname));
        }
    });
    let upload = multer({ storage: storage }).single('file');
    upload(req, res, function (err) {
        console.log("path=", config.url + 'images/material-multi/' + req.file.filename);

        if (req.fileValidationError) {
            console.log("err1", req.fileValidationError);
            return res.json("err1", req.fileValidationError);
        } else if (!req.file) {
            console.log('Please select an image to upload');
            return res.json('Please select an image to upload');
        } else if (err instanceof multer.MulterError) {
            console.log("err3");
            return res.json("err3", err);
        } else if (err) {
            console.log("err4");
            return res.json("err4", err);
        }
        return res.json('/images/material-multi/' + req.file.filename);


    });
});








var nowDate = new Date();
date = nowDate.getFullYear() + '-' + (nowDate.getMonth() + 1) + '-' + nowDate.getDate();
router.get("/GetDailyTotal", (req, res, next) => {
    db.executeSql("select * from appointment where createddate='" + date + "' and ispayment=true", function (data, err) {
        if (err) {
            console.log(err);
        } else {

            return res.json(data);
        }
    })
});

router.get("/GetMonthlyTotal", (req, res, next) => {
    db.executeSql("select * from appointment where  DATE_FORMAT(createddate, '%m') = DATE_FORMAT(CURRENT_TIMESTAMP, '%m') and ispayment=true", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});

 



function mail(filename, data, toemail, subj, mailname) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        host: 'smtp.gmail.com',
        auth: {
            user: 'ptlshubham@gmail.com',
            pass: 'hvcukfxtadulqrnb'
        },
    });
    const filePath = 'src/assets/emailtemplets/' + filename;
    const source = fs.readFileSync(filePath, 'utf-8').toString();
    const template = handlebars.compile(source);
    const replacements = data;
    const htmlToSend = template(replacements);

    const mailOptions = {
        from: `"ptlshubham@gmail.com"`,
        subject: subj,
        to: toemail,
        Name: mailname,
        html: htmlToSend,
       

    };
    transporter.sendMail(mailOptions, function (error, info) {
        console.log('fgfjfj')
        if (error) {
            console.log(error);
            res.json("Errror");
        } else {
            console.log('Email sent: ' + info.response);
            res.json(data);
        }
    });
}


router.post("/ForgotPassword", (req, res, next) => {
    let otp = Math.floor(100000 + Math.random() * 900000);
    console.log(req.body);
    db.executeSql("select * from users where email='" + req.body.email + "';", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
            return res.json('err');
        } else {
            console.log(data[0]);
            db.executeSql("INSERT INTO `otp`(`userid`, `otp`, `createddate`, `createdtime`,`role`,`isactive`) VALUES (" + data[0].userid + "," + otp + ",CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'" + data[0].role + "',true)", function (data1, err) {
                if (err) {
                    console.log(err);
                } else {
                    const replacements = {
                        votp: otp,
                        email: req.body.email
                    };
                    mail('verification.html', replacements, req.body.email, "Password resetting", " ")
                    res.json(data);
                }
            })

        }
    });
});

router.post("/GetOneTimePassword", (req, res, next) => {
    console.log(req.body)
    db.executeSql("select * from otp where userid = '" + req.body.id + "' " + " and otp =' " + req.body.otp + "' ", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});
// router.post("/ChackForPassword", midway.checkToken, (req, res, next) => {
//     var salt = '7fa73b47df808d36c5fe328546ddef8b9011b2c6';
//     var repass = salt + '' + req.body.pass;
//     var encPassword = crypto.createHash('sha1').update(repass).digest('hex');
//     db.executeSql("select * from users where userid=" + req.body.id + " and password='" + encPassword + "'", function(data, err) {
//         if (err) {
//             console.log(err);
//         } else {
//             return res.json(data)
//         }
//     })
// })

router.post("/UpdatePassword", (req, res, next) => {
    console.log(req.body);
    var salt = '7fa73b47df808d36c5fe328546ddef8b9011b2c6';
    var repass = salt + '' + req.body.password;
    var encPassword = crypto.createHash('sha1').update(repass).digest('hex');
    db.executeSql("UPDATE users SET password='" + encPassword + "' WHERE userid=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            console.log("shsyuhgsuygdyusgdyus", data);
            return res.json(data);
        }
    });
});


router.post("/UpdateActiveStatus", (req, res, next) => {
    db.executeSql("UPDATE  `appointment` SET isactive=" + req.body.isactive + ", updatedate=CURRENT_TIMESTAMP,ispayment=true WHERE id=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})

router.post("/GetViewAppointment", (req, res, next) => {
    db.executeSql("select * from appointment where custid = " + req.body.id + "", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})

router.post("/UpdateEnquiryStatus", (req, res, next) => {
    db.executeSql("UPDATE  `enquiry` SET isactive=" + req.body.isactive + " WHERE id=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})


router.post("/GetCustomerTotalPoints", (req, res, next) => {
    db.executeSql("select * from point where custid = " + req.body.id + "", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})

router.post("/GetAllCustomerDataList", (req, res, next) => {

    db.executeSql("select * from appointment where custid = " + req.body.id + "", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})

router.post("/GetCustomerById", (req, res, next) => {
    db.executeSql("select * from customer where uid=" + req.body.id + "", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            if (data.length > 0) {
                db.executeSql("select * from appointment where custid = " + data[0].id + "", function (data1, err) {
                    if (err) {
                        console.log("Error in store.js", err);
                    } else {

                    }
                    return res.json(data1);
                });
            } else {
                res.json('customer not found');
            }

        }
    })

})
router.post("/SaveRatingsDetails", (req, res, next) => {
    db.executeSql("UPDATE `appointment` SET ratings=" + req.body.ratings + " WHERE id=" + req.body.id + "", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json('success');
        }
    });
})
router.post("/GetUsedServicesByCustomer", (req, res, next) => {

    db.executeSql("select s.servicesid,s.servicesname,s.custid,s.appointmentid,s.employeename,s.empid,sl.id as slId,sl.price,sl.time,sl.point from custservices s join serviceslist sl on s.servicesid=sl.id where s.appointmentid = " + req.body.id + "", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})

var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();

today = yyyy + '-' + mm + '-' + dd;

router.get("/GetAllCompletedServices", (req, res, next) => {
    db.executeSql("select a.id,a.custid,a.totalprice,a.totalpoint,a.totaltime,a.isactive,a.createddate,a.updatedate,c.id as cId,c.fname,c.lname,c.email,c.contact,c.whatsapp,c.gender from appointment a join customer c on a.custid=c.id where a.isactive=false and a.createddate='" + today + "'", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});

router.post("/SaveModeOfPayment", (req, res, next) => {
    db.executeSql("INSERT INTO `payment`(`cid`, `appointmentid`, `cname`, `modeofpayment`, `tprice`, `tpoint`, `pdate`,`createddate`) VALUES (" + req.body.cid + "," + req.body.appointmentid + ",'" + req.body.cname + "','" + req.body.modeofpayment + "'," + req.body.tprice + "," + req.body.tpoint + ",CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);", function (data, err) {
        if (err) {
            res.json("error");
        } else {

            return res.json("success");
        }
    });
});

router.get("/GetAllModeOfPayment", (req, res, next) => {
    db.executeSql("select * from payment where pdate ='" + today + "' ", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})

router.get("/GetMonthlyPayment", (req, res, next) => {
    db.executeSql("select * from payment ", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})


router.post("/SaveExpensesList", (req, res, next) => {
    db.executeSql("INSERT INTO expenses (expensesdate, expensesname, expensesprices, employeename, paymenttype) VALUES ('" + req.body.expensesdate + "','" + req.body.expensesname + "','" + req.body.expensesprices + "','" + req.body.employeename + "','" + req.body.paymenttype + "');", function (data, err) {
        console.log(req.body.expensesdate, " , ", req.body.expensesdate);
        if (err) {
            res.json("error");
        } else {

            return res.json(data);
        }
    });
});

router.get("/GetAllExpenses", (req, res, next) => {
    db.executeSql("select * from expenses", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});

router.post("/RemoveExpensesDetails", (req, res, next) => {
    db.executeSql("Delete from expenses where id=" + req.body.id, function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})

router.post("/UpdateExpensesDetails", (req, res, next) => {
    var newdate = new Date(req.body.expensesdate).getDate() + 1;
    var newMonth = new Date(req.body.expensesdate).getMonth();
    var newyear = new Date(req.body.expensesdate).getFullYear();
    var querydate = new Date(newyear, newMonth, newdate)
    db.executeSql("UPDATE expenses SET expensesdate='" + querydate.toISOString() + "',expensesname='" + req.body.expensesname + "',expensesprices='" + req.body.expensesprices + "',employeename='" + req.body.employeename + "',paymenttype='" + req.body.paymenttype + "' WHERE id=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})

router.get("/getMonthlyExpensesList", (req, res, next) => {
    db.executeSql("select * from expenses where  DATE_FORMAT(expensesdate, '%m') = DATE_FORMAT(CURRENT_TIMESTAMP, '%m')", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});

router.post("/UpdateCategoryList", (req, res, next) => {
    console.log(req.body)
    db.executeSql("UPDATE `category` SET name='" + req.body.name + "' where id=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})
router.post("/SaveCategoryList", (req, res, next) => {
    console.log(req.body)
    db.executeSql("INSERT INTO `category`( `name`, `isactive`, `createddate`) VALUES ('" + req.body.name + "',true,CURRENT_TIMESTAMP);", function (data, err) {
        if (err) {
            console.log(err)
        } else {
            return res.json('success');
        }
    });
});
router.post("/saveCartList", (req, res, next) => {
    console.log(req.body)
    db.executeSql("INSERT INTO `cartlist`( `userid`, `productid`, `quantity`,`price`, `createddate`) VALUES ('" + req.body.uid + "','" + req.body.id + "','" + req.body.quant + "'," + req.body.price + ",CURRENT_TIMESTAMP);", function (data, err) {
        if (err) {
            console.log(err)
        } else {
            return res.json('success');
        }
    });
});
router.post("/SavePlaceOrderList", (req, res, next) => {
    db.executeSql("INSERT INTO `orderlist`(`userid`,`totalprice`,`isactive`,`orderdate`,`createddate`) VALUES (" + req.body.uid + "," + req.body.totalprice + ",true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);", function (data, err) {
        if (err) {
            console.log(err)
        } else {
            console.log(data.insertId, req.body.productlist.length);
            for (let i = 0; i < req.body.productlist.length; i++) {
                db.executeSql("INSERT INTO `orderdetails`(`oid`, `uid`, `pid`, `oquant`, `createddate`) VALUES(" + data.insertId + "," + req.body.productlist[i].userid + "," + req.body.productlist[i].Pid + "," + req.body.productlist[i].quantity + ",CURRENT_TIMESTAMP);", function (data1, err) {
                    if (err) {
                        console.log("Error in store.js", err);
                    } else {
                        for (let i = 0; i < req.body.productlist.length; i++) {
                            db.executeSql("DELETE FROM `cartlist` WHERE id=" + req.body.productlist[i].id + "", function (data3, err) {
                                if (err) {
                                    console.log("Error in store.js", err);
                                } else {

                                }
                            });
                        }
                    }
                });
            }
        }
        return res.json('success');
    });
});
router.post("/SavePurchaseServiceList", (req, res, next) => {
    db.executeSql("UPDATE `customer` SET ismembership=true WHERE id=" + req.body.cid + "", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            for (let i = 0; i < req.body.services.length; i++) {
                db.executeSql("INSERT INTO `purchasedmembership`(`cid`, `memid`, `serid`, `sname`, `quntity`, `tprice`, `discount`, `dprice`, `isactive`, `createddate`) VALUES (" + req.body.cid + "," + req.body.memid + "," + req.body.services[i].serviceid + ",'" + req.body.services[i].servicesname + "'," + req.body.services[i].quantity + "," + req.body.tprice + "," + req.body.discount + "," + req.body.dprice + "," + req.body.isactive + ",CURRENT_TIMESTAMP);", function (data1, err) {
                    if (err) {
                        console.log("Error in store.js", err);
                    } else {
                        if (i == req.body.services.length - 1) {
                            res.json(data1);
                        }
                    }
                });
            }
        }
    })

});

router.get("/GetAllMembershipPurchased", (req, res, next) => {
    db.executeSql("SELECT * FROM purchasedmembership,membership,customer where purchasedmembership.memid=membership.id AND purchasedmembership.cid=customer.id GROUP BY cid,memid;", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
})
router.post("/GetMembershipPurchasedByID", (req, res, next) => {
    db.executeSql("SELECT * FROM purchasedmembership where cid=" + req.body.cid + " AND memid=" + req.body.memid + "", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
})

router.post("/GetActivatedMembership", (req, res, next) => {
    db.executeSql("SELECT * FROM purchasedmembership where cid=" + req.body.id + " AND isactive=true", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
})
router.post("/updateCartList", (req, res, next) => {
    console.log(req.body)
    db.executeSql("UPDATE `cartlist` SET quantity=" + req.body.quantity + " where id=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})
router.get("/getAllCartList", (req, res, next) => {
    db.executeSql("select * from products , cartlist WHERE products.id=cartlist.productid ", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});

router.post("/removeCartDetails", (req, res, next) => {
    console.log(req.body);
    db.executeSql("Delete from cartlist where userid=" + req.body.userid + " AND id=" + req.body.id + "", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})
router.get("/RemoveCategoryDetails/:id", (req, res, next) => {
    console.log(req.params.id)
    db.executeSql("Delete from category where id=" + req.params.id, function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})
router.get("/GetAllCategoryList", (req, res, next) => {
    db.executeSql("select * from category", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});
router.post("/SaveProductsList", (req, res, next) => {
    console.log(req.body)
    db.executeSql("INSERT INTO `products`(`name`, `image`, `category`, `price`, `quantity`, `purchasedate`, `vendorname`, `vendorcontact`, `descripition`, `isactive`, `createddate`,`display`) VALUES ('" + req.body.name + "','" + req.body.image + "','" + req.body.category + "','" + req.body.price + "','" + req.body.quantity + "','" + req.body.purchasedate + "','" + req.body.vendorname + "','" + req.body.vendorcontact + "','" + req.body.descripition + "',true,CURRENT_TIMESTAMP," + req.body.display + ");", function (data, err) {
        if (err) {
            console.log(err)
        } else {
            for (let i = 0; i < req.body.multi.length; i++) {
                db.executeSql("INSERT INTO `images`(`productid`,`catid`,`listimages`,`createddate`)VALUES(" + data.insertId + ",1,'" + req.body.multi[i] + "',CURRENT_TIMESTAMP);", function (data, err) {
                    if (err) {
                        console.log("Error in store.js", err);
                    } else { }
                });
            }
        }
    });
    return res.json('success');

});
router.get("/GetAllProductsList", (req, res, next) => {
    db.executeSql("select * from products", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});
router.get("/GetActiveProducts", (req, res, next) => {
    db.executeSql("select * from products where display=true", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});

router.get("/RemoveProductDetails/:id", (req, res, next) => {

    db.executeSql("Delete from products where id=" + req.params.id, function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})
router.post("/UploadProductImage", (req, res, next) => {
    var imgname = generateUUID();

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'images/products');
        },
        // By default, multer removes file extensions so let's add them back
        filename: function (req, file, cb) {

            cb(null, imgname + path.extname(file.originalname));
        }
    });
    let upload = multer({ storage: storage }).single('file');
    upload(req, res, function (err) {
        console.log("path=", config.url + 'images/products/' + req.file.filename);

        if (req.fileValidationError) {
            console.log("err1", req.fileValidationError);
            return res.json("err1", req.fileValidationError);
        } else if (!req.file) {
            console.log('Please select an image to upload');
            return res.json('Please select an image to upload');
        } else if (err instanceof multer.MulterError) {
            console.log("err3");
            return res.json("err3", err);
        } else if (err) {
            console.log("err4");
            return res.json("err4", err);
        }
        return res.json('/images/products/' + req.file.filename);

        console.log("You have uploaded this image");
    });
});

router.post("/UploadMultiProductImage", (req, res, next) => {
    var imgname = generateUUID();

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'images/listimages');
        },
        // By default, multer removes file extensions so let's add them back
        filename: function (req, file, cb) {

            cb(null, imgname + path.extname(file.originalname));
        }
    });
    let upload = multer({ storage: storage }).single('file');
    upload(req, res, function (err) {
        console.log("path=", config.url + '/images/listimages/' + req.file.filename);

        if (req.fileValidationError) {
            console.log("err1", req.fileValidationError);
            return res.json("err1", req.fileValidationError);
        } else if (!req.file) {
            console.log('Please select an image to upload');
            return res.json('Please select an image to upload');
        } else if (err instanceof multer.MulterError) {
            console.log("err3");
            return res.json("err3", err);
        } else if (err) {
            console.log("err4");
            return res.json("err4", err);
        }
        return res.json('/images/listimages/' + req.file.filename);
        console.log("You have uploaded this image");
    });
});

router.get("/RemoveRecentUoloadImage", midway.checkToken, (req, res, next) => {
    console.log(req.body);
    db.executeSql("SELECT * FROM images ORDER BY createddate DESC LIMIT 1", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})

router.get("/CourosalImage/:id", (req, res, next) => {
    console.log(req.body);
    db.executeSql("SELECT * FROM images, products WHERE  images.productid = products.id AND productid=" + req.params.id, function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})
router.get("/GetCartDataByID/:id", (req, res, next) => {
    db.executeSql("select c.id,c.userid,c.productid,c.quantity,c.price,c.createddate,p.id as Pid,p.name,p.image,p.category,p.price,p.quantity as pquantity,p.vendorname,p.vendorcontact,p.descripition,p.isactive from cartlist c join products p on c.productid=p.id  WHERE c.productid=p.id AND c.userid=" + req.params.id, function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})
router.post("/UpdateProductList", (req, res, next) => {
    console.log(req.body)
    db.executeSql("UPDATE `products` SET name='" + req.body.name + "',descripition='" + req.body.descripition + "',category='" + req.body.category + "',purchasedate='" + req.body.purchasedate + "',quantity=" + req.body.quantity + ",price=" + req.body.price + ",vendorname='" + req.body.vendorname + "',display=" + req.body.display + ",updateddate=CURRENT_TIMESTAMP where id=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})
router.post("/Verification", (req, res, next) => {
    let otp = Math.floor(100000 + Math.random() * 900000);
    db.executeSql("INSERT INTO `otp`(`otp`,`createddate`,`createdtime`,`role`,`isactive`,`email`) VALUES (" + otp + ",CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'" + req.body.role + "',true,'" + req.body.email + "')", function (data1, err) {
        if (err) {
            console.log(err);
        } else {
            const replacements = {
                votp: otp,
                email: req.body.email
            };
            mail('verification.html', replacements, req.body.email, "Verify a New Account", " ")
            res.json(data1);
        }
    })
});

router.post("/GetRegisterOtp", (req, res, next) => {
    console.log(req.body)
    db.executeSql("select * from otp where email = '" + req.body.email + "'", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });


});

router.post("/SaveUserCustomerList", (req, res, next) => {
    var salt = '7fa73b47df808d36c5fe328546ddef8b9011b2c6';
    var repass = salt + '' + req.body.password;
    var encPassword = crypto.createHash('sha1').update(repass).digest('hex');
    db.executeSql("INSERT INTO `users`(`email`,`password`,`role`,`isactive`)VALUES('" + req.body.email + "','" + encPassword + "','Customer',true);", function (data, err) {
        if (err) {
            console.log(err)
        } else {
            db.executeSql("INSERT INTO `customer`(`fname`,`lname`,`email`,`contact`,`whatsapp`,`gender`,`createddate`,`uid`,`ismembership`)VALUES('" + req.body.fname + "','" + req.body.lname + "','" + req.body.email + "','" + req.body.contact + "','" + req.body.contact + "','" + req.body.gender + "',CURRENT_TIMESTAMP," + data.insertId + "," + req.body.isMembership + ");", function (data, err) {
                if (err) {
                    console.log(err)
                } else {
                    console.log(data);
                }
            });
        }
        return res.json('success');
    });
});

router.post("/SaveVendorList", (req, res, next) => {
    console.log(req.body)
    db.executeSql("INSERT INTO `vendor`( `fname`, `gst`, `contact`, `whatsapp`, `address`, `city`, `pincode`, `isactive`, `createdate`, `updatedate`) VALUES ('" + req.body.fname + "','" + req.body.gst + "','" + req.body.contact + "','" + req.body.whatsapp + "','" + req.body.address + "','" + req.body.city + "'," + req.body.pincode + ",true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);", function (data, err) {
        if (err) {
            console.log(err)
        } else {

            return res.json('success');
        }
    });
});
router.get("/GetAllVendor", (req, res, next) => {
    db.executeSql("select * from vendor", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});

router.post("/RemoveVendorList", (req, res, next) => {

    console.log(req.body);
    db.executeSql("Delete from vendor where id=" + req.body.id, function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})

router.post("/UpdateVendorList", (req, res, next) => {
    db.executeSql("UPDATE `vendor` SET fname='" + req.body.fname + "',gst='" + req.body.gst + "',contact='" + req.body.contact + "',whatsapp='" + req.body.whatsapp + "',address='" + req.body.address + "',city='" + req.body.city + "',updatedate=CURRENT_TIMESTAMP WHERE id=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});
router.get("/GetCustDetails", (req, res, next) => {
    db.executeSql("select c.fname,c.lname,c.contact,c.whatsapp,c.email,c.gender from customer c where custid = id" + req.body.id + "", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    });
})

router.post("/GetCustomerDataById", (req, res, next) => {
    console.log(req.body)
    db.executeSql("select * from customer where id = " + req.body.id + "", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});
// router.post("/GetCustomerTotalPoints", (req, res, next) => {
//     db.executeSql("select * from point where custid = " + req.body.id + "", function (data, err) {
//         if (err) {
//             console.log("Error in store.js", err);
//         } else {
//             return res.json(data);
//         }
//     });
// })




router.post("/SaveWebBanners", (req, res, next) => {
    console.log(req.body);
    db.executeSql("INSERT INTO `webbanners`(`name`,`bannersimage`,`status`)VALUES('" + req.body.name + "','" + req.body.bannersimage + "'," + req.body.status + ");", function (data, err) {
        if (err) {
            res.json("error");
        } else {
            res.json("success");
        }
    });
});

router.get("/GetWebBanners", (req, res, next) => {
    console.log("call-4");
    console.log(req.body.id)
    db.executeSql("select * from webbanners ", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});

router.post("/RemoveWebBanners", (req, res, next) => {
    console.log(req.id)
    db.executeSql("Delete from webbanners where id=" + req.body.id, function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});

router.post("/UpdateActiveWebBanners", (req, res, next) => {
    console.log(req.body)
    db.executeSql("UPDATE  `webbanners` SET status=" + req.body.status + " WHERE id=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});
router.post("/UpdateActiveOffers", (req, res, next) => {
    console.log(req.body)
    db.executeSql("UPDATE  `OFFER` SET status=" + req.body.status + " WHERE id=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});
router.get("/GetWebBanner", (req, res, next) => {
    db.executeSql("select * from webbanners where status=1", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});
// let secret = 'prnv';
router.post('/login', function (req, res, next) {

    const body = req.body;
    console.log(body);
    var salt = '7fa73b47df808d36c5fe328546ddef8b9011b2c6';
    var repass = salt + '' + body.password;
    var encPassword = crypto.createHash('sha1').update(repass).digest('hex');
    db.executeSql("select * from admin where email='" + req.body.email + "';", function (data, err) {
        console.log(data);
        if (data.length > 0) {
            db.executeSql("select * from admin where email='" + req.body.email + "' and password='" + encPassword + "';", function (data1, err) {
                console.log(data1);
                if (data1.length > 0) {

                    module.exports.user1 = {
                        username: data1[0].email,
                        password: data1[0].password
                    }
                    let token = jwt.sign({ username: data1[0].email, password: data1[0].password },
                        secret, {
                        expiresIn: '1h' // expires in 24 hours
                    }
                    );
                    console.log("token=", token);
                    data[0].token = token;

                    res.cookie('auth', token);
                    res.json(data);
                } else {
                    return res.json(2);
                }
            });
        } else {
            return res.json(1);
        }
    });

});
router.post("/removeLastInsertedOTP", (req, res, next) => {
    console.log(req.body)
    db.executeSql("Delete from otp where email='" + req.body.email + "'", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    });
})
let secret = 'prnv';
router.post('/GetUsersLogin', function (req, res, next) {
    const body = req.body;
    var salt = '7fa73b47df808d36c5fe328546ddef8b9011b2c6';
    var repass = salt + '' + body.password;
    var encPassword = crypto.createHash('sha1').update(repass).digest('hex');
    db.executeSql("select * from users where email='" + req.body.email + "';", function (data, err) {
        console.log(data);
        if (data == null || data == undefined || data.length === 0) {
            return res.json(1);
        } else {
            // var time = get_time_diff;
            // console.log(time);
            db.executeSql("select * from users where email='" + req.body.email + "' and password='" + encPassword + "';", function (data1, err) {
                if (data1.length > 0) {
                    module.exports.user1 = {
                        username: data1[0].email,
                        password: data1[0].password
                    }
                    let token = jwt.sign({ username: data1[0].email, password: data1[0].password },
                        secret, {
                        expiresIn: '1h' // expires in 24 hours
                    }
                    );
                    console.log("token=", token);


                    res.cookie('auth', token);
                    if (data1[0].role == 'Admin') {
                        let resdata = [];
                        db.executeSql("select * from admin where uid=" + data1[0].userid, function (data2, err) {
                            if (err) {
                                console.log(err);
                            } else {
                                resdata.push(data2[0]);
                                resdata[0].token = token;
                                resdata[0].role = data1[0].role;
                                resdata[0].last_login = data1[0].out_time;
                                resdata[0].last_inTime = data1[0].in_time;
                                db.executeSql("UPDATE  `users` SET status=true,in_time=CURRENT_TIMESTAMP WHERE userid=" + data1[0].userid, function (msg, err) {
                                    if (err) {
                                        console.log("Error in store.js", err);
                                    } else { }
                                });
                                return res.json(resdata);
                            }
                        })

                    } else if (data1[0].role == 'Customer') {
                        console.log('helllllllll')
                        let resdata1 = [];
                        db.executeSql("select * from customer where uid=" + data1[0].userid, function (data3, err) {
                            if (err) {
                                console.log("data");
                                console.log(err);
                            } else {
                                console.log(data1[0].userid)
                                resdata1.push(data3[0]);
                                resdata1[0].token = token;
                                resdata1[0].role = data1[0].role;
                                resdata1[0].last_login = data1[0].out_time;
                                resdata1[0].last_inTime = data1[0].in_time;

                                db.executeSql("UPDATE  `users` SET status=true,in_time=CURRENT_TIMESTAMP WHERE userid=" + data1[0].userid, function (msg, err) {
                                    if (err) {
                                        console.log("Error in store.js", err);
                                    } else { }
                                });
                                return res.json(resdata1);
                            }
                        })
                    }
                    else if (data1[0].role == 'Sub-Admin') {
                        let resdata5 = [];
                        db.executeSql("select * from admin where uid=" + data1[0].userid, function (data7, err) {
                            if (err) {
                                console.log(err);
                            } else {
                                resdata5.push(data7[0]);
                                resdata5[0].token = token;
                                resdata5[0].role = data1[0].role;
                                resdata5[0].last_login = data1[0].out_time;
                                resdata5[0].last_inTime = data1[0].in_time;
                                db.executeSql("UPDATE  `users` SET status=true,in_time=CURRENT_TIMESTAMP WHERE userid=" + data1[0].userid, function (msg, err) {
                                    if (err) {
                                        console.log("Error in store.js", err);
                                    } else { }
                                });
                                return res.json(resdata5);
                            }
                        })

                    }
                    // else if (data1[0].role == 'Student') {
                    //     let resdata2 = [];
                    //     db.executeSql("select * from studentlist where uid=" + data1[0].userid, function (data4, err) {
                    //         if (err) {
                    //             console.log(err);
                    //         } else {
                    //             resdata2.push(data4[0]);
                    //             resdata2[0].token = token;
                    //             resdata2[0].role = data1[0].role;
                    //             resdata2[0].last_login = data1[0].out_time;
                    //             resdata2[0].last_inTime = data1[0].in_time;
                    //             db.executeSql("UPDATE  `users` SET status=true,in_time=CURRENT_TIMESTAMP WHERE userid=" + data1[0].userid, function (msg, err) {
                    //                 if (err) {
                    //                     console.log("Error in store.js", err);
                    //                 } else { }
                    //             });
                    //             return res.json(resdata2);
                    //         }
                    //     })
                    // } else if (data1[0].role == 'Visitor') {
                    //     let resdata3 = [];
                    //     db.executeSql("select * from visitorreg where uid=" + data1[0].userid, function (data5, err) {
                    //         if (err) {
                    //             console.log(err);
                    //         } else {
                    //             resdata3.push(data5[0]);
                    //             resdata3[0].token = token;
                    //             resdata3[0].role = data1[0].role;
                    //             resdata3[0].last_login = data1[0].out_time;
                    //             resdata3[0].last_inTime = data1[0].in_time;
                    //             db.executeSql("UPDATE  `users` SET status=true,in_time=CURRENT_TIMESTAMP WHERE userid=" + data1[0].userid, function (msg, err) {
                    //                 if (err) {
                    //                     console.log("Error in store.js", err);
                    //                 } else { }
                    //             });
                    //             return res.json(resdata3);
                    //         }
                    //     })
                    // } else if (data1[0].role == 'Parents') {
                    //     let resdata4 = [];
                    //     db.executeSql("select * from parentsinfo where uid=" + data1[0].userid, function (data6, err) {
                    //         if (err) {
                    //             console.log(err);
                    //         } else {
                    //             resdata4.push(data6[0]);
                    //             resdata4[0].token = token;
                    //             resdata4[0].role = data1[0].role;
                    //             resdata4[0].last_login = data1[0].out_time;
                    //             resdata4[0].last_inTime = data1[0].in_time;
                    //             db.executeSql("UPDATE  `users` SET status=true,in_time=CURRENT_TIMESTAMP WHERE userid=" + data1[0].userid, function (msg, err) {
                    //                 if (err) {
                    //                     console.log("Error in store.js", err);
                    //                 } else { }
                    //             });
                    //             return res.json(resdata4);
                    //         }
                    //     })
                    // } 



                } else {
                    return res.json(2);
                }
            });
        }

    });

});

router.post("/UpdateLogoutDetails", (req, res, next) => {
    console.log(req.body)
    db.executeSql("UPDATE users SET status=false,out_time=CURRENT_TIMESTAMP WHERE userid=" + req.body.userid, function (msg, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            db.executeSql("INSERT INTO `logintime`(`userid`, `login_minute`, `login_date`)VALUES(" + req.body.userid + "," + req.body.loginMinute + ",CURRENT_TIMESTAMP);", function (data, err) {
                if (err) {
                    console.log("Error in store.js", err);
                } else {
                    return res.json('Success');
                }
            });
        }
    });
});


function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });

    return uuid;
}


module.exports = router;