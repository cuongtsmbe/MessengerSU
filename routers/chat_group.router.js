const express = require("express");
const router = express();
const chat_group = require("./../models/chat_group.model");


router.post("/chat/:offset", async function(req, res, next) {
    var offset = req.params.offset ? req.params.offset : 0;
    var ChatInGroup = await chat_group.getContentOfGroup(req.body.nameGroup, offset);
    res.send(ChatInGroup);
});
router.post("/add", function(req, res, next) { //insert nội dung chat trong group
    var objInsert = {
        name_group: req.body.nameGroup,
        user_send: req.body.sender,
        content: req.body.data,
        type: (req.body.type) ? req.body.type : "text",
    };
    chat_group.insertContentChat(objInsert);
});
module.exports = router;