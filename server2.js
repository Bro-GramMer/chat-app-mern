
const express = require("express");
const bodyParser = require("body-Parser");
// const { compile } = require("ejs");
const app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);

app.use(express.static(__dirname + '/public'))
app.use(express.urlencoded({
    extended: true
}));

app.use(bodyParser.urlencoded({           // used to get posted date on page 
    extended: true
}));
   
   var users = "";

    let ids = new Map();
    let ids2 = new Map();
    var status = 0;

 app.get('/', (req, res) =>{
  res.sendFile(__dirname + "/public/login.html")
});

app.get("/chat_page", (req, res) => {
  res.sendFile(__dirname + "/public/chat_page.html");
});

 app.post("/", (req, res) => {
         users = req.body.username;
          status = 1;
         //  console.log("kitni baar");
        res.redirect('/chat_page');
});
       

io.on('connection', (socket) => {
//  const new_id = socket.handshake.query.id
//     socket.join(new_id);

        ids[users] = socket.id;
          ids2[socket.id] = users;
         status = 0;
         users = '';
       console.log(ids);


console.log("new user connected");
  socket.on("message", (data) => { 
    console.log(data.new_user);
   
       var sender_name = ids2[socket.id];
       console.log(data.new_msg);
   socket.to(ids[data.new_user]).emit("new message",({msg: data.new_msg, from : sender_name}));
           });
    });
   

http.listen(3000, () => {
  console.log('listening on port :3000');
});


