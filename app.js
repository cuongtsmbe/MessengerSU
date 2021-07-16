const express = require('express');
const exphbs = require('express-handlebars');
const app = express();
const bodyParser = require('body-parser'); //get post method value
require('express-async-errors');
const session = require('express-session');
const port = 3000;
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const socket_emit_on_handling = require("./SocketServer/socket_server");
var userSession = ''; //biến nãy ssex thay đổi thi có nhiều User cùng tác động
// app.use(cookieParser());
app.set('trust proxy', 1) // trust first proxy
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
app.use(function(req, res, next) { //phaỉ luôn gắn lại cho locals  vì locals sẽ bị làm mới khi chạy request
    res.locals.name = req.session.name;
    res.locals.username = req.session.username;
    userSession = req.session.username; //save lại để thực hiện cho trong socket vì trong socket không có req
    // console.log('Cookies: ', req.cookies);
    // console.log('Signed Cookies: ', req.signedCookies);
    next();
});
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');



app.get('/get_session', (req, res) => {
        //check session
        if (req.session.username) {
            return res.status(200).json({ status: 'success', session: req.session.username })
        }
        return res.status(200).json({ status: 'error', session: 'No session' })
    })
    // parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// app.get('/', function(req, res) {
//     res.render("testUpdate", { layout: false });
// });

app.use(express.static('public'));
app.use(express.static('uploads'));
app.use("/user", require("./routers/user.router"));
app.use("/group", require("./routers/group.router"));
app.use("/", require("./routers/chat.router"));
app.use("/chatgroup", require("./routers/chat_group.router"));
app.use("/upload", require("./routers/upload_file.router")); //thực hiện update file lên server

//socket
io.on('connection', (socket) => {
    if (!socket.usernameConnect && userSession != '') { //đặt tên cho socket
        socket.usernameConnect = userSession; //vì biến userSession này sẽ bị biến đổi khi có người đăng nhập . (sẽ lỗi nếu 2 người cùng login trang 1 lúc)
    }
    socket_emit_on_handling(io, socket);
});

app.use(function(req, res, next) {
    res.render("404");
});
app.use(function(err, req, res, next) {
    console.log(err);
    res.render("500");
});
server.listen(port, function(req, res, next) {
    console.log(`listen port ${port}`);
});


//vấn đề tag này load thì biến constant bị thay đổi biến constant userSession làm mất mấy tiếng k hiểu vì sao