var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var socket_io = require('socket.io');

var routes = require('./routes/index');
var users = require('./routes/users');
var arduino = require('./routes/arduino');

var app = express();
var io = socket_io();
app.io = io;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/arduino', arduino);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var serial = require('./serial.js');
var serial_last = "";
var serial_success = true;

io.on('connection', function(socket){
  socket.on('arduino-cmd', function(msg) {
    console.log('arduino-cmd: '+msg);
    serial_last = msg;
    serial_success = false;
    serial.write(msg+'\r\n');
  });
});

var serial_data = "";

serial.on('data', function(data) {
  var receive_data = data.toString();
  for (var i = 0; i < receive_data.length; i++) {
    if (receive_data[i] == "\n") {
      console.log("Return:"+serial_data);
      var jdata = JSON.parse(serial_data);
      console.log(jdata);
      serial_data = "";
    } else {
      serial_data += receive_data[i];
    }
  }
  //io.emit('battery', data.toString());
});


module.exports = app;
