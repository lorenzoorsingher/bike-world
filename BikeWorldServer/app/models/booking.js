var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up the booking model
module.exports = mongoose.model('Booking', new Schema({ 
	username: String,
	date: Date,
    bikeCode: String,
    releaseBikeCode: Number,
    rentalPointName: String
}));