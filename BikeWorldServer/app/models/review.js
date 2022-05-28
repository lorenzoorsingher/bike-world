var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Review', new Schema({ 
    title: String,
    text: String,
    stars: Number,
    author: String
}));