var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var app = express();
//dependency on mongoDB
var connect_mongoDB = require('./db_connections/mongoDB');
var debug = require('debug')('nosql-car-rental-webapp:server');
var server = require('http').createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

// socket.io
io.on('connection', (socket) => {
  console.log("a user connected")
  socket.on('connect1', (msg) => {
  console.log("Frontend responds:" + msg);
    io.emit('chat message', "backend replies!");
  });

});

io.emit('chat message', "Hello");


// Routes
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var journeyRouter = require('./routes/journeysuggestions');
var bookingRouter = require('./routes/bookingcab');
var trackingRouter = require('./routes/trackingjourneys');
var sharedcab = require('./routes/sharedCabRelations');

var connect_mongoDB= require('./db_connections/mongoDB');

// Middlewares
const myMiddleware = (req, res, next) => {
  console.log('This middleware is running');
  req.io = io;
  next();
};
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/tracking', trackingRouter);
app.use('/journey', journeyRouter);
app.use('/booking', bookingRouter);
app.use('/sharedcab', sharedcab);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
  next();
});

// const myMiddleware = (req, res, next) => {
//   try{
//     req.io = io;
//   console.log('This middleware is running');
//   }
//   catch(ex){;
//     console.log('io not defined!')
//   }
//   next();
// };
// view engine setup
//app.use(myMiddleware);

app.set('socket', io);
var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}


server.listen(port, () => {
  console.log("Server running");
});
server.on('error', onError);
server.on('listening', onListening);

connect_mongoDB();

module.exports = app;
