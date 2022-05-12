var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
module.exports = mongoose.model('User', new Schema({ 
	username: String,
	email: String,
	psw: String,
	permissions: Boolean,
	target: String
}));