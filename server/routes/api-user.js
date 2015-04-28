var express = require('express');
var md5 = require('MD5');
var router = express.Router();

var mongoose = require('mongoose');
var TeamMember = require('../models/TeamMember.js');

/* GET /api/user/login listing. */
router.get('/login', function(req, res, next) {
  TeamMember.find({email: req.query.email, password: md5(req.query.password)}, function (err, items) {
    if (err) return next(err);
	if(items.length > 0) {
		//console.log(items);
		req.session.userid = items[0]._id;
		req.session.email = req.query.email;
	}
    res.jsonp(items);
  });
});

/* GET /api/user/login listing. */
router.get('/logout', function(req, res, next) {
  if(req.session.userid != null) {
    req.session.userid = null;
	req.session.email = null;
	res.jsonp({success: true, message: 'Successfully logged out.'});    
  } else {
	res.jsonp({success: false, message: 'Invalid operation!'});
  }
});

module.exports = router;