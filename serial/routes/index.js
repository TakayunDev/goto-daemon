var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/voice', function(req, res, next) {
  res.render('index', { title: 'TopPage - Goto-RT1' });
});

module.exports = router;
