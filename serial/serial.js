var SerialPort = require('serialport').SerialPort;
var ser = new SerialPort('/dev/ttyAMA0', {baudRate: 57600});

ser.on('open', function(){
  console.log('open');
});

ser.on('data', function(data){
  console.log(data.toString());
});


module.exports = ser;
