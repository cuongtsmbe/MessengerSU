const express = require("express");
const router = express();
const multer = require('multer');
const config = require("./../config/config.json");
//multer
var storage = multer.diskStorage({ //nó chạy cho từng phần tử trong var  upload:  array userPhoto 
    destination: function(req, file, cb) {
        if (file.mimetype.search("video") != -1) {
            cb(null, './uploads/video'); //cấu hình địa chỉ lưu file trong server
        } else if (file.mimetype.search("image") != -1) {
            cb(null, './uploads/image');
        } else if (file.mimetype.search("application") != -1) {
            cb(null, './uploads/application');
        } else {
            cb(null, './uploads/other');
        }
    },
    filename: function(req, file, cb) { //tên file đc lưu phía server
        cb(null, file.originalname); //file.originalname lấy tên file lúc mới tải lên
    }
});

var upload = multer({ storage: storage }).array('userPhoto', config.max_file_upload);

router.post('/file', function(req, res) {
    upload(req, res, function(err) {
        if (err) {
            console.log(err);
            return res.status(500).send("Error uploading file. Limit the number of files to upload is <= 12 ");

        }
        res.status(200).send("File is uploaded");
    });
});

module.exports = router;