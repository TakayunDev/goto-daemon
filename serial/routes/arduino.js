var express = require('express');
var router = express.Router();

var serial = require('../serial.js');

/* GET arduino listing. */
router.get('/read/battery0', function(req, res, next) {
  serial.write('read/battery0\r\n', function(){});
  res.send('0');
});
router.get('/read/battery1', function(req, res, next) {
  serial.write('read/battery1\r\n', function(){});
  res.send('0');
});

module.exports = router;
