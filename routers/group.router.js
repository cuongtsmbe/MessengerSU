const express = require("express");
const router = express();
const groupModel = require("./../models/group.model");

router.post('/getjoin', async function(req, res, next) { //(khi click chuyển qua button Main G)lấy lần chat cuối cùng trong group , số lượng người join , thành viên trong từng group 
    var [ListGroupAndChat, ListUserInGroup] = await Promise.all([
        groupModel.GetGroupHadJoinAndLastChat(req.body.username),
        groupModel.GetUsersJoinInGroup(req.body.username),
        // groupModel.GetNumberUserWithConditionUSer(req.body.username),
    ]);
    var data = []; // array obj dang {id,RoomName,Soluong,ListUserJoin}
    ListGroupAndChat.forEach(item => { //duyệt qua danh sách các Group của người này
        var valueOfData = {};
        //valueOfData.id = item.idGroup;
        valueOfData.GroupName = item.NameGroup;
        // NumberUserInGroup.forEach(i => { // thêm thuộc tính Soluong thành viên cho valueOfData
        //     if (i.name_group == item.NameGroup) {
        //         valueOfData.Soluong = i.member;
        //     }
        // });
        valueOfData.ListUserJoin = [];
        ListUserInGroup.forEach(e => { //thêm danh sách người đang trong Group (thuộc tính ListUserJoin)
            if (e.name_group == item.NameGroup) {
                valueOfData.ListUserJoin.push(e.user_join);
            }
        });
        valueOfData.Soluong = valueOfData.ListUserJoin.length; //thêm thuộc tính Soluong thành viên cho valueOfData
        valueOfData.LastRecordChat = {
            "user_send_to_group": item.last_row_of_user_send_to_group,
            "content": item.content,
            "time": item.time,
            "id_record": item.id_record, //lấy ra để xem có đúng là cuối chưa hay không thôi, chứ không làm gì
        };
        data.push(valueOfData);
    });
    res.send(data);
});
router.post('/AddJoinGroup', async function(req, res, next) {
    var data = {
        name_group: req.body.nameGroup,
        user_join: req.body.user_join,
    };
    var ExistUserInRow = await groupModel.getConditionGroupAndUser(data); //kiểm tra xem user đó đã join vào group hay chưa
    if (ExistUserInRow.length <= 0) { //nếu chưa cos trong db thì mới cho in insert
        await groupModel.addUserJoin(data);
        res.send("success");
    }
    res.send("fail");
});
router.post("/LeaveGroup", async function(req, res, next) { //xóa người nào đó ra khỏi group trên db
    var objCondition = {
        name_group: req.body.nameGroup,
        user_join: req.body.user_leave,
    };
    var result = await groupModel.DeleteUserOfGroup(objCondition);
    if (result.affectedRows >= 1) { //nếu xóa đc thì phản hồi là success
        res.send("success");
    }
    res.send("fail");
});
module.exports = router;