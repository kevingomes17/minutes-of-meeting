var mongoose = require('mongoose');

var TeamMemberSchema = new mongoose.Schema({
  name: String,
  email: String,
  initials: String,
  skills: String,
  password: String,
  isAdmin: Boolean,
  createdOn: Date,
  createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'TeamMember'},
  modifiedOn: Date,
  modifiedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'TeamMember'}
});

module.exports = mongoose.model('TeamMember', TeamMemberSchema); 