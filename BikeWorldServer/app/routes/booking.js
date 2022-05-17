const express = require('express');
const router = express.Router();
const Bike = require('../models/bike'); // get our mongoose model
const RentalPoint = require('../models/rentalPoint'); // get our mongoose model
const Booking = require('../models/booking.js') // get booking model
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

// ---------------------------------------------------------
// route to add new booking
// ---------------------------------------------------------
router.post('', async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

    //get all booking for that specific day and rental point
    const bookingNumber = await Booking.count({
        day: req.body.day,
        month: req.body.month,
        year: req.body.year,
        rentalPointName: req.body.rentalPointName
    })

    //find the rental Point
	let rentalPoint = await RentalPoint.findOne({
		name: req.body.rentalPointName
	}).exec();

    if(rentalPoint.bikeNumber - bookingNumber == 0){
        res.json({ success: false, message: 'Non ci sono biciclette disponibili'});
		return;	//to stop the execution of the function	
    }    

    //save booking in the db
    const newBooking = new Booking({username: req.body.username, day: req.body.day, month: req.body.month, year: req.body.year, bikeCode: req.body.bikeCode, rentalPointName: req.body.rentalPointName});
    await newBooking.save();
    
	res.json({
		success: true,
		message: 'New Booking added!'
	});

});


// ---------------------------------------------------------
// route to get bookings
// ---------------------------------------------------------
router.get('', async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
	
    let username = req.query.username;

	// get the bookings
	let bookings = await Booking.find( { 'username': username }).exec();	
    console.log(bookings);
	res.json({bookings});
});

// ---------------------------------------------------------
// route to delete booking
// ---------------------------------------------------------
router.delete('', async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

	// remove the booking
	await Booking.deleteOne( { _id: req.query._id}).exec();

	res.json({
		success: true,
		message: 'Booking deleted!'
	});
});


module.exports = router;