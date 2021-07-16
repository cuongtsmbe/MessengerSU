//video
function video_call_setting_stream() { //tắt video 1 phía
    stream = All_stream_video_controll;
    console.log(stream);
    if (document.getElementById("camera_button_setting").textContent == 'camera is closed') {
        document.getElementById("camera_button_setting").innerHTML = "camera open";
        document.getElementById('camera_button_setting').className = "text-info border";
    } else {
        document.getElementById("camera_button_setting").innerHTML = "camera is closed";
        document.getElementById('camera_button_setting').className = "text-danger border";
    }
    stream.forEach(function(item) {
        item.getTracks().forEach(function(track) {
            if (track.readyState == 'live' && track.kind === 'video') { //tắt/bật camera 
                // track.stop();//dừng hẳn 
                track.enabled = !track.enabled; //MediaStreamTrack.enable The enabled property on the MediaStreamTrack interface is a Boolean value which is true if the track is allowed to render the source stream or false if it is not. This can be used to intentionally mute a track.

            }
        });
    });
}

function audio_call_setting_stream() { //tắt audio 
    stream = All_stream_video_controll;
    if (document.getElementById("audio_button_setting").textContent == "micro is closed") {
        document.getElementById("audio_button_setting").innerHTML = "micro open";
        document.getElementById('audio_button_setting').className = "text-info border";
    } else {
        document.getElementById("audio_button_setting").innerHTML = "micro is closed";
        document.getElementById('audio_button_setting').className = "text-danger border";
    }
    stream.forEach(function(item) {
        item.getTracks().forEach(function(track) {
            if (track.readyState == 'live' && track.kind === 'audio') { //tắt/bật audio 
                // track.stop();dừng stream
                track.enabled = !track.enabled;

            }
        });
    });
}

function stopAllVideoAndAudio(stream) { //tắt cuộc gọi(tắt tất cả stream)
    stream.forEach(function(item) {
        item.getTracks().forEach(function(track) {
            if (track.readyState == 'live') {
                track.stop();
            }
        });
    });
    document.getElementById("my_video_show").innerHTML = "";
    document.getElementById("my_friend_camera_show").innerHTML = "";
    if (document.getElementById("thong_bao_cuoc_goi")) {
        document.getElementById("thong_bao_cuoc_goi").remove();
    }
}

function showCamera(idVideoShow = "my_video_show") { //chỉ mở trc camera phía mình có hay k cx đc
    getUserMedia({ video: true, audio: false }, async function(stream) {
        var video = document.createElement("video");
        video.srcObject = stream; //đặt đường dẫn video là luồng stream
        video.id = "my_camera_show";
        All_stream_video_controll.push(stream); //chỉ dùng hiện ở this computer
        var divController = document.createElement("div");
        divController.id = "div_button_controller";
        var button_end_peer = document.createElement("button"); //button end call
        button_end_peer.className = "id_button_end_peer";
        button_end_peer.innerHTML = "End Call";
        button_end_peer.className = "btn btn-danger";
        button_end_peer.addEventListener("click", end_call_peer);
        var div_video_audio = document.createElement("div");
        div_video_audio.id = "parent_button_audio_camera";
        var button_video_setting = document.createElement("button"); //button tắt camera 
        button_video_setting.className = "id_button_end_peer";
        button_video_setting.id = "camera_button_setting"
        button_video_setting.innerHTML = "camera is open";
        button_video_setting.className = "text-info border";
        button_video_setting.addEventListener("click", video_call_setting_stream);
        var button_audio_setting = document.createElement("button"); //button tắt audio 
        button_audio_setting.className = "id_button_end_peer";
        button_audio_setting.id = "audio_button_setting";
        button_audio_setting.innerHTML = "audio is open";
        button_audio_setting.className = "text-info border";
        button_audio_setting.addEventListener("click", audio_call_setting_stream);

        await video.play();
        document.getElementById(idVideoShow).innerHTML = "";
        divController.appendChild(button_end_peer); //add button vào div
        divController.appendChild(div_video_audio); //div chứa button audio and video enabled/off
        div_video_audio.appendChild(button_video_setting); //add button vào div
        div_video_audio.appendChild(button_audio_setting); //add button vào div
        document.getElementById(idVideoShow).appendChild(divController); //add div có button vào div parent
        document.getElementById(idVideoShow).appendChild(video);
    });
}

function callVideo(idVideoShow = "my_friend_camera_show", idPeerReceiver) {
    All_stream_video_controll = [];
    getUserMedia({ video: true, audio: true }, function(stream) {
        var call = peer.call(idPeerReceiver, stream); //stream  này sẽ show phía người nhận
        call_value = call;
        All_stream_video_controll.push(stream);
        showCamera();
        call.on('stream', async function(remoteStream) {
            console.log("calling....");
            var video = document.createElement("video");
            video.srcObject = remoteStream; //đặt đường dẫn video là luồng stream
            video.id = "video_calling";
            await video.play();
            document.getElementById(idVideoShow).innerHTML = "";
            document.getElementById(idVideoShow).appendChild(video);
            if (document.getElementById("thong_bao_cuoc_goi")) {
                document.getElementById("thong_bao_cuoc_goi").remove(); //xóa thông báo đang đổ chuông đi
            }
        });
        call.on('close', function() { //chỉ thực hiện phía người gọi (người call thực hiện tắt cuộc gọi)
            stopAllVideoAndAudio(All_stream_video_controll);
        });
    }, function(err) {
        console.log('Failed to get local stream', err);
    });
}

function receverVideoCall(idVideoShow = "my_friend_camera_show") {
    peer.on('call', function(call) {
        console.log("called");
        All_stream_video_controll = [];
        console.log(call);
        call_value = call; //call chứa thông tin người gọi đến 
        getUserMedia({ video: true, audio: true }, function(stream) {
            console.log("receiver call....");
            showCamera();
            All_stream_video_controll.push(stream); //controller stream phía this computer người nhận (không tác động đến người call)
            socket.emit("ThietBiNguoiNhanDoChuong", call_value.peer); //đường truyền cuộc gọi đã đến phía gười nhận
            ThongBaoCuocGoiDen(call_value.peer, call, stream, idVideoShow); //khi sự kiện call peer chạy đến được đây thì thông báo phía người nhận có người gợi đến :có muốn chấp nhận hay không
            call.on('close', function() { //thực hiện phía người nhận (khi người nhận thực hiện call.close())
                stopAllVideoAndAudio(All_stream_video_controll);
            });
        }, function(err) {
            console.log('Failed to get local stream', err);
        });
    });
}


function stream_answer_call(call, stream, idVideoShow) { //peer call answer
    call.answer(stream); // Answer the call with an A/V stream.
    call.on('stream', async function(remoteStream) {
        console.log("->add video receiver");
        var video = document.createElement("video");
        video.srcObject = remoteStream; //đặt đường dẫn video là luồng stream
        video.id = "video_receiver";
        await video.play(); //khi có lỗi thì do video chưa chuển bị xong mà video đã cho play() -> dùng async/await vì video.play() trả về 1 promise
        document.getElementById(idVideoShow).innerHTML = "";
        document.getElementById(idVideoShow).appendChild(video);

    });
}

function ThongBaoCuocGoiDen(user_goi_den, call, stream, idVideoShow) { //chấp nhận hoặc từ chối cuộc gọi đến
    var div_thong_bao_cuoc_goi_den = document.createElement("div");
    div_thong_bao_cuoc_goi_den.id = "thong_bao_cuoc_goi";
    var p_nguoi_goi_den = document.createElement("p");
    p_nguoi_goi_den.textContent = "Cuộc gọi đến từ " + user_goi_den;
    div_thong_bao_cuoc_goi_den.appendChild(p_nguoi_goi_den);
    var button_nhan_cuoc_goi = document.createElement("button");
    button_nhan_cuoc_goi.className = "btn btn-primary";
    button_nhan_cuoc_goi.innerHTML = "Chấp Nhận";
    button_nhan_cuoc_goi.addEventListener("click", function() {
        stream_answer_call(call, stream, idVideoShow); //show stream video khi click chấp nhận cuộc gọi
        document.getElementById("thong_bao_cuoc_goi").remove();
    });
    var button_tu_choi = document.createElement("button");
    button_tu_choi.className = "btn btn-danger";
    button_tu_choi.innerHTML = "Từ Chối";
    button_tu_choi.addEventListener("click", function() {
        socket.emit("Tu_Choi_Cuoc_Goi_Video", user_goi_den);
        document.getElementById("thong_bao_cuoc_goi").remove(); //xóa button chấp nhận hay từ chối cuộc gọi ra khỏi dom
        stopAllVideoAndAudio(All_stream_video_controll); //dừng stream phía this computer
    });
    div_thong_bao_cuoc_goi_den.appendChild(button_nhan_cuoc_goi);
    div_thong_bao_cuoc_goi_den.appendChild(button_tu_choi);
    document.querySelector("body").appendChild(div_thong_bao_cuoc_goi_den);
}


socket.on("server_send_CuocGoiBiTuChoi", function() {
    alert("Người dùng bận .vui lòng gọi lại sau.");
    stopAllVideoAndAudio(All_stream_video_controll); //stop stream phía máy friends
});
socket.on("server_send_ThietBiNguoiNhanDangDoChuong", function() {
    var div_thong_bao_cuoc_goi_den = document.createElement("div");
    div_thong_bao_cuoc_goi_den.id = "thong_bao_cuoc_goi";
    var p_nguoi_goi_den = document.createElement("p");
    p_nguoi_goi_den.textContent = "Đang đổ chuông ... ";
    div_thong_bao_cuoc_goi_den.appendChild(p_nguoi_goi_den);
    document.querySelector("body").appendChild(div_thong_bao_cuoc_goi_den);
});

function end_call_peer() {
    call_value.close(); //thực hiện close với biến call 
    socket.emit("end_call_client", call_value.peer);
    if (document.getElementById("my_video_show").textContent != "") {
        stopAllVideoAndAudio(All_stream_video_controll);
    }
}

function callFriend(username_receiver) {
    callVideo("my_friend_camera_show", username_receiver); //call with peer 
    console.log(usernameOfLoginInTag + " (call) " + username_receiver);
}
//end call video














function sendData(username_receiver) { //xử lý tin nhắn gửi đi
    var data = renderMyDom(); //Add nội dung chat trong DOM người gửi
    socket.emit("send-content", { data, username_receiver, userSend: usernameOfLoginInTag }); //gửi lên server
    var dotMes; //hiển thị nội dụng vừa gửi lên thẻ p của người nhận trong list user
    if (data.length > 65) {
        dotMes = "...";
    } else {
        dotMes = "";
    }
    if (document.getElementById(`tagp${username_receiver}`) != null) {
        document.getElementById(`tagp${username_receiver}`).innerHTML = `you: ${data.substring(0, 65)}${dotMes}`;
    }
    $("#input_write_content").val(""); //làm mới ô input send
    setTimeout(function() { scroll_end_chat(true) }, 0);
}

function getTimeSend() {
    let current = new Date(); //gửi thời gian lên server
    let cDate = current.getFullYear() + '-' + (current.getMonth() + 1) + '-' + current.getDate();
    let cTime = current.getHours() + "h:" + current.getMinutes() + "m:" + current.getSeconds() + "s";
    let dateTime = cDate + ' ' + cTime;
    return dateTime;
}

function renderMyDom() { //thêm trực tiếp nội dung người gửi vào DOM
    var data = $("#input_write_content").val();
    $(".msg_history").append( //thêm trực tiếp vào DOM
        `<div class="outgoing_msg">
            <div class="sent_msg">
            <p class="colorP">${data}</p>
            <span class="time_date">${getTimeSend()}</span> </div>
        </div>`);
    $("#input_write_content").val("");
    if (offset != 0) {
        var obj = document.getElementsByClassName("colorP");

        obj[obj.length - 1].style.background = "#e91e63";
    }
    return data;
}

function getDataRoom(RoomName) { //khi click vào Room nào thì yêu cầu server xử lý và lấy nội dung chat trong Room đó ra
    if (document.getElementById("show_more_class")) {
        document.getElementById("show_more_class").style.display = "none";
    }
    setTimeout(function() { scroll_end_chat(true) }, 400); //chạy khi tất cả chạy xong r
    UserShowC = RoomName;
    UserShowC_typeGroup_Room_Person = "room";
    offset = 0;
    for (let i = 0; i < document.getElementsByClassName(`listPeopleChat`).length; i++) { //chỉnh lại màu xám cho tất cả user trong list 
        document.getElementsByClassName(`listPeopleChat`)[i].style.background = "white";
    }
    document.getElementsByClassName(`(${UserShowC})`)[0].style.background = "whitesmoke";

    document.getElementById("nameChat").innerHTML = UserShowC_typeGroup_Room_Person + " : " + UserShowC;
    socket.emit("get_content_chat_in_room", { Room_need_content: RoomName });
}

function xuly_send_in_Room(nameRoom, type = "text", data = null) { //lưu nội dung chat lên Array trên server và trả về nội dung vừa chat qua list Room
    setTimeout(function() { scroll_end_chat(true) }, 0);
    let dateTime = getTimeSend(); //lấy thời gian và ngày gửi
    if (data == null) {
        data = renderMyDom();
    }
    socket.emit("client_send_data_multi_people", { data, Room_Group_receiver: nameRoom, userSend: usernameOfLoginInTag, dateTime, typeGroup: "room", type }); //gửi lên server
    var dotMes; //hiển thị nội dụng vừa gửi lên thẻ p  trong list Room
    if (data.length > 65) {
        dotMes = "...";
    } else {
        dotMes = "";
    }
    var xulyTachChuoi = nameRoom.split(" ");
    var nameRoomLienNhau = "";
    for (var i = 0; i < xulyTachChuoi.length; i++) {
        nameRoomLienNhau = nameRoomLienNhau + xulyTachChuoi[i];
    }
    if (document.getElementById(`tagp${nameRoomLienNhau}`) == null) { //nếu mà khi leave khỏi Room thì trên list sẽ xóa. để k bị lỗi get id null thì làm mới lại
        $(".type_msg").html("");
        $(".msg_history").html("");
    } else {
        document.getElementById(`tagp${nameRoomLienNhau}`).innerHTML = `you: ${data.substring(0, 65)}${dotMes}`;
    }

    $("#input_write_content").val(""); //làm mới ô input send
}

function render_File_In_Receiver_Dom(data, sender, type) { //thêm trực tiếp nội dung vào DOM
    var tempitems;
    if (type == "application") {
        tempitems = `<p class="renderDomSocket"><a href="/application/${data}" target="_blank">${data}</a></p>`;
    } else if (type == "video") {
        tempitems = ` <p class="renderDomSocket"><span><video width='50%' height='auto' controls><source src='/video/${data}' type='video/mp4'></video></span></p>`;
    } else if (type == "image") {
        tempitems = `<p class="renderDomSocket"><a href="/image/${data}" target="_blank" ><img class="img_dom_client" src="/image/${data}"  title="${data}"></a></p>`;
    } else if (type == "other") {
        tempitems = `<p class="renderDomSocket"><a href="/other/${data}" target="_blank">${data}</a></p>`;
    } else { //khi type = text
        tempitems = `<p class="renderDomSocket">${data}</p>`;
    }
    $(".msg_history").append( //thêm trực tiếp vào DOM
        `<div class="incoming_msg mt-1">
                <div class="incoming_msg_img"> <img src="/img/check.png" alt="sunil"> </div>
                <div class="received_msg">
                <div class="received_withd_msg">
                    <span class="time_date">${sender}</span>
                   ` + tempitems + `
                    <span class="time_date">${getTimeSend()}</span></div>
                </div>
            </div>`);
    if (offset != 0) {
        var obj = document.getElementsByClassName("renderDomSocket");

        obj[obj.length - 1].style.background = "rgb(246 255 171)";
    }


}



function renderChatFromServer(obj) { //Room: { data: data, Name_Send: chat.Room_Group_receiver, time: chat.dateTime, NameRoomLienNhau, userSendToRoom: chat.userSend,type: } ::: ->  User: { data: obj.data, userSend: obj.userSend }

    setTimeout(function() { scroll_end_chat(scroll_not_end()) }, 0);
    var mes = '';
    var dotMes;
    if (obj.data.length > 65) {
        dotMes = "...";
    } else {
        dotMes = "";
    }
    var time = getTimeSend() || "now";
    //chuyển giá trị sao cho cả group và person đều dùng đc
    if (obj.userSend != undefined) { //phần chat riêng đang dùng hàm này
        obj.Name_Send = obj.userSend;
        obj.userSendToRoom = "";
    }
    if (UserShowC == obj.Name_Send) { //nếu người gửi tin nhắn đến chính là người mà mình đang xem thì mới thêm vào DOM
        // $(".msg_history").append(
        //     `<div class="incoming_msg mt-1">
        //         <div class="incoming_msg_img"> <img src="/img/check.png" alt="sunil"> </div>
        //         <div class="received_msg">
        //         <div class="received_withd_msg">
        //             <span class="time_date">${obj.userSendToRoom}</span>
        //             <p>${obj.data}</p>
        //             <span class="time_date">${time}</span></div>
        //         </div>
        //     </div>`);
        render_File_In_Receiver_Dom(obj.data, obj.userSendToRoom, obj.type ? obj.type : "text");
        mes = `<h5  style="font-size:13px;color:#989898"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-envelope-open" viewBox="0 0 16 16">
        <path d="M8.47 1.318a1 1 0 0 0-.94 0l-6 3.2A1 1 0 0 0 1 5.4v.818l5.724 3.465L8 8.917l1.276.766L15 6.218V5.4a1 1 0 0 0-.53-.882l-6-3.2zM15 7.388l-4.754 2.877L15 13.117v-5.73zm-.035 6.874L8 10.083l-6.965 4.18A1 1 0 0 0 2 15h12a1 1 0 0 0 .965-.738zM1 13.117l4.754-2.852L1 7.387v5.73zM7.059.435a2 2 0 0 1 1.882 0l6 3.2A2 2 0 0 1 16 5.4V14a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V5.4a2 2 0 0 1 1.059-1.765l6-3.2z"/>
      </svg> ${obj.data.substring(0, 65)}${dotMes}</h5>`;
    } else { //hiện thông báo có người vừa gửi tin nhắn
        mes = `<h5  style="font-size:13px;" id="notifyColor${obj.Name_Send}"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-envelope" viewBox="0 0 16 16">
        <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2zm13 2.383-4.758 2.855L15 11.114v-5.73zm-.034 6.878L9.271 8.82 8 9.583 6.728 8.82l-5.694 3.44A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.739zM1 11.114l4.758-2.876L1 5.383v5.73z"/>
      </svg> ${obj.data.substring(0, 65)}${dotMes}</h5>`;

    }


    if (obj.NameRoomLienNhau != undefined) {
        if (document.getElementById(`tagp${obj.NameRoomLienNhau}`) != null) {
            document.getElementById(`tagp${obj.NameRoomLienNhau}`).innerHTML = mes;
        }
    } else { //nếu là user
        if (document.getElementById(`tagp${obj.Name_Send}`) != null) {
            document.getElementById(`tagp${obj.Name_Send}`).innerHTML = mes;
        }
    }

}

function leaveJoin(nameRoom) {
    socket.emit("leave-room", { RoomNameLeave: nameRoom });
}
socket.on("server-send-content", function(obj) { //{ data: obj.data, userSend: obj.userSend, type: (obj.type ? obj.type : "text") } xử lý tin nhắn nhận được từ server
    renderChatFromServer(obj);

});

socket.on("this-browser-is-have-username", function(username) {
    usernameOfLoginInTag = username; //lưu lại biến global username của browser này lại
    console.log("username của tag này : " + usernameOfLoginInTag);
    peer = new Peer(username); // (đặt id cho peer phía client login là: "id_peer_person"+username)new Peer("id muon dat cho peer");//nếu k đặt id cho peer thì peer sẽ tự động tạo id 
    receverVideoCall();
});

socket.on("List_Room_Have_In_Server", function(ListRoom) { //hiển tất cả Room có trong server {RoomName:,ListUserJoin:,Soluong:,}
    if (tagButtonChoose != 'room') { return; } //nếu client không đang xem phía danh sách room  thì dừng lại
    if ($("#ListRoom")) {
        $("#ListRoom").html("");
        list_left = ListRoom;
        ListRoom.forEach(items => {
            var xulyTachChuoi = items.RoomName.split(" "); //xử lý cho tên Room làm id  thẻ html
            var itemsLienNhau = "";
            for (var i = 0; i < xulyTachChuoi.length; i++) {
                itemsLienNhau = itemsLienNhau + xulyTachChuoi[i];
            }
            var memberList = items.ListUserJoin.join();
            $("#ListRoom").append(
                `<div class="chat_list active_chat listPeopleChat (${items.RoomName})" style="cursor:pointer;" onclick="getDataRoom('${items.RoomName}')">
                    <div class="chat_people">
                        <div class="chat_img"> <img src="/img/cube_green.png" alt="sunil" style="height:30px;margin-bottom:5px"> </div>
                        <div class="chat_ib">
                            <h6 class="d-flex justify-content-between"><span>${items.RoomName}  <button type="button" class="btn btn-outline-danger pt-0 pb-0 pr-1 pl-1 m-0" onclick="leaveJoin('${items.RoomName}')">leave</button></span><span class="" id="spanListMember${itemsLienNhau}" title=" Danh sách các thành viên (phân biệt theo username) : ${memberList} " ><span id="spanMember${itemsLienNhau}" >${items.Soluong}</span> member</span></h6>
                            <p id="tagp${itemsLienNhau}">...</p>
                        </div>
                    </div>
                </div>
                `);
        });
    }
});



//get nội dung chat về cho client

socket.on("server_send_content_chat_in_room", function(data) { //Room
    console.log("data Room");
    console.log(data);
    $('.msg_history').html('');
    if (data.length > 0) {
        data.forEach(function(value) {
            var tempitems;
            if (value.type == "application") {
                tempitems = ` <p><a href="/application/${value.content}" target="_blank">${value.content}</a></p>`;
            } else if (value.type == "video") {
                tempitems = `<p><span><video width='50%' height='auto' controls><source src='/video/${value.content}' type='video/mp4'></video></span></p>`;
            } else if (value.type == "image") {
                tempitems = ` <p><a href="/image/${value.content}" target="_blank" ><img class="img_dom_client" src="/image/${value.content}"  title="${value.content}"></a></p>`;
            } else if (value.type == "other") {
                tempitems = `<p><a href="/other/${value.content}" target="_blank">${value.content}</a></p>`;
            } else {
                tempitems = `<p>${value.content}</p>`
            }
            if (value.userSend != `${usernameOfLoginInTag}`) {
                $(".msg_history").append(
                    `<div class="incoming_msg">
                        <div class="incoming_msg_img"> <img src="/img/check.png" alt="sunil"> </div>
                        <div class="received_msg">
                        <div class="received_withd_msg">
                            <span class="time_date">${value.userSend}</span>
                           ` + tempitems + `
                            <span class="time_date">${value.time}</span></div>
                        </div>
                    </div>`);

            } else {

                $(".msg_history").append(
                    `<div class="outgoing_msg">
                        <div class="sent_msg">
                        ` + tempitems + `
                        <span class="time_date"> ${value.time}</span> </div>
                    </div>`);
            }

        });
    } else {
        $(".msg_history").append(
            `<div class="incoming_msg">
                <div class="incoming_msg_img"> <img src="/img/check.png" alt="sunil"> </div>
                <div class="received_msg">
                <div class="received_withd_msg">
                    <p>Let go, chat something in here ...</p>
                    <span class="time_date">now</span></div>
                </div>
            </div>`);
    }

    render_button_call_send(UserShowC, "xuly_send_in_Room");
});

socket.on('server_send_data_of_member', function(chat) { // { data, Room_Group_receiver: nameRoom, userSend: nguoi gui den room,dateTime }
    var xulyTachChuoi = chat.Room_Group_receiver.split(" "); //xử lý cho tên Room làm id 
    var NameRoomLienNhau = "";
    for (var i = 0; i < xulyTachChuoi.length; i++) {
        NameRoomLienNhau = NameRoomLienNhau + xulyTachChuoi[i];
    }
    renderChatFromServer({ data: chat.data, Name_Send: chat.Room_Group_receiver, time: chat.dateTime, NameRoomLienNhau, userSendToRoom: chat.userSend, type: (chat.type) ? chat.type : "text" }); //userSend là Room vì đây chính là nội dung mà Phòng chat gửi về cho mình
});

socket.on('data_group_send', function(obj) { //nhận nội dung từ group gửi về  { userSend:, Group: , content: ,type: }
    var xulyTachChuoi = obj.Group.split(" "); //xử lý cho tên Group làm id  thẻ html
    var itemsLienNhau = "";
    for (var i = 0; i < xulyTachChuoi.length; i++) {
        itemsLienNhau = itemsLienNhau + xulyTachChuoi[i];
    }
    renderChatFromServer({ data: obj.content, Name_Send: obj.Group, NameRoomLienNhau: itemsLienNhau, userSendToRoom: obj.userSend, type: obj.type ? obj.type : "text" });
});

function xuly_add_to_dom_leave_join_Room_Group(obj, room_or_group_user) {
    if (tagButtonChoose == room_or_group_user) { //khi client nào đó trong group đang click vào button group mà có lient nào đó join hay leave vào group vào đó của mình thì thực hiện tìm trên DOM cập nhật ngay trên dó dựa theo id element chứ không render lại list group nữa  
        if (obj.action == 'join') {
            var xulyTachChuoi = obj.nameGroupOrRoomHaveMemberJoinLeave.split(" "); //xử lý cho tên Group làm id  thẻ html
            var itemsLienNhau = "";
            for (var i = 0; i < xulyTachChuoi.length; i++) {
                itemsLienNhau = itemsLienNhau + xulyTachChuoi[i];
            }
            $(`#spanMember${itemsLienNhau}`).html(parseInt($(`#spanMember${itemsLienNhau}`).html()) + 1);
            var titleValue = $(`#spanListMember${itemsLienNhau}`).attr("title") + `,${obj.userJoinOrLeave}`;
            $(`#spanListMember${itemsLienNhau}`).attr("title", titleValue);
        }
        if (obj.action == 'leave') {
            var xulyTachChuoi = obj.nameGroupOrRoomHaveMemberJoinLeave.split(" "); //xử lý cho tên Group làm id  thẻ html
            var itemsLienNhau = "";
            for (var i = 0; i < xulyTachChuoi.length; i++) {
                itemsLienNhau = itemsLienNhau + xulyTachChuoi[i];
            }
            $(`#spanMember${itemsLienNhau}`).html(parseInt($(`#spanMember${itemsLienNhau}`).html()) - 1);
            var titleValue = `member has recently out: ` + `${obj.userJoinOrLeave}`;
            $(`#spanListMember${itemsLienNhau}`).attr("title", titleValue);
        }
    }
    //thông báo có người vừa leave or join
    if (obj.action == "join") {
        alert(`${obj.userJoinOrLeave} had Join ${room_or_group_user}: ${ obj.nameGroupOrRoomHaveMemberJoinLeave}`);
    }
    if (obj.action == "leave") {
        alert(`${obj.userJoinOrLeave} had leave ${room_or_group_user}: ${ obj.nameGroupOrRoomHaveMemberJoinLeave}`);
    }
}

socket.on('server_response_have_member_in_Group', function(objGroup) { //obj :{ nameGroupOrRoomHaveMemberJoinLeave: obj.Group, userJoinOrLeave: socket.usernameConnect,action:obj.action }
    xuly_add_to_dom_leave_join_Room_Group(objGroup, 'group');
});


socket.on("server_response_join_leave_in_room", function(obj) { //obj: { nameGroupOrRoomHaveMemberJoinLeave: obj.Group, userJoinOrLeave: socket.usernameConnect,action:obj.action }
    xuly_add_to_dom_leave_join_Room_Group(obj, 'room');
})
socket.on("server_alert_the_call_has_been_turned_off", function() {
    alert("Cuộc hội thoại đã kết thúc.");
    if (document.getElementById("my_video_show").textContent != "") {
        stopAllVideoAndAudio(All_stream_video_controll);
    }
})