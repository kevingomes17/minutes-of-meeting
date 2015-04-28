var mongoose = require('mongoose');

var MomItemSchema = new mongoose.Schema({
  category: String, 
  description: String, 
  owner: {type: mongoose.Schema.Types.ObjectId, ref: 'TeamMember', required: false}, 
  status: String, 
  type: String, 
  dueDate: Date, 
  richText: Boolean
});
 
var MomSchema = new mongoose.Schema({
  title: String,
  project: {type: mongoose.Schema.Types.ObjectId, ref: 'Project'},
  minutesTaker: {type: mongoose.Schema.Types.ObjectId, ref: 'TeamMember'},
  attendees: [{type: mongoose.Schema.Types.ObjectId, ref: 'TeamMember'}],
  createdOn: Date,
  createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'TeamMember'},
  modifiedOn: Date,
  modifiedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'TeamMember'},
  items: [MomItemSchema]
});

module.exports = mongoose.model('Mom', MomSchema); 