var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
module.exports = mongoose.model('Damage', new Schema({
    id: String,
    description: String,
}));