var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
module.exports = mongoose.model('Bike', new Schema({ 
	code: String,
    model: String,
	type: String,
	rentalPointName: String,
	state: Boolean 	//0 need reparation, 1 is OK
}));