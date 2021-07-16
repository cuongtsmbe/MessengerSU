const TABLE = 'user';
const db = require("../util/db");
module.exports = {
    getAll: function() {
        return db.getAll(TABLE);
    },
    insertUser: function(user) {
        return db.insert(TABLE, user);
    },
    getUserByUsername: function(conditionData) {
        var condition = {
            "username": conditionData.username,
        };
        return db.getOneByCondition(TABLE, condition);
    },
    getListUserAndLastChat: function(user) { //khi bbb login và click Person people thì sẽ show danh sách tất cả user cùng với nội dung chat cuối cùng mà bbb với user đó chat vs nhau
        var sql = `SELECT user1.name as name,user1.username as username,cc1.idContent as id,cc1.userSend as userSend_last,cc1.receiver as receiver,cc1.content as content,cc1.timesend as time
        from ${TABLE} user1
        left join chatcontent as cc1 on (user1.username=cc1.userSend OR user1.username=cc1.receiver)
        where  user1.username!='${user}' and (cc1.idContent is null or cc1.idContent  IN (
        SELECT MAX(cc.idContent) FROM ${TABLE}
                left join chatcontent as cc on (${TABLE}.username=cc.userSend OR ${TABLE}.username=cc.receiver)
                where cc.idContent is NULL OR cc.idContent IN (SELECT MAX(idContent)
                                        from chatcontent
                                        where chatcontent.userSend='${user}' or chatcontent.receiver='${user}'
                                        group by chatcontent.userSend, chatcontent.receiver
                                   ) 
                group by ${TABLE}.username
           ))`;
        //cái cc1.idContent is null chỉ lấy đc khi user đó chưa đc ai gửi tin nhắn đến. Giả sử userAA đc cuongphan gửi 1 tin nhắn đến thì lúc này userC yêu cầu get list user and chat  userAA lúc này có idContent !=null và có cc.userSend cùng cc.receiver đều không phải userC. lúc này userC không thể lấy đc những người đã gửi tin nhắn vs người khác nhưng không phải userC . xử lý cái đó ở phần user.router 
        return db.load(sql);
    }
}