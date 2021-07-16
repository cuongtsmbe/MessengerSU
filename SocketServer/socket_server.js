const chatModel = require("./../models/chat.model");
const constants = require("./../config/constants");
const handling = require("./HandlingRoom");
module.exports = function(io, socket) {

    var RoomListOn = []; //Danh Sách mà User này join vào

    if (socket.usernameConnect != '') {
        socket.join(`${ socket.usernameConnect}`); //join vào room có tên chính là username của chính người đăng nhập
    }

    io.to(socket.id).emit("this-browser-is-have-username", socket.usernameConnect); //khi vừa login vào page chat .server sẽ nói cho browseer phía client ...mày chính là username này.. hãy lưu nó lại phía biến constant cho khi nào cần
    if (socket.usernameConnect != '') {
        constants.listUserOnline.push(socket.usernameConnect); //thêm danh sách người mới online vào array constants.listUserOnline ,nếu 1 username đăng nhập nhiều máy thì có thể thêm nhiều username giống nhau để nếu off thì loại từ từ .
    }
    console.log(constants.listUserOnline);
    console.log('a user connected : ' + socket.id);
    //listen,emit client 
    socket.on("send-content", async function(obj) {
        console.log(obj);
        chatModel.addContent(obj); //add content lên db . khi nào load lại thì mới dùng 
        socket.to(obj.username_receiver).emit("server-send-content", { data: obj.data, userSend: obj.userSend, type: (obj.type ? obj.type : "text") }); //gửi trực tiếp nội dung chat cho người nhận
    });

    //join room
    socket.on('Join_Room', function(dataRoom) { //yêu cầu Join vào Room

        if (constants.NumberAndListUserInRoom.length == 0 || !handling.TestExistRoomName(dataRoom.RoomName)) {
            constants.NumberAndListUserInRoom.push({ RoomName: dataRoom.RoomName, ListUserJoin: [`${ socket.usernameConnect}`], Soluong: 1 }); //{RoomName:,ListUserJoin:,Soluong:,}
        } else { //nếu Room này đã có người khác tạo rồi thì chỉ cần xét xem người này đã Join chưa và tăng soluong lên  
            var Return_member_for_list_user_in_room = [];
            constants.NumberAndListUserInRoom = constants.NumberAndListUserInRoom.map(items => {
                if (items.RoomName == dataRoom.RoomName) {
                    if (RoomListOn.indexOf(dataRoom.RoomName) < 0) { //nếu chưa Join vào Room thì thực hiện
                        items.Soluong++;
                        items.ListUserJoin.push(`${ socket.usernameConnect}`);
                        Return_member_for_list_user_in_room = items;
                    }

                }
                return items;
            });
        }
        if (RoomListOn.indexOf(dataRoom.RoomName) < 0) { //nếu trong danh sách chưa có mới add vào
            RoomListOn.push(dataRoom.RoomName);
        }
        console.log("Room All: ");
        console.log(constants.NumberAndListUserInRoom);
        socket.join(dataRoom.RoomName);

        if (Return_member_for_list_user_in_room != undefined && Return_member_for_list_user_in_room.length != 0) {
            handling.Feedback_member(Return_member_for_list_user_in_room, socket, "join"); //cập nhật danh sách Join vào Room cho từng User bị ảnh hưởng
        }

        socket.emit("List_Room_Have_In_Server", handling.Get_List_User_Join_In_Room(RoomListOn)); //dữ liệu kiểu array {RoomName:,ListUserJoin:,Soluong:,} .chỉ gửi cho người nào yêu cầu lên server truyền 

    });
    socket.on('get_All_Room', function() {
        socket.emit("List_Room_Have_In_Server", handling.Get_List_User_Join_In_Room(RoomListOn)); //chỉ gửi cho người nào yêu cầu lên server có thể dùng io.socket(socket.id).emit(...);
    });

    socket.on('get_content_chat_in_room', function(data) { //lấy nội dung chat của 1 Room nào đó trả về cho client yêu cầu
        var data_had_run = []; //dữ liệu sau khi khi lọc 
        if (constants.ChatRoomContent.length < 0) {
            return [];
        }
        constants.ChatRoomContent.forEach(item => {
            if (item.room_received == data.Room_need_content) { //nếu Room nhận tin nhắn chính là Room cần lấy nội dụng thì push vao arr
                data_had_run.push(item);
            }
        });
        socket.emit('server_send_content_chat_in_room', data_had_run);
    });
    //Room

    socket.on("client_send_data_multi_people", function(data) { // { data, Room_Group_receiver: nameRoom, userSend: usernameOfLoginInTag,dateTime }
        if (data.typeGroup && data.typeGroup == "room") {
            constants.ChatRoomContent.push({ userSend: data.userSend, room_received: data.Room_Group_receiver, content: data.data, time: data.dateTime, type: data.type }); //Lưu chat vào mảng tạm (dạng array object {userSend:,room_received:,content:,time:}) 
        }
        socket.to(data.Room_Group_receiver).emit("server_send_data_of_member", data);
    });
    socket.on("leave-room", function(obj) { //{ RoomNameLeave: nameRoom }
        handling.LeaveRoom(socket.usernameConnect, socket, obj.RoomNameLeave);
        RoomListOn.splice(RoomListOn.indexOf(obj.RoomNameLeave), 1);
        socket.leave(obj.RoomName); //cho user này leave room
        socket.emit("List_Room_Have_In_Server", handling.Get_List_User_Join_In_Room(RoomListOn));
    });
    socket.on("Join_to_list_Group", function(listGroupNeedJoin) { // socket join vào tất cả list group mà người này tham gia 
        listGroupNeedJoin.listGroup.forEach(item => {
            socket.join(item.GroupName);
        });
    });
    socket.on("send_data_to_socket_group", function(data) {
        //gửi nội dung đó cho các thành viên group ngoại trừ người gửi 
        socket.to(data.nameGroup).emit("data_group_send", { userSend: socket.usernameConnect, Group: data.nameGroup, content: data.content, type: data.type ? data.type : "text" });
    });
    socket.on("send_to_member_in_Group_have_somone_join_Or_Leave", function(obj) { //{Group,action:"join"} action là "join" hoặc "leave"  những thành viên trong group này sẽ đc server response khi có ai đó join
        if (obj.action == 'leave') {
            socket.leave(obj.Group);
        }
        socket.to(obj.Group).emit("server_response_have_member_in_Group", { nameGroupOrRoomHaveMemberJoinLeave: obj.Group, userJoinOrLeave: socket.usernameConnect, action: obj.action });
    });
    console.log("rooms user join : ");
    console.log(socket.rooms);
    socket.on("end_call_client", function(username) {
        console.log("tắt cuộc gọi với: " + username);
        socket.to(username).emit("server_alert_the_call_has_been_turned_off");
    });
    socket.on("ThietBiNguoiNhanDoChuong", function(UserCall) {
        socket.to(UserCall).emit("server_send_ThietBiNguoiNhanDangDoChuong"); //thông báo thiết bị người nhận đang đổ chuông
    });
    socket.on("Tu_Choi_Cuoc_Goi_Video", function(usercalling) {
        console.log(`cuoc goi cua ${usercalling} bi tu choi `);
        console.log(usercalling);
        socket.to(usercalling).emit("server_send_CuocGoiBiTuChoi");
    });
    //room video
    socket.on("join_room_video_call", function(idroom, id_peer) {
        socket.join(idroom);
        socket.to(idroom).emit("have_user_join_room", id_peer);
    });
    socket.on("end_call_video_group", function(idroom, id_peer) {
        socket.to(idroom).emit("have_user_leave_call", id_peer);
        socket.leave(idroom);
    });
    socket.on('disconnect', () => {
        constants.listUserOnline.splice(constants.listUserOnline.indexOf(socket.usernameConnect), 1); //Xóa người mới offline ra khỏi array constants.listUserOnline
        handling.LeaveRoom(socket.usernameConnect, socket);
        console.log(constants.listUserOnline);
        console.log(" disconnected : " + socket.id); //chỉ khi thực hiện xong trong disconnect function này thì nó mới xóa socket đó đi
    });

};