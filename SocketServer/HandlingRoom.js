const constants = require("./../config/constants");
module.exports = {

    TestExistRoomName: function(name) {
        var LengthRoom = constants.NumberAndListUserInRoom.length;
        for (var i = 0; i < LengthRoom; i++) {
            if (constants.NumberAndListUserInRoom[i].RoomName == name) {
                return true;
            }
        }
        return false;
    },

    LeaveRoom: function(userLeave, socket, Room = "All") { //cập nhật lại Room khi có người LeaveRoom,nói cho mọi người trong phòng biết là bạn đã rời phòng; Room=All nếu muốn rời tất  cả phòng 
        var Return_member_for_list_user_in_room = null; //{RoomName:,ListUserJoin:,Soluong:,} 
        constants.NumberAndListUserInRoom = constants.NumberAndListUserInRoom.map(items => {
            if (items.ListUserJoin.indexOf(userLeave) >= 0 && (items.RoomName == Room || Room == "All")) { //Room=All nếu muốn rời tất cả phòng(khi logout hoặc tắt trình duyệt) 
                items.Soluong--;
                Return_member_for_list_user_in_room = items;
                items.ListUserJoin.splice(items.ListUserJoin.indexOf(userLeave), 1);
                if (Return_member_for_list_user_in_room != null) {
                    this.Feedback_member(Return_member_for_list_user_in_room, socket, "leave"); //cập nhật danh sách Join vào Room cho từng User bị ảnh hưởng
                }

            }
            return items;
        });

        console.log(" Rooom now is : ");
        console.log(constants.NumberAndListUserInRoom);
        this.ClearChatInRoomDontHaveUser(); //thực hiện xóa nội dung chat của Room khi tất cả đều out
    },

    ClearChatInRoomDontHaveUser: function() {
        var RoomName0User = []; //danh sách các Room không có User nào Online
        constants.NumberAndListUserInRoom.forEach(item => {
            if (item.Soluong == 0) {
                RoomName0User.push(item.RoomName);
            }
        });
        constants.ChatRoomContent = constants.ChatRoomContent.filter(item => { //trả về  những nội dung chat có Room không nằm  trong RoomName0User
            return (RoomName0User.indexOf(item.room_received) < 0);
        });
    },

    Get_List_User_Join_In_Room: function(listRoom) { //array tên các room
        return constants.NumberAndListUserInRoom.filter(item => { //trả về danh sách obj {RoomName:,ListUserJoin:,Soluong:,} với điều kiện nằm trong danh sách mà User đang Join vào
            return listRoom.indexOf(item.RoomName) >= 0;
        });
    },
    Feedback_member: function(Return_member_for_list_user_in_room, socket, action) { //action: "leave" or "join" ..giả sử trong Group cá  and A,B khi mình Join vào Group thì số thành viên tăng lên ..Vì vậy phải trả số lượng về cho A,B đều biết nữa.
        // Return_member_for_list_user_in_room.ListUserJoin.forEach(itemForEach => {
        //             var arrayListRoomOfUser = []; //(lưu tên room mà user đang join)từng user sẽ đc lọc lấy ra danh sách các Room mà user đó join ;mục đích để dùng hàm Get_List_User_Join_In_Room lấy ra số lượng ...
        //             constants.NumberAndListUserInRoom.forEach(itemObj => { //duyệt từng Room 
        //                 if (itemObj.ListUserJoin.indexOf(itemForEach) >= 0) { //nếu danh sách user trongg room có người này
        //                     arrayListRoomOfUser.push(itemObj.RoomName); //thêm Tên Room vào danh sách mà người này đang Join
        //                 }
        //             });
        // if (itemForEach != socket.usernameConnect) { //emit cho socket.usernameConnect của socket khác(itemForEach) đc bởi gì khi io.on thì đã join socket vào phòng có socket.usernameConnect
        //     // socket.to(itemForEach).emit("List_Room_Have_In_Server", this.Get_List_User_Join_In_Room(arrayListRoomOfUser)); //cập nhật {RoomName:,ListUserJoin:,Soluong:,} cho từng người trong Room là có người nào đó join vào
        //     }
        //           });
        //   },

        //trả về cho những thành viên trong nhóm RoomName này obj dạng {nameGroupOrRoomHaveMemberJoinLeave: Return_member_for_list_user_in_room.RoomName, userJoinOrLeave: socket.usernameConnect, action } này để giống với group nên có thể dùng lại hàm render của group 
        socket.to(Return_member_for_list_user_in_room.RoomName).emit("server_response_join_leave_in_room", { nameGroupOrRoomHaveMemberJoinLeave: Return_member_for_list_user_in_room.RoomName, userJoinOrLeave: socket.usernameConnect, action });
    }
};