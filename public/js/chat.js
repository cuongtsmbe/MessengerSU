//đối với cái này đáng ra phải dùng jquery Nhưng khi click vào button Person thì các user đc render không thể click bằng jquery đc nữa ??? ->Nên mới xài onclick với this làm tham số 
function renderMsg(e, offsetValue = 0) { //thực hiện show chat từ db ra màn hình  nếu user đang vào trang chat của 2 người 
    if (document.getElementById("show_more_class")) {
        document.getElementById("show_more_class").style.display = "none";
    }
    offset = offsetValue;
    var username = $(e).attr('username') != undefined ? $(e).attr('username') : e; //lấy giá trị thuộc tính  username thẻ div vừa click xong
    UserShowC = username;
    UserShowC_typeGroup_Room_Person = "person";
    document.getElementById("nameChat").innerHTML = UserShowC_typeGroup_Room_Person + " : " + UserShowC + " (username)";
    if (document.getElementById(`notifyColor${UserShowC}`)) {
        document.getElementById(`notifyColor${UserShowC}`).style.color = "#989898";
    }
    for (let i = 0; i < document.getElementsByClassName(`listPeopleChat`).length; i++) { //chỉnh lại màu xám cho tất cả user trong list 
        document.getElementsByClassName(`listPeopleChat`)[i].style.background = "white";
    }
    document.getElementsByClassName(`div_person_${UserShowC}`)[0].style.background = "whitesmoke"; //user được chọn thì hiển thị màu trắng
    $(".msg_history").html("");
    // Send a GET request
    axios({
        method: 'post',
        url: `/chat/${username}/${offset}`,
        // data: {
        //     "username": username,
        // }
    }).then(function(arr) {
        if (arr.data.length == 0) {
            $(".msg_history").append(
                `<div class="incoming_msg">
                    <div class="incoming_msg_img"> <img src="/img/check.png" alt="sunil"> </div>
                    <div class="received_msg">
                    <div class="received_withd_msg">
                        <p>Don't have content ...</p>
                        <span class="time_date">now</span></div>
                    </div>
                </div>`);
        }
        arr.data.forEach(function(value) { //value này chứa nội dung chat của mình với người vùa click 
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
                tempitems = `<p>${value.content}</p>`;
            }
            if (value.userSend == username) { //nếu nội dung chat của mình có người gửi chính là người mình vừa click thì cho nội dung chat đó vào phía class: incomig_msg
                $(".msg_history").append(
                    `<div class="incoming_msg">
                        <div class="incoming_msg_img"> <img src="/img/check.png" alt="sunil"> </div>
                        <div class="received_msg">
                        <div class="received_withd_msg">
                           ` + tempitems + `
                            <span class="time_date">${value.timesend}</span></div>
                        </div>
                    </div>`);

            } else {

                $(".msg_history").append(
                    `<div class="outgoing_msg">
                        <div class="sent_msg">
                        ` + tempitems + `
                        <span class="time_date"> ${value.timesend}</span> </div>
                    </div>`);
            }
        });
    }).catch(function(err) {
        console.log(err);
    });
    //button call và send 
    render_button_call_send(UserShowC, 'sendData');
    setTimeout(function() { scroll_end_chat(true) }, 400); //chạy khi tất cả chạy xong r

}
//cuộn đến
function scrollIfNeeded(element, container) { //cuộc trang đến thẻ có id phù hợp
    if (element.offsetTop < container.scrollTop) {
        container.scrollTop = element.offsetTop;

    } else {
        const offsetBottom = element.offsetTop + element.offsetHeight;
        const scrollBottom = container.scrollTop + container.offsetHeight;
        if (offsetBottom > scrollBottom) {
            container.scrollTop = offsetBottom - container.offsetHeight;
        }

    }
}

function scroll_end_chat(boolVal) { //cho phép hiển thị nội dung chat cuối cùng khi có ai đó nhắn đến
    if (boolVal) {
        scrollIfNeeded(document.getElementById('goto_end_chat'), document.getElementById('group_chat_history'));
    }
}

function scroll_not_end() { //kiểm tra xem đang ở cuối nội dung chat chưa(trc khi dc socket.on thêm vào dom)
    var elmentParent = document.getElementById('group_chat_history');
    var yScroll = elmentParent.scrollTop; //đã cuộn đi đc so với top(px)
    var heightDivParent = elmentParent.offsetHeight;
    var el = document.getElementById('show_more_class');
    if ((elmentParent.scrollHeight - (parseInt(yScroll) + parseInt(heightDivParent))) < 100) { //nếu người này scroll xuống cuối rồi

        if (document.getElementById("show_more_class")) {
            el.style.display = "none";

        }
        return true; //kích hoạt (nếu có người nào nhắn đến thì tự động cuộn xuống)
    }
    if (UserShowC_typeGroup_Room_Person != 'room' && yScroll < 10) {
        el.style.display = "block";
    }
    return false;
}
show_button_more();

function show_button_more() {
    var button_more = document.createElement("button");
    button_more.className = "show_more_class btn btn-info";
    button_more.id = "show_more_class";
    button_more.style.display = "none";
    button_more.innerHTML = "show more";
    button_more.addEventListener("click", show_more);
    document.getElementById("group_chat_history").appendChild(button_more);
}

function show_more() {
    if (UserShowC_typeGroup_Room_Person == "person") {
        renderMsg(UserShowC, offset + 18);
    } else
    if (UserShowC_typeGroup_Room_Person == "group") {
        getDataGroup(UserShowC, offset + 18);
    }
}

function show_image_client_update() { //dùng fileReader đọc file và hiển thị ra trước khi gửi lên server
    document.getElementById("image_read").style.display = "flex";
    var filename = document.getElementById('upload').files; //filelist  input:multiple
    console.log(filename);
    if (filename.length > 0) { //khi k có file nào thì nó k chạy hàm này nên dòng này hơi thừa
        document.getElementById("submit-btn").style.display = "block"; //hiện button send file
        document.getElementById("send-button").style.display = "none"; //ẩn button send chat
        document.getElementById("image_read").innerHTML = ""; //khi click vào button upload thì làm mới nội dung đã chọn trc đó
        for (let i = 0; i < filename.length; i++) { //chạy hết các phần tử trong array filename
            var fileReader = new FileReader();
            fileReader.onload = function(ProgressEvent) { //khi chạy đến trạng thái onload thì ProgressEvent lúc này dạng obj trong đó có ProgressEvent.target.result dạng url đại diện cho data vừa đọc
                console.log(ProgressEvent);
                if (ProgressEvent.target.result.search("image") != -1) { //nếu dữ liệu đang đọc là image thì dùng element img
                    var img = document.createElement("img");
                    img.src = ProgressEvent.target.result; //src dữ liệu đã đọc dưới dạng url
                    img.className = "img_show_item";
                    var span = document.createElement("span");
                    span.className = "span_image_readfile";
                    span.appendChild(img);
                    document.getElementById("image_read").appendChild(span);
                } else if (ProgressEvent.target.result.search("video") != -1) { //nếu dữ liệu đang đọc là image thì dùng element video
                    var video = "<video width='20%' height='auto' controls><source src='" + ProgressEvent.target.result + "' type='video/mp4'></video>";
                    var span = document.createElement("span");
                    span.innerHTML = video;
                    document.getElementById("image_read").append(span);
                } else { //nếu file updload là application thì hiển thị thẻ a kèm link dowload 
                    var span = document.createElement("span");
                    var a = document.createElement("a");
                    a.href = ProgressEvent.target.result; //link chuyển đến file được đọc
                    a.textContent = `${filename[i].name}_(${filename[i].size}_byte)`;
                    span.appendChild(a);
                    document.getElementById("image_read").appendChild(span);
                }
            }
            fileReader.readAsDataURL(filename[i]); //chạy reader file upload file
        }
    }
}

function render_File_In_My_Dom(url, filename, type) { //thêm trực tiếp nội dung người gửi vào DOM chỉ dùng cho file khi vừa upload
    var tempitems;
    if (type == "application") {
        tempitems = ` <p><a href="${url}" target="_blank">${filename}</a></p>`;
    } else if (type == "video") {
        tempitems = `<p><span><video width='50%' height='auto' controls><source src='${url}' type='video/mp4'></video></span></p>`;
    } else if (type == "image") {
        tempitems = ` <p><a href="${url}" target="_blank" ><img class="img_dom_client" src="${url}"  title="${filename}"></a></p>`;
    } else if (type == "other") {
        tempitems = `<p><a href="${url}" target="_blank">${filename}</a></p>`;
    }

    $(".msg_history").append( //thêm trực tiếp vào DOM
        `<div class="outgoing_msg">
            <div class="sent_msg">
            ` + tempitems + `
            <span class="time_date">${getTimeSend()}</span> </div>
        </div>`);

}


function send_file() { //upload file to server bằng axios sau đó emit tên file upload cho người nhận cùng insert filename to db
    setTimeout(function() { scroll_end_chat(scroll_not_end()) }, 0);
    var bodyFormData = new FormData(); //tạo form để thực hiện gửi form bằng axios
    var updatefileList = document.getElementById('upload').files; //lấy tất cả file đc chọn trong input có type=file
    arrFileNameUpload = [];
    for (let i = 0; i < updatefileList.length; i++) { //lấy từng file trong upload và append nó nào form FormData với name=userPhoto
        var namefile = Date.now() + updatefileList[i].name;
        arrFileNameUpload.push({ name: namefile, type: updatefileList[i].type });
        bodyFormData.append("userPhoto", updatefileList[i], namefile); //nếu dùng bodyFormData.set thì chỉ upload đc 1 file thôi
    }
    console.log("arrFileNameUpload: ");
    console.log(arrFileNameUpload);
    axios({ //upfile lên server
            method: "post",
            url: "/upload/file",
            data: bodyFormData, //data: {  } nếu dùng dạng này truyền form thì sẽ bị lỗi https://www.geeksforgeeks.org/how-to-post-a-file-from-a-form-with-axios/,
            headers: {
                'Content-Type': 'multipart/form-data' //cho form dạng "multipart/form-data" thì mới upload đc file lên server
            },
        }).then(function(response) { //khi upload tất cả file lên server thành công thì thực hiện send cho người nhận
            if (response.status == 200) {
                for (let i = 0; i < arrFileNameUpload.length; i++) {
                    var typeContent;
                    var url; //url dẫn đến file upload 
                    if (arrFileNameUpload[i].type.search("video") != -1) {
                        typeContent = "video";
                    } else if (arrFileNameUpload[i].type.search("image") != -1) {
                        typeContent = "image";
                    } else if (arrFileNameUpload[i].type.search("application") != -1) {
                        typeContent = "application";
                    } else {
                        typeContent = "other";
                    }
                    url = typeContent;
                    render_File_In_My_Dom(`/${typeContent}/${arrFileNameUpload[i].name}`, arrFileNameUpload[i].name, typeContent); //thực hiện add to dom phía người gửi cùng vs nếu là application thì kèm link...
                    if (UserShowC_typeGroup_Room_Person == 'person') {
                        socket.emit("send-content", { data: arrFileNameUpload[i].name, username_receiver: UserShowC, userSend: usernameOfLoginInTag, type: typeContent });
                    } else if (UserShowC_typeGroup_Room_Person == 'group') {
                        xuly_send_in_Group(UserShowC, typeContent, arrFileNameUpload[i].name);
                    } else if (UserShowC_typeGroup_Room_Person == "room") {
                        xuly_send_in_Room(UserShowC, typeContent, arrFileNameUpload[i].name);
                    }
                }
            }
            console.log(response);
            document.getElementById("submit-btn").style.display = "none"; //ẩn button send file
            document.getElementById("send-button").style.display = "block"; //hiện button send chat
        })
        .catch(function(response) {
            alert("Có lỗi gì đó khi gửi file. xin vui lòng thử lại.(lưu ý: số lượng file gửi luôn <=12)");
            console.log(response);
        });
    document.getElementById("image_read").innerHTML = "";
    document.getElementById("image_read").style.display = "none";
}


function render_button_call_send(username, xuly_send) {
    $(".type_msg").html(
        `
        <div class="input_msg_write">
        
        <input type="text" class="write_msg" name="message_msg" id="input_write_content" placeholder="Type a message" />
        <div class="button-send">
        <button class="msg_send_btn" username='${username}' id="call-button" onclick="callFriend('${username}')" type="button"> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-camera-video" viewBox="0 0 16 16">
        <path fill-rule="evenodd" d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5zm11.5 5.175 3.5 1.556V4.269l-3.5 1.556v4.35zM2 4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h7.5a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H2z"/>
      </svg>
        </button>
      

        <div class="fileUpload btn msg_send_btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-upload" viewBox="0 0 16 16">
        <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
        <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/>
        </svg>
            <input  class="msg_send_btn upload"  type="file" name="userPhoto" id="upload" onchange="show_image_client_update()" multiple/>
        </div>

        <button class="msg_send_btn" type="button"  onclick="send_file()"  id="submit-btn"><i class="fa fa-paper-plane-o" aria-hidden="true"></i></button>

     
    </button>
        <button class="msg_send_btn" type="button"  id="send-button" onclick="${xuly_send}('${username}','text')"  username='${username}'><i class="fa fa-paper-plane-o" aria-hidden="true"></i></button>
        </div>
        <div id="image_read">
           
        </div>
        <span id = "status"></span>
       
        </div>`);
}

function join_room() {
    var nameRoom = $("#name_room").val();
    socket.emit("Join_Room", { RoomName: nameRoom });
    $("#name_room").val("");
}


function renderInputJoinRoom(img, handlingJoin) { //handlingJoin : tên hàm xử lý khi click vào Join button
    $("#inbox_chat").html('');
    $("#inbox_chat").append(`<div class="chat_list active_chat listPeopleChat" style="cursor:pointer;">
        <div class="chat_people">
            <div class="chat_img"> <img src="${img}" alt="sunil" style="height:30px;margin-top:5px"> </div>
            <div class="chat_ib">
            <input class="form-control" type="text" placeholder=" Create/Join name room you want ...." title="Tên phòng mà bạn muốn tạo hoặc tham gia ." id="name_room" > <button type="button" class="btn btn-info  mt-2" id="button_join" onclick="${handlingJoin}()">Join</button>
            </div>
        </div>
    </div>
    <div id="ListRoom"></div>
    `);
}

function join_group() { //khi người dùng join vào 1 group nào đó thì thực hiện kiểm tra và insert vào db và show tất cả group đã join ra màn hình
    var nameRoom = $("#name_room").val();
    axios({
        method: "post",
        url: "/group/AddJoinGroup",
        data: {
            user_join: usernameOfLoginInTag,
            nameGroup: nameRoom,
        }
    }).then(function(res) {
        if (res.data == 'success') { //nếu join vào group chưa tồn tại thì mới load lại 
            $("#MainGroupButton").click(); //kích hoạt click vào button MainGroupButton
            socket.emit("send_to_member_in_Group_have_somone_join_Or_Leave", { Group: nameRoom, action: "join" }); //gửi cho những người trong phòng đo cùng biết
        }
    }).catch(function(err) {
        alert("Join Error . Bạn có thể thử lại sau .Thanks !");
        console.log(err);
    })

}

function leaveGroup(Group) { //xóa người này khỏi group thông qua user
    axios({
        method: "post",
        url: "/group/LeaveGroup",
        data: {
            user_leave: usernameOfLoginInTag,
            nameGroup: Group,
        }
    }).then(function(res) {
        if (res.data == 'success') { //nếu join vào group server phản hồi success thì mới load lại 
            $("#MainGroupButton").click(); //kích hoạt click vào button MainGroupButton để render lại danh sách phòng
            socket.emit("send_to_member_in_Group_have_somone_join_Or_Leave", { Group, action: "leave" }); //gửi cho những người trong phòng đo cùng biết
        }
    }).catch(function(err) {
        alert("Leave Error . Bạn có thể thử lại sau .Thanks !");
        console.log(err);
    })
}


function getDataGroup(nameGroup, valueOffset = 0) { //render nội dung chat từ db
    if (document.getElementById("show_more_class")) {
        document.getElementById("show_more_class").style.display = "none";
    }
    offset = valueOffset;
    setTimeout(function() { scroll_end_chat(true) }, 400); //chạy khi tất cả chạy xong r
    UserShowC = nameGroup;
    UserShowC_typeGroup_Room_Person = "group";
    document.getElementById("nameChat").innerHTML = UserShowC_typeGroup_Room_Person + " : " + UserShowC;

    for (let i = 0; i < document.getElementsByClassName(`listPeopleChat`).length; i++) { //chỉnh lại màu xám cho tất cả user trong list 
        document.getElementsByClassName(`listPeopleChat`)[i].style.background = "white";
    }
    document.getElementsByClassName(`(${UserShowC})`)[0].style.background = "whitesmoke";

    axios({
        method: "post",
        url: `/chatgroup/chat/${offset}`,
        data: {
            "nameGroup": nameGroup,
        },
    }).then(function(chatContent) {
        console.log(chatContent.data);
        $('.msg_history').html('');
        if (chatContent.data.length > 0) {
            chatContent.data.forEach(function(value) {
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
                if (value.user_send != `${usernameOfLoginInTag}`) {
                    $(".msg_history").append(
                        `<div class="incoming_msg">
                        <div class="incoming_msg_img"> <img src="/img/check.png" alt="sunil"> </div>
                        <div class="received_msg">
                        <div class="received_withd_msg">
                            <span class="time_date">${value.user_send}</span>
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
                    <p>Don't have chat content  ...</p>
                    <span class="time_date">now</span></div>
                </div>
            </div>`);
        }
        render_button_call_send(UserShowC, "xuly_send_in_Group");
    }).catch(function(err) {
        console.log(err);
        console.log("Đã có lỗi xãy ra .Bạn có thể load lại trang để thử lại !!");
    })
}

function xuly_send_in_Group(Group, type, data = null) {
    setTimeout(function() { scroll_end_chat(true) }, 0);
    if (data == null) { //nếu chưa có biến data thì cho nó thực hiện từ biến send click
        data = renderMyDom();
    }
    socket.emit("send_data_to_socket_group", { content: data, nameGroup: Group, type });
    axios({ //thêm nôi dung chat vào db
            method: "post",
            url: "/chatgroup/add",
            data: {
                nameGroup: Group,
                sender: usernameOfLoginInTag,
                data,
                type,
            },
        }).catch(function(err) {
            console.log("error insert chat in group : " + err);
        })
        //hiển thị chat phía bên thanh list 
    var dotMes;
    if (data.length > 65) {
        dotMes = "...";
    } else {
        dotMes = "";
    }
    var xulyTachChuoi = Group.split(" "); //xử lý cho tên Group làm id trong thẻ html
    var itemsLienNhau = "";
    for (var i = 0; i < xulyTachChuoi.length; i++) {
        itemsLienNhau = itemsLienNhau + xulyTachChuoi[i];
    }
    if (document.getElementById(`tagp${itemsLienNhau}`) != null) {
        document.getElementById(`tagp${itemsLienNhau}`).innerHTML = `you: ${data.substring(0, 65)}${dotMes}`;
    }
    $("#input_write_content").val(""); //làm mới ô input send
}

function seachNameInList() {
    var value_search = document.getElementById("search_value_list").value;
    if (tagButtonChoose == "person") {
        $("#inbox_chat").html('');
        list_left.forEach(item => {
            if (item.name.indexOf(value_search) >= 0) {
                if (item.content == null) {
                    item.content = '';
                }
                var sender_last = '';
                if (item.userSend_last == usernameOfLoginInTag) {
                    sender_last = 'you: ';
                }
                $("#inbox_chat").append(`<div class="chat_list active_chat listPeopleChat div_person_${item.username}" style="cursor:pointer;" username="${item.username}" onclick="renderMsg(this)">
                <div class="chat_people">
                    <div class="chat_img"> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-box" viewBox="0 0 16 16">
                    <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5 8 5.961 14.154 3.5 8.186 1.113zM15 4.239l-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923l6.5 2.6zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464L7.443.184z"/>
                  </svg> </div>
                    <div class="chat_ib">
                        <h5>${item.name}<span class="chat_date"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-brush" viewBox="0 0 16 16">
                        <path d="M15.825.12a.5.5 0 0 1 .132.584c-1.53 3.43-4.743 8.17-7.095 10.64a6.067 6.067 0 0 1-2.373 1.534c-.018.227-.06.538-.16.868-.201.659-.667 1.479-1.708 1.74a8.118 8.118 0 0 1-3.078.132 3.659 3.659 0 0 1-.562-.135 1.382 1.382 0 0 1-.466-.247.714.714 0 0 1-.204-.288.622.622 0 0 1 .004-.443c.095-.245.316-.38.461-.452.394-.197.625-.453.867-.826.095-.144.184-.297.287-.472l.117-.198c.151-.255.326-.54.546-.848.528-.739 1.201-.925 1.746-.896.126.007.243.025.348.048.062-.172.142-.38.238-.608.261-.619.658-1.419 1.187-2.069 2.176-2.67 6.18-6.206 9.117-8.104a.5.5 0 0 1 .596.04zM4.705 11.912a1.23 1.23 0 0 0-.419-.1c-.246-.013-.573.05-.879.479-.197.275-.355.532-.5.777l-.105.177c-.106.181-.213.362-.32.528a3.39 3.39 0 0 1-.76.861c.69.112 1.736.111 2.657-.12.559-.139.843-.569.993-1.06a3.122 3.122 0 0 0 .126-.75l-.793-.792zm1.44.026c.12-.04.277-.1.458-.183a5.068 5.068 0 0 0 1.535-1.1c1.9-1.996 4.412-5.57 6.052-8.631-2.59 1.927-5.566 4.66-7.302 6.792-.442.543-.795 1.243-1.042 1.826-.121.288-.214.54-.275.72v.001l.575.575zm-4.973 3.04.007-.005a.031.031 0 0 1-.007.004zm3.582-3.043.002.001h-.002z"/>
                      </svg></span></h5>
                        <p id="tagp${item.username}">${sender_last}${item.content} </p>
                    </div>
                </div>
            </div>
            `);
            }
        });

    } else if (tagButtonChoose == "group") {
        $("#ListRoom").html("");
        list_left.forEach(items => {
            if (items.GroupName.indexOf(value_search) >= 0) {
                if (items.LastRecordChat.content == null) {
                    items.LastRecordChat.content = '';
                    items.LastRecordChat.user_send_to_group = '';
                }
                var dotMes; //hiển thị nội dụng vừa gửi lên thẻ p của người nhận trong list user
                if (items.LastRecordChat.content.length > 65) {
                    dotMes = "...";
                } else {
                    dotMes = "";
                }
                var contentrender = items.LastRecordChat.content.substring(0, 65);
                var xulyTachChuoi = items.GroupName.split(" "); //xử lý cho tên Group làm id  thẻ html
                var itemsLienNhau = "";
                for (var i = 0; i < xulyTachChuoi.length; i++) {
                    itemsLienNhau = itemsLienNhau + xulyTachChuoi[i];
                }
                var memberList = items.ListUserJoin.join();
                $("#ListRoom").append(
                    `<div class="chat_list active_chat listPeopleChat (${items.GroupName})" style="cursor:pointer;" onclick="getDataGroup('${items.GroupName}')">
                        <div class="chat_people">
                            <div class="chat_img"> <img src="/img/cube_green.png" alt="sunil" style="height:30px;margin-bottom:5px"> </div>
                            <div class="chat_ib">
                                <h6 class="d-flex justify-content-between"><span>${items.GroupName}  <button type="button" class="btn btn-outline-danger pt-0 pb-0 pr-1 pl-1 m-0" onclick="leaveGroup('${items.GroupName}')">leave</button></span><span class="" id="spanListMember${itemsLienNhau}" title=" Thành Viên (list username) : ${memberList} " ><span id="spanMember${itemsLienNhau}" >${items.Soluong}</span> member</span></h6>
                                <p id="tagp${itemsLienNhau}">${items.LastRecordChat.user_send_to_group} : ${contentrender}${dotMes}</p>
                            </div>
                        </div>
                    </div>
                    `);
            }
        });

    } else if (tagButtonChoose == "room") {
        $("#ListRoom").html("");
        list_left.forEach(items => {
            if (items.RoomName.indexOf(value_search) >= 0) {
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
            }
        });

    }
}

$(document).ready(function() {
    // $('.listPeopleChat').click(renderMsg);
    $("#PersonButton").click(function() { //hiển thị user
        tagButtonChoose = 'person';
        $("#inbox_chat").html('');
        axios({
            method: 'post',
            url: `/user/allUser`,
            data: {
                username: usernameOfLoginInTag,
            }
        }).then(function(ListUserAndChatWithOneUser) { //trả về danh sách tất cả user và nội dung chat cuối với usernameOfLoginInTag 
            console.log(ListUserAndChatWithOneUser);
            list_left = ListUserAndChatWithOneUser.data;
            ListUserAndChatWithOneUser.data.forEach(item => {
                if (item.content == null) {
                    item.content = '';
                }
                var sender_last = '';
                if (item.userSend_last == usernameOfLoginInTag) {
                    sender_last = 'you: ';
                }
                $("#inbox_chat").append(`<div class="chat_list active_chat listPeopleChat div_person_${item.username}" style="cursor:pointer;" username="${item.username}" onclick="renderMsg(this)">
                    <div class="chat_people">
                        <div class="chat_img"> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-box" viewBox="0 0 16 16">
                        <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5 8 5.961 14.154 3.5 8.186 1.113zM15 4.239l-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923l6.5 2.6zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464L7.443.184z"/>
                      </svg> </div>
                        <div class="chat_ib">
                            <h5>${item.name}<span class="chat_date"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-brush" viewBox="0 0 16 16">
                            <path d="M15.825.12a.5.5 0 0 1 .132.584c-1.53 3.43-4.743 8.17-7.095 10.64a6.067 6.067 0 0 1-2.373 1.534c-.018.227-.06.538-.16.868-.201.659-.667 1.479-1.708 1.74a8.118 8.118 0 0 1-3.078.132 3.659 3.659 0 0 1-.562-.135 1.382 1.382 0 0 1-.466-.247.714.714 0 0 1-.204-.288.622.622 0 0 1 .004-.443c.095-.245.316-.38.461-.452.394-.197.625-.453.867-.826.095-.144.184-.297.287-.472l.117-.198c.151-.255.326-.54.546-.848.528-.739 1.201-.925 1.746-.896.126.007.243.025.348.048.062-.172.142-.38.238-.608.261-.619.658-1.419 1.187-2.069 2.176-2.67 6.18-6.206 9.117-8.104a.5.5 0 0 1 .596.04zM4.705 11.912a1.23 1.23 0 0 0-.419-.1c-.246-.013-.573.05-.879.479-.197.275-.355.532-.5.777l-.105.177c-.106.181-.213.362-.32.528a3.39 3.39 0 0 1-.76.861c.69.112 1.736.111 2.657-.12.559-.139.843-.569.993-1.06a3.122 3.122 0 0 0 .126-.75l-.793-.792zm1.44.026c.12-.04.277-.1.458-.183a5.068 5.068 0 0 0 1.535-1.1c1.9-1.996 4.412-5.57 6.052-8.631-2.59 1.927-5.566 4.66-7.302 6.792-.442.543-.795 1.243-1.042 1.826-.121.288-.214.54-.275.72v.001l.575.575zm-4.973 3.04.007-.005a.031.031 0 0 1-.007.004zm3.582-3.043.002.001h-.002z"/>
                          </svg></span></h5>
                            <p id="tagp${item.username}">${sender_last}${item.content} </p>
                        </div>
                    </div>
                </div>
                `);
            });

        }).catch(function(error) {
            console.log(error);
            alert("Yêu cầu của bạn thất bại . Hãy kiểm tra lại internet và thực hiện lại  . Thanks You .");
        });

    });

    $("#MainGroupButton").click(function() {
        tagButtonChoose = 'group';
        renderInputJoinRoom('/img/3d-cube.png', 'join_group');
        axios({
            method: 'post',
            url: `/group/getjoin`,
            data: {
                username: usernameOfLoginInTag,
            }
        }).then(function(ListGroupAndChat) {
            if ($("#ListRoom")) {
                $("#ListRoom").html("");
                list_left = ListGroupAndChat.data;
                console.log("List Group User Join And Chat Last: ");
                console.log(ListGroupAndChat);
                ListGroupAndChat.data.forEach(items => {
                    if (items.LastRecordChat.content == null) {
                        items.LastRecordChat.content = '';
                        items.LastRecordChat.user_send_to_group = '';
                    }
                    var dotMes; //hiển thị nội dụng vừa gửi lên thẻ p của người nhận trong list user
                    if (items.LastRecordChat.content.length > 65) {
                        dotMes = "...";
                    } else {
                        dotMes = "";
                    }
                    var contentrender = items.LastRecordChat.content.substring(0, 65);
                    var xulyTachChuoi = items.GroupName.split(" "); //xử lý cho tên Group làm id  thẻ html
                    var itemsLienNhau = "";
                    for (var i = 0; i < xulyTachChuoi.length; i++) {
                        itemsLienNhau = itemsLienNhau + xulyTachChuoi[i];
                    }
                    var memberList = items.ListUserJoin.join();
                    $("#ListRoom").append(
                        `<div class="chat_list active_chat listPeopleChat (${items.GroupName})" style="cursor:pointer;" onclick="getDataGroup('${items.GroupName}')">
                                <div class="chat_people">
                                    <div class="chat_img"> <img src="/img/cube_green.png" alt="sunil" style="height:30px;margin-bottom:5px"> </div>
                                    <div class="chat_ib">
                                        <h6 class="d-flex justify-content-between"><span>${items.GroupName}  <button type="button" class="btn btn-outline-danger pt-0 pb-0 pr-1 pl-1 m-0" onclick="leaveGroup('${items.GroupName}')">leave</button></span><span class="" id="spanListMember${itemsLienNhau}" title=" Thành Viên (list username) : ${memberList} " ><span id="spanMember${itemsLienNhau}" >${items.Soluong}</span> member</span></h6>
                                        <p id="tagp${itemsLienNhau}">${items.LastRecordChat.user_send_to_group} : ${contentrender}${dotMes}</p>
                                    </div>
                                </div>
                            </div>
                            `);
                });
            }
            if (ListGroupAndChat.data.length > 0) { //cho server socket join người này vào các group đó 
                socket.emit("Join_to_list_Group", { listGroup: ListGroupAndChat.data });
            }
        }).catch(function(err) {
            console.log(err);
            alert("Yêu cầu của Group thất bại . Bạn có thể load lại trang và thử lại .Thanks you !!");
        })
        $("#name_room").val("");
    });

    $("#RoomGroupButton").click(function() {
        tagButtonChoose = 'room';
        renderInputJoinRoom('/img/youth.png', 'join_room');
        socket.emit("Join_Room", { RoomName: RoomPublicName }); //cho user nào cũng join vào Room này
        socket.emit("get_All_Room");
    });

});