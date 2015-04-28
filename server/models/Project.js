var mongoose = require('mongoose');

var ProjectSchema = new mongoose.Schema({
  name: String,
  description: String,
  teamMembers: [{type: mongoose.Schema.Types.ObjectId, ref: 'TeamMember'}],
  createdOn: Date,
  createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'TeamMember'},
  modifiedOn: Date,
  modifiedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'TeamMember'}
});

module.exports = mongoose.model('Project', ProjectSchema); 