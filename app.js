const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const lessMiddleware = require('less-middleware');
const logger = require('morgan');
const session = require('express-session');



let emos={};

const app = express();
app.config=require('./config.json');
app.io=null;

var knex = require('knex')({
  client: 'pg',
  version: '7.2',
  connection: app.config.pgConnection,
  pool: {min: 0, max: 40}
});
const pgSession = require('connect-pg-simple')(session);
const pgStoreConfig = {conObject: app.config.pgConnection}
var sess = {
  secret: (app.config.sha256Secret),
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 10 * 24 * 60 * 60 * 1000,
    // secure: true,
    //httpOnly: true,
    //sameSite: 'none',
  }, // 10 days
  store: new pgSession(pgStoreConfig),
};



const indexRouter = require('./routes/indexRouter');
const apiRouter = require('./routes/apiRouter');




// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session(sess));
app.use((req, res, next)=>{
  req.config=app.config;
  req.knex=knex;
  req.addEmo=(emoid, spk)=>{
   if(!emos[spk.eventidshort]) {emos[spk.eventidshort]=[];}
   let item={emoid, spkName:spk.name, spkId:spk.id, date:new Date()}
   emos[spk.eventidshort].push(item)
    app.io.emit("emo",item);
  }
  req.getEmo=(emoid)=>{
    if(!emos[emoid])
      emos[emoid]=[]
    return emos[emoid]
  }
  req.delEmo=(emoid)=>{
    emos[emoid]=[];
  }
  req.adminAuth=async (req, res, next)=>{
    if(req.session["admin"])
      return next();

    var auth=await req.knex.select("*").from("t_admin");
    const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':')

    // Verify login and password are set and correct
    if (login && password) {
      var find = auth.filter(a => {
        return login === a.name && password === a.pass
      });
      if (find.length > 0) {
        req.user = find[0];
        req.session["admin"]=find[0];
        return next();
      }
    }
    res.set('WWW-Authenticate', 'Basic realm="401"') // change this
    res.status(401).send('Authentication required.') // custom message
  }
  next();
});

app.use('/', indexRouter);
app.use('/api/v1/', apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.onListening=function(httpServer){
  app.io.on("connect", (socket) => {
    console.log("new WS connection", socket.id); // x8WIv7-mJelg7on_ALbx
  });
  console.log("listening");
}

module.exports = app;
