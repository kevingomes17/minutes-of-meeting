var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId; 
var Mom = require('../models/Mom.js');

/* GET /mom listing. */
router.get('/', function(req, res, next) {
  Mom.find({
	$or: [
		{minutesTaker: new ObjectId(req.session.userid)}, 
		{attendees: new ObjectId(req.session.userid)}
		//{attendees: {$in:[new ObjectId(req.session.userid)]}}
	]}, 
	function (err, items) {
		if (err) return next(err);
		res.jsonp(items);
	});
  
});

/* POST /mom */
router.post('/', function(req, res, next) {
  req.body.createdBy = req.session.userid;
  Mom.create(req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* GET /mom/id */
router.get('/:id', function(req, res, next) {
  Mom.findById(req.params.id, function (err, post) {
    if (err) return next(err);
    res.jsonp(post);
  });
});

/* PUT /mom/:id */
router.put('/:id', function(req, res, next) {
  req.body.modifiedBy = req.session.userid;
  req.body.modifiedOn = new Date();
  Mom.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* DELETE /mom/:id */
router.delete('/:id', function(req, res, next) {
  Mom.findByIdAndRemove(req.params.id, req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

module.exports = router;