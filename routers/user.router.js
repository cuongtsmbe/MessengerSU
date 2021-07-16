const express = require("express");
const router = express();
const userModel = require("./../models/user.model");
const bcrypt = require('bcryptjs');
const config = require("./../config/config.json");

router.post('/allUser', async function(req, res, next) { //chỉ để client fetch get data user
    var listAllUser = await userModel.getAll();
    var ListAllUserNoPas = listAllUser.map(item => { //delete password ở mỗi user khi cho ra browser
        delete item.password;
        return item;
    });
    //kiểm tra nếu còn thiếu username nào nữa thì push vào đồng thời cho thông tin về lần chat cuối cùng bằng null
    var listUserAndChat = await userModel.getListUserAndLastChat(req.body.username);
    var arrayListUsername = []; //array username have trong listUserAndChat
    listUserAndChat.forEach(item => {
        arrayListUsername.push(item.username);
    });
    ListAllUserNoPas.forEach(item => {
        if (item.username != req.body.username && arrayListUsername.indexOf(item.username) < 0) { //kiểm tra xem tất cả các username(ngoại trừ user yêu cầu) trong listUserAndChat với tất cả user có trong db
            listUserAndChat.push({ name: item.name, username: item.username, id: null, userSend_last: null, receiver: null, time: null, content: null })
        }
    });
    res.send(listUserAndChat);
});

router.get('/', async function(req, res) {
    if (!req.session.name) { //nếu đã đăng nhập thì không cho vào trang login register nữa
        res.render('user', { layout: false });
    } else {
        res.redirect("/chat");
    }
});
router.get('/login', function(req, res) {
    if (!req.session.name) {
        res.render('user', { layout: false });
    } else {
        res.redirect("/chat");
    }
});
router.post('/login', async function(req, res) {
    var userInf = await userModel.getUserByUsername(req.body);
    if (userInf.length > 0 && bcrypt.compareSync(req.body.password, userInf[0].password)) {
        req.session.name = userInf[0].name; //save in session
        req.session.username = userInf[0].username;
        res.redirect("/chat");
    } else {
        res.render('user', {
            layout: false,
            "error": true,
            "errUsername": "password or username is incorrect  !!",
        });
    }
});

router.get('/register', function(req, res) {
    if (!req.session.name) {
        res.render('user', { layout: false });
    } else {
        res.redirect("/chat");
    }
});
router.post('/register', async function(req, res) {
    if (req.body.Name == '' || req.body.username == '' || req.body.Password == '') {
        res.render('user', {
            layout: false,
            "error": true,
            "errUsername": "Please complete all information .",
        });
        return;
    }
    var userInf = await userModel.getUserByUsername({ "username": req.body.username });
    var hash = config.hash;
    if (userInf.length > 0) { //nếu không db đã có username này
        res.render('user', {
            layout: false,
            "error": true,
            "errUsername": "username is already registered  !!",
        });
    } else {
        var password = bcrypt.hashSync(req.body.Password, hash);
        var dataInsert = {
            "name": req.body.Name,
            "username": req.body.username,
            "password": password,
        };
        userModel.insertUser(dataInsert); //insert user register
        req.session.name = dataInsert.name; //save in session
        req.session.username = dataInsert.username;
        res.redirect("/chat");
    }
});

router.get('/logout', function(req, res) {
    if (!req.session.name) {
        res.render('user', { layout: false });
    } else {
        req.session.name = null;
        req.session.username = null;
        res.redirect("/user/login");
    }
});
module.exports = router;