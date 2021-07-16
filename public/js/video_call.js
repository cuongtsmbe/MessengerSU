// document.ready
//khi vào link room thì thực hiện
//1. lấy idroom cùng id của peer new user emit lên server
//2.server join user mới vào trong roomSocket để thông qua socket có thể thông báo đến những người trong room
//3.server trả idpeer new user cho các thành viên trong room
//4.các thành viên trong room call đến idpeer này 
//5.thực hiện answer trả stream cho các thành viên trong room
//6.thực hiện lên DOM  
var peersClose = [];
socket.on("this-browser-is-have-username", function(username) {
    usernameOfLoginInTag = username; //lưu lại biến global username của browser này lại
    console.log("username của tag này : " + usernameOfLoginInTag);
    peer = new Peer(undefined);
    peer.on('open', id => {
        socket.emit("join_room_video_call", id_room, id);
    });
    receiverCall();
});
socket.on("have_user_join_room", function(id_peer_newUser) {
    getUserMedia({ video: true, audio: true }, function(stream) {
        var call = peer.call(id_peer_newUser, stream); //1
        showCamera("my_video_show");
        var videoForDel, temp; //để lưu lại thẻ video để có thể xóa nếu call.close();
        call_value = call;
        peersClose[call.peer] = call; //call.peer là id peer mình gọi đến
        All_stream_video_controll.push(stream);
        call.on('stream', function(remoteStream) { //4 stream phía receiver trả về 
            temp = addVideoFriendToDom("group_video_append", peer.id.substring(0, 12), remoteStream);
            if (temp != 0) {
                videoForDel = temp;
            }
            console.log("peer id call: ");
            console.log(peer.id);
            // All_stream_video_controll.push(remoteStream);
        });
        call.on("close", function() {
            if (videoForDel) {
                videoForDel.remove();
            }
            alert("Có thành viên rời cuộc gọi.");
        });
    }, function(err) {
        console.log('Failed to get local stream', err);
    });
});

function receiverCall() {
    peer.on('call', function(call) { //2
        getUserMedia({ video: true, audio: true }, function(stream) {
            call.answer(stream); // Answer the call with an A/V stream. stream gửi qua bên máy người gọi
            showCamera("my_video_show");
            call_value = call;
            All_stream_video_controll.push(stream);
            peersClose[call_value.peer] = call; //call.peer là id peer máy vừa gọi đến
            var videoForDel, temp;
            call.on('stream', function(remoteStream) { //3
                temp = addVideoFriendToDom("group_video_append", remoteStream.id.substring(0, 12), remoteStream);
                if (temp != 0) {
                    videoForDel = temp;
                }
                console.log("peer id receiver: ");
                console.log(peer.id);
                // All_stream_video_controll.push(remoteStream);
            });
            call.on("close", function() {
                if (videoForDel) {
                    videoForDel.remove();
                }
                alert("Có thành viên rời cuộc gọi.");
            });
        }, function(err) {
            console.log('Failed to get local stream', err);
        });
    });
}

function addVideoFriendToDom(idDom, id, stream) {
    if (!document.getElementById(id)) {
        var video = document.createElement("video");
        video.id = id;
        console.log(stream);
        video.srcObject = stream;
        video.play();
        document.getElementById(idDom).appendChild(video);
        return video;
    }
    return 0;
}
showCamera();

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

function video_call_setting_stream() { //tắt video 1 phía
    console.log(All_stream_video_controll);
    if (document.getElementById("camera_button_setting").textContent == 'camera close') {
        document.getElementById("camera_button_setting").innerHTML = "camera open";
        document.getElementById('camera_button_setting').className = "text-info border";
    } else {
        document.getElementById("camera_button_setting").innerHTML = "camera close";
        document.getElementById('camera_button_setting').className = "text-danger border";
    }
    All_stream_video_controll.forEach(function(item) {
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


function closeStream() {
    All_stream_video_controll.forEach(function(item) {
        item.getTracks().forEach(function(track) {
            track.stop();
        });
    });
    document.getElementById("my_video_append").innerHTML = '';
}



function end_call_peer() {
    call_value.close(); //thực hiện close với biến call ()thực hiện đến call.on("close",function(){}) để thông báo đến group
    closeStream(); //đống stream bên phía người end call
    socket.emit("end_call_video_group", id_room, peer.id); //thông báo cho người này leave nhóm
}
socket.on("have_user_leave_call", function(idPeerLeave) {
    console.log("peer leave : " + idPeerLeave);
    console.log(peer);
    if (peersClose[idPeerLeave]) {
        peersClose[idPeerLeave].close();
    }
});