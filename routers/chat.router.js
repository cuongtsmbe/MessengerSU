const express = require("express");
const router = express();
const chatModel = require("./../models/chat.model");
const userModel = require("./../models/user.model");
const { uuid } = require('uuidv4');
router.get('/chat', async function(req, res) {
    if (!req.session.name) { //nếu chưa đăng nhập  thì phải đăng nhập trước
        res.redirect("/user/login");
        return;
    }
    var data = await userModel.getAll().catch(err => {
        console.log("error getAll table user : ");
        console.log(err);
    });
    res.render('chat', {
        "listPerson": data,
    });
});

router.post('/chat/:username/:offset', async function(req, res, next) { // router sẽ đc gọi ở axios phía client (lấy tất cả tin nhắn mà 2 người nhắn cho nhau show ra)
    var condition = {
        userSend: req.session.username,
        receiver: req.params.username
    };
    var offset = (req.params.offset == undefined) ? 0 : req.params.offset;
    var data = await chatModel.selectChatContent(condition, offset, numrecord = 20);
    res.send(data); //trả dữ liệu nội dung chat của 2 user về cho axios
});
router.get('/chat/video', function(req, res, next) {
    res.redirect(`/chat/video/${uuid()}`);

});

router.get('/chat/video/:uuid', function(req, res, next) {
    // if (!req.session.name) { //nếu chưa đăng nhập  thì phải đăng nhập trước
    //     res.redirect("/user/login");
    //     return;
    // }
    res.render("video_chat", { layout: false, "id_room_server_send": req.params.uuid });
});
// router.post('/chat/addcontent', async function(req, res, next) { // put sẽ đc gọi ở axios phía socket.on 
//     console.log("req.session.username   : cuong in /chat/addcontent");
//     var data = {
//         userSend: req.session.username,
//         receiver: req.body.username_receiver,
//         content: req.body.data,
//     };
//     await chatModel.addContent(data);

// });
module.exports = router;