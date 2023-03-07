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
const { sql } = require("../../config");
const mysql = require('mysql');
const PDFDocument = require('pdfkit');
const doc = new PDFDocument({
    layout: 'landscape',
    size: 'A4',
});



router.get("/GetInstituteDetailByURL/:id", (req, res, next) => {
    console.log(req.params, 'institute');
    db.executeSql("SELECT * FROM institute WHERE url='" + req.params.id + "';", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            // db.executeSql("INSERT INTO `visitor`(`localArea`, `wifi`, `createddate`) VALUES ('" + MacAddress.Local Area Connection * 10 + "','" + MacAddress.Wi - Fi + "',CURRENT_TIMESTAMP)", function (data1, err) {
            //     if (err) {
            //         res.json("error");
            //     } else {
            //         console.log('success')
            //     }
            // });
            // console.log(data);
            return res.json(data);
        }
    })
});

router.get("/GetLastUpdateSiteById/:id", (req, res, next) => {
    db.executeSql("SELECT * FROM institute WHERE id='" + req.params.id + "';", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});
router.post("/SaveInsituteDetails", (req, res, next) => {
    console.log(req.body, "hello  im here");
    const body = req.body;
    var salt = '7fa73b47df808d36c5fe328546ddef8b9011b2c6';
    var repass = salt + '' + body.pass;
    var encPassword = crypto.createHash('sha1').update(repass).digest('hex');
    console.log(encPassword);
    db.executeSql("INSERT INTO `institute`(`type`, `name`, `phone`, `contact`, `email`, `password`, `url`, `createddate`) VALUES ('" + req.body.type + "','" + req.body.name + "'," + req.body.phone + "," + req.body.contact + ",'" + req.body.email + "','" + encPassword + "','" + req.body.url + "',CURRENT_TIMESTAMP)", function (data, err) {
        if (err) {
            res.json("error");
        } else {
            return res.json(data);
        }
    });
});
router.post("/UpdateInstituteDetails", (req, res, next) => {
    console.log(req.body, "hello  im here");
    const body = req.body;
    var salt = '7fa73b47df808d36c5fe328546ddef8b9011b2c6';
    var repass = salt + '' + body.pass;
    var encPassword = crypto.createHash('sha1').update(repass).digest('hex');
    console.log(encPassword);
    db.executeSql("UPDATE `institute` SET `type`='" + req.body.type + "',`name`='" + req.body.name + "',`phone`=" + req.body.phone + ",`contact`=" + req.body.contact + ",`email`='" + req.body.email + "',`password`='" + encPassword + "',`url`='" + req.body.url + "',`updateddate`=CURRENT_TIMESTAMP WHERE id=" + req.body.id + ";", function (data, err) {
        if (err) {
            res.json("error");
        } else {
            return res.json('success');
        }
    });
});
router.get("/RemoveInstituteDetailsById/:id", (req, res, next) => {
    db.executeSql("DELETE FROM institute WHERE id='" + req.params.id + "';", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});
router.get("/GetAllInstituteDetails", (req, res, next) => {
    db.executeSql("SELECT * FROM `institute`;", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});

router.post("/UploadGalleryImages", (req, res, next) => {
    var imgname = generateUUID();

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'images/gallery');
        },
        // By default, multer removes file extensions so let's add them back
        filename: function (req, file, cb) {

            cb(null, imgname + path.extname(file.originalname));
        }
    });
    let upload = multer({ storage: storage }).single('file');
    upload(req, res, function (err) {
        console.log("path=", config.url + 'images/gallery/' + req.file.filename);

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
        return res.json('/images/gallery/' + req.file.filename);


    });
});

router.post("/UploadGalleryVideo", (req, res, next) => {
    const videoStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, "video/")
        },
        filename: (req, file, cb) => {
            cb(null, file.fieldname + '_' + Date.now()
                + path.extname(file.originalname))
        }
    });
    const videoUpload = multer({
        storage: videoStorage,
        limits: {
            fileSize: 10000000 // 10000000 Bytes = 10 MB
        },
        fileFilter(req, file, cb) {
            // upload only mp4 and mkv format
            if (!file.originalname.match(/\.(mp4|MPEG-4|mkv)$/)) {
                return cb(new Error('Please upload a video'))
            }
            cb(undefined, true)
        }
    })
    let upload = multer({ videoUpload: videoUpload }).single('video');
    upload(error, req, res, function (err) {
        console.log('/video/' + req.file.filename);
        res.status(400).send({ error: error.message })
        return res.json('/video/' + req.file.filename)
        // return res.json('/images/infra/' + req.file.filename);
    });
});

router.post("/SaveGalleryImages", (req, res, next) => {
    db.executeSql("INSERT INTO `image`(`institute_id`, `purpose`, `image`, `isactive`, `createddate`) VALUES(" + req.body.institute_id + ",'" + req.body.purpose + "','" + req.body.image + "',true,CURRENT_TIMESTAMP)", function (data, err) {
        if (err) {
            res.json("error");
        } else {
            return res.json(data);
        }
    });
});
router.post("/GetALLImagesByIdDetails", (req, res, next) => {
    db.executeSql("SELECT * FROM `image` WHERE institute_id=" + req.body.institute_id + ";", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});
router.post("/GetImagesByIdDetails", (req, res, next) => {
    db.executeSql("SELECT * FROM `image` WHERE isactive=true AND institute_id=" + req.body.institute_id + ";", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});
router.post("/UpdateActiveDeactiveBanners", (req, res, next) => {
    console.log(req.body, 'Deactive')
    db.executeSql("UPDATE  `image` SET isactive=" + req.body.isactive + " WHERE id=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});
router.post("/RemoveImagesByIdDetails", (req, res, next) => {
    db.executeSql("DELETE FROM `image` WHERE id=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});

router.post("/SaveDepartmentList", (req, res, next) => {
    db.executeSql("INSERT INTO `department_list`(`institute_id`, `department`, `createddate`) VALUES (" + req.body.institute_id + ",'" + req.body.department + "',CURRENT_TIMESTAMP)", function (data, err) {
        if (err) {
            res.json("error");
        } else {
            return res.json('success');
        }
    });
});

router.post("/UpdateDepartmentList", (req, res, next) => {
    db.executeSql("UPDATE `department_list` SET `department`='" + req.body.department + "',`updateddate`=CURRENT_TIMESTAMP WHERE id=" + req.body.id + ";", function (data, err) {
        if (err) {
            res.json("error");
        } else {
            return res.json('success');
        }
    });
});

router.get("/GetDepartmentByIdDetails/:id", (req, res, next) => {
    db.executeSql("SELECT * FROM `department_list` WHERE institute_id=" + req.params.id, function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});

router.get("/GetYearbyGroupDetails/:id", (req, res, next) => {
    db.executeSql("SELECT * FROM `papers` WHERE institute_id='" + req.params.id + "' GROUP BY year;", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});
router.get("/RemoveDepartmentByIdDetails/:id", (req, res, next) => {
    db.executeSql("DELETE FROM `department_list` WHERE id=" + req.params.id, function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});

router.post("/SaveStaffProfileImages", (req, res, next) => {
    var imgname = generateUUID();

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'images/staff');
        },
        // By default, multer removes file extensions so let's add them back
        filename: function (req, file, cb) {

            cb(null, imgname + path.extname(file.originalname));
        }
    });
    let upload = multer({ storage: storage }).single('file');
    upload(req, res, function (err) {
        console.log("path=", config.url + 'images/staff/' + req.file.filename);

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
        return res.json('/images/staff/' + req.file.filename);


    });
});

router.post("/SaveStaffDetailsList", (req, res, next) => {
    console.log(req.body, 'Hii I ma Staff')
    db.executeSql("INSERT INTO `staff_list` (`institute_id`, `department`, `name`, `contact`, `email`, `designation`, `qualification`, `birthday_date`, `joining_date`, `profile_image`, `createddate`) values ('" + req.body.institute_id + "','" + req.body.department + "','" + req.body.name + "'," + req.body.contact + ",'" + req.body.email + "','" + req.body.designation + "','" + req.body.qualification + "','" + req.body.birthday_date + "','" + req.body.joining_date + "','" + req.body.profile + "',CURRENT_TIMESTAMP)", function (data, err) {
        if (err) {
            res.json("error");
            console.log(err)
        } else {
            return res.json(data);
        }
    });
});

router.post("/UpdateStaffDetailsById", (req, res, next) => {
    console.log(req.body, 'Update Staff')
    db.executeSql("UPDATE `staff_list` SET `department`='" + req.body.department + "',`name`='" + req.body.name + "',`contact`='" + req.body.contact + "',`email`='" + req.body.email + "',`designation`='" + req.body.designation + "',`qualification`='" + req.body.qualification + "',`birthday_date`='" + req.body.birthday_date + "',`joining_date`='" + req.body.joining_date + "',`profile_image`='" + req.body.profile + "',`updateddate`=CURRENT_TIMESTAMP WHERE id=" + req.body.id, function (data, err) {
        if (err) {
            res.json("error");
            console.log(err)
        } else {
            return res.json(data);
        }
    });
});

router.get("/GetAllStaffDetails/:id", (req, res, next) => {
    db.executeSql("SELECT s.id as staffId,s.institute_id,s.department,s.name,s.contact,s.email,s.designation,s.qualification,s.joining_date,s.profile_image, s.birthday_date,d.id as departmentId,d.department as departmentName FROM staff_list s left join department_list d on s.department= d.id WHERE s.institute_id=" + req.params.id, function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});

router.get("/RemoveStaffDetailsById/:id", (req, res, next) => {
    db.executeSql("DELETE FROM `staff_list` WHERE id=" + req.params.id, function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});

router.post("/SaveDonnerListDetails", (req, res, next) => {
    db.executeSql("INSERT INTO `donners`(`donationDate`, `donnerName`, `donnerCity`, `amount`, `createddate`) VALUES ('" + req.body.donationDate + "','" + req.body.donnerName + "','" + req.body.donnerCity + "'," + req.body.amount + ",CURRENT_TIMESTAMP)", function (data, err) {
        if (err) {
            res.json("error");
            console.log(err)
        } else {
            return res.json(data);
        }
    });
});

router.get("/GetAllDonnerList", (req, res, next) => {
    db.executeSql("SELECT * FROM donners ORDER BY donationDate DESC ;", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});
router.post("/SaveBulkDonnersDetails", (req, res, next) => {
    for (let i = 0; i < req.body.length; i++) {
        db.executeSql("INSERT INTO `donners`(`donationDate`, `donnerName`, `donnerCity`, `amount`, `createddate`) VALUES ('" + req.body[i].donationDate + "','" + req.body[i].donnerName + "','" + req.body[i].donnerCity + "','" + req.body[i].amount + "',CURRENT_TIMESTAMP)", function (data, err) {
            if (err) {
                res.json("error");
                console.log(err)
            } else {
            }
        });
    }
    // return res.json('success');
});

router.post("/SaveBeneficiaryDetails", (req, res, next) => {
    db.executeSql("INSERT INTO `beneficiary`(`year`,`studentName`, `instituteName`, `course`, `refundAmount`, `createddate`) VALUES ('" + req.body.year + "','" + req.body.studentName + "','" + req.body.instituteName + "','" + req.body.course + "','" + req.body.refundAmount + "',CURRENT_TIMESTAMP)", function (data, err) {
        if (err) {
            res.json("error");
            console.log(err)
        } else {
            return res.json(data);
        }
    });
});

router.get("/GetAllBeneficiaryList", (req, res, next) => {
    db.executeSql("SELECT * FROM beneficiary;", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});
router.get("/GetBeneficiaryYear", (req, res, next) => {
    db.executeSql("SELECT id, year FROM beneficiary GROUP BY year;", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});
router.post("/SaveBulkBeneficiaryDetails", (req, res, next) => {
    for (let i = 0; i < req.body.length; i++) {
        db.executeSql("INSERT INTO `beneficiary`(`year`,`studentName`, `instituteName`, `course`, `refundAmount`, `createddate`) VALUES ('" + req.body[i].year + "','" + req.body[i].studentName + "','" + req.body[i].instituteName + "','" + req.body[i].course + "','" + req.body[i].refundAmount + "',CURRENT_TIMESTAMP)", function (data, err) {
            if (err) {
                res.json("error");
                console.log(err)
            } else {
            }
        });
    }
    return res.json('success');

});


router.get("/RemoveBeneficiaryDetailsById/:id", (req, res, next) => {
    db.executeSql("DELETE FROM `beneficiary` WHERE id=" + req.params.id, function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});

router.get("/RemoveDonnerDetailsById/:id", (req, res, next) => {
    db.executeSql("DELETE FROM `donners` WHERE id=" + req.params.id, function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});
router.post("/uploadBlogImages", (req, res, next) => {
    var imgname = generateUUID();

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'images/blogs');
        },
        // By default, multer removes file extensions so let's add them back
        filename: function (req, file, cb) {

            cb(null, imgname + path.extname(file.originalname));
        }
    });
    let upload = multer({ storage: storage }).single('file');
    upload(req, res, function (err) {
        console.log("path=", config.url + 'images/blogs/' + req.file.filename);

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
        return res.json('/images/blogs/' + req.file.filename);


    });
});
router.post("/SaveBlogDetails", (req, res, next) => {
    db.executeSql("INSERT INTO `blogs`(`institute_id`, `blogTitle`,`authorName`, `blogDate`, `blogImage`, `createdate`) VALUES ('" + req.body.institute_id + "','" + req.body.blogTitle + "','" + req.body.authorName + "','" + req.body.blogDate + "','" + req.body.blogImage + "',CURRENT_TIMESTAMP)", function (data, err) {
        if (err) {
            res.json("error");
            console.log(err)
        } else {
            const values = [req.body.blogDetails]
            const escapedValues = values.map(mysql.escape);
            db.executeSql1("UPDATE blogs SET blogDetails=" + escapedValues + " WHERE id= " + data.insertId, escapedValues, function (data1, err) {
                if (err) {
                    res.json("error");
                    console.log(err)
                } else {
                }
            });
            return res.json('success');
        }
    });
});
router.post("/UpdateBlogDetails", (req, res, next) => {
    db.executeSql("UPDATE `blogs` SET `blogTitle`='" + req.body.blogTitle + "',`authorName`='" + req.body.authorName + "',`blogDate`='" + req.body.blogDate + "',`blogImage`='" + req.body.blogImage + "',`updateddate`=CURRENT_TIMESTAMP WHERE id=" + req.body.id + ";", function (data, err) {
        if (err) {
            res.json("error");
        } else {
            const values = [req.body.blogDetails]
            const escapedValues = values.map(mysql.escape);
            db.executeSql1("UPDATE blogs SET blogDetails=" + escapedValues + " WHERE id= " + req.body.id, escapedValues, function (data1, err) {
                if (err) {
                    res.json("error");
                    console.log(err)
                } else {
                }
            });
            return res.json('success');
        }
    });
});

router.get("/GetBlogsDetailsById/:id", (req, res, next) => {
    db.executeSql("SELECT * FROM blogs WHERE institute_id=" + req.params.id + ";", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});
router.get("/RemoveBlogDetails/:id", (req, res, next) => {
    db.executeSql("DELETE FROM `blogs` WHERE id=" + req.params.id + ";", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});

router.post("/UploadInfraImage", (req, res, next) => {
    var imgname = generateUUID();

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'images/infra');
        },
        // By default, multer removes file extensions so let's add them back
        filename: function (req, file, cb) {

            cb(null, imgname + path.extname(file.originalname));
        }
    });
    let upload = multer({ storage: storage }).single('file');
    upload(req, res, function (err) {
        console.log("path=", config.url + 'images/infra/' + req.file.filename);

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
        return res.json('/images/infra/' + req.file.filename);


    });
});
router.post("/UploadMoreImage", (req, res, next) => {
    var imgname = generateUUID();
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'images/more');
        },
        // By default, multer removes file extensions so let's add them back
        filename: function (req, file, cb) {

            cb(null, imgname + path.extname(file.originalname));
        }
    });
    let upload = multer({ storage: storage }).single('file');
    upload(req, res, function (err) {
        console.log("path=", config.url + 'images/more/' + req.file.filename);

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
        return res.json('/images/more/' + req.file.filename);


    });
});
router.post("/SaveScholarshipDetails", (req, res, next) => {
    db.executeSql("INSERT INTO `scholarship`(`institute_id`, `purpose`, `title`, `image`,`createdate`) VALUES  ('" + req.body.institute_id + "','" + req.body.purpose + "','" + req.body.title + "','" + req.body.image + "',CURRENT_TIMESTAMP)", function (data, err) {
        if (err) {
            res.json("error");
            console.log(err)
        } else {
            const values = [req.body.details]
            const escapedValues = values.map(mysql.escape);
            db.executeSql1("UPDATE scholarship SET details=" + escapedValues + " WHERE id= " + data.insertId, escapedValues, function (data1, err) {
                if (err) {
                    res.json("error");
                    console.log(err)
                } else {
                }
            });
            return res.json('success');
        }
    });
});
router.get("/GetScholarshipDetails/:id", (req, res, next) => {
    db.executeSql("SELECT * FROM scholarship WHERE institute_id=" + req.params.id + ";", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});
router.get("/RemoveScholarshipDetails/:id", (req, res, next) => {
    db.executeSql("DELETE FROM `scholarship` WHERE id=" + req.params.id + ";", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});
router.post("/SaveInfrastructureDetails", (req, res, next) => {
    db.executeSql("INSERT INTO `infrastructure`(`institute_id`, `infraTitle`,`infraImage`, `createddate`) VALUES ('" + req.body.institute_id + "','" + req.body.infraTitle + "','" + req.body.infraImage + "',CURRENT_TIMESTAMP)", function (data, err) {
        if (err) {
            res.json("error");
            console.log(err)
        } else {
            const values = [req.body.infraDetails]
            const escapedValues = values.map(mysql.escape);
            db.executeSql1("UPDATE infrastructure SET infraDetails=" + escapedValues + " WHERE id= " + data.insertId, escapedValues, function (data1, err) {
                if (err) {
                    res.json("error");
                    console.log(err)
                } else {
                }
            });
            return res.json('success');
        }

    });
    // return res.json('success');

});
router.post("/UpdateInfraDetails", (req, res, next) => {
    db.executeSql("UPDATE `infrastructure` SET `infraTitle`='" + req.body.infraTitle + "',`infraImage`='" + req.body.infraImage + "',`updateddate`=CURRENT_TIMESTAMP WHERE id=" + req.body.id + ";", function (data, err) {
        if (err) {
            res.json("error");
        } else {
            const values = [req.body.infraDetails]
            const escapedValues = values.map(mysql.escape);
            db.executeSql1("UPDATE infrastructure SET infraDetails=" + escapedValues + " WHERE id= " + req.body.id, escapedValues, function (data1, err) {
                if (err) {
                    res.json("error");
                    console.log(err)
                } else {
                }
            });
            return res.json('success');
        }
    });
});
router.get("/RemoveInfraDetails/:id", (req, res, next) => {
    db.executeSql("DELETE FROM `infrastructure` WHERE id=" + req.params.id + ";", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});
router.get("/GetInfraDetailsById/:id", (req, res, next) => {
    db.executeSql("SELECT * FROM infrastructure WHERE institute_id=" + req.params.id + ";", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});

router.post("/SaveAlumniDetails", (req, res, next) => {
    db.executeSql("INSERT INTO `alumni`(`instituteName`, `alumniName`, `alumniCourse`, `alumniYear`, `contactNumber`, `email`, `createddate`) VALUES  ('" + req.body.instituteName + "','" + req.body.alumniName + "','" + req.body.alumniCourse + "','" + req.body.alumniYear + "','" + req.body.contactNumber + "','" + req.body.email + "',CURRENT_TIMESTAMP)", function (data, err) {
        if (err) {
            res.json("error");
            console.log(err)
        } else {
            const replacements = {
                name: req.body.alumniName,
            };
            mail('alumni.html', replacements, req.body.email, "Alumni Registered Successfully", " ")
            // res.json(data);
            return res.json('success');
        }
    });
});

router.post("/SaveRahatokarshDonation", (req, res, next) => {
    db.executeSql("INSERT INTO `rahatokarsh`(`name`, `number`, `email`, `amount`, `isactive`, `createddate`) VALUES  ('" + req.body.donnerName + "','" + req.body.contactNumber + "','" + req.body.email + "','" + req.body.donationAmount + "',false,CURRENT_TIMESTAMP)", function (data, err) {
        if (err) {
            res.json("error");
            console.log(err)
        } else {
            const replacements = {
                name: req.body.donnerName,
            };
            mail('donation.html', replacements, req.body.email, "Thank You For Contributing.", " ")
            // res.json(data);
            return res.json('success');
        }
    });
});
router.get("/GetRahatokarshDonationList", (req, res, next) => {
    db.executeSql("SELECT * FROM rahatokarsh ORDER BY createddate DESC; ;", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});


// // Adding functionality
// doc

//     .fontSize(27)
//     .text('This the article for GeeksforGeeks', 100, 100);

// // Adding an image in the pdf.

// doc.image('images/blogs/3b993646-e4bf-442a-8af1.jpg', {
//     fit: [400, 400],
//     align: 'justify',
//     valign: 'justify'
// });

// // Finalize PDF file
// doc.end();



router.post("/GenerateRahatokarshCertficate", (req, res, next) => {
    console.log(req.body, 'Certificate')
    // Saving the pdf file in root directory.
    db.executeSql("UPDATE `rahatokarsh` SET `isactive`=true,`updateddate`=CURRENT_TIMESTAMP WHERE id=" + req.body.id, function (data, err) {
        if (err) {
            res.json("error");
            console.log(err)
        } else {
            let cert_name=Date.now();
            doc.pipe(fs.createWriteStream('certificate/' + cert_name + '.pdf'));
            db.executeSql("update rahatokarsh set certificate= '/certificate/" + cert_name + ".pdf'  where id=" + req.body.id, function(data1,err){
                if(err){
                    console.log(err);
                }
            })
            function jumpLine(doc, lines) {
                for (let index = 0; index < lines; index++) {
                    doc.moveDown();
                }
            }
            doc.rect(0, 0, doc.page.width, doc.page.height).fill('#fff');

            doc.fontSize(10);

            // Margin
            const distanceMargin = 18;

            doc
                .fillAndStroke('#0e8cc3')
                .lineWidth(20)
                .lineJoin('round')
                .rect(
                    distanceMargin,
                    distanceMargin,
                    doc.page.width - distanceMargin * 2,
                    doc.page.height - distanceMargin * 2,
                )
                .stroke();

            // Header
            const maxWidth = 140;
            const maxHeight = 70;

            doc.image('src/assets/winners.png', doc.page.width / 2 - maxWidth / 2, 60, {
                fit: [maxWidth, maxHeight],
                align: 'center',
            });

            jumpLine(doc, 5)

            doc
                .font('src/assets/fonts/NotoSansJP-Light.otf')
                .fontSize(10)
                .fill('#021c27')
                .text('Super Course for Awesomes', {
                    align: 'center',
                });

            jumpLine(doc, 2)

            // Content
            doc
                .font('src/assets/fonts/NotoSansJP-Regular.otf')
                .fontSize(16)
                .fill('#021c27')
                .text('CERTIFICATE OF COMPLETION', {
                    align: 'center',
                });

            jumpLine(doc, 1)

            doc
                .font('src/assets/fonts/NotoSansJP-Light.otf')
                .fontSize(10)
                .fill('#021c27')
                .text('Present to', {
                    align: 'center',
                });

            jumpLine(doc, 2)
            doc
                .font('src/assets/fonts/NotoSansJP-Bold.otf')
                .fontSize(24)
                .fill('#021c27')
                .text(req.body.name, {
                    align: 'center',
                });

            jumpLine(doc, 1)

            doc
                .font('src/assets/fonts/NotoSansJP-Light.otf')
                .fontSize(10)
                .fill('#021c27')
                .text('Successfully completed the Super Course for Awesomes.', {
                    align: 'center',
                });

            jumpLine(doc, 7)

            doc.lineWidth(1);

            // Signatures
            const lineSize = 174;
            const signatureHeight = 390;

            doc.fillAndStroke('#021c27');
            doc.strokeOpacity(0.2);

            const startLine1 = 128;
            const endLine1 = 128 + lineSize;
            doc
                .moveTo(startLine1, signatureHeight)
                .lineTo(endLine1, signatureHeight)
                .stroke();

            const startLine2 = endLine1 + 32;
            const endLine2 = startLine2 + lineSize;
            doc
                .moveTo(startLine2, signatureHeight)
                .lineTo(endLine2, signatureHeight)
                .stroke();

            const startLine3 = endLine2 + 32;
            const endLine3 = startLine3 + lineSize;
            doc
                .moveTo(startLine3, signatureHeight)
                .lineTo(endLine3, signatureHeight)
                .stroke();

            doc
                .font('src/assets/fonts/NotoSansJP-Bold.otf')
                .fontSize(10)
                .fill('#021c27')
                .text('John Doe', startLine1, signatureHeight + 10, {
                    columns: 1,
                    columnGap: 0,
                    height: 40,
                    width: lineSize,
                    align: 'center',
                });

            doc
                .font('src/assets/fonts/NotoSansJP-Light.otf')
                .fontSize(10)
                .fill('#021c27')
                .text('Associate Professor', startLine1, signatureHeight + 25, {
                    columns: 1,
                    columnGap: 0,
                    height: 40,
                    width: lineSize,
                    align: 'center',
                });

            doc
            // .font('src/assets/fonts/NotoSansJP-Bold.otf')
            // .fontSize(10)
            // .fill('#021c27')
            // .text('Student Name', startLine2, signatureHeight + 10, {
            //     columns: 1,
            //     columnGap: 0,
            //     height: 40,
            //     width: lineSize,
            //     align: 'center',
            // });

            doc
            // .font('src/assets/fonts/NotoSansJP-Light.otf')
            // .fontSize(10)
            // .fill('#021c27')
            // .text('Student', startLine2, signatureHeight + 25, {
            //     columns: 1,
            //     columnGap: 0,
            //     height: 40,
            //     width: lineSize,
            //     align: 'center',
            // });

            doc
                .font('src/assets/fonts/NotoSansJP-Bold.otf')
                .fontSize(10)
                .fill('#021c27')
                .text('Jane Doe', startLine3, signatureHeight + 10, {
                    columns: 1,
                    columnGap: 0,
                    height: 40,
                    width: lineSize,
                    align: 'center',
                });

            doc
                .font('src/assets/fonts/NotoSansJP-Light.otf')
                .fontSize(10)
                .fill('#021c27')
                .text('Director', startLine3, signatureHeight + 25, {
                    columns: 1,
                    columnGap: 0,
                    height: 40,
                    width: lineSize,
                    align: 'center',
                });

            jumpLine(doc, 4);

            // Validation link
            const link =
                'https://validate-your-certificate.hello/validation-code-here';

            const linkWidth = doc.widthOfString(link);
            const linkHeight = doc.currentLineHeight();

            doc
                .underline(
                    doc.page.width / 2 - linkWidth / 2,
                    448,
                    linkWidth,
                    linkHeight,
                    { color: '#021c27' },
                )
                .link(
                    doc.page.width / 2 - linkWidth / 2,
                    448,
                    linkWidth,
                    linkHeight,
                    link,
                );

            doc
                .font('src/assets/fonts/NotoSansJP-Light.otf')
                .fontSize(10)
                .fill('#021c27')
                .text(
                    link,
                    doc.page.width / 2 - linkWidth / 2,
                    448,
                    linkWidth,
                    linkHeight
                );

            // Footer
            const bottomHeight = doc.page.height - 100;

            doc.image('src/assets/qr.png', doc.page.width / 2 - 30, bottomHeight, {
                fit: [60, 60],
            });

            doc.end();
            // return res.json(data);
            const replacements = {
                name: req.body.name,
                // download: 
            };
            mail('certification.html', replacements, req.body.email, "Thank You For Donating.", " ")
            // res.json(data);
            return res.json('success');

        }
    });
});
router.get("/GetAlumniDetails", (req, res, next) => {
    db.executeSql("SELECT * FROM alumni;", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});

router.post("/SaveContactUsDetails", (req, res, next) => {
    db.executeSql("INSERT INTO `contact`(`institute_id`, `name`, `email`, `contact`, `subject`, `message`, `createddate`) VALUES  ('" + req.body.institute_id + "','" + req.body.name + "','" + req.body.email + "','" + req.body.contact + "','" + req.body.subject + "','" + req.body.message + "',CURRENT_TIMESTAMP)", function (data, err) {
        if (err) {
            res.json("error");
            console.log(err)
        } else {
            const replacements = {
                name: req.body.name,
            };
            mail('feedback-ces.html', replacements, req.body.email, "Feedback Submitted", " ")
            // res.json(data);
            return res.json('success');
        }
    });
});

router.post("/SaveCounselingDetails", (req, res, next) => {
    db.executeSql("INSERT INTO `counseling`(`name`, `division`, `email`, `phone`, `instituteName`, `message`, `createddate`) VALUES ('" + req.body.name + "','" + req.body.division + "','" + req.body.email + "'," + req.body.phone + ",'" + req.body.instituteName + "','" + req.body.message + "',CURRENT_TIMESTAMP)", function (data, err) {
        if (err) {
            res.json("error");
            console.log(err)
        } else {
            const replacements = {
                name: req.body.name,
                // email: req.body.email,
                // subject: req.body.subject,
                // message: req.body.message
            };
            mail('appointement-ces.html', replacements, req.body.email, "Appointement Submitted", " ")
            // res.json(data);
            return res.json('success');
        }
    });
});
router.get("/GetCounselingData", (req, res, next) => {
    db.executeSql("SELECT * FROM counseling;", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});

router.get("/GetContactUsDetailsById/:id", (req, res, next) => {
    db.executeSql("SELECT * FROM contact WHERE institute_id=" + req.params.id + ";", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});

router.post("/SaveResultDetails", (req, res, next) => {
    db.executeSql("INSERT INTO `result`(`institute_id`, `title`, `image`, `createddate`) VALUES ('" + req.body.institute_id + "','" + req.body.title + "','" + req.body.image + "',CURRENT_TIMESTAMP)", function (data, err) {
        if (err) {
            res.json("error");
            console.log(err)
        } else {
            return res.json(data);
        }
    });
});

router.post("/SaveQuestionPapersDetails", (req, res, next) => {
    db.executeSql("INSERT INTO `papers`(`institute_id`, `department`, `subject`, `year`, `semester`, `title`, `files`, `createdate`) VALUES('" + req.body.institute_id + "','" + req.body.department + "','" + req.body.subject + "','" + req.body.year + "','" + req.body.semester + "','" + req.body.title + "','" + req.body.files + "',CURRENT_TIMESTAMP)", function (data, err) {
        if (err) {
            res.json("error");
            console.log(err)
        } else {
            return res.json(data);
        }
    });
});

router.get("/GetQuestionPapersDetails/:id", (req, res, next) => {
    db.executeSql("SELECT * FROM papers WHERE institute_id=" + req.params.id + ";", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});

router.get("/RemoveQuestionPapersDetails/:id", (req, res, next) => {
    db.executeSql("DELETE FROM papers WHERE id=" + req.params.id + ";", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});

router.post("/UpdateResultDetails", (req, res, next) => {
    console, log(req.body, 'resukt')
    db.executeSql("UPDATE `result` SET `title`='" + req.body.title + "',`image`='" + req.body.image + "',`updateddate`=CURRENT_TIMESTAMP WHERE id=" + req.body.id, function (data, err) {
        if (err) {
            res.json("error");
            console.log(err)
        } else {
            return res.json(data);
        }
    });
});

router.post("/UpdateBeneficiaryDetails", (req, res, next) => {
    console, log('Benificiary')
    db.executeSql("UPDATE `beneficiary` SET `year`='" + req.body.year + "',`studentName`='" + req.body.studentName + "',`instituteName`='" + req.body.instituteName + "',`course`='" + req.body.course + "',`refundAmount`='" + req.body.refundAmount + "',`updateddate`=CURRENT_TIMESTAMP WHERE id" + req.body.id, function (data, err) {
        if (err) {
            res.json("error");
            console.log(err)
        } else {
            return res.json(data);
        }
    });
});
router.get("/RemoveResultDetailsById/:id", (req, res, next) => {
    console.log(req.params, 'gjvuvyihgk')
    db.executeSql("DELETE FROM `result` WHERE id=" + req.params.id, function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});
router.get("/GetResultDetailsById/:id", (req, res, next) => {
    db.executeSql("SELECT * FROM result WHERE institute_id=" + req.params.id + ";", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});

router.post("/UploadPDF", (req, res, next) => {

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, "pdf/")
        },
        filename: (req, file, cb) => {
            cb(null, Date.now() + ".pdf")
        },
    })
    let upload = multer({ storage: storage }).single('file');
    upload(req, res, function (err) {
        console.log('/pdf/' + req.file.filename)
        return res.json('/pdf/' + req.file.filename)
        // return res.json('/images/infra/' + req.file.filename);
    });

});

// router.post("/SaveNewsDataList", (req, res, next) => {
//     db.executeSql("INSERT INTO `news`(`institute_id`, `date`, `message`, `files`, `createddate`) VALUES ('" + req.body.institute_id + "','" + req.body.date + "','" + req.body.message + "','" + req.body.files + "',CURRENT_TIMESTAMP)", function (data, err) {
//         if (err) {
//             res.json("error");
//             console.log(err)
//         } else {
//             return res.json('success');
//         }
//     });
// });
router.post("/SaveNewsDataList", (req, res, next) => {
    db.executeSql("INSERT INTO `news`(`institute_id`, `date`, `files`,`isactive`,`createddate`) VALUES ('" + req.body.institute_id + "','" + req.body.date + "','" + req.body.files + "',true,CURRENT_TIMESTAMP)", function (data, err) {
        if (err) {
            res.json("error");
            console.log(err)
        } else {
            const values = [req.body.message]
            const escapedValues = values.map(mysql.escape);
            db.executeSql1("UPDATE news SET message=" + escapedValues + " WHERE id= " + data.insertId, escapedValues, function (data1, err) {
                if (err) {
                    res.json("error");
                    console.log(err)
                } else {
                }
            });
            return res.json('success');
        }
    });
});

router.post("/SaveAnswerkeyDataList", (req, res, next) => {
    db.executeSql("INSERT INTO `answerkey`(`date`,`files`, `isactive`, `createddate`) VALUES ('" + req.body.date + "','" + req.body.files + "',true,CURRENT_TIMESTAMP)", function (data, err) {
        if (err) {
            res.json("error");
            console.log(err)
        } else {
            const values = [req.body.message]
            const escapedValues = values.map(mysql.escape);
            db.executeSql1("UPDATE answerkey SET message=" + escapedValues + " WHERE id= " + data.insertId, escapedValues, function (data1, err) {
                if (err) {
                    res.json("error");
                    console.log(err)
                } else {
                }
            });
            return res.json('success');
        }
    });
});

router.post("/UpdateActiveDeactiveNews", (req, res, next) => {
    console.log(req.body, 'news')
    db.executeSql("UPDATE `news` SET isactive=" + req.body.isactive + " WHERE id=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});

router.post("/UpdateActiveDeactiveAnswerkey", (req, res, next) => {
    console.log(req.body, 'answerkey')
    db.executeSql("UPDATE `answerkey` SET isactive=" + req.body.isactive + " WHERE id=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});

router.post("/SaveStudentListData", (req, res, next) => {
    db.executeSql("INSERT INTO `student`(`institute_id`, `title`, `createddate`) VALUES ('" + req.body.institute_id + "','" + req.body.title + "',CURRENT_TIMESTAMP)", function (data, err) {
        if (err) {
            res.json("error");
            console.log(err)
        } else {
            const values = [req.body.details]
            const escapedValues = values.map(mysql.escape);
            db.executeSql1("UPDATE student SET details=" + escapedValues + " WHERE id= " + data.insertId, escapedValues, function (data1, err) {
                if (err) {
                    res.json("error");
                    console.log(err)
                } else {
                }
            });
            return res.json('success');
        }
    });
});

router.post("/UpdateStudentListData", (req, res, next) => {
    db.executeSql("UPDATE `student` SET `title`='" + req.body.title + "',`updateddate`=CURRENT_TIMESTAMP WHERE id=" + req.body.id, function (data, err) {
        if (err) {
            res.json("error");
            console.log(err)
        } else {
            const values = [req.body.details]
            const escapedValues = values.map(mysql.escape);
            db.executeSql1("UPDATE student SET details=" + escapedValues + " WHERE id= " + req.body.id, escapedValues, function (data1, err) {
                if (err) {
                    res.json("error");
                    console.log(err)
                } else {
                }
            });
            return res.json('success');
        }
    });
});

router.get("/GetStudentListData/:id", (req, res, next) => {
    db.executeSql("SELECT * FROM student WHERE institute_id=" + req.params.id + ";", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});

router.get("/RemoveStudentListData/:id", (req, res, next) => {
    db.executeSql("DELETE FROM student WHERE id=" + req.params.id + ";", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});

router.get("/GetNewsByIdDetails/:id", (req, res, next) => {
    db.executeSql("SELECT * FROM news WHERE institute_id=" + req.params.id + " ORDER BY date DESC ;", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});

router.get("/GetAllAnswerkey", (req, res, next) => {
    db.executeSql("SELECT * FROM answerkey ORDER BY date DESC ;", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});

router.get("/GetNewsOnlyForCES/:id", (req, res, next) => {
    db.executeSql("SELECT * FROM news WHERE institute_id=" + req.params.id + " AND isactive=true ORDER BY date DESC; ", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});
router.get("/RemoveNewsByIdDetails/:id", (req, res, next) => {
    db.executeSql("DELETE FROM news WHERE id=" + req.params.id, function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});
router.get("/RemoveAnswerkeyByIdDetails/:id", (req, res, next) => {
    db.executeSql("DELETE FROM answerkey WHERE id=" + req.params.id, function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});

router.get("/RemoveOtherDetailsById/:id", (req, res, next) => {
    db.executeSql("DELETE FROM others WHERE id=" + req.params.id, function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});

router.post("/SaveOthersDataList", (req, res, next) => {
    db.executeSql("INSERT INTO `others`(`institute_id`, `purpose`, `title`, `files`, `createddate`) VALUES  ('" + req.body.institute_id + "','" + req.body.purpose + "','" + req.body.title + "','" + req.body.files + "',CURRENT_TIMESTAMP)", function (data, err) {
        if (err) {
            res.json("error");
            console.log(err)
        } else {
            return res.json('success');
        }
    });
});

router.post("/SaveMagazineList", (req, res, next) => {
    db.executeSql("INSERT INTO `magazine`(`title`, `files`, `createddate`) VALUES ('" + req.body.title + "','" + req.body.files + "',CURRENT_TIMESTAMP)", function (data, err) {
        if (err) {
            res.json("error");
            console.log(err)
        } else {
            return res.json('success');
        }
    });
});
router.get("/GetMagazineList", (req, res, next) => {
    db.executeSql("SELECT * FROM magazine;", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});
router.get("/RemoveMagazineList/:id", (req, res, next) => {
    db.executeSql("DELETE FROM magazine WHERE id=" + req.params.id + ";", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});
router.get("/GetOthersByIdDetails/:id", (req, res, next) => {
    db.executeSql("SELECT * FROM others WHERE institute_id=" + req.params.id + ";", function (data, err) {
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
            user: 'cesociety16@gmail.com',
            pass: 'wtezdbqbwpzryeoy'
        },
    });
    const filePath = 'src/assets/emailtemplets/' + filename;
    const source = fs.readFileSync(filePath, 'utf-8').toString();
    const template = handlebars.compile(source);
    const replacements = data;
    const htmlToSend = template(replacements);

    const mailOptions = {
        from: `"cesociety16@gmail.com"`,
        subject: subj,
        to: toemail,
        Name: mailname,
        html: htmlToSend,


    };
    transporter.sendMail(mailOptions, function (error, info) {
        // console.log('Mail Sent')
        if (error) {
            console.log(error);
            res.json("Errror");
        } else {
            console.log('Email sent: ' + info.response);
            res.json(data);
        }
    });
}

router.get("/GetAllBirthdayDetails", (req, res, next) => {
    db.executeSql("SELECT s.id as staffId,s.institute_id,s.department,s.name,s.contact,s.email,s.designation,s.qualification,s.joining_date,s.profile_image, s.birthday_date, CURDATE(),d.id as departmentId,d.department as departmentName,i.id as instiId,i.name as instituteName FROM staff_list s left join department_list d on s.department= d.id left join institute i on s.institute_id=i.id WHERE DAYOFMONTH(s.birthday_date) = DAYOFMONTH(CURDATE()) AND MONTH(s.birthday_date) = MONTH(CURDATE());", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});

router.get("/GetAllNewsDetails/:id", (req, res, next) => {
    db.executeSql("SELECT * FROM institute WHERE url='www.cesociety.in';", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            db.executeSql("SELECT * FROM news WHERE (institute_id=" + req.params.id + " OR institute_id=" + data[0].id + ") AND isactive=true ORDER BY date DESC ;", function (data1, err) {
                if (err) {
                    console.log(err);
                } else {
                    return res.json(data1);
                }
            })

        }
    })
});
// router.get("/GetAllAnswerkeyDetails/:id", (req, res, next) => {
//     db.executeSql("SELECT * FROM institute WHERE url='www.cesociety.in';", function (data, err) {
//         if (err) {
//             console.log(err);
//         } else {
//             db.executeSql("SELECT * FROM Answerkey WHERE (institute_id=" + req.params.id + " OR institute_id=" + data[0].id + ") AND isactive=true ORDER BY date DESC ;", function (data1, err) {
//                 if (err) {
//                     console.log(err);
//                 } else {
//                     return res.json(data1);
//                 }
//             })

//         }
//     })
// });

router.post("/SaveGatePassUserList", (req, res, next) => {
    db.executeSql("INSERT INTO `gatepass`(`role`, `institute`, `meetingWith`, `purpose`, `name`, `dateTime`, `contact`, `createddate`) VALUES ('" + req.body.role + "','" + req.body.institute + "','" + req.body.meetingWith + "','" + req.body.purpose + "','" + req.body.name + "','" + req.body.dateTime + "'," + req.body.contact + ",CURRENT_TIMESTAMP)", function (data, err) {
        if (err) {
            res.json("error");
            console.log(err)
        } else {
            return res.json(data.insertId);
        }
    });
});
router.get("/GetGatePassUserList", (req, res, next) => {
    db.executeSql("SELECT * FROM gatepass;", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});




























































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