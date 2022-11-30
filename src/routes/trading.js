const express = require("express");
const router = express.Router();
const db = require("../db/db");
const multer = require('multer');
const path = require('path');
const config = require("../../config");
var midway = require('./midway');



router.post("/newTradeRequest", midway.checkToken, (req, res, next) => {
    console.log(req.body)
    db.executeSql("INSERT INTO `trades`( `buyerName`, `buyerId`, `req_quality`, `req_quantity`, `payment_terms`, `payment_days`, `payment_validity`, `buyerRate`, `tradeStatus`) VALUES ('" + req.body.buyerName + "','" + req.body.buyerId + "','" + req.body.material_quality + "','" + req.body.quantity + "','" + req.body.payment_terms + "','" + req.body.payment_days + "','" + req.body.payment_validity + "','" + req.body.buyerRate + "','" + req.body.tradeStatus + "');", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json('sucess');
        }
    });
});

router.post("/SaveTransporterDetails", midway.checkToken, (req, res, next) => {
    for (let i = 0; i < req.body.length; i++) {
        db.executeSql("INSERT INTO `transport_trade`(`orderId`, `startDate`, `driverContact`, `vehicleNo`, `weightSlip`,`invoiceImage`, `materialQuantity`, `invoiceAmount`, `deliveryStatus`, `createdDate`) VALUES (" + req.body[i].tradeId + ",CURRENT_TIMESTAMP," + req.body[i].transporterContact + ",'" + req.body[i].transportVehicle + "','" + req.body[i].transportImage + "','" + req.body[i].invoiceImage + "','" + req.body[i].materialQuantity + "'," + req.body[i].invoiceAmount + ",'" + req.body[i].deliveryStatus + "',CURRENT_TIMESTAMP);", function (data, err) {
            if (err) {
                console.log(err);
            } else {
                db.executeSql("UPDATE `trades` set `transportDetailsStatus`=true,`updatedDate`=CURRENT_TIMESTAMP WHERE id=" + req.body[i].tradeId, function (data, err) {
                    if (err) {
                        console.log(err);
                    } else {
                    }
                })
            }
        });
    }
    return res.json('success');
});
router.post("/SaveDeliveryRecieptData", midway.checkToken, (req, res, next) => {
    db.executeSql("UPDATE `transport_trade` set `endDate`=CURRENT_TIMESTAMP,`deliveryReciept`='" + req.body.deliveryReciept + "',`deliveryStatus`='Delivered',`updatedDate`=CURRENT_TIMESTAMP WHERE id=" + req.body.id, function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json('success');
        }
    })
});
router.post("/SaveBuyerPaymentDetails", midway.checkToken, (req, res, next) => {
    db.executeSql("UPDATE `transport_trade` set `utrNo`='"+req.body.utrNo+"',`paymentImage`='" + req.body.paymentImage + "',`paymentDate`=CURRENT_TIMESTAMP,`updatedDate`=CURRENT_TIMESTAMP WHERE id=" + req.body.transportId, function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json('success');
        }
    })
});
router.post("/GetTransporterDetailsbyIdForSeller", midway.checkToken, (req, res, next) => {
    db.executeSql("SELECT * FROM `transport_trade`WHERE orderId=" + req.body.tradeId + ";", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            res.json(data);
        }
    })
});
router.post("/getNewTradingDatabyIdForBuyer", midway.checkToken, (req, res, next) => {
    db.executeSql("select t.id as tradeId,t.buyerName,t.buyerId,t.req_quality,t.req_quantity,t.payment_terms,t.payment_days,t.payment_validity,t.buyerRate,t.sellerName,t.sellerId,t.sellerQuantity,t.sellerRate,t.materialImage,t.deliveryTerms,t.tradeStatus,t.buyerComissionPay,t.sellerComissionPay,t.transportDetailsStatus,t.createdDate,t.updatedDate from trades where  t.buyerId=" + req.body.uid + " and t.tradeStatus='IDEAL';", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            res.json(data);
        }
    })
});


router.post("/getAllTradingDatabyIdForBuyer", midway.checkToken, (req, res, next) => {
    db.executeSql("select t.id as tradeId,t.buyerName,t.buyerId,t.req_quality,t.req_quantity,t.payment_terms,t.payment_days,t.payment_validity,t.sellerQuantity,t.buyerRate,t.sellerName,t.sellerId,t.sellerRate,t.materialImage,t.deliveryTerms,t.tradeStatus,t.buyerComissionPay,t.sellerComissionPay,t.transportDetailsStatus,t.createdDate,t.updatedDate , a.street,a.city,a.state,a.pincode from trades t left join address a on t.sellerId = a.uid where  t.buyerId=" + req.body.uid, function (data, err) {
        if (err) {
            console.log(err);
        } else {
            res.json(data);
        }
    })
});

router.post("/getAllTradingDatabyIdForSeller", midway.checkToken, (req, res, next) => {
    console.log("vfvfvfvfvf")
    db.executeSql("select t.id as tradeId,t.buyerName,t.buyerId,t.req_quality,t.req_quantity,t.payment_terms,t.payment_days,t.payment_validity,t.buyerRate,t.sellerName,t.sellerId,t.sellerQuantity,t.sellerRate,t.materialImage,t.deliveryTerms,t.tradeStatus,t.buyerComissionPay,t.sellerComissionPay,t.transportDetailsStatus,t.createdDate,t.updatedDate,a.street,a.city,a.state,a.pincode,a.landmark from trades t left join user u on t.buyerId = u.id left join address a on t.buyerId = a.uid where t.sellerId=" + req.body.uid + ";", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            console.log(data)
            res.json(data);
        }
    })
});

router.post("/saveSellerTradeRequest", midway.checkToken, (req, res, next) => {
    db.executeSql("UPDATE `trades` set `sellerName`='" + req.body.sellerName + "',`sellerId`='" + req.body.sellerId + "',`sellerQuantity`='" + req.body.sell_quantity + "',`sellerRate`='null',`materialImage`='" + req.body.materialImage + "',`deliveryTerms`='" + req.body.diliveryTerms + "',`tradeStatus`='PENDING',`updatedDate`=CURRENT_TIMESTAMP WHERE id=" + req.body.orderId, function (data, err) {
        if (err) {
            console.log(err);
        } else {
            if (req.body.materialMultiImage.length > 0) {
                for (let i = 0; i < req.body.materialMultiImage.length; i++) {
                    db.executeSql("INSERT INTO `materialimage`(`tradeId`, `image`) VALUES (" + req.body.orderId + ",'" + req.body.materialMultiImage[i] + "');", function (data1, err) {
                        if (err) {
                            res.json("error");
                        } else {
                        }
                    });
                }
            }
        }
    })
    return res.json("success");
})

router.post("/getNewTradingReqForSeller", midway.checkToken, (req, res, next) => {
    db.executeSql("SELECT t.id as orderId, u.firstName as buyFirstName,t.payment_days, u.lastName as buyLastName,t.req_quality,t.req_quantity,t.buyerRate,t.deliveryTerms,t.tradeStatus,t.payment_validity,t.payment_terms, a.street,a.state,a.city,a.pincode from trades t join user u on u.id = t.buyerId join address a on a.uid = t.buyerId where  t.req_quality='" + req.body.mat_qlty + "';", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            res.json(data);
        }
    })
})

router.post("/RegisterNewUser", (req, res, next) => {
    // console.log(req.body);
    db.executeSql("select * from user where email='" + req.body.email + "'", function (data, err) {
        if (data.length > 0) {
            res.json('duplicate email');
        } else {
            db.executeSql("INSERT INTO `user`(`salutation`, `firstName`, `lastName`, `phone`, `email`, `role`, `companyName`, `designation`,`avg_mnth_trade`, `GST_no`, `company_contact`, `material_quality`, `KYC_status`, `created_date`,`profileUpdation`) VALUES ('" + req.body.select + "','" + req.body.fname + "','" + req.body.lname + "','" + req.body.contact + "','" + req.body.email + "','" + req.body.regAs + "','" + req.body.companyname + "','" + req.body.designation + "','" + req.body.avg_mnth_trade + "','" + req.body.gstno + "','" + req.body.workphone + "','" + req.body.selectMaterial + "',false,CURRENT_TIMESTAMP,false)", function (data3, err) {
                if (err) {
                    res.json("error");
                } else {
                    db.executeSql("INSERT INTO `address`(`uid`, `street`, `city`, `state`, `pincode`, `landmark`,`createddate`) VALUES (" + data3.insertId + ",'" + req.body.address + "','" + req.body.city + "','" + req.body.selectState + "'," + req.body.pincode + ",'" + req.body.landmark + "',CURRENT_TIMESTAMP)", function (data1, err) {
                        if (err) {
                            res.json("error");
                        } else {
                        }
                    });
                }
            });
        }
        return res.json('sucess');

    })

});


router.post("/completeProfile", midway.checkToken, (req, res, next) => {
    console.log(req.body)
    db.executeSql("UPDATE `user` SET `firstName`='" + req.body.firstName + "',`lastName`='" + req.body.lastName + "',`phone`='" + req.body.phone + "',`email`='" + req.body.email + "',`companyName`='" + req.body.companyName + "',`designation`='" + req.body.designation + "',`avg_mnth_trade`='" + req.body.avg_mnth_trade + "',`GST_no`='" + req.body.GST_no + "',`company_contact`='" + req.body.company_contact + "',`material_quality`='" + req.body.material_quality + "',`bank_name`='" + req.body.bank_name + "',`bank_acc_no`='" + req.body.bank_acc_no + "',`acc_type`='" + req.body.acc_type + "',`acc_holder_name`='" + req.body.acc_holder_name + "',`isfc_code`='" + req.body.isfc_code + "',`branch_name`='" + req.body.branch_name + "',`cancel_cheque`='" + req.body.cancel_cheque + "',`PAN_card`='" + req.body.PAN_card + "',`updated_date`=CURRENT_TIMESTAMP,`profileUpdation`=true WHERE id=" + req.body.id, function (data, err) {
        if (err) {
            console.log(err);
        } else {
            res.json('success');
        }
    })
})

router.get("/getUserDetailById/:id", midway.checkToken, (req, res, next) => {
    db.executeSql("select * from user where id=" + req.params.id, function (data, err) {
        if (err) {
            console.log(err)
        }
        else {
            res.json(data)
        }
    })
})

router.get("/getAllUser", midway.checkToken, (req, res, next) => {
    db.executeSql("select * from user;", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});

router.get("/getAllBuyer", midway.checkToken, (req, res, next) => {
    db.executeSql("select * from user where role='buyer' and KYC_status=true;", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});
router.post("/NewComissionPaymentForBuyer", midway.checkToken, (req, res, next) => {
    console.log(req.body);
    db.executeSql("UPDATE `trades` set `tradeStatus`='ACCEPTED',`buyerComissionPay`=true,`updatedDate`=CURRENT_TIMESTAMP WHERE id=" + req.body.tradeId, function (data, err) {
        if (err) {
            console.log(err);
        } else {
            res.json('success');
        }
    })
})

router.post("/NewComissionPaymentForSeller", midway.checkToken, (req, res, next) => {
    db.executeSql("UPDATE `trades` set `sellerComissionPay`=true,`updatedDate`=CURRENT_TIMESTAMP WHERE id=" + req.body.tradeId, function (data, err) {
        if (err) {
            console.log(err);
        } else {
            res.json('success');
        }
    })
})
router.post("/UploadWeightSlipImage", midway.checkToken, (req, res, next) => {
    var imgname = generateUUID();

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'images/weight');
        },
        // By default, multer removes file extensions so let's add them back
        filename: function (req, file, cb) {

            cb(null, imgname + path.extname(file.originalname));
        }
    });
    let upload = multer({ storage: storage }).single('file');
    upload(req, res, function (err) {
        console.log("path=", config.url + 'images/weight/' + req.file.filename);

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
        return res.json('/images/weight/' + req.file.filename);


    });
});
router.post("/InvoiceRecieptImageUpload", midway.checkToken, (req, res, next) => {
    var imgname = generateUUID();

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'images/invoice');
        },
        // By default, multer removes file extensions so let's add them back
        filename: function (req, file, cb) {

            cb(null, imgname + path.extname(file.originalname));
        }
    });
    let upload = multer({ storage: storage }).single('file');
    upload(req, res, function (err) {
        console.log("path=", config.url + 'images/invoice/' + req.file.filename);

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
        return res.json('/images/invoice/' + req.file.filename);


    });
});

router.post("/UploadDeliveryRecieptImage", midway.checkToken, (req, res, next) => {
    var imgname = generateUUID();

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'images/delivery-reciept');
        },
        // By default, multer removes file extensions so let's add them back
        filename: function (req, file, cb) {

            cb(null, imgname + path.extname(file.originalname));
        }
    });
    let upload = multer({ storage: storage }).single('file');
    upload(req, res, function (err) {
        console.log("path=", config.url + 'images/delivery-reciept/' + req.file.filename);

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
        return res.json('/images/delivery-reciept/' + req.file.filename);


    });
});

router.post("/UploadPaymentSlipImage", midway.checkToken, (req, res, next) => {
    var imgname = generateUUID();

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'images/payment');
        },
        // By default, multer removes file extensions so let's add them back
        filename: function (req, file, cb) {

            cb(null, imgname + path.extname(file.originalname));
        }
    });
    let upload = multer({ storage: storage }).single('file');
    upload(req, res, function (err) {
        console.log("path=", config.url + 'images/payment/' + req.file.filename);

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
        return res.json('/images/payment/' + req.file.filename);


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