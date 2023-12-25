const express = require("express");
const router = express.Router();
const db = require("../db/db");
const multer = require('multer');
const path = require('path');
const config = require("../../config");
var midway = require('./midway');
var crypto = require('crypto');
const nodemailer = require('nodemailer');
var handlebars = require("handlebars");
const fs = require('fs');
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
    var repass = salt + '' + body.password;
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
    var repass = salt + '' + body.password;
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
    db.executeSql("SELECT * FROM `institute` ORDER BY name ASC;", function (data, err) {
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
    db.executeSql("SELECT * FROM `image` WHERE institute_id=" + req.body.institute_id + " ORDER BY createddate DESC;", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});
router.post("/GetImagesByIdDetails", (req, res, next) => {
    db.executeSql("SELECT * FROM `image` WHERE isactive=true AND institute_id=" + req.body.institute_id + " ORDER BY createddate DESC;", function (data, err) {
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
    db.executeSql("SELECT * FROM image WHERE id=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            fs.unlink('/var/www/html/cesbackend' + data[0].files, function (err) {
                if (err) {
                    throw err;
                } else {
                    db.executeSql("DELETE FROM `image` WHERE id=" + req.body.id + ";", function (data, err) {
                        if (err) {
                            console.log(err);
                        } else {
                            return res.json(data);
                        }
                    })
                }
            });
        }
    });
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
    db.executeSql("SELECT * FROM `department_list` WHERE institute_id=" + req.params.id + " ORDER BY createddate DESC;", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});

router.get("/GetYearbyGroupDetails/:id", (req, res, next) => {
    console.log(req.params);
    db.executeSql("SELECT * FROM `papers` WHERE institute_id='" + req.params.id + "' GROUP BY year ;", function (data, err) {
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
    db.executeSql("INSERT INTO `staff_list` (`institute_id`, `department`, `name`, `contact`, `email`, `designation`, `qualification`, `birthday_date`, `joining_date`, `profile_image`,`position`,`researchPaper`,`createddate`) values ('" + req.body.institute_id + "','" + req.body.department + "','" + req.body.name + "'," + req.body.contact + ",'" + req.body.email + "','" + req.body.designation + "','" + req.body.qualification + "','" + req.body.birthday_date + "','" + req.body.joining_date + "','" + req.body.profile + "'," + req.body.position + ",'" + req.body.researchPaper + "',CURRENT_TIMESTAMP)", function (data, err) {
        if (err) {
            res.json("error");
            console.log(err)
        } else {
            console.log(data, 'Response')
            return res.json(data);
        }
    });
});

router.post("/UpdateStaffDetailsById", (req, res, next) => {
    console.log(req.body, 'Update Staff')
    db.executeSql("UPDATE `staff_list` SET `department`='" + req.body.department + "',`name`='" + req.body.name + "',`contact`='" + req.body.contact + "',`email`='" + req.body.email + "',`designation`='" + req.body.designation + "',`qualification`='" + req.body.qualification + "',`birthday_date`='" + req.body.birthday_date + "',`joining_date`='" + req.body.joining_date + "',`profile_image`='" + req.body.profile + "',`position`=" + req.body.position + ",`researchPaper`='" + req.body.researchPaper + "',`updateddate`=CURRENT_TIMESTAMP WHERE id=" + req.body.staffId, function (data, err) {
        if (err) {
            res.json("error");
            console.log(err)
        } else {
            return res.json(data);
        }
    });
});

router.get("/RemoveStaffDocument/:id", (req, res, next) => {
    db.executeSql("UPDATE `staff_list` SET `researchPaper`='undefined',`updateddate`=CURRENT_TIMESTAMP WHERE id=" + req.params.id, function (data, err) {
        if (err) {
            res.json("error");
            console.log(err)
        } else {
            return res.json('success');
        }
    });
});

router.get("/GetAllStaffDetails/:id", (req, res, next) => {
    db.executeSql("SELECT s.id as staffId,s.institute_id,s.department,s.name,s.contact,s.email,s.designation,s.qualification,s.joining_date,s.profile_image, s.position,s.researchPaper,s.birthday_date,s.createddate,d.id as departmentId,d.department as departmentName FROM staff_list s left join department_list d on s.department= d.id WHERE s.institute_id=" + req.params.id + " ORDER BY s.position,s.joining_date", function (data, err) {
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
    db.executeSql("SELECT * FROM blogs WHERE institute_id=" + req.params.id + " ORDER BY createdate DESC ;", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});
router.get("/RemoveBlogDetails/:id", (req, res, next) => {
    db.executeSql("SELECT * FROM blogs WHERE id=" + req.params.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            fs.unlink('/var/www/html/cesbackend' + data[0].blogImage, function (err) {
                if (err) {
                    throw err;
                } else {
                    db.executeSql("DELETE FROM blog WHERE id=" + req.params.id + ";", function (data, err) {
                        if (err) {
                            console.log(err);
                        } else {
                            return res.json(data);
                        }
                    })
                }
            });
        }
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
    db.executeSql("SELECT * FROM scholarship WHERE institute_id=" + req.params.id + " ORDER BY createdate DESC ;", function (data, err) {
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
            if (req.body.infraMultiImage.length > 0) {
                for (let i = 0; i < req.body.infraMultiImage.length; i++) {
                    db.executeSql("INSERT INTO `infraimage`(`infraId`, `image`) VALUES (" + data.insertId + ",'" + req.body.infraMultiImage[i] + "');", function (data1, err) {
                        if (err) {
                            res.json("error");
                        } else {
                        }
                    });
                }
            }
            const values = [req.body.infraDetails]
            const escapedValues = values.map(mysql.escape);
            db.executeSql1("UPDATE infrastructure SET infraDetails=" + escapedValues + " WHERE id= " + data.insertId, escapedValues, function (data1, err) {
                if (err) {
                    res.json("error");
                    console.log(err)
                } else {
                    return res.json('success');

                }
            });
            // return res.json('success');
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
router.post("/deleteInfraImage", (req, res, next) => {

    fs.unlink('/var/www/html/cesbackend' + req.body.img, function (err) {
        if (err) {
            throw err;
        } else {
            return res.json('sucess');
        }
    });
})
router.get("/RemoveInfraDetails/:id", (req, res, next) => {
    db.executeSql("SELECT * FROM infrastructure WHERE id=" + req.params.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            if (data[0].infraImage != 'null' && data[0].infraImage != 'undefined') {
                fs.unlink('/var/www/html/cesbackend' + data[0].infraImage, function (err) {
                    if (err) {
                        if (err) {
                            db.executeSql("DELETE FROM `infrastructure` WHERE id=" + req.params.id, function (data, err) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    return res.json(data);
                                }
                            })
                        }
                        // throw err;

                    } else {
                        db.executeSql("DELETE FROM `infrastructure` WHERE id=" + req.params.id, function (data, err) {
                            if (err) {
                                console.log(err);
                            } else {
                                return res.json(data);
                            }
                        })
                    }
                });
            }
            else {
                db.executeSql("DELETE FROM `infrastructure` WHERE id=" + req.params.id, function (data, err) {
                    if (err) {
                        console.log(err);
                    } else {
                        return res.json(data);
                    }
                })

            }
        }
    });
});
router.get("/GetInfraDetailsById/:id", (req, res, next) => {
    db.executeSql("SELECT * FROM infrastructure WHERE institute_id=" + req.params.id + " ORDER BY createddate DESC;", function (data, err) {
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
router.post("/UploadInfraMultiImage", midway.checkToken, (req, res, next) => {
    var imgname = generateUUID();
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'images/infraMulti');
        },
        // By default, multer removes file extensions so let's add them back
        filename: function (req, file, cb) {
            cb(null, imgname + path.extname(file.originalname));
        }
    });
    let upload = multer({ storage: storage }).single('file');
    upload(req, res, function (err) {
        console.log("path=", config.url + 'images/infraMulti/' + req.file.filename);

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
        return res.json('/images/infraMulti/' + req.file.filename);
    });
});
router.get("/GetInfraMultiImagesById/:id", (req, res, next) => {
    console.log(req.params)
    db.executeSql("SELECT * FROM infraimage WHERE infraId=" + req.params.id + ";", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
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






router.get("/GetCommitteeDetailsById/:id", (req, res, next) => {
    db.executeSql("SELECT * FROM committee WHERE institute_id=" + req.params.id + " ORDER BY createddate ASC;", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});
router.get("/GetCommitteeMultiImagesById/:id", (req, res, next) => {
    console.log(req.params)
    db.executeSql("SELECT * FROM commimage WHERE commId=" + req.params.id + ";", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});
router.post("/deleteCommitteeImage", (req, res, next) => {

    fs.unlink('/var/www/html/cesbackend' + req.body.img, function (err) {
        if (err) {
            throw err;
        } else {
            return res.json('sucess');
        }
    });

});
router.get("/RemoveCommitteeDetails/:id", (req, res, next) => {
    // db.executeSql("DELETE FROM `infrastructure` WHERE id=" + req.params.id + ";", function (data, err) {
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         return res.json(data);
    //     }
    // });
    db.executeSql("SELECT * FROM committee WHERE id=" + req.params.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            if (data[0].commImage != 'null' && data[0].commImage != 'undefined') {
                fs.unlink('/var/www/html/cesbackend'+data[0].commImage, function (err){
                // fs.unlink('F:/pranav/CES/CES-main/ces-society-backend' + data[0].commImage, function (err) {
                    if (err) {
                        db.executeSql("DELETE FROM `committee` WHERE id=" + req.params.id, function (data, err) {
                            if (err) {
                                console.log(err);
                            } else {
                                return res.json(data);
                            }
                        })
                    } else {
                        db.executeSql("DELETE FROM `committee` WHERE id=" + req.params.id, function (data, err) {
                            if (err) {
                                console.log(err);
                            } else {
                                return res.json(data);
                            }
                        })
                    }
                });
            } else {
                db.executeSql("DELETE FROM `committee` WHERE id=" + req.params.id, function (data, err) {
                    if (err) {
                        console.log(err);
                    } else {
                        return res.json(data);
                    }
                })
            }

        }
    });
});
router.post("/UploadCommMultiImage", (req, res, next) => {
    var imgname = generateUUID();
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'images/commmulti');
        },
        // By default, multer removes file extensions so let's add them back
        filename: function (req, file, cb) {
            cb(null, imgname + path.extname(file.originalname));
        }
    });
    let upload = multer({ storage: storage }).single('file');
    upload(req, res, function (err) {
        console.log("path=", config.url + 'images/commmulti/' + req.file.filename);

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
        return res.json('/images/commmulti/' + req.file.filename);
    });
});
router.post("/UploadCommitteeImage", (req, res, next) => {
    var imgname = generateUUID();
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'images/committee');
        },
        // By default, multer removes file extensions so let's add them back
        filename: function (req, file, cb) {
            cb(null, imgname + path.extname(file.originalname));
        }
    });
    let upload = multer({ storage: storage }).single('file');
    upload(req, res, function (err) {
        // console.log(req);
        console.log("path=", config.url + 'images/committee/' + req.file.filename);

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
        return res.json('/images/committee/' + req.file.filename);
    });
});
router.post("/UpdateCommitteeDetails", (req, res, next) => {
    console.log(req.body);
    db.executeSql("UPDATE `committee` SET `commTitle`='" + req.body.commTitle + "',`commImage`='" + req.body.commImage + "',`updateddate`=CURRENT_TIMESTAMP WHERE id=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log(err);
            res.json("error");
        } else {
            const values = [req.body.commDetails]
            const escapedValues = values.map(mysql.escape);
            db.executeSql1("UPDATE committee SET commDetails=" + escapedValues + " WHERE id= " + req.body.id, escapedValues, function (data1, err) {
                if (err) {
                    console.log(err)
                    res.json("error");
                } else {
                }
            });
            return res.json('success');
        }
    });
});
router.post("/SaveCommitteeDetails", (req, res, next) => {
    console.log(req.body)
    db.executeSql("INSERT INTO `committee`(`institute_id`, `commTitle`,`commImage`, `createddate`) VALUES ('" + req.body.institute_id + "','" + req.body.commTitle + "','" + req.body.commImage + "',CURRENT_TIMESTAMP)", function (data, err) {
        if (err) {
            res.json("error");
            console.log(err)
        } else {
            if (req.body.commMultiImage.length > 0) {
                for (let i = 0; i < req.body.commMultiImage.length; i++) {
                    db.executeSql("INSERT INTO `commimage`(`commId`, `image`) VALUES (" + data.insertId + ",'" + req.body.commMultiImage[i] + "');", function (data1, err) {
                        if (err) {
                            res.json("error");
                        } else {
                        }
                    });
                }
            }
            const values = [req.body.commDetails]
            const escapedValues = values.map(mysql.escape);
            db.executeSql1("UPDATE committee SET commDetails=" + escapedValues + " WHERE id= " + data.insertId, escapedValues, function (data1, err) {
                if (err) {
                    res.json("error");
                    console.log(err)
                } else {
                    return res.json('success');

                }
            });
            // return res.json('success');
        }
    });
    // return res.json('success');

});


router.get("/GetPlacementDetailsById/:id", (req, res, next) => {
    db.executeSql("SELECT * FROM placement WHERE institute_id=" + req.params.id + " ORDER BY createddate ASC;", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});
router.get("/GetPlacementMultiImagesById/:id", (req, res, next) => {
    console.log(req.params)
    db.executeSql("SELECT * FROM placementimage WHERE placementId=" + req.params.id + ";", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});
router.post("/deletePlacementImage", (req, res, next) => {

    fs.unlink('/var/www/html/cesbackend' + req.body.img, function (err) {
        if (err) {
            throw err;
        } else {
            return res.json('sucess');
        }
    });

});
router.get("/RemovePlacementDetails/:id", (req, res, next) => {
    db.executeSql("SELECT * FROM placement WHERE id=" + req.params.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            if (data[0].placeImage != 'null' && data[0].placeImage != 'undefined') {
                fs.unlink('/var/www/html/cesbackend'+data[0].placeImage, function (err){
                // fs.unlink('F:/pranav/CES/CES-main/ces-society-backend' + data[0].placeImage, function (err) {
                    if (err) {
                        db.executeSql("DELETE FROM `placement` WHERE id=" + req.params.id, function (data, err) {
                            if (err) {
                                console.log(err);
                            } else {
                                return res.json(data);
                            }
                        })
                    } else {
                        db.executeSql("DELETE FROM `placement` WHERE id=" + req.params.id, function (data, err) {
                            if (err) {
                                console.log(err);
                            } else {
                                return res.json(data);
                            }
                        })
                    }
                });
            } else {
                db.executeSql("DELETE FROM `placement` WHERE id=" + req.params.id, function (data, err) {
                    if (err) {
                        console.log(err);
                    } else {
                        return res.json(data);
                    }
                })
            }

        }
    });
});
router.post("/UploadPlacementMultiImage", (req, res, next) => {
    var imgname = generateUUID();
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'images/commmulti');
        },
        // By default, multer removes file extensions so let's add them back
        filename: function (req, file, cb) {
            cb(null, imgname + path.extname(file.originalname));
        }
    });
    let upload = multer({ storage: storage }).single('file');
    upload(req, res, function (err) {
        console.log("path=", config.url + 'images/placemulti/' + req.file.filename);

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
        return res.json('/images/placemulti/' + req.file.filename);
    });
});
router.post("/UploadPlacementImage", (req, res, next) => {
    var imgname = generateUUID();
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'images/placement');
        },
        // By default, multer removes file extensions so let's add them back
        filename: function (req, file, cb) {
            cb(null, imgname + path.extname(file.originalname));
        }
    });
    let upload = multer({ storage: storage }).single('file');
    upload(req, res, function (err) {
        // console.log(req);
        console.log("path=", config.url + 'images/placement/' + req.file.filename);

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
        return res.json('/images/placement/' + req.file.filename);
    });
});
router.post("/UpdatePlacementDetails", (req, res, next) => {
    console.log(req.body);
    db.executeSql("UPDATE `placement` SET `placeTitle`='" + req.body.commTitle + "',`placeImage`='" + req.body.commImage + "',`updateddate`=CURRENT_TIMESTAMP WHERE id=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log(err);
            res.json("error");
        } else {
            const values = [req.body.placeDetails]
            const escapedValues = values.map(mysql.escape);
            db.executeSql1("UPDATE placement SET placeDetails=" + escapedValues + " WHERE id= " + req.body.id, escapedValues, function (data1, err) {
                if (err) {
                    console.log(err)
                    res.json("error");
                } else {
                }
            });
            return res.json('success');
        }
    });
});
router.post("/SavePlacementDetails", (req, res, next) => {
    console.log(req.body)
    db.executeSql("INSERT INTO `placement`(`institute_id`, `placeTitle`,`placeImage`, `createddate`) VALUES ('" + req.body.institute_id + "','" + req.body.placeTitle + "','" + req.body.placeImage + "',CURRENT_TIMESTAMP)", function (data, err) {
        if (err) {
            res.json("error");
            console.log(err)
        } else {
            if (req.body.placeMultiImage.length > 0) {
                for (let i = 0; i < req.body.placeMultiImage.length; i++) {
                    db.executeSql("INSERT INTO `placementimage`(`placementId`, `image`) VALUES (" + data.insertId + ",'" + req.body.placeMultiImage[i] + "');", function (data1, err) {
                        if (err) {
                            res.json("error");
                        } else {
                        }
                    });
                }
            }
            const values = [req.body.placeDetails]
            const escapedValues = values.map(mysql.escape);
            db.executeSql1("UPDATE placement SET placeDetails=" + escapedValues + " WHERE id= " + data.insertId, escapedValues, function (data1, err) {
                if (err) {
                    res.json("error");
                    console.log(err)
                } else {
                    return res.json('success');

                }
            });
            // return res.json('success');
        }
    });
    // return res.json('success');

});


router.get("/GetResearchDetailsById/:id", (req, res, next) => {
    db.executeSql("SELECT * FROM research WHERE institute_id=" + req.params.id + " ORDER BY createddate ASC;", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});
router.get("/RemoveResearchDetails/:id", (req, res, next) => {
    db.executeSql("DELETE FROM `research` WHERE id=" + req.params.id, function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});
router.post("/UpdateResearchDetails", (req, res, next) => {
    console.log(req.body);
    db.executeSql("UPDATE `research` SET `researchTitle`='" + req.body.researchTitle + "',`updateddate`=CURRENT_TIMESTAMP WHERE id=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log(err);
            res.json("error");
        } else {
            const values = [req.body.researchDetails]
            const escapedValues = values.map(mysql.escape);
            db.executeSql1("UPDATE research SET researchDetails=" + escapedValues + " WHERE id= " + req.body.id, escapedValues, function (data1, err) {
                if (err) {
                    console.log(err)
                    res.json("error");
                } else {
                }
            });
            return res.json('success');
        }
    });
});
router.post("/SaveResearchDetails", (req, res, next) => {
    console.log(req.body)
    db.executeSql("INSERT INTO `research`(`institute_id`, `researchTitle`, `createddate`) VALUES ('" + req.body.institute_id + "','" + req.body.researchTitle + "',CURRENT_TIMESTAMP)", function (data, err) {
        if (err) {
            res.json("error");
            console.log(err)
        } else {
            const values = [req.body.researchDetails]
            const escapedValues = values.map(mysql.escape);
            db.executeSql1("UPDATE research SET researchDetails=" + escapedValues + " WHERE id= " + data.insertId, escapedValues, function (data1, err) {
                if (err) {
                    res.json("error");
                    console.log(err)
                } else {
                    return res.json('success');

                }
            });
        }
    });
});
router.get("/GetSyllabusDetailsById/:id", (req, res, next) => {
    db.executeSql("SELECT * FROM syllabus WHERE institute_id=" + req.params.id + " ORDER BY createddate ASC;", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});
router.get("/RemoveSyllabusDetails/:id", (req, res, next) => {
    db.executeSql("DELETE FROM `syllabus` WHERE id=" + req.params.id, function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});
router.post("/UpdateSyllabusDetails", (req, res, next) => {
    console.log(req.body);
    db.executeSql("UPDATE `syllabus` SET `syllabusTitle`='" + req.body.syllabusTitle + "',`updateddate`=CURRENT_TIMESTAMP WHERE id=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log(err);
            res.json("error");
        } else {
            const values = [req.body.syllabusDetails]
            const escapedValues = values.map(mysql.escape);
            db.executeSql1("UPDATE syllabus SET syllabusDetails=" + escapedValues + " WHERE id= " + req.body.id, escapedValues, function (data1, err) {
                if (err) {
                    console.log(err)
                    res.json("error");
                } else {
                }
            });
            return res.json('success');
        }
    });
});
router.post("/SaveSyllabusDetails", (req, res, next) => {
    console.log(req.body)
    db.executeSql("INSERT INTO `syllabus`(`institute_id`, `syllabusTitle`, `createddate`) VALUES ('" + req.body.institute_id + "','" + req.body.syllabusTitle + "',CURRENT_TIMESTAMP)", function (data, err) {
        if (err) {
            res.json("error");
            console.log(err)
        } else {
            const values = [req.body.syllabusDetails]
            const escapedValues = values.map(mysql.escape);
            db.executeSql1("UPDATE syllabus SET syllabusDetails=" + escapedValues + " WHERE id= " + data.insertId, escapedValues, function (data1, err) {
                if (err) {
                    res.json("error");
                    console.log(err)
                } else {
                    return res.json('success');
                }
            });
        }
    });
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
router.get("/RemoveAlumniByIdDetails/:id", (req, res, next) => {
    db.executeSql("DELETE FROM alumni WHERE id=" + req.params.id + ";", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
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


router.get("/GetCampusDetailsById/:id", (req, res, next) => {
    db.executeSql("SELECT * FROM campus WHERE institute_id=" + req.params.id + " ORDER BY createddate ASC;", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});
router.get("/GetCampusMultiImagesById/:id", (req, res, next) => {
    console.log(req.params)
    db.executeSql("SELECT * FROM campusimage WHERE campusId=" + req.params.id + ";", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});
router.post("/deleteCampusImage", (req, res, next) => {

    fs.unlink('/var/www/html/cesbackend' + req.body.img, function (err) {
        if (err) {
            throw err;
        } else {
            return res.json('sucess');
        }
    });

});
router.get("/RemoveCampusDetails/:id", (req, res, next) => {
    // db.executeSql("DELETE FROM `infrastructure` WHERE id=" + req.params.id + ";", function (data, err) {
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         return res.json(data);
    //     }
    // });
    db.executeSql("SELECT * FROM campus WHERE id=" + req.params.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            if (data[0].campusImage != 'null' && data[0].campusImage != 'undefined') {
                fs.unlink('/var/www/html/cesbackend'+data[0].campusImage, function (err){
                // fs.unlink('F:/pranav/CES/CES-main/ces-society-backend' + data[0].campusImage, function (err) {
                    if (err) {
                        db.executeSql("DELETE FROM `campus` WHERE id=" + req.params.id, function (data, err) {
                            if (err) {
                                console.log(err);
                            } else {
                                return res.json(data);
                            }
                        })
                    } else {
                        db.executeSql("DELETE FROM `campus` WHERE id=" + req.params.id, function (data, err) {
                            if (err) {
                                console.log(err);
                            } else {
                                return res.json(data);
                            }
                        })
                    }
                });
            } else {
                db.executeSql("DELETE FROM `campus` WHERE id=" + req.params.id, function (data, err) {
                    if (err) {
                        console.log(err);
                    } else {
                        return res.json(data);
                    }
                })
            }

        }
    });
});
router.post("/UploadCampusMultiImage", (req, res, next) => {
    var imgname = generateUUID();
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'images/campusmulti');
        },
        // By default, multer removes file extensions so let's add them back
        filename: function (req, file, cb) {
            cb(null, imgname + path.extname(file.originalname));
        }
    });
    let upload = multer({ storage: storage }).single('file');
    upload(req, res, function (err) {
        console.log("path=", config.url + 'images/campusmulti/' + req.file.filename);

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
        return res.json('/images/campusmulti/' + req.file.filename);
    });
});
router.post("/UploadCampusImage", (req, res, next) => {
    var imgname = generateUUID();
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'images/campus');
        },
        // By default, multer removes file extensions so let's add them back
        filename: function (req, file, cb) {
            cb(null, imgname + path.extname(file.originalname));
        }
    });
    let upload = multer({ storage: storage }).single('file');
    upload(req, res, function (err) {
        // console.log(req);
        console.log("path=", config.url + 'images/campus/' + req.file.filename);

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
        return res.json('/images/campus/' + req.file.filename);
    });
});
router.post("/UpdateCampusDetails", (req, res, next) => {
    console.log(req.body);
    db.executeSql("UPDATE `campus` SET `campusTitle`='" + req.body.campusTitle + "',`campusImage`='" + req.body.campusImage + "',`updateddate`=CURRENT_TIMESTAMP WHERE id=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log(err);
            res.json("error");
        } else {
            const values = [req.body.campusDetails]
            const escapedValues = values.map(mysql.escape);
            db.executeSql1("UPDATE campus SET campusDetails=" + escapedValues + " WHERE id= " + req.body.id, escapedValues, function (data1, err) {
                if (err) {
                    console.log(err)
                    res.json("error");
                } else {
                }
            });
            return res.json('success');
        }
    });
});
router.post("/SaveCampusDetails", (req, res, next) => {
    console.log(req.body)
    db.executeSql("INSERT INTO `campus`(`institute_id`, `campusTitle`,`campusImage`, `createddate`) VALUES ('" + req.body.institute_id + "','" + req.body.campusTitle + "','" + req.body.campusImage + "',CURRENT_TIMESTAMP)", function (data, err) {
        if (err) {
            res.json("error");
            console.log(err)
        } else {
            if (req.body.campusMultiImage.length > 0) {
                for (let i = 0; i < req.body.campusMultiImage.length; i++) {
                    db.executeSql("INSERT INTO `campusimage`(`campusId`, `image`) VALUES (" + data.insertId + ",'" + req.body.campusMultiImage[i] + "');", function (data1, err) {
                        if (err) {
                            res.json("error");
                        } else {
                        }
                    });
                }
            }
            const values = [req.body.campusDetails]
            const escapedValues = values.map(mysql.escape);
            db.executeSql1("UPDATE campus SET campusDetails=" + escapedValues + " WHERE id= " + data.insertId, escapedValues, function (data1, err) {
                if (err) {
                    res.json("error");
                    console.log(err)
                } else {
                    return res.json('success');

                }
            });
            // return res.json('success');
        }
    });
    // return res.json('success');

});



router.post("/SaveNewNaacDetails", (req, res, next) => {
    console.log(req.body)
    db.executeSql("INSERT INTO `naacnew`(`instituteId`, `criteria`, `createddate`) VALUES ('" + req.body.institute_id + "','" + req.body.selectedCriteria + "',CURRENT_TIMESTAMP)", function (data, err) {
        if (err) {
            res.json("error");
            console.log(err)
        } else {
            const values = [req.body.naacDetails]
            const escapedValues = values.map(mysql.escape);
            db.executeSql1("UPDATE naacnew SET details=" + escapedValues + " WHERE id= " + data.insertId, escapedValues, function (data1, err) {
                if (err) {
                    res.json("error");
                    console.log(err)
                } else {
                    return res.json('success');

                }
            });
            // return res.json('success');
        }
    });
    // return res.json('success');

});

router.get("/GetNewNaacDetailsById/:id", (req, res, next) => {
    db.executeSql("SELECT * FROM naacnew WHERE instituteid=" + req.params.id + " ORDER BY createddate ASC;", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});
router.get("/removeNewNaacDetails/:id", (req, res, next) => {
    db.executeSql("DELETE FROM `naacnew` WHERE id=" + req.params.id, function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json('sucess');
        }
    })
});

router.post("/UpdateNewNaacDetails", (req, res, next) => {
    console.log(req.body);
    db.executeSql("UPDATE `naacnew` SET `criteria`='" + req.body.selectedCriteria + "',`updateddate`=CURRENT_TIMESTAMP WHERE id=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log(err);
            res.json("error");
        } else {
            const values = [req.body.naacDetails]
            const escapedValues = values.map(mysql.escape);
            db.executeSql1("UPDATE naacnew SET details=" + escapedValues + " WHERE id= " + req.body.id, escapedValues, function (data1, err) {
                if (err) {
                    console.log(err)
                    res.json("error");
                } else {
                }
            });
            return res.json('success');
        }
    });
});





router.post("/GenerateRahatokarshCertficate", (req, res, next) => {
    console.log(req.body, 'Certificate')
    // Saving the pdf file in root directory.
    db.executeSql("UPDATE `rahatokarsh` SET `isactive`=true,`updateddate`=CURRENT_TIMESTAMP WHERE id=" + req.body.id, function (data, err) {
        if (err) {
            res.json("error");
            console.log(err)
        } else {
            let cert_name = Date.now();
            doc.pipe(fs.createWriteStream('certificate/' + cert_name + '.pdf'));
            db.executeSql("update rahatokarsh set certificate= '/certificate/" + cert_name + ".pdf'  where id=" + req.body.id, function (data1, err) {
                if (err) {
                    console.log(err);
                }
            })
            function jumpLine(doc, lines) {
                for (let index = 0; index < lines; index++) {
                    doc.moveDown();
                }
            }
            // doc.rect(0, 0, doc.page.width, doc.page.height).fill('#fff');

            // doc.fontSize(8);

            // Margin
            // const distanceMargin = 12;

            // doc
            //     .fillAndStroke('#203154')
            //     .lineWidth(2)
            //     .lineJoin('round')
            //     .rect(
            //         distanceMargin,
            //         distanceMargin,
            //         doc.page.width - distanceMargin * 2,
            //         doc.page.height - distanceMargin * 2,
            //     )
            //     .stroke();
            doc.image('src/assets/example.jpg', 0, 0, {
                fit: [doc.page.width, doc.page.height],
                align: 'center',
            });
            jumpLine(doc, 4)
            jumpLine(doc, 2)
            const start = 85;
            doc
                .font('src/assets/fonts/NotoSansJP-Bold.otf')
                .fontSize(22)
                .fill('#021c27')
                .text(req.body.name, 85, 335, {
                    align: 'center',
                });
            jumpLine(doc, 2)
            //  doc.lineWidth(1);
            // Signatures
            const lineSize = 300;
            const signatureHeight = 390;
            // doc.fillAndStroke('#021c27');
            // doc.strokeOpacity(0.2);
            const startLine1 = 85;
            const endLine1 = 128 + lineSize;
            // doc
            //     .moveTo(startLine1, signatureHeight)
            //     .lineTo(endLine1, signatureHeight)
            //     .stroke();
            const startLine2 = endLine1 + 32;
            const endLine2 = startLine2 + lineSize;
            // doc
            //     .moveTo(startLine2, signatureHeight)
            //     .lineTo(endLine2, signatureHeight)
            //     .stroke();

            const startLine3 = endLine2 + 32;
            const endLine3 = startLine3 + lineSize;
            // doc
            //     .moveTo(startLine3, signatureHeight)
            //     .lineTo(endLine3, signatureHeight)
            //     .stroke();
            const datetime = new Date(); // Replace this with your datetime object
            const date = datetime.toISOString().slice(0, 10);
            doc
                .font('src/assets/fonts/NotoSansJP-Bold.otf')
                .fontSize(16)
                .fill('#021c27')
                .text(date, startLine1, signatureHeight + 90, {
                    columns: 1,
                    columnGap: 0,
                    height: 40,
                    width: lineSize,
                    align: 'center',
                });

            // doc
            //     .font('src/assets/fonts/NotoSansJP-Light.otf')
            //     .fontSize(10)
            //     .fill('#021c27')
            //     .text('Associate Professor', startLine1, signatureHeight + 95, {
            //         columns: 1,
            //         columnGap: 0,
            //         height: 40,
            //         width: lineSize,
            //         align: 'center',
            //     });

            doc
                .font('src/assets/fonts/NotoSansJP-Bold.otf')
                .fontSize(16)
                .fill('#021c27')
                .text('0000' + req.body.id, startLine2, signatureHeight + 90, {
                    columns: 1,
                    columnGap: 0,
                    height: 40,
                    width: lineSize,
                    align: 'center',
                });

            // doc
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

            // doc
            //     .font('src/assets/fonts/NotoSansJP-Bold.otf')
            //     .fontSize(10)
            //     .fill('#021c27')
            //     .text('Jane Doe', startLine3, signatureHeight + 10, {
            //         columns: 1,
            //         columnGap: 0,
            //         height: 40,
            //         width: lineSize,
            //         align: 'center',
            //     });

            // doc
            //     .font('src/assets/fonts/NotoSansJP-Light.otf')
            //     .fontSize(10)
            //     .fill('#021c27')
            //     .text('Director', startLine3, signatureHeight + 25, {
            //         columns: 1,
            //         columnGap: 0,
            //         height: 40,
            //         width: lineSize,
            //         align: 'center',
            //     });

            // jumpLine(doc, 4);

            // // Validation link
            // const link =
            //     'https://validate-your-certificate.hello/validation-code-here';

            // const linkWidth = doc.widthOfString(link);
            // const linkHeight = doc.currentLineHeight();

            // doc
            //     .underline(
            //         doc.page.width / 2 - linkWidth / 2,
            //         448,
            //         linkWidth,
            //         linkHeight,
            //         { color: '#021c27' },
            //     )
            //     .link(
            //         doc.page.width / 2 - linkWidth / 2,
            //         448,
            //         linkWidth,
            //         linkHeight,
            //         link,
            //     );

            // doc
            //     .font('src/assets/fonts/NotoSansJP-Light.otf')
            //     .fontSize(10)
            //     .fill('#021c27')
            //     .text(
            //         link,
            //         doc.page.width / 2 - linkWidth / 2,
            //         448,
            //         linkWidth,
            //         linkHeight
            //     );

            // Footer
            // const bottomHeight = doc.page.height - 100;

            // doc.image('src/assets/qr.png', doc.page.width / 2 - 30, bottomHeight, {
            //     fit: [60, 60],
            // });

            doc.end();
            // return res.json(data);
            const replacements = {
                name: req.body.name,
                link: 'http://localhost:9000/certificate/' + cert_name + '.pdf'
                // download: 
            };
            mail('certification.html', replacements, req.body.email, "Thank You For Donating.", " ")
            // res.json(data);
            return res.json('success');

        }
    });
});
router.get("/GetAlumniDetails", (req, res, next) => {
    db.executeSql("SELECT * FROM alumni ORDER BY createddate DESC;", function (data, err) {
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
                division: req.body.division,
                email: req.body.email,
                phone: req.body.phone,
                instituteName: req.body.instituteName,
                message: req.body.message,
                createddate: req.body.createddate
            };
            let staticEmail = 'ces.counseling2019@gmail.com';
            mail('appointement-ces.html', replacements, req.body.email, "Appointement Submitted")
            mail('appointement-booked.html', replacements, staticEmail, "Appointement Submitted")

            // res.json(data);
            return res.json('success');
        }
    });
});
router.get("/GetCounselingData", (req, res, next) => {
    db.executeSql("SELECT * FROM counseling ORDER BY createddate DESC;", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});

router.get("/GetContactUsDetailsById/:id", (req, res, next) => {
    db.executeSql("SELECT * FROM contact WHERE institute_id=" + req.params.id + " ORDER BY createddate DESC;", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});

router.post("/SaveResultDetails", (req, res, next) => {
    db.executeSql("INSERT INTO `result`(`institute_id`, `title`, `image`,`year`, `createddate`) VALUES ('" + req.body.institute_id + "','" + req.body.title + "','" + req.body.image + "','" + req.body.year + "',CURRENT_TIMESTAMP)", function (data, err) {
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
    db.executeSql("SELECT * FROM papers WHERE institute_id=" + req.params.id + " ORDER BY createdate DESC;", function (data, err) {
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
    console, log(req.body, 'result')
    db.executeSql("UPDATE `result` SET `title`='" + req.body.title + "',`image`='" + req.body.image + "',`year`='" + req.body.year + "',`updateddate`=CURRENT_TIMESTAMP WHERE id=" + req.body.id, function (data, err) {
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
    db.executeSql("SELECT * FROM results WHERE id=" + req.params.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            fs.unlink('/var/www/html/cesbackend' + data[0].image, function (err) {
                if (err) {
                    throw err;
                } else {
                    db.executeSql("DELETE FROM `result` WHERE id=" + req.params.id, function (data, err) {
                        if (err) {
                            console.log(err);
                        } else {
                            return res.json(data);
                        }
                    })
                }
            });
        }
    });

});
router.get("/GetResultDetailsById/:id", (req, res, next) => {
    db.executeSql("SELECT * FROM result WHERE institute_id=" + req.params.id + " ORDER BY createddate DESC;", function (data, err) {
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
            cb(null, Date.now() + path.extname(file.originalname))
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
    console.log(req.body, 'jbdjbjfds');
    db.executeSql("INSERT INTO `news`(`institute_id`, `date`, `files`,`isactive`,`startDate`, `endDate`,`createddate`) VALUES (" + req.body.institute_id + ",'" + req.body.date + "','" + req.body.files + "',true,'" + req.body.startDate + "','" + req.body.endDate + "',CURRENT_TIMESTAMP)", function (data, err) {
        if (err) {
            console.log(err)
            res.json("error");

        } else {
            const values = [req.body.message]
            const escapedValues = values.map(mysql.escape);
            db.executeSql1("UPDATE news SET message=" + escapedValues + " WHERE id= " + data.insertId, escapedValues, function (data1, err) {
                if (err) {
                    console.log(err)
                    res.json("error");

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
    db.executeSql("SELECT * FROM student WHERE institute_id=" + req.params.id + " ORDER BY createddate DESC;", function (data, err) {
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
    db.executeSql("SELECT * FROM news WHERE institute_id=" + req.params.id + " ORDER BY date DESC ;", function (data1, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data1);
        }
    })
});

router.get("/GetAllAnswerkey", (req, res, next) => {
    db.executeSql("SELECT * FROM answerkey where isactive=true ORDER BY date DESC ;", function (data, err) {
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
    db.executeSql("SELECT * FROM news WHERE id=" + req.params.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            if (data[0].files != 'null' && data[0].files != 'undefined') {
                fs.unlink('/var/www/html/cesbackend' + data[0].files, function (err) {
                    if (err) {
                        throw err;
                    } else {
                        db.executeSql("DELETE FROM `news` WHERE id=" + req.params.id, function (data, err) {
                            if (err) {
                                console.log(err);
                            } else {
                                return res.json(data);
                            }
                        })
                    }
                });
            } else {
                db.executeSql("DELETE FROM news WHERE id=" + req.params.id, function (data, err) {
                    if (err) {
                        console.log(err);
                    } else {
                        return res.json(data);
                    }
                })
            }
        }
    });
});
router.get("/RemoveAnswerkeyByIdDetails/:id", (req, res, next) => {
    db.executeSql("SELECT * FROM answerkey WHERE id=" + req.params.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            fs.unlink('/var/www/html/cesbackend' + data[0].files, function (err) {
                if (err) {
                    throw err;
                } else {
                    db.executeSql("DELETE FROM `answerkey` WHERE id=" + req.params.id, function (data, err) {
                        if (err) {
                            console.log(err);
                        } else {
                            return res.json(data);
                        }
                    })
                }
            });
        }
    });
});
router.get("/RemoveOtherDetailsById/:id", (req, res, next) => {
    db.executeSql("SELECT * FROM others WHERE id=" + req.params.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            fs.unlink('/var/www/html/cesbackend' + data[0].files, function (err) {
                if (err) {
                    throw err;
                } else {
                    db.executeSql("DELETE FROM others WHERE id=" + req.params.id, function (data, err) {
                        if (err) {
                            console.log(err);
                        } else {
                            return res.json(data);
                        }
                    })
                }
            });
        }
    });
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
router.get("/GetNaacLinkData/:id", (req, res, next) => {
    db.executeSql("SELECT * FROM naaclink WHERE institute_id=" + req.params.id + " ORDER BY createddate DESC;", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});

router.post("/SaveNaacLinkDetails", (req, res, next) => {
    console.log(req.body)
    db.executeSql("INSERT INTO `naaclink`(`institute_id`,`criteria`, `subMenu`, `subToSub`, `linkName`, `link`, `isactive`, `createddate`) VALUES ('" + req.body.institute_id + "','" + req.body.criteria + "','" + req.body.subMenu + "','" + req.body.subToSub + "','" + req.body.paraname + "','" + req.body.paralink + "',true,CURRENT_TIMESTAMP)", function (data, err) {
        if (err) {
            res.json("error");
            console.log(err)
        } else {
            return res.json(data);
        }
    });
});
router.get("/GetSubMenuGroupBy/:id", (req, res, next) => {
    console.log(req.params)
    db.executeSql("SELECT subMenu,COUNT(*) FROM naaclink WHERE institute_id=" + req.params.id + " GROUP BY subMenu;", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
})
router.get("/GetSubToSubMenuGroupBy/:id", (req, res, next) => {
    db.executeSql("SELECT subToSub,COUNT(*) FROM naaclink WHERE institute_id=" + req.params.id + " GROUP BY subToSub;", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
})
router.get("/RemoveLinkByID/:id", (req, res, next) => {
    db.executeSql("select * from naaclink where id=" + req.params.id, function (data, err) {
        if (err) {
            console.log(err);
        } else {
            // fs.unlink('/var/www/html/cesbackend'+data[0].paralink, function (err) {
            //     if (err) throw err;
            //     // if no error, file has been deleted successfully
            //     console.log('File deleted!12');
            // });
            // fs.unlink('/var/www/html/cesbackend'+data[0].attachlink, function (err) {
            //     if (err) throw err;
            //     // if no error, file has been deleted successfully
            //     console.log('File deleted!');
            // });
            db.executeSql("DELETE FROM naaclink WHERE id=" + req.params.id + ";", function (data, err) {
                if (err) {
                    console.log(err);
                } else {
                    return res.json(data);
                }
            })
        }
    })
});
router.post("/SaveNaacDetails", (req, res, next) => {
    console.log(req.body)
    db.executeSql("INSERT INTO `naac`(`criteria`, `keyno`, `paraname`, `paralink`, `attachname`, `attachlink`, `isactive`, `createddate`) VALUES ('" + req.body.criteria + "','" + req.body.keyNo + "','" + req.body.paraname + "','" + req.body.paralink + "','" + req.body.attachname + "','" + req.body.attachlink + "',true,CURRENT_TIMESTAMP)", function (data, err) {
        if (err) {
            res.json("error");
            console.log(err)
        } else {
            return res.json(data);
        }
    });
});
router.post("/SendCriteriaDetails", (req, res, next) => {
    console.log(req.body)
    db.executeSql("SELECT * FROM naac WHERE criteria='" + req.body.criteria + "'", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});
router.get("/RemoveCrietriaListURL/:id", (req, res, next) => {
    db.executeSql("select * from naac where id=" + req.params.id, function (data, err) {
        if (err) {
            console.log(err);
        } else {
            fs.unlink('/var/www/html/cesbackend' + data[0].paralink, function (err) {
                if (err) throw err;
                // if no error, file has been deleted successfully
                console.log('File deleted!12');
            });
            fs.unlink('/var/www/html/cesbackend' + data[0].attachlink, function (err) {
                if (err) throw err;
                // if no error, file has been deleted successfully
                console.log('File deleted!');
            });
            db.executeSql("DELETE FROM naac WHERE id=" + req.params.id + ";", function (data, err) {
                if (err) {
                    console.log(err);
                } else {
                    return res.json(data);
                }
            })
        }
    })
});
router.get("getCriteriaGroupBy", (req, res, next) => {
    db.executeSql("SELECT criteria,COUNT(*) FROM naac GROUP BY criteria;", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
})

router.get("/GetNaacData", (req, res, next) => {
    db.executeSql("SELECT * FROM naac;", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});
router.get("/GetKeyNoDataGroupBy", (req, res, next) => {
    db.executeSql("SELECT keyno,COUNT(*) FROM naac GROUP BY keyno;", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});
router.post("/GetKeyNoDataGroupByWithSearch", (req, res, next) => {
    console.log(req.body)
    db.executeSql("SELECT keyno,COUNT(*) FROM naac WHERE criteria='" + req.body.criteria + "' GROUP BY keyno", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});
router.post("/UpdateNAACData", (req, res, next) => {
    console.log(req.body, 'NAAC')
    db.executeSql("UPDATE `naac` SET `criteria`='" + req.body.criteria + "',`keyno`='" + req.body.keyno + "',`paraname`='" + req.body.paraname + "',`paralink`='" + req.body.paralink + "',`attachname`='" + req.body.attachname + "',`attachlink`='" + req.body.attachlink + "',`updateddate`=CURRENT_TIMESTAMP WHERE id=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
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
    db.executeSql("SELECT * FROM magazine ORDER BY createddate DESC;", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});
router.get("/RemoveMagazineList/:id", (req, res, next) => {
    db.executeSql("select * from magazine WHERE id=" + req.params.id + ";", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            fs.unlink('/var/www/html/cesbackend' + data[0].files, function (err) {
                if (err) {
                    throw err;
                } else {
                    db.executeSql("DELETE FROM magazine WHERE id=" + req.params.id + ";", function (data, err) {
                        if (err) {
                            console.log(err);
                        } else {
                            return res.json(data);
                        }
                    })
                }
            });
        }
    })
});
router.get("/GetOthersByIdDetails/:id", (req, res, next) => {
    db.executeSql("SELECT * FROM others WHERE institute_id=" + req.params.id + " ORDER BY createddate DESC;", function (data, err) {
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
            let date = new Date();
            const day = new String(date.getDate());
            let mnth = date.getUTCMonth() + 1;
            if (mnth <= 9) {
                mnth = '0' + mnth;
                console.log(mnth);
            }
            const year = date.getFullYear();
            const concat = '' + year + '-' + mnth + '-' + day;
            console.log(concat, 'ed');
            db.executeSql("SELECT * FROM news WHERE institute_id=" + req.params.id + " and (startDate IS NULL OR startDate<='" + concat + "') and (endDate IS NULL OR endDate>='" + concat + "') and isactive=true ORDER BY date DESC ;", function (data, err) {
                if (err) {
                    console.log(err);
                } else {
                    return res.json(data);
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
    db.executeSql("SELECT * FROM gatepass ORDER BY createddate DESC;", function (data, err) {
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
    db.executeSql("SELECT * FROM image ORDER BY createddate DESC LIMIT 1", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            fs.unlink('/var/www/html/cesbackend' + data[0].files, function (err) {
                if (err) {
                    throw err;
                } else {
                    return res.json(data);
                }
            });
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
router.post("/UploadPhotoContestImage", (req, res, next) => {
    var imgname = generateUUID();
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'images/contest');
        },
        // By default, multer removes file extensions so let's add them back
        filename: function (req, file, cb) {

            cb(null, imgname + path.extname(file.originalname));
        }
    });
    let upload = multer({ storage: storage }).single('file');
    upload(req, res, function (err) {
        console.log("path=", config.url + 'images/contest/' + req.file.filename);

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
        return res.json('/images/contest/' + req.file.filename);
    });
});
router.post("/UploadContestMultiImage", (req, res, next) => {
    var imgname = generateUUID();
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'images/contest');
        },
        // By default, multer removes file extensions so let's add them back
        filename: function (req, file, cb) {
            cb(null, imgname + path.extname(file.originalname));
        }
    });
    let upload = multer({ storage: storage }).single('file');
    upload(req, res, function (err) {
        console.log("path=", config.url + 'images/contest/' + req.file.filename);

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
        return res.json('/images/contest/' + req.file.filename);
    });
});
router.post("/SavePhotoContestDetails", (req, res, next) => {
    console.log(req.body);
    db.executeSql("INSERT INTO `photocontest`(`name`, `contact`, `birthday`, `image`, `isactive`, `createddate`) VALUES  ('" + req.body.name + "','" + req.body.contact + "','" + req.body.birthday + "','" + req.body.image + "',true,CURRENT_TIMESTAMP)", function (data, err) {
        if (err) {
            res.json("error");
            console.log(err)
        } else {
            if (req.body.contestMultiImage.length > 0) {
                for (let i = 0; i < req.body.contestMultiImage.length; i++) {
                    db.executeSql("INSERT INTO `contestimages`(`userid`, `image`,`createddate`) VALUES(" + data.insertId + ",'" + req.body.contestMultiImage[i] + "',CURRENT_TIMESTAMP);", function (data1, err) {
                        if (err) {
                            res.json("error");
                        } else {
                        }
                    });
                }
            }
        }
        return res.json('success');
    });

});
router.get("/GetPhotoContestList", (req, res, next) => {
    db.executeSql("SELECT * FROM photocontest;", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});
router.get("/GetPhotoContestImagesById/:id", (req, res, next) => {
    db.executeSql("SELECT * FROM contestimages WHERE userid=" + req.params.id + ";", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});
router.get("/RemovePhotoContestDetailsById/:id", (req, res, next) => {
    db.executeSql("DELETE FROM `photocontest` WHERE id=" + req.params.id + ";", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            db.executeSql("DELETE FROM `contestimages` WHERE userid=" + req.params.id + ";", function (data, err) {
                if (err) {
                    console.log(err);
                } else {
                }
            })
        }
        return res.json(data);
    })
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