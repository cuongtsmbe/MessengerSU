const TABLE = 'chatcontent';
const db = require("../util/db");
module.exports = {
    getAll: function() {
        return db.getAll(TABLE);
    },
    selectChatContent: function(condition, offset, numberRecord) { //condition:chứa username người nhận và người gửi .... lấy nội dung chat sắp xếp theo thời gian
        // sql = `select * from ${TABLE} where (userSend='${condition.userSend}' and receiver='${condition.receiver}') or (userSend='${condition.receiver}' and receiver='${condition.userSend}') order by timesend asc`;
        var sql = `select * from (select *
            from ${TABLE} as A
            where (A.userSend='${condition.userSend}' and A.receiver='${condition.receiver}') or (A.userSend='${condition.receiver}' and A.receiver='${condition.userSend}')
            ORDER BY A.idContent desc
           LIMIT ${offset},${numberRecord}) LR 
           ORDER BY LR.timesend asc`;

        return db.load(sql);
    },
    addContent: function(obj) {
        var dataInsert = {
            userSend: obj.userSend,
            content: obj.data,
            receiver: obj.username_receiver,
            type: (obj.type ? obj.type : "text"),
        };
        return db.insert(TABLE, dataInsert);
    }
}