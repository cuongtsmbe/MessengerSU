const TABLE = 'chat_content_in_group';
const db = require("../util/db");
module.exports = {
    getContentOfGroup: function(Group, offset, numberRecord = 20) {
        // var sql = `select * from ${TABLE} where ${TABLE}.name_group='${Group}' order by ${TABLE}.time asc`;
        var sql = `select * from (select *
            from ${TABLE} as A
            where A.name_group='${Group}'
            ORDER BY A.id desc
           LIMIT ${offset},${numberRecord}) LR 
           ORDER BY LR.time asc`;
        console.log(sql);
        return db.load(sql);
    },
    insertContentChat: function(objInsert) {
        return db.insert(TABLE, objInsert);
    }
}