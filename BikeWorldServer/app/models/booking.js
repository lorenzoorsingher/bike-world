var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up the booking model
module.exports = mongoose.model('Booking', new Schema({ 
	username: String,
	day: Number,
	month: Number,
    year: Number,
    bikeCode: String,
    rentalPointName: String
}));