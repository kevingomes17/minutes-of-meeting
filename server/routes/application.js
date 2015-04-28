var express = require('express');
var router = express.Router();

/* GET /mom listing. */
router.get('/', function(req, res, next) {
  var sess = req.session;
  if(sess.userid == null) {
	res.sendfile('./server/views/login.html');
  } else {
	res.sendfile('./server/views/index.html');
  }
});

module.exports = router;