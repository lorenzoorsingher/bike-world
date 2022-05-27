var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
module.exports = mongoose.model('Itinerary', new Schema({ 
	name: String,
    addressStarting: String,
	latS: Number,
	lngS: Number,
    description: String,
	difficulty: String,
	length: Number	
}));