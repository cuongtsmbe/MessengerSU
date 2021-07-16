var usernameOfLoginInTag; //save value client login : khi vừa logn vào trang chat thì nó sẽ lưu giá trị này lại
var UserShowC; //user đang click vào user or group nào đó để xem chat
var UserShowC_typeGroup_Room_Person; //"person" or "room" or "group" người đang hiện mục  chat đang ở phía nào  ...(khi click vào user or room or group nào để render chat thì mới set lại  )
var RoomPublicName = "public";
var tagButtonChoose = ""; //khi click vào Person,Room,Group thì lưu lại để khi có người add vào room hay group thì mới cho phép render lại list  (RoomGroupButton,...)
var arrFileNameUpload = []; //{ name:namefile, type: updatefileList[i].type } danh sách tên file mà client upload to server(luôn bị reset trc khi upload)
var socket = io("http://localhost:3000");
var peer;
var call_value; //lưu lại giá trị call để có thể thực hiện call.close() tắt cuộc gọi
var All_stream_video_controll = []; //save tất cả stream (muốn tắt camera thì phải đóng toàn bộ stream)
var stream_call; //khi click vào tắt camera nhưng vẫn muốn gọi
var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
var list_left = []; //chứa tất cả danh sách room or person or group (vd khi click button person -> list person )
var offset = 0;