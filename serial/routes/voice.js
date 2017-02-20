var express = require('express');
var router = express.Router();

const exec = require('child_process').exec;

/* GET arduino listing. */
router.get('/say', function(req, res, next) {
  const query_text = req.query.text;
  const text = decodeURI(query_text);
  console.log("say: \""+text+"\"");
  exec('/home/pi/Script/Voice/mikusay.sh "'+text+'"');
  res.send('0');
});

module.exports = router;
