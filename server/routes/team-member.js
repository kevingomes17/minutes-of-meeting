var express = require('express');
var md5 = require('MD5');
var router = express.Router();

var mongoose = require('mongoose');
var TeamMember = require('../models/TeamMember.js');

/* GET /team-member listing. */
router.get('/', function(req, res, next) {
  TeamMember.find(function (err, items) {
    if (err) return next(err);
    res.jsonp(items);
  });
});

/* POST /team-member */
router.post('/', function(req, res, next) {
  req.body.createdBy = req.session.userid;
  if(req.body.newPassword != '' && req.body.newPassword != null) { req.body.password = md5(req.body.newPassword); }
  TeamMember.create(req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* GET /team-member/id */
router.get('/:id', function(req, res, next) {
  TeamMember.findById(req.params.id, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* PUT /team-member/:id */
router.put('/:id', function(req, res, next) {
  req.body.modifiedBy = req.session.userid;
  req.body.modifiedOn = new Date();
  if(req.body.newPassword != '' && req.body.newPassword != null) { req.body.password = md5(req.body.newPassword); }
  TeamMember.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* DELETE /team-member/:id */
router.delete('/:id', function(req, res, next) {
  TeamMember.findByIdAndRemove(req.params.id, req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

module.exports = router;