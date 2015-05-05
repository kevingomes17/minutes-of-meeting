var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Project = require('../models/Project.js');

/* GET /projects listing. */
router.get('/', function(req, res, next) {
  Project.find(function (err, items) {
    if (err) return next(err);
    res.jsonp(items);
  }).populate('teamMembers');
});

/* POST /projects */
router.post('/', function(req, res, next) {
  req.body.createdBy = req.session.userid;
  Project.create(req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* GET /projects/id */
router.get('/:id', function(req, res, next) {
  Project.findById(req.params.id, function (err, post) {
    if (err) return next(err);
    res.json(post);
  }).populate('teamMembers');
});

/* PUT /projects/:id */
router.put('/:id', function(req, res, next) {
  req.body.modifiedBy = req.session.userid;
  req.body.modifiedOn = new Date();
  Project.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* DELETE /projects/:id */
router.delete('/:id', function(req, res, next) {
  Project.findByIdAndRemove(req.params.id, req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

module.exports = router;