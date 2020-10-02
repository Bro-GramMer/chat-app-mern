
const express = require("express");
const bodyParser = require("body-Parser");
// const { compile } = require("ejs");
const app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);

const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const mongoose = require("mongoose");
const passportlocalMongoose = require('passport-local-mongoose')

mongoose.connect("mongodb://localhost:27017/ChatusersDB", {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    })
    .then(() => console.log('DB Connected!')) // promise resolved
    .catch(err => {
        console.log(error in connecting);
    });



app.use(express.static(__dirname + '/public'))
app.use(express.urlencoded({
    extended: true
}));

app.use(bodyParser.urlencoded({           // used to get posted date on page 
    extended: true
}));



mongoose.set("useCreateIndex", true);

const sessionMiddleware = session({
  name : "sid",
  cookie : {
      maxAge : 1000*6000,
      sameSite : true,
  },
  secret : "mysecret",
  resave : false,
  saveUninitialized : false
});

app.use(sessionMiddleware);

app.use(passport.initialize());
app.use(passport.session());

const UserSchema = new mongoose.Schema({
  Username : {
    type : String
  },
  Password : {
    type : String
  }
});

UserSchema.plugin(passportlocalMongoose);

const User = new mongoose.model("User", UserSchema);

passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

   
   var users = "";

    let ids = new Map();
    let ids2 = new Map();
    var status = 0;

 app.get('/', (req, res) =>{
  res.redirect("/login");
});

app.get("/chat_page", (req, res) => {
  console.log("User is : "+req.user.username);
  users = req.user.username;
  res.sendFile(__dirname + "/public/chat_page.html");
});

//  app.post("/", (req, res) => {
//          users = req.body.username;
//           status = 1;
//          //  console.log("kitni baar");
//         res.redirect('/chat_page');
// });
app.get('/login', (req, res) => {
  if(req.isAuthenticated()){
      res.redirect('/chat_page')
  }
  else {
    res.sendFile(__dirname + "/public/Login.html");
  }
})

app.get('/register', (req, res) => {
  if(req.isAuthenticated()){
      res.redirect('/chat_page')
  }
  else {
    res.sendFile(__dirname + "/public/Register.html");
  }
})

app.post('/register', (req, res) => {
  User.register(new User({username : req.body.username}), req.body.password, function(err, user){
      if(err){
          console.log(err)
          res.redirect('/register')
      }
      else{
          passport.authenticate('local')(req, res, function(){
            users = req.body.username;
            res.redirect('/chat_page');
          })
      }
  })
});

app.post('/login', (req, res) => {
  const user = new User({
      username : req.body.username,
      password : req.body.password
  })

  req.login(user, function(err) {
      if(err){
          console.log(err)
      }
      else{
          passport.authenticate('local')(req, res, function(){
            users = req.body.username;
            res.redirect('/chat_page');
          })
      }
  })
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


