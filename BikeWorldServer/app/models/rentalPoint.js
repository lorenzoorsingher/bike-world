var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
module.exports = mongoose.model('RentalPoint', new Schema({ 
	name: String,
    address: String,
	lat: Number,
	lng: Number,
	type: String,
	bikeNumber: Number	//max bike number available
}));