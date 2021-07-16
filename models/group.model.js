const TABLE = 'groupchat';
const db = require("../util/db");
module.exports = {
    getAll: function() {
        return db.getAll(TABLE);
    },
    GetGroupHadJoinAndLastChat: function(userNeedGet) {
        //lấy danh sách group mà user yêu cầu có tham gia và lấy thêm row insert  cuối cùng của từng group 
        var sql = `SELECT ${TABLE}.id as idGroup , ${TABLE}.name_group as NameGroup ,ccg.id as id_record ,ccg.user_send as last_row_of_user_send_to_group,ccg.content as content,ccg.time as time FROM ${TABLE}
        left join chat_content_in_group as ccg on (${TABLE}.name_group=ccg.name_group)
        where  ${TABLE}.user_join='${userNeedGet}' and (ccg.id is NULL OR ccg.id IN (SELECT MAX(id)
                                from chat_content_in_group
                                group by chat_content_in_group.name_group
                           ))`;
        //nếu mà group đó chưa chat thì dùng chat_content_in_group.id is NULL  để lấy ra
        return db.load(sql);
    },
    GetUsersJoinInGroup: function(user) { //lấy danh sách thành viên  trong nhóm có user này tham gia
        var sql = `select *
            from ${TABLE}
            where ${TABLE}.name_group IN (select ${TABLE}.name_group as nameGroupHaveThisUser
                                            from ${TABLE} 
                                            where ${TABLE}.user_join='${user}')
            group by ${TABLE}.name_group,${TABLE}.user_join
        `;
        return db.load(sql);
    },
    // GetNumberUserWithConditionUSer: function(user) { //lấy ra số lượng thành viên trong nhóm có người này tham gia
    //     var sql = `select *,count(*) as member
    //         from ${TABLE}
    //         group by ${TABLE}.name_group
    //         having ${TABLE}.user_join='${user}'
    //      `;
    //     return db.load(sql);
    // }
    addUserJoin: function(objInsert) {
        return db.insert(TABLE, objInsert);
    },
    getConditionGroupAndUser: function(obj) {
        var sql = `select * from ${TABLE} where name_group='${obj.name_group}' and user_join='${obj.user_join}'`;
        return db.load(sql);
    },
    DeleteUserOfGroup: function(objCondition) {
        var sql = `DELETE FROM ${TABLE} WHERE name_group='${objCondition.name_group}' and user_join='${objCondition.user_join}'`;
        return db.load(sql);
    },
}